import {
    Address,
    Chain,
    ChainFormatters,
    createPublicClient,
    createWalletClient,
    encodeFunctionData,
    formatUnits,
    Hex,
    http,
    PrivateKeyAccount,
    PublicClient,
    SimulateContractReturnType,
    WalletClient,
} from 'viem';
import { Config, L2PassConfig } from '../../config';
import { printError, printInfo, printSuccess } from '../../data/logger/logPrinter';
import { l2passAbi } from '../../abis/l2passAbi';
import { L2passConfig } from './l2passConfig';
import { getBridgeBalance, getBridgeData, getValue } from '../../data/utils/utils';
import { delay } from '../../data/helpers/delayer';
import { addTextMessage } from '../../data/telegram/telegramBot';
import { IOneToOneBridgeData } from '../../data/utils/interfaces';
import { l2passGasRefuelAbi } from '../../abis/l2passGasRefuelAbi';

const mintData: bigint = 0x0000000000000000000000000000000000000000000000000000000000000001n;
const contractAddress: Hex = '0x0000049F63Ef0D60aBE49fdD8BEbfa5a68822222';
const bridgeGasContractAddress: Hex = '0x222228060E7Efbb1D78BB5D454581910e3922222';
const zroPaymentAddress: Address = '0x0000000000000000000000000000000000000000';
const adapterParams: Hex = '0x00010000000000000000000000000000000000000000000000000000000000030d40';

let client: PublicClient;

