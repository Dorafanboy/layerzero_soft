import {
    createPublicClient,
    createWalletClient,
    formatUnits,
    Hex,
    hexToSignature,
    http,
    parseUnits,
    PrivateKeyAccount,
    PublicClient,
    SimulateContractReturnType,
    zeroAddress,
} from 'viem';
import { printError, printInfo, printSuccess } from '../../data/logger/logPrinter';
import { AngleBridgeConfig, Config } from '../../config';
import { getBridgeBalance, getSwapBalance, getValue } from '../../data/utils/utils';
import { celo, gnosis, polygon } from 'viem/chains';
import { delay } from '../../data/helpers/delayer';
import { agEURAbi } from '../../abis/agEURAbi';
import axios from 'axios';
import { getLimit, getQuoteBody, getSwapBody, getTypedData } from './angleBridgeConfig';
import { angleBridgeAbi } from '../../abis/angleBridgeAbi';
import { addTextMessage } from '../../data/telegram/telegramBot';
import * as console from 'console';
import { IAngleBridgeData } from '../../data/utils/interfaces';
import { minterBridge } from '../minter/minter';
import { gasRefuel } from '../l2pass/l2pass';
import { bridgeLayer3 } from '../layer3/layer3';
import { withdrawAmount } from '../../data/okx/okx';

const usdcAddress: Hex = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
const networks: IAngleBridgeData[] = [
    { chain: polygon, address: '0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4' },
    { chain: celo, address: '0xC16B81Af351BA9e64C1a069E3Ab18c244A1E3049', chainId: 42220 },
    { chain: gnosis, address: '0x4b1e2c2762667331bc91648052f646d1b0d35984', chainId: 100 },
];

const angleBridgePolygonAddress = '0x4E3288c9ca110bCC82bf38F09A7b425c095d92Bf';

const adapterParams: Hex = '0x00010000000000000000000000000000000000000000000000000000000000030d40';

const bridgeFromPolygonAddress = '0x0c1EBBb61374dA1a8C57cB6681bF27178360d36F';
const bridgeFromGnosisAddress = '0xFA5Ed56A203466CbBC2430a43c66b9D8723528E7';
const bridgeFromCeloAddress = '0xf1dDcACA7D17f8030Ab2eb54f2D9811365EFe123';

let walletClient;

