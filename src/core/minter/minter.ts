import {
    createPublicClient,
    createWalletClient,
    encodePacked,
    formatUnits,
    http,
    PrivateKeyAccount,
    PublicClient,
    SimulateContractReturnType,
} from 'viem';
import { Config, MerklyData } from '../../config';
import { getBridgeData, getValue } from '../../data/utils/utils';
import { printError, printInfo, printSuccess } from '../../data/logger/logPrinter';
import { minterAbi } from '../../abis/minterAbi';
import { addTextMessage } from '../../data/telegram/telegramBot';
import { delay } from '../../data/helpers/delayer';
import { IOneToOneBridgeData } from '../../data/utils/interfaces';

export async function minterBridge(account: PrivateKeyAccount, firstChain?: string, secondChain?: string) {
    printInfo(`Выполняю модуль Minter Merkly Bridge`);

    let currentTry: number = 0,
        value,
        network,
        adapterParams,
        id;

    let estimateFee: readonly [bigint, bigint];
    let bridgeData: IOneToOneBridgeData;
    let client!: PublicClient;

    while (currentTry <= Config.retryCount) {
        if (currentTry == Config.retryCount) {
            printError(
                `Не нашел баланс для бриджа в Minter Merkly Bridge. Превышено количество попыток - [${currentTry}/${Config.retryCount}]\n`,
            );
            return false;
        }

        bridgeData = await getBridgeData(true, firstChain ? firstChain : '', secondChain ? secondChain : '');

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
            adapterParams = encodePacked(
                ['uint16', 'uint', 'uint', 'address'],
                [2, BigInt(2e5), value, account.address],
            );

            id = Config.rpcs.find((chain) => chain.chain === bridgeData.secondChainData.chain.network)!.id!;

            estimateFee = await client.readContract({
                address: <`0x${string}`>bridgeData.firstChainData.contract,
                abi: minterAbi,
                functionName: 'estimateSendFee',
                args: [id, <`0x${string}`>account.address.toLowerCase(), <`0x${string}`>adapterParams],
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

    const { request } = await client
        .simulateContract({
            address: <`0x${string}`>bridgeData!.firstChainData.contract,
            abi: minterAbi,
            functionName: 'bridgeGas',
            args: [id!, <`0x${string}`>account.address.toLowerCase(), <`0x${string}`>adapterParams],
            account: account,
            value: BigInt(value!) + BigInt(parseFloat(estimateFee![0].toString())),
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля Minter Merkly bridge - ${e}`);
            return { request: undefined };
        });

    if (request !== undefined) {
        const hash = await walletClient.writeContract(request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля Minter Merkly bridge - ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${bridgeData!.firstChainData.chain.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅MinterMerkly: bridge ${bridgeData!.firstChainData.chain.name}=>${
                bridgeData!.secondChainData.chain.name
            } ${formatUnits(value!, 18)} ${
                bridgeData!.secondChainData.chain.nativeCurrency.symbol
            } <a href='${url}'>link</a>`,
        );

        return true;
    }

    return false;
}
