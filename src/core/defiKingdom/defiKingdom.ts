import {
    createPublicClient,
    createWalletClient,
    formatUnits,
    http,
    parseUnits,
    PrivateKeyAccount,
    PublicClient,
    SimulateContractReturnType,
    WalletClient,
} from 'viem';
import { Config, DefiKingdom } from '../../config';
import { printError, printInfo, printSuccess } from '../../data/logger/logPrinter';
import { getSwapBalance, getValue } from '../../data/utils/utils';
import { delay } from '../../data/helpers/delayer';
import { dfk } from 'viem/chains';
import { defiKingdomABI } from '../../abis/defiKingdom';
import { defiKingdomBridgeGoldABI } from '../../abis/defiKingdomBridgeGold';
import { addTextMessage } from '../../data/telegram/telegramBot';
import { agEURAbi } from '../../abis/agEURAbi';

const buyGoldContract = '0x3C351E1afdd1b1BC44e931E12D4E05D6125eaeCa';
const jewelContractAddress = '0xCCb93dABD71c8Dad03Fc4CE5559dC3D89F67a260';
const dfkGoldContractAddress = '0x576C260513204392F0eC0bc865450872025CB1cA';
const bridgeDfkGoldContract = '0x501CdC4ef10b63219704Bf6aDb785dfccb06deE2';
const dfkGoldTokenId = 150;
const multiplyFactor = 0.999;

let client!: PublicClient;
const network = Config.rpcs.find((rpc) => rpc.chain === dfk.network);

client = createPublicClient({
    chain: dfk,
    transport: network?.rpcUrl == null ? http() : http(network.rpcUrl),
});