export async function useAngleBridge(account: PrivateKeyAccount, addressToWithdraw: Hex = '0x') {
    printInfo(`Выполняю модуль Angle Bridge`);

    let network = Config.rpcs.find((rpc) => rpc.chain === polygon.network);

    if (network === undefined) {
        return false;
    }

    const client = createPublicClient({
        chain: polygon,
        transport: network.rpcUrl == null ? http() : http(network.rpcUrl),
    });

    printInfo(`Пытаюсь найти баланс в USDC в Angle Bridge в сети ${polygon.name}`);

    let balance = await getSwapBalance(client, account.address, usdcAddress);

    let value = null;

    walletClient = createWalletClient({
        chain: polygon,
        transport: network.rpcUrl == null ? http() : http(network.rpcUrl),
    });

    if (balance > parseUnits(AngleBridgeConfig.swapRange.range.minRange.toString(), 6)) {
        value = await getValue(
            client,
            account.address,
            AngleBridgeConfig.swapRange.range,
            AngleBridgeConfig.swapRange.fixed,
            false,
            parseUnits(balance.toString(), 0),
        );

        console.log(value, balance);

        if (value != null) {
            printInfo(
                `Буду производить свап USDC в agEUR в сети ${polygon.name} на сумму ${formatUnits(value, 6)} USDC`,
            );

            const quoteBody = await getQuoteBody(account.address, value.toString(), true);
            const quoteResponse = await axios.post('https://api.angle.money/v1/aggregator/quote', quoteBody);

            const oneDollarBody = await getQuoteBody(account.address, '1000000', true);
            const oneDollarResponse = await axios.post('https://api.angle.money/v1/aggregator/quote', oneDollarBody);

            const fixedAmount = Number(formatUnits(oneDollarResponse.data.toAmount, 18)).toFixed(3);

            if (fixedAmount < (0.92).toString()) {
                printError(`Текущий курс USDC/USDT к agEUR(1 к ${fixedAmount}) ниже 0.92, высокий slippage.`);
                return false;
            }

            const swapBody = await getSwapBody(account.address, quoteResponse.data.pathId);

            const swapResponse = await axios.post('https://api.angle.money/v1/aggregator/swap', swapBody);

            const allowance = await client.readContract({
                address: usdcAddress,
                abi: agEURAbi,
                functionName: 'allowance',
                args: [account.address, angleBridgePolygonAddress],
            });

            console.log(allowance, value);
            if (allowance < value) {
                printInfo(`Произвожу approve USDC в сети ${polygon.name}`);

                const { request } = await client
                    .simulateContract({
                        address: usdcAddress,
                        abi: agEURAbi,
                        functionName: 'approve',
                        args: [angleBridgePolygonAddress, balance],
                        account: account,
                    })
                    .then((result) => result as SimulateContractReturnType)
                    .catch((e) => {
                        printError(`Произошла ошибка во время выполнения approve Angle Bridge - ${e}`);
                        return { request: undefined };
                    });

                if (request !== undefined) {
                    const approveHash = await walletClient.writeContract(request).catch((e) => {
                        printError(
                            `Произошла ошибка во время выполнения модуля Angle Bridge approve Polygon USDC - ${e}`,
                        );
                        return false;
                    });

                    if (approveHash === false) {
                        return false;
                    }

                    printSuccess(
                        `Транзакция успешно отправлена. Хэш транзакции: ${
                            polygon.blockExplorers.default.url + '/tx/' + approveHash
                        }\n`,
                    );

                    await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);
                }
            }

            printInfo(`Текущий курс USDC/USDT к agEUR(1 к ${fixedAmount}).`);

            printInfo(`Произвожу swap USDC в agEUR в сети ${polygon.name}`);

            const prepareTransaction = await walletClient.prepareTransactionRequest({
                account,
                to: angleBridgePolygonAddress,
                data: swapResponse.data.payload,
            });

            const signature = await walletClient.signTransaction(prepareTransaction).catch((e) => {
                printError(`Произошла ошибка во время выполнения модуля Angle Bridge from polygon - ${e}`);
                return undefined;
            });

            if (signature !== undefined) {
                const hash = await walletClient.sendRawTransaction({ serializedTransaction: signature }).catch((e) => {
                    printError(`Произошла ошибка во время выполнения модуля Angle Bridge from polygon - ${e}`);
                    return false;
                });

                if (hash == false) {
                    return false;
                }

                const url = `${polygon.blockExplorers.default.url + '/tx/' + hash}`;

                printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

                await addTextMessage(
                    `✅Angle Bridge: swap ${formatUnits(value, 6)} USDC to agEUR <a href='${url}'>link</a>`,
                );
            }

            await delay(
                AngleBridgeConfig.delayWithNonPolygon.minRange,
                AngleBridgeConfig.delayWithNonPolygon.maxRange,
                true,
            );
        }
    } else {
        printInfo(
            `Баланс ${formatUnits(balance, 6)} USDC Polygon меньше чем минимальное значение(${
                AngleBridgeConfig.swapRange.range.minRange
            }) для свапа USDC в agEUR, ищу баланс agEUR в других сетях `,
        );
    }

    let foundNetwork = await findNetworkWithBalance(account.address, value);

    if (foundNetwork == null) {
        printError(`Не было найдено ни одной сети, в которой можно бриджить agEUR.`);
        return false;
    }

    if (foundNetwork.client.chain.name == 'Polygon') {
        await checkPolygonBalance(account);

        const agEURBalance = await getSwapBalance(client, account.address, <`0x${string}`>networks[0].address);

        let currentTry: number = 0;

        while (currentTry <= Config.retryCount) {
            if (currentTry == Config.retryCount) {
                printError(
                    `Не нашел баланс для бриджа в Angle Bridge. Превышено количество попыток - [${currentTry}/${Config.retryCount}]\n`,
                );
                return false;
            }

            value = await getValue(
                client,
                account.address,
                AngleBridgeConfig.bridgeRange.range,
                AngleBridgeConfig.bridgeRange.fixed,
                true,
                BigInt(agEURBalance.toString()),
            );

            if (value != null && value != BigInt(-1)) {
                currentTry = Config.retryCount + 1;
            } else {
                await delay(Config.delayBetweenAction.minRange, Config.delayBetweenAction.maxRange, false);
            }

            currentTry++;
        }

        const number = Math.floor(Math.random() * 2) + 1;
        const networkDestination = number == 1 ? celo : gnosis;
        const dstChainId = number == 1 ? 125 : 145;

        printInfo(
            `Буду производить бридж agEUR из сети ${polygon.name} в сеть ${
                networkDestination.name
            } на сумму ${formatUnits(value!, 18)} agEUR`,
        );

        const allowance = await client.readContract({
            address: <`0x${string}`>networks[0].address,
            abi: agEURAbi,
            functionName: 'allowance',
            args: [account.address, bridgeFromPolygonAddress],
        });

        const limitBody = getLimit(<`0x${string}`>account.address.toLowerCase(), 137, networkDestination.id);

        const limitResponse = await axios.get(limitBody);
        const fromLimit = limitResponse.data['137'].agEUR.fromLimit;

        printInfo(`Текущие лимиты для бриджа agEUR из Polygon ${formatUnits(fromLimit, 18)}`);

        if (value! > fromLimit) {
            printError(`Текущие лимиты не позволяют отправить средства(будут потери)`);
            return false;
        }

        if (allowance < value!) {
            printInfo(`Произвожу approve agEUR в сети ${polygon.name}`);

            const { request } = await client
                .simulateContract({
                    address: <`0x${string}`>networks[0].address,
                    abi: agEURAbi,
                    functionName: 'approve',
                    args: [bridgeFromPolygonAddress, agEURBalance],
                    account: account,
                })
                .then((result) => result as SimulateContractReturnType)
                .catch((e) => {
                    printError(`Произошла ошибка во время выполнения модуля approve agEUR AngleBridge - ${e}`);
                    return { request: undefined };
                });

            if (request !== undefined) {
                const hash = await walletClient.writeContract(request).catch((e) => {
                    printError(`Произошла ошибка во время выполнения модуля approve agEUR AngleBridge - ${e}`);
                    return false;
                });

                if (hash == false) {
                    return false;
                }

                const url = `${polygon.blockExplorers.default.url + '/tx/' + hash}`;

                printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);
            }

            await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);
        }

        printInfo(
            `Произвожу бридж ${formatUnits(value!, 18)} agEUR из сети ${polygon.name} в сеть ${
                networkDestination.name
            } `,
        );

        const estimateFee = await client.readContract({
            address: bridgeFromPolygonAddress,
            abi: angleBridgeAbi,
            functionName: 'estimateSendFee',
            args: [dstChainId, <`0x${string}`>account.address.toLowerCase(), value!, false, adapterParams],
        });

        const { request } = await client
            .simulateContract({
                address: bridgeFromPolygonAddress,
                abi: angleBridgeAbi,
                functionName: 'send',
                args: [
                    dstChainId,
                    <`0x${string}`>account.address.toLowerCase(),
                    value!,
                    account.address,
                    zeroAddress,
                    adapterParams,
                ],
                account: account,
                value: estimateFee[0],
            })
            .then((result) => result as SimulateContractReturnType)
            .catch((e) => {
                printError(`Произошла ошибка во время выполнения модуля Angle Bridge - ${e}`);
                return { request: undefined };
            });

        if (request !== undefined) {
            const hash = await walletClient.writeContract(request).catch((e) => {
                printError(`Произошла ошибка во время выполнения модуля Angle Bridge - ${e}`);
                return false;
            });

            if (hash == false) {
                return false;
            }

            const url = `${polygon.blockExplorers.default.url + '/tx/' + hash}`;

            printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

            await addTextMessage(
                `✅Angle Bridge: bridge ${formatUnits(value!, 18)} agEUR from ${polygon.name} to ${
                    networkDestination.name
                }  <a href='${url}'>link</a>`,
            );

            await delay(AngleBridgeConfig.delayWithPolygon.minRange, AngleBridgeConfig.delayWithPolygon.maxRange, true);

            await useAngleBridge(account, addressToWithdraw);
        }
    } else if (foundNetwork.client.chain.name == 'Gnosis' || foundNetwork.client.chain.name == 'Celo') {
        await checkBalance(account);

        for (let i = 0; i < AngleBridgeConfig.circlesCount; i++) {
            const network = Config.rpcs.find((rpc) => rpc.chain === foundNetwork!.client.chain.network);

            const isCelo = foundNetwork!.client.chain.name == 'Celo';

            printInfo(`Произожу ${i + 1}й круг бриджей, сеть - ${foundNetwork!.client.chain.name}`);

            const limitBody = getLimit(
                <`0x${string}`>account.address.toLowerCase(),
                isCelo ? 42220 : 100,
                !isCelo ? 42220 : 100,
            );

            const client = createPublicClient({
                chain: foundNetwork!.client.chain,
                transport: network!.rpcUrl == null ? http() : http(network!.rpcUrl),
            });

            const nonce = await client.readContract({
                address: foundNetwork!.contractAddress,
                abi: agEURAbi,
                functionName: 'nonces',
                args: [account.address],
            });

            const agEURBalance = await getSwapBalance(
                client,
                account.address,
                <`0x${string}`>networks[isCelo ? 1 : 2].address,
            );

            value = await getValue(
                client,
                account.address,
                AngleBridgeConfig.bridgeRange.range,
                AngleBridgeConfig.bridgeRange.fixed,
                true,
                BigInt(agEURBalance.toString()),
            );

            if (value == BigInt(-1)) {
                printInfo(`Не удалось получить баланс для бриджа`);
                return false;
            }

            const limitResponse = await axios.get(limitBody);
            const fromLimit = limitResponse.data[isCelo ? 42220 : 100].agEUR.fromLimit;

            printInfo(`Текущие лимиты для бриджа agEUR из ${isCelo ? 'Celo' : 'Gnosis'} ${formatUnits(fromLimit, 18)}`);

            if (value! > fromLimit) {
                printError(`Текущие лимиты не позволяют отправить средства(будут потери)`);
                return false;
            }

            printInfo(
                `Произвожу бридж ${formatUnits(value, 18)} agEUR из сети ${isCelo ? `Celo` : `Gnosis`} в сеть ${
                    !isCelo ? `Celo` : `Gnosis`
                }`,
            );

            let block = await client.getBlock();
            let deadline = BigInt(Number(block.timestamp) + 10000);

            let typedData = getTypedData(
                networks[isCelo ? 1 : 2].chainId!,
                <`0x${string}`>networks[isCelo ? 1 : 2].address,
            );

            typedData.message = getMessageStructure(
                account.address,
                value,
                isCelo ? bridgeFromCeloAddress : bridgeFromGnosisAddress,
                Number(nonce),
                Number(deadline),
            );

            walletClient = createWalletClient({
                chain: foundNetwork!.client.chain,
                transport: network!.rpcUrl == null ? http() : http(network!.rpcUrl),
            });

            let signature = await account.signTypedData(typedData);
            let { r, s, v } = hexToSignature(signature);

            while (v == BigInt(27)) {
                printInfo(`Сообщение неверной версии ${v}, попробую заного получить.`);

                block = await client.getBlock();
                deadline = BigInt(Number(block.timestamp) + 10000);

                typedData = getTypedData(
                    networks[isCelo ? 1 : 2].chainId!,
                    <`0x${string}`>networks[isCelo ? 1 : 2].address,
                );

                typedData.message = getMessageStructure(
                    account.address,
                    value,
                    isCelo ? bridgeFromCeloAddress : bridgeFromGnosisAddress,
                    Number(nonce),
                    Number(deadline),
                );

                signature = await account.signTypedData(typedData);
                ({ r, s, v } = hexToSignature(signature));

                await delay(5, 10, false);
            }

            const dstChainId = isCelo ? 145 : 125;

            const estimateFee = await client.readContract({
                address: isCelo ? bridgeFromCeloAddress : bridgeFromGnosisAddress,
                abi: angleBridgeAbi,
                functionName: 'estimateSendFee',
                args: [dstChainId, <`0x${string}`>account.address.toLowerCase(), value, false, adapterParams],
            });

            console.log(typedData);
            console.log(v);
            console.log(deadline);

            const { request } = await client
                .simulateContract({
                    address: isCelo ? bridgeFromCeloAddress : bridgeFromGnosisAddress,
                    abi: angleBridgeAbi,
                    functionName: 'sendWithPermit',
                    value: estimateFee[0],
                    args: [
                        dstChainId,
                        <`0x${string}`>account.address.toLowerCase(),
                        value,
                        account.address,
                        zeroAddress,
                        adapterParams,
                        deadline,
                        Number(28),
                        r,
                        s,
                    ],
                    account: account,
                })
                .then((result) => result as SimulateContractReturnType)
                .catch((e) => {
                    printError(
                        `Произошла ошибка во время выполнения модуля Angle Bridge ${isCelo ? `Celo` : `Gnosis`} - ${e}`,
                    );
                    return { request: undefined };
                });

            if (request !== undefined) {
                const hash = await walletClient.writeContract(request).catch((e) => {
                    printError(
                        `Произошла ошибка во время выполнения модуля Angle Bridge ${isCelo ? `Celo` : `Gnosis`} - ${e}`,
                    );
                    return false;
                });

                if (hash == false) {
                    return false;
                }

                const url = `${
                    isCelo ? `https://celoscan.io` + '/tx/' + hash : gnosis.blockExplorers?.default.url + '/tx/' + hash
                }`;

                printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

                await addTextMessage(
                    `✅AngleBridge: bridge from ${isCelo ? celo.name : gnosis.name} to ${
                        !isCelo ? celo.name : gnosis.name
                    } ${formatUnits(value!, 18)} agEUR <a href='${url}'>link</a>`,
                );

                await delay(
                    AngleBridgeConfig.delayWithNonPolygon.minRange,
                    AngleBridgeConfig.delayWithNonPolygon.maxRange,
                    true,
                );
            }
        }

        foundNetwork = await findNetworkWithBalance(account.address);
    } else {
        printError(`Не было найдено сетей с балансом agEUR`);
        return false;
    }

    printInfo(`Прогон объема успешно завершен.`);

    network = Config.rpcs.find((rpc) => rpc.chain === foundNetwork!.client.chain.network);

    const isCelo = foundNetwork!.client.chain.name == 'Celo';

    printInfo(`Произожу вывод из сети - ${foundNetwork!.client.chain.name} в сеть Polygon`);

    const limitBody = getLimit(<`0x${string}`>account.address.toLowerCase(), isCelo ? 42220 : 100, 137);

    const foundNetworkClient = createPublicClient({
        chain: foundNetwork!.client.chain,
        transport: network!.rpcUrl == null ? http() : http(network!.rpcUrl),
    });

    const nonce = await foundNetworkClient.readContract({
        address: foundNetwork!.contractAddress,
        abi: agEURAbi,
        functionName: 'nonces',
        args: [account.address],
    });

    console.log(<`0x${string}`>networks[isCelo ? 1 : 2].address);

    const agEURBalance = await getSwapBalance(
        foundNetwork!.client,
        account.address,
        <`0x${string}`>networks[isCelo ? 1 : 2].address,
    );

    console.log(agEURBalance);

    value = await getValue(
        foundNetworkClient,
        account.address,
        AngleBridgeConfig.bridgeRange.range,
        AngleBridgeConfig.bridgeRange.fixed,
        true,
        BigInt(agEURBalance.toString()),
    );

    const limitResponse = await axios.get(limitBody);
    const fromLimit = limitResponse.data[isCelo ? 42220 : 100].agEUR.fromLimit;

    printInfo(`Текущие лимиты для бриджа agEUR из ${isCelo ? 'Celo' : 'Gnosis'} ${formatUnits(fromLimit, 18)}`);

    if (value! > fromLimit) {
        printError(`Текущие лимиты не позволяют отправить средства(будут потери)`);
        return false;
    }

    printInfo(`Произвожу бридж ${formatUnits(value, 18)} agEUR из сети ${isCelo ? `Celo` : `Gnosis`} в сеть Polygon`);

    const block = await foundNetworkClient.getBlock();
    const deadline = BigInt(Number(block.timestamp) + 10000);

    const typedData = getTypedData(networks[isCelo ? 1 : 2].chainId!, <`0x${string}`>networks[isCelo ? 1 : 2].address);

    typedData.message = getMessageStructure(
        account.address,
        value,
        isCelo ? bridgeFromCeloAddress : bridgeFromGnosisAddress,
        Number(nonce),
        Number(deadline),
    );

    console.log(typedData);

    walletClient = createWalletClient({
        chain: foundNetwork!.client.chain,
        transport: network!.rpcUrl == null ? http() : http(network!.rpcUrl),
    });

    const signature = await account.signTypedData(typedData);
    const { r, s } = hexToSignature(signature);

    const dstChainId = 109;

    const estimateFee = await foundNetworkClient.readContract({
        address: isCelo ? bridgeFromCeloAddress : bridgeFromGnosisAddress,
        abi: angleBridgeAbi,
        functionName: 'estimateSendFee',
        args: [dstChainId, <`0x${string}`>account.address.toLowerCase(), value, false, adapterParams],
    });

    const { request } = await foundNetworkClient
        .simulateContract({
            address: isCelo ? bridgeFromCeloAddress : bridgeFromGnosisAddress,
            abi: angleBridgeAbi,
            functionName: 'sendWithPermit',
            value: estimateFee[0],
            args: [
                dstChainId,
                <`0x${string}`>account.address.toLowerCase(),
                value,
                account.address,
                zeroAddress,
                adapterParams,
                deadline,
                Number(27),
                r,
                s,
            ],
            account: account,
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля Angle Bridge ${isCelo ? `Celo` : `Gnosis`} - ${e}`);
            return { request: undefined };
        });

    if (request !== undefined) {
        const hash = await walletClient.writeContract(request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля Angle Bridge ${isCelo ? `Celo` : `Gnosis`} - ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${
            isCelo ? `https://celoscan.io` + '/tx/' + hash : gnosis.blockExplorers?.default.url + '/tx/' + hash
        }`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅Angle Bridge: bridge from ${isCelo ? celo.name : gnosis.name} to Polygon ${formatUnits(
                value!,
                18,
            )} agEUR <a href='${url}'>link</a>`,
        );

        await delay(
            AngleBridgeConfig.delayWithNonPolygon.minRange,
            AngleBridgeConfig.delayWithNonPolygon.maxRange,
            true,
        );
    }

    const networkPolygon = Config.rpcs.find((rpc) => rpc.chain === polygon.network);

    if (networkPolygon === undefined) {
        return false;
    }

    const agEURBalancePolygon = await getSwapBalance(client, account.address, <`0x${string}`>networks[0].address);

    value = await getValue(
        client,
        account.address,
        AngleBridgeConfig.bridgeRange.range,
        AngleBridgeConfig.bridgeRange.fixed,
        true,
        BigInt(agEURBalancePolygon.toString()),
    );

    walletClient = createWalletClient({
        chain: polygon,
        transport: networkPolygon!.rpcUrl == null ? http() : http(networkPolygon!.rpcUrl),
    });

    if (value != null) {
        printInfo(`Буду производить свап agEUR в USDC в сети ${polygon.name} на сумму ${formatUnits(value, 18)} agEUR`);

        const quoteBody = await getQuoteBody(account.address, value.toString(), false);
        const quoteResponse = await axios.post('https://api.angle.money/v1/aggregator/quote', quoteBody);

        const oneDollarBody = await getQuoteBody(account.address, '1000000000000000000000', false);
        console.log(oneDollarBody);
        const oneDollarResponse = await axios.post('https://api.angle.money/v1/aggregator/quote', oneDollarBody);

        const fixedAmount = Number(formatUnits(oneDollarResponse.data.toAmount, 9)).toFixed(3);

        printInfo(`Текущие лимиты для свапа agEUR к USDC в Polygon +-0.92 к ${fixedAmount}`);

        if (fixedAmount < (1.07).toString()) {
            printError(`Текущий курс agEUR(${fixedAmount}) к 1 USDC/USDT ниже 1.07, высокий slippage.`);
            return false;
        }

        const swapBody = await getSwapBody(account.address, quoteResponse.data.pathId);

        const swapResponse = await axios.post('https://api.angle.money/v1/aggregator/swap', swapBody);

        const allowance = await client.readContract({
            address: <`0x${string}`>networks[0].address,
            abi: agEURAbi,
            functionName: 'allowance',
            args: [account.address, angleBridgePolygonAddress],
        });

        if (allowance < value) {
            printInfo(`Произвожу approve agEUR в сети ${polygon.name}`);

            const { request } = await client
                .simulateContract({
                    address: <`0x${string}`>networks[0].address,
                    abi: agEURAbi,
                    functionName: 'approve',
                    args: [angleBridgePolygonAddress, agEURBalancePolygon],
                    account: account,
                })
                .then((result) => result as SimulateContractReturnType)
                .catch((e) => {
                    printError(`Произошла ошибка во время выполнения approve agEUR Angle Bridge - ${e}`);
                    return { request: undefined };
                });

            if (request !== undefined) {
                const approveHash = await walletClient.writeContract(request).catch((e) => {
                    printError(`Произошла ошибка во время выполнения approve agEUR Angle Bridge - ${e}`);
                    return false;
                });

                if (approveHash === false) {
                    return false;
                }

                printSuccess(
                    `Транзакция успешно отправлена. Хэш транзакции: ${
                        polygon.blockExplorers.default.url + '/tx/' + approveHash
                    }\n`,
                );

                await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);
            }
        }

        printInfo(`Произвожу swap agEUR USDC в сети ${polygon.name}`);

        const prepareTransaction = await walletClient.prepareTransactionRequest({
            account,
            to: angleBridgePolygonAddress,
            data: swapResponse.data.payload,
        });

        const signature = await walletClient.signTransaction(prepareTransaction).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля Angle Bridge from polygon - ${e}`);
            return undefined;
        });

        if (signature !== undefined) {
            const hash = await walletClient.sendRawTransaction({ serializedTransaction: signature }).catch((e) => {
                printError(`Произошла ошибка во время выполнения модуля Angle Bridge from polygon - ${e}`);
                return false;
            });

            if (hash == false) {
                return false;
            }

            const url = `${polygon.blockExplorers.default.url + '/tx/' + hash}`;

            printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

            await addTextMessage(
                `✅Angle Bridge: swap ${formatUnits(value, 18)} agEUR to USDC <a href='${url}'>link</a>`,
            );
        }

        await delay(
            AngleBridgeConfig.delayWithNonPolygon.minRange,
            AngleBridgeConfig.delayWithNonPolygon.maxRange,
            true,
        );
    }

    if (addressToWithdraw == '0x') {
        printInfo(`Аккаунт для субсчета не указан => выводить на биржу не надо.`);
        return true;
    }

    balance = await getSwapBalance(client, account.address, usdcAddress);

    value = await getValue(
        client,
        account.address,
        AngleBridgeConfig.swapRange.range,
        AngleBridgeConfig.swapRange.fixed,
        false,
        parseUnits(balance.toString(), 0),
    );

    printInfo(`Буду выводить на субадрес - ${addressToWithdraw} ${formatUnits(value, 6)} USDC`);

    const transferRequest = await client
        .simulateContract({
            address: usdcAddress,
            abi: agEURAbi,
            functionName: 'transfer',
            args: [addressToWithdraw, value],
            account: account,
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля Withdraw to subacc - ${e}`);
            return { transferRequest: undefined };
        });

    if (transferRequest !== undefined && 'request' in transferRequest) {
        const hash = await walletClient.writeContract(transferRequest!.request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля Withdraw to subacc - ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${polygon.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅Transfer: withdraw from Polygon ${formatUnits(
                value!,
                6,
            )} USDC to ${addressToWithdraw} <a href='${url}'>link</a>`,
        );
    }

    return true;
}

async function findNetworkWithBalance(address: Hex, value: bigint | null = null) {
    for (let i = 0; i < networks.length; i++) {
        const network = Config.rpcs.find((rpc) => rpc.chain === networks[i].chain.network);

        if (network === undefined) {
            return;
        }

        const client = createPublicClient({
            chain: networks[i].chain,
            transport: network.rpcUrl == null ? http() : http(network.rpcUrl),
        });

        printInfo(`Пытаюсь найти баланс в agEUR в Angle Bridge в сети ${networks[i].chain.name}`);

        const balance = await getSwapBalance(client, address, <`0x${string}`>networks[i].address);

        console.log(value, balance);
        const newValue =
            value == null
                ? await getValue(
                      client,
                      address,
                      AngleBridgeConfig.bridgeRange.range,
                      AngleBridgeConfig.bridgeRange.fixed,
                      true,
                      parseUnits(balance.toString(), 0),
                  )
                : value;

        if (newValue >= AngleBridgeConfig.bridgeRange.range.minRange) {
            return { client: client, contractAddress: <`0x${string}`>networks[i].address };
        }
    }

    return null;
}

function getMessageStructure(address: Hex, value: bigint, spender: Hex, nonce: number, deadline: number) {
    return {
        owner: address,
        spender: spender,
        value: value,
        nonce: nonce,
        deadline: deadline,
    };
}

async function checkBalance(account: PrivateKeyAccount) {
    const celoNetwork = Config.rpcs.find((rpc) => rpc.chain === celo.network);
    const gnosisNetwork = Config.rpcs.find((rpc) => rpc.chain === gnosis.network);

    const celoClient = createPublicClient({
        chain: celo,
        transport: celoNetwork?.rpcUrl == null ? http() : http(celoNetwork.rpcUrl),
    });

    const gnosisClient = createPublicClient({
        chain: gnosis,
        transport: gnosisNetwork?.rpcUrl == null ? http() : http(gnosisNetwork.rpcUrl),
    });

    let celoBalance = await getBridgeBalance(celoClient as PublicClient, account.address);
    let gnosisBalance = await getBridgeBalance(gnosisClient, account.address);

    if (Number(formatUnits(gnosisBalance, 18)) < AngleBridgeConfig.bridgeGnosisLimit.limit) {
        printInfo(`Gnosis меньше, чем указано в конфиге. Буду бриджить в Gnosis`);

        await bridgeLayer3(account);

        await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);

        let currentTry = 0;

        while (currentTry <= Config.retryCount) {
            gnosisBalance = await getBridgeBalance(gnosisClient as PublicClient, account.address);

            if (currentTry == Config.retryCount) {
                printError(
                    `Не нашел баланс Gnosis. Превышено количество попыток - [${currentTry}/${Config.retryCount}]\n`,
                );
                return false;
            }

            if (Number(formatUnits(gnosisBalance, 18)) < AngleBridgeConfig.bridgeGnosisLimit.limit) {
                printInfo(`Произвожу еще дополнительное ожидание, т.к баланс еще не был пополнен(Gnosis)`);
                await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);
            } else {
                currentTry = Config.retryCount + 1;
            }

            currentTry++;
        }
    }

    if (Number(formatUnits(celoBalance, 18)) < AngleBridgeConfig.bridgeCeloLimit.limit) {
        printInfo(`Celo меньше, чем указано в конфиге. Буду пополнять через merkly/l2pass/биржи`);

        const randomNumber = Math.random();

        if (randomNumber < 0.33) {
            await minterBridge(account, 'gnosis', 'celo');
        } else if (randomNumber < 0.66) {
            await gasRefuel(account, 'gnosis', 'celo');
        } else {
            printInfo(`Буду пополнять Celo с биржи.`);
            await withdrawAmount(account.address, AngleBridgeConfig.bridgeDataCelo, true);
        }

        await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);

        let currentTry = 0;

        while (currentTry <= Config.retryCount) {
            celoBalance = await getBridgeBalance(celoClient as PublicClient, account.address);

            if (currentTry == Config.retryCount) {
                printError(
                    `Не нашел баланс Celo. Превышено количество попыток - [${currentTry}/${Config.retryCount}]\n`,
                );
                return false;
            }

            if (Number(formatUnits(celoBalance, 18)) < AngleBridgeConfig.bridgeCeloLimit.limit) {
                printInfo(`Произвожу еще дополнительное ожидание, т.к баланс еще не был пополнен(Сelo)`);
                await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);
            } else {
                currentTry = Config.retryCount + 1;
            }

            currentTry++;
        }
    }
}

async function checkPolygonBalance(account: PrivateKeyAccount) {
    const polygonNetwork = Config.rpcs.find((rpc) => rpc.chain === polygon.network);
    const polygonClient = createPublicClient({
        chain: polygon,
        transport: polygonNetwork?.rpcUrl == null ? http() : http(polygonNetwork.rpcUrl),
    });

    let polygonBalance = await getBridgeBalance(polygonClient as PublicClient, account.address);

    if (Number(formatUnits(polygonBalance, 18)) < AngleBridgeConfig.bridgePolygonLimit.limit) {
        printInfo(`Polygon баланс меньше, чем указано в конфиге. Буду выводить с биржи`);

        await withdrawAmount(account.address, AngleBridgeConfig.bridgeDataPolygon, true);

        let currentTry = 0;

        while (currentTry <= Config.retryCount) {
            polygonBalance = await getBridgeBalance(polygonClient as PublicClient, account.address);

            if (currentTry == Config.retryCount) {
                printError(
                    `Не нашел баланс Gnosis. Превышено количество попыток - [${currentTry}/${Config.retryCount}]\n`,
                );
                return false;
            }

            if (Number(formatUnits(polygonBalance, 18)) < AngleBridgeConfig.bridgeGnosisLimit.limit) {
                printInfo(`Произвожу еще дополнительное ожидание, т.к баланс еще не был пополнен`);
                await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);
            } else {
                currentTry = Config.retryCount + 1;
            }

            currentTry++;
        }
    }
}