export async function l2passMint(account: PrivateKeyAccount) {
    printInfo(`Выполняю модуль L2Pass Mint NFT`);

    let currentTry: number = 0,
        network,
        mintFee;

    let senderChain!: Chain;

    while (currentTry <= Config.retryCount) {
        if (currentTry == Config.retryCount) {
            printError(
                `Не нашел баланс для бриджа в L2Pass Mint NFT. Превышено количество попыток - [${currentTry}/${Config.retryCount}]\n`,
            );
            return false;
        }

        senderChain = await getChain();

        network = Config.rpcs.find((chain) => chain.chain === senderChain.network);

        client = createPublicClient({
            chain: senderChain,
            transport: network?.rpcUrl == null ? http() : http(network.rpcUrl),
        });

        printInfo(`Пытаюсь заминтить нфт в сети ${senderChain.name}`);

        const balance = await getBridgeBalance(client, account.address);

        mintFee = await client.readContract({
            address: contractAddress,
            abi: l2passAbi,
            functionName: 'mintPrice',
        });

        currentTry++;

        if (balance > mintFee) {
            currentTry = Config.retryCount + 1;
        }
    }

    if (mintFee !== undefined) {
        printInfo(
            `Произвожу минт нфт в сети ${senderChain.name} по стоимости ${formatUnits(mintFee, 18)} ${
                senderChain.nativeCurrency.symbol
            }\n`,
        );
    }

    const walletClient: WalletClient = createWalletClient({
        chain: senderChain,
        transport: network?.rpcUrl == null ? http() : http(network?.rpcUrl),
    });

    const { request } = await client
        .simulateContract({
            address: contractAddress,
            abi: l2passAbi,
            functionName: 'mint',
            args: [mintData],
            account: account,
            value: mintFee,
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля L2Pass Mint NFT - ${e}`);
            return { request: undefined };
        });

    if (request !== undefined) {
        const hash = await walletClient.writeContract(request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля L2Pass Mint NFT - ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${senderChain.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        printInfo(`Ожидаю время до бриджа`);
        await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);
        if (mintFee !== undefined) {
            await addTextMessage(
                `✅L2Pass: mint NFT ${senderChain.name} for ${formatUnits(mintFee, 18)} ${
                    senderChain.nativeCurrency.symbol
                } <a href='${url}'>link</a>`,
            );
        }

        await l2passBridgeNFT(account, senderChain, walletClient);

        return true;
    }

    return false;
}

export async function l2passBridgeNFT(
    account: PrivateKeyAccount,
    senderChain: Chain<ChainFormatters>,
    walletClient: WalletClient,
) {
    printInfo(`Выполняю модуль L2Pass Bridge NFT`);

    let currentTry: number = 0,
        chainName = client.chain?.name,
        path = false,
        findReceiverTry = 0;

    let receiverChain: Chain;

    while (currentTry <= Config.retryCount) {
        while (chainName == client.chain?.name || path != true) {
            receiverChain = await getChain();
            chainName = receiverChain.name;
            path = await isPathExists(senderChain.name, receiverChain.name);

            if (findReceiverTry == Config.findReceiverChainL2Pass) {
                printError(
                    `Не было найдено сети-получателя для NFT. Превышено количество попыток [${findReceiverTry}/${Config.findReceiverChainL2Pass}]\n`,
                );
                return false;
            }

            findReceiverTry++;
        }

        printInfo(`Пытаюсь забриджить нфт из сети ${senderChain.name} в сеть ${chainName}`);

        const balance = await getBridgeBalance(client, account.address);

        if (currentTry == Config.retryCount) {
            printError(
                `Не нашел баланс для бриджа в L2Pass Bridge NFT. Превышено количество попыток - [${currentTry}/${Config.retryCount}]\n`,
            );
            return false;
        }

        const nftId: bigint = await client
            .readContract({
                address: contractAddress,
                abi: l2passAbi,
                functionName: 'tokenOfOwnerByIndex',
                args: [account.address, BigInt(0)],
            })
            .catch((e) => {
                printError(`Произошла ошибка во время выполнения модуля L2Pass Bridge NFT - ${e}`);
                return BigInt(-1);
            });

        if (nftId == BigInt(-1)) {
            return false;
        }

        const id = Config.rpcs.find((chain) => chain.chain === receiverChain.network)!.id;

        const estimateSendFee = await client.readContract({
            address: contractAddress,
            abi: l2passAbi,
            functionName: 'estimateSendFee',
            args: [id, <`0x${string}`>account.address.toLowerCase(), nftId, false, adapterParams],
        });

        printInfo(
            `Произвожу бридж нфт #${nftId} из сети ${senderChain.name} в сеть ${chainName} по стоимости ${formatUnits(
                estimateSendFee[0],
                18,
            )} ${senderChain.nativeCurrency.symbol}`,
        );

        if (balance > estimateSendFee[0]) {
            const { request } = await client
                .simulateContract({
                    address: contractAddress,
                    abi: l2passAbi,
                    functionName: 'sendFrom',
                    args: [
                        account.address,
                        id,
                        <`0x${string}`>account.address.toLowerCase(),
                        nftId,
                        account.address,
                        zroPaymentAddress,
                        adapterParams,
                    ],
                    account: account,
                    value: estimateSendFee[0],
                })
                .then((result) => result as SimulateContractReturnType)
                .catch((e) => {
                    printError(`Произошла ошибка во время выполнения модуля L2Pass Bridge NFT - ${e}`);
                    return { request: undefined };
                });

            if (request !== undefined) {
                const hash = await walletClient.writeContract(request).catch((e) => {
                    printError(`Произошла ошибка во время выполнения модуля L2Pass Bridge NFT - ${e}`);
                    return false;
                });

                if (hash == false) {
                    return false;
                }

                const url = `${senderChain.blockExplorers?.default.url + '/tx/' + hash}`;

                printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

                await addTextMessage(
                    `✅L2Pass: bridge NFT ${senderChain.name}=>${chainName} for ${formatUnits(
                        estimateSendFee[0],
                        18,
                    )} ${senderChain.nativeCurrency.symbol} <a href='${url}'>link</a>`,
                );

                return true;
            }
        }

        currentTry++;
    }

    return false;
}

export async function gasRefuel(account: PrivateKeyAccount, firstChain?: string, secondChain?: string) {
    printInfo(`Выполняю модуль L2Pass Gas Refuel`);

    let currentTry: number = 0,
        value,
        network,
        id;

    let estimateFee: readonly [bigint, bigint];
    let bridgeData: IOneToOneBridgeData;
    let client!: PublicClient;

    while (currentTry <= Config.retryCount) {
        if (currentTry == Config.retryCount) {
            printError(
                `Не нашел баланс для бриджа в L2Pass. Превышено количество попыток - [${currentTry}/${Config.retryCount}]\n`,
            );
            return false;
        }

        bridgeData = await getBridgeData(false, firstChain ? firstChain : '', secondChain ? secondChain : '');

        network = Config.rpcs.find((chain) => chain.chain === bridgeData.firstChainData.chain.network);

        client = createPublicClient({
            chain: bridgeData.firstChainData.chain,
            transport: network?.rpcUrl == null ? http() : http(network.rpcUrl),
        });

        printInfo(
            `Пытаюсь произвести бридж из сети ${bridgeData.firstChainData.chain.name} в сеть ${bridgeData.secondChainData.chain.name}`,
        );

        value = await getValue(client, account.address, bridgeData.value?.range, bridgeData?.value.fixed, true);

        currentTry++;

        if (value != null && value != BigInt(-1)) {
            id = Config.rpcs.find((chain) => chain.chain === bridgeData.secondChainData.chain.network)!.id!;

            estimateFee = await client.readContract({
                address: bridgeGasContractAddress,
                abi: l2passGasRefuelAbi,
                functionName: 'estimateGasRefuelFee',
                args: [id, value, <`0x${string}`>account.address, false],
            });

            const balance = await client.getBalance({
                address: account.address,
            });

            if (balance > BigInt(value) + BigInt(parseFloat(estimateFee[0].toString()))) {
                currentTry = Config.retryCount + 1;
            }
        } else {
            await delay(Config.delayBetweenAction.minRange, Config.delayBetweenAction.maxRange, false);
        }
    }

    printInfo(
        `Произвожу бридж из сети ${bridgeData!.firstChainData.chain.name} в сеть ${
            bridgeData!.secondChainData.chain.name
        } на сумму ${formatUnits(value!, 18)} ${bridgeData!.secondChainData.chain.nativeCurrency.symbol} `,
    );

    const walletClient = createWalletClient({
        chain: bridgeData!.firstChainData.chain,
        transport: network?.rpcUrl == null ? http() : http(network.rpcUrl),
    });

    const adapterParams = encodeFunctionData({
        abi: l2passGasRefuelAbi,
        functionName: 'gasRefuel',
        args: [id!, zroPaymentAddress, value!, account.address],
    });

    const test = await walletClient.prepareTransactionRequest({
        account,
        to: bridgeGasContractAddress,
        data: adapterParams,
        value: estimateFee![0],
    });

    const signature = await walletClient.signTransaction(test).catch((e) => {
        printError(`Произошла ошибка во время выполнения модуля L2Pass Gas Refuel - ${e}`);
        return undefined;
    });

    if (signature !== undefined) {
        const hash = await walletClient.sendRawTransaction({ serializedTransaction: signature }).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля L2Pass Gas Refuel - ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${bridgeData!.firstChainData.chain.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅L2Pass gas refuel: bridge ${bridgeData!.firstChainData.chain.name}=>${
                bridgeData!.secondChainData.chain.name
            } ${formatUnits(value!, 18)} ${
                bridgeData!.secondChainData.chain.nativeCurrency.symbol
            } <a href='${url}'>link</a>`,
        );

        return true;
    }

    return false;
}

async function getChain(): Promise<Chain> {
    const keys = Object.keys(L2passConfig.chains);
    const randomChain = keys[Math.floor(Math.random() * keys.length)];

    return L2passConfig.chains[randomChain].chain;
}

async function isPathExists(chainNameFirst: string, chainNameSecond: string): Promise<boolean> {
    const path = `${chainNameFirst},${chainNameSecond}`;

    return L2PassConfig.paths.includes(path);
}
