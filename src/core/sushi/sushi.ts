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
import { getSwapBalance, getValue } from '../../data/utils/utils';
import { Config, StargateConfig } from '../../config';
import { polygon } from 'viem/chains';
import { sushiAbi } from '../../abis/sushiAbi';
import axios from 'axios';
import { printError, printInfo, printSuccess } from '../../data/logger/logPrinter';
import { delay } from '../../data/helpers/delayer';
import { addTextMessage } from '../../data/telegram/telegramBot';

const sushiPolygonContract: Hex = '0xb45e53277a7e0f1d35f2a77160e91e25507f1763';
const stgPolygonContract: Hex = '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590';
const tokenIn: Hex = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export async function swapToSTG(account: PrivateKeyAccount) {
    const network = Config.rpcs.find((rpc) => rpc.chain === polygon.network);

    if (network === undefined) {
        return;
    }

    const client: PublicClient = createPublicClient({
        chain: polygon,
        transport: network.rpcUrl == null ? http() : http(network.rpcUrl),
    });

    const stgBalance = await getSwapBalance(client, account.address, stgPolygonContract);

    if (BigInt(stgBalance.toString()) > 0) {
        return true;
    }

    printInfo(`Выполняю модуль покупки STG за MATIC на площадке sushi`);

    const gasPrice = await client.getGasPrice();

    let value,
        currentTry = 0;
    while (currentTry <= Config.retryCount) {
        if (currentTry == Config.retryCount) {
            printError(
                `Не нашел баланс для свапа MATIC в STG. Превышено количество попыток - [${currentTry}/${Config.retryCount}]\n`,
            );
            return false;
        }

        value = await getValue(
            client,
            account.address,
            StargateConfig.stgAmount.range,
            StargateConfig.stgAmount.fixed,
            true,
        );

        currentTry++;

        if (value != null && value != BigInt(-1)) {
            currentTry = Config.retryCount + 1;
        }
    }

    const sushiResponse = await axios.get(
        `https://api.sushi.com/swap/v4/137?&tokenIn=${tokenIn}&tokenOut=${stgPolygonContract}&amount=${value?.toString()}&maxPriceImpact=0.005&gasPrice=${gasPrice.toString()}&to=${
            account.address
        }&preferSushi=true`,
    );

    const amountOutMin = sushiResponse.data.routeProcessorArgs.amountOutMin;
    const route = sushiResponse.data.routeProcessorArgs.routeCode;

    if (value !== undefined) {
        printInfo(`Покупаю ${formatUnits(amountOutMin, 18)} STG за ${formatUnits(value, 18)} MATIC`);

        const walletClient: WalletClient = createWalletClient({
            chain: polygon,
            transport: network.rpcUrl == null ? http() : http(network.rpcUrl),
        });

        const { request } = await client
            .simulateContract({
                address: sushiPolygonContract,
                abi: sushiAbi,
                functionName: 'processRoute',
                args: [tokenIn, BigInt(value.toString()), stgPolygonContract, amountOutMin, account.address, route],
                account: account,
                value: BigInt(value),
            })
            .then((result) => result as SimulateContractReturnType)
            .catch((e) => {
                printError(`Произошла ошибка во время выполнения модуля STG за MATIC на площадке sushi - ${e}`);
                return { request: undefined };
            });

        if (request !== undefined) {
            const hash = await walletClient.writeContract(request).catch((e) => {
                printError(`Произошла ошибка во время выполнения модуля STG за MATIC на площадке sushi - ${e}`);
                return false;
            });

            if (hash === false) {
                return false;
            }

            const url = `${polygon.blockExplorers.default.url + '/tx/' + hash}`;

            printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);
            await addTextMessage(
                `✅Sushi: buy ${formatUnits(amountOutMin, 18)} STG for ${formatUnits(
                    value,
                    18,
                )} MATIC <a href='${url}'>link</a>`,
            );

            await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);

            return true;
        }
    }

    return false;
}
