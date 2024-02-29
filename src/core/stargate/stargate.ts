import {
    createPublicClient,
    createWalletClient,
    formatUnits,
    Hex,
    http,
    PrivateKeyAccount,
    PublicClient,
    SimulateContractReturnType,
    WalletClient,
} from 'viem';
import { Config, StargateConfig } from '../../config';
import { swapToSTG } from '../sushi/sushi';
import { printError, printInfo, printSuccess } from '../../data/logger/logPrinter';
import { polygon } from 'viem/chains';
import { getSwapBalance } from '../../data/utils/utils';
import { stargateAbi } from '../../abis/stargateAbi';
import { addTextMessage } from '../../data/telegram/telegramBot';

const stgPolygonContract: Hex = '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590';
const polygonStargateContract: Hex = '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590';

const kavaDstChainId: number = 177;

const zroPaymentAddress: Hex = '0x0000000000000000000000000000000000000000';
const adapterParam: Hex = '0x00010000000000000000000000000000000000000000000000000000000000014c08';

export async function stargateBridge(account: PrivateKeyAccount) {
    printInfo(`Выполняю модуль Stargate Bridge`);

    const isHaveStg = await swapToSTG(account);

    if (isHaveStg == false) {
        printError(`На аккаунте нету STG токена. Невозможно сделать модуль Stargate Bridge`);
        return false;
    }

    const network = Config.rpcs.find((rpc) => rpc.chain === polygon.network);

    if (network === undefined) {
        return false;
    }

    const client: PublicClient = createPublicClient({
        chain: polygon,
        transport: network.rpcUrl == null ? http() : http(network.rpcUrl),
    });

    const stgBalance = await getSwapBalance(client, account.address, stgPolygonContract);

    const fixed = Math.floor(
        Math.random() * (StargateConfig.bridgePercent.fixed.maxRange - StargateConfig.bridgePercent.fixed.minRange) +
            StargateConfig.bridgePercent.fixed.minRange,
    );

    const percent = Math.floor(
        Math.random() * (StargateConfig.bridgePercent.range.maxRange - StargateConfig.bridgePercent.range.minRange) +
            StargateConfig.bridgePercent.range.minRange,
    );

    const value = (BigInt(stgBalance.toString()) / BigInt(100)) * BigInt(percent);

    const bridgeValue = Number(formatUnits(value, 18)).toFixed(fixed);

    printInfo(`Произвожу бридж ${bridgeValue} STG из сети Polygon в Kava EVM`);

    const estimateSendFee = BigInt('51769620501263306');

    const { request } = await client
        .simulateContract({
            address: polygonStargateContract,
            abi: stargateAbi,
            functionName: 'sendTokens',
            args: [
                kavaDstChainId,
                <`0x${string}`>account.address.toLowerCase(),
                BigInt(value.toString()),
                zroPaymentAddress,
                adapterParam,
            ],
            account: account,
            value: estimateSendFee,
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля Stargate Bridge - ${e}`);
            return { request: undefined };
        });

    const walletClient: WalletClient = createWalletClient({
        chain: polygon,
        transport: network.rpcUrl == null ? http() : http(network.rpcUrl),
    });

    if (request !== undefined) {
        const hash = await walletClient.writeContract(request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля Stargate Bridge - ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${polygon.blockExplorers.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(`✅Stargate: bridge ${bridgeValue} STG Polygon=>Kava EVM <a href='${url}'>link</a>`);

        return true;
    }

    return false;
}