export async function buyGold(account: PrivateKeyAccount) {
    printInfo(`Выполняю модуль DefiKingdom buy DFKGOLD`);

    let currentTry: number = 0,
        value,
        amountOut,
        fixedAmountOut;

    while (currentTry <= Config.retryCount) {
        if (currentTry == Config.retryCount) {
            printError(
                `Не нашел баланс для покупки DFKGOLD. Превышено количество попыток - [${currentTry}/${Config.retryCount}]\n`,
            );
            return false;
        }

        value = await getValue(
            client,
            account.address,
            DefiKingdom.sellJewelRange?.range,
            DefiKingdom.sellJewelRange?.fixed,
            true,
        );

        currentTry++;

        if (value != null && value != BigInt(-1)) {
            const getAmountsOut = await client.readContract({
                address: <`0x${string}`>buyGoldContract,
                abi: defiKingdomABI,
                functionName: 'getAmountsOut',
                args: [value, [jewelContractAddress, dfkGoldContractAddress]],
            });

            amountOut = BigInt(Math.floor(Number(getAmountsOut[1]) * multiplyFactor));
            const strNumber = amountOut.toString();
            const decimalPlace = Math.abs(Math.log10(Number(formatUnits(value, 18))));

            fixedAmountOut =
                strNumber.substring(0, strNumber.length - decimalPlace) +
                '.' +
                strNumber.substring(strNumber.length - decimalPlace);

            printInfo(`Покупаю ${fixedAmountOut} DFKGOLD на ${formatUnits(value, 18)} JEWEL`);
            currentTry = Config.retryCount + 1;
        } else {
            await delay(Config.delayBetweenAction.minRange, Config.delayBetweenAction.maxRange, false);
        }
    }

    const walletClient: WalletClient = createWalletClient({
        chain: dfk,
        transport: network?.rpcUrl == null ? http() : http(network.rpcUrl),
    });

    const block = await client.getBlock();
    const randomThreeDigits = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
    const deadline = block.timestamp.toString() + randomThreeDigits.toString();

    const { request } = await client
        .simulateContract({
            address: buyGoldContract,
            abi: defiKingdomABI,
            functionName: 'swapExactETHForTokens',
            args: [amountOut!, [jewelContractAddress, dfkGoldContractAddress], account.address, BigInt(deadline)],
            account: account,
            value: BigInt(value!),
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля DefiKingdom buy DFKGOLD - ${e}`);
            return { request: undefined };
        });

    if (request !== undefined) {
        const hash = await walletClient.writeContract(request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля DefiKingdom buy DFKGOLD - ${e}`);
            return false;
        });

        if (hash === false) {
            return false;
        }

        const url = `${dfk.blockExplorers.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);
        await addTextMessage(
            `✅DefiKingdom: buy ${fixedAmountOut} DFKGOLD for ${formatUnits(
                value!,
                18,
            )} JEWEL <a href='${url}'>link</a>`,
        );

        await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);

        return true;
    }
}

export async function bridgeGold(account: PrivateKeyAccount) {
    printInfo(`Выполняю модуль DefiKingdom bridge DFKGOLD`);

    const dfkGoldBalance = await getSwapBalance(client, account.address, dfkGoldContractAddress);

    if (BigInt(dfkGoldBalance.toString()) <= 0) {
        printInfo(`Баланс DFKGOLD меньше либо равен нулю, выполняю модуль`);
        await buyGold(account);
    }

    const bridgeCount =
        Math.floor(
            Math.random() * (DefiKingdom.bridgeRangePerModule.maxRange - DefiKingdom.bridgeRangePerModule.minRange + 1),
        ) + DefiKingdom.bridgeRangePerModule.minRange;

    printInfo(`Буду выполнять ${bridgeCount} повторов DFKGOLD bridge`);

    for (let i = 0; i < bridgeCount; i++) {
        const value =
            Math.random() *
                (DefiKingdom.dfkGoldBridgeRange.range.maxRange - DefiKingdom.dfkGoldBridgeRange.range.minRange + 1) +
            DefiKingdom.dfkGoldBridgeRange.range.minRange;

        const fixed =
            Math.floor(
                Math.random() *
                    (DefiKingdom.dfkGoldBridgeRange.fixed.maxRange - DefiKingdom.dfkGoldBridgeRange.fixed.minRange + 1),
            ) + DefiKingdom.dfkGoldBridgeRange.fixed.minRange;

        printInfo(`Буду бриджить ${value.toFixed(fixed)} DFKGOLD`);

        const walletClient: WalletClient = createWalletClient({
            chain: dfk,
            transport: network?.rpcUrl == null ? http() : http(network.rpcUrl),
        });

        const bridgeValue = Number(value.toFixed(fixed)) * Math.pow(10, 3);

        const estimateFee = await client.readContract({
            address: bridgeDfkGoldContract,
            abi: defiKingdomBridgeGoldABI,
            functionName: 'estimateFeeSendERC20',
            args: [dfkGoldTokenId, account.address, dfkGoldContractAddress, BigInt(bridgeValue)],
        });

        const allowance = await client.readContract({
            address: dfkGoldContractAddress,
            abi: agEURAbi,
            functionName: 'allowance',
            args: [account.address, bridgeDfkGoldContract],
        });

        if (parseUnits(allowance.toString(), 6) <= 0) {
            printInfo(`Произвожу approve DFKGOLD`);

            const { request } = await client
                .simulateContract({
                    address: dfkGoldContractAddress,
                    abi: agEURAbi,
                    functionName: 'approve',
                    args: [bridgeDfkGoldContract, dfkGoldBalance],
                    account: account,
                })
                .then((result) => result as SimulateContractReturnType)
                .catch((e) => {
                    printError(`Произошла ошибка во время выполнения approve Defi Kingdom - ${e}`);
                    return { request: undefined };
                });

            if (request !== undefined) {
                const approveHash = await walletClient.writeContract(request).catch((e) => {
                    printError(`Произошла ошибка во время выполнения модуля DefiKingdom approve DFKGOLD - ${e}`);
                    return false;
                });

                if (approveHash === false) {
                    return false;
                }

                printSuccess(
                    `Транзакция успешно отправлена. Хэш транзакции: ${
                        dfk.blockExplorers.default.url + '/tx/' + approveHash
                    }\n`,
                );

                await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);
            }
        }

        const { request } = await client
            .simulateContract({
                address: bridgeDfkGoldContract,
                abi: defiKingdomBridgeGoldABI,
                functionName: 'sendERC20',
                args: [dfkGoldTokenId, account.address, dfkGoldContractAddress, BigInt(bridgeValue)],
                account: account,
                value: estimateFee,
            })
            .then((result) => result as SimulateContractReturnType)
            .catch((e) => {
                printError(`Произошла ошибка во время выполнения модуля DefiKingdom bridge DFKGOLD - ${e}`);
                return { request: undefined };
            });

        if (request !== undefined) {
            const hash = await walletClient.writeContract(request).catch((e) => {
                printError(`Произошла ошибка во время выполнения модуля DefiKingdom bridge DFKGOLD - ${e}`);
                return false;
            });

            if (hash === false) {
                return false;
            }

            const url = `${dfk.blockExplorers.default.url + '/tx/' + hash}`;

            printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);
            await addTextMessage(`✅DefiKingdom: bridge ${value.toFixed(fixed)} DFKGOLD <a href='${url}'>link</a>`);

            await delay(DefiKingdom.delayBetweenBridge.minRange, DefiKingdom.delayBetweenBridge.maxRange, true);
        }
    }

    return true;
}
