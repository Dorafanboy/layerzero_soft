import {
    createPublicClient,
    createWalletClient,
    encodeAbiParameters,
    formatUnits,
    http,
    PrivateKeyAccount,
    PublicClient,
} from 'viem';
import { printError, printInfo, printSuccess } from '../../data/logger/logPrinter';
import { Config } from '../../config';
import { getValue } from '../../data/utils/utils';
import { delay } from '../../data/helpers/delayer';
import { addTextMessage } from '../../data/telegram/telegramBot';
import { functionBridgeSignature, Layer3ConfigData, params, socketContractAddress } from './layer3Config';
import { ILayer3Data } from '../../data/utils/interfaces';

export async function bridgeLayer3(account: PrivateKeyAccount) {
    printInfo(`Выполняю модуль layer3 bridge`);

    let currentTry: number = 0,
        value;

    let client!: PublicClient;

    let randomLayer3Data: ILayer3Data;
    let network;

    while (currentTry <= Config.retryCount) {
        if (currentTry == Config.retryCount) {
            printError(
                `Не нашел баланс для бриджа в Layer3. Превышено количество попыток - [${currentTry}/${Config.retryCount}]\n`,
            );
            return false;
        }

        randomLayer3Data = await getRandomLayer3Data();

        network = Config.rpcs.find((chain) => chain.chain === randomLayer3Data.chain.network);

        client = createPublicClient({
            chain: randomLayer3Data.chain,
            transport: network?.rpcUrl == null ? http() : http(network.rpcUrl),
        });

        printInfo(`Пытаюсь произвести бридж из сети ${randomLayer3Data.chain.name} в сети Gnosis`);

        value = await getValue(client, account.address, randomLayer3Data.range, randomLayer3Data.fixed, true);

        currentTry++;

        if (value != null && value != BigInt(-1)) {
            currentTry = Config.retryCount + 1;
        } else {
            await delay(Config.delayBetweenAction.minRange, Config.delayBetweenAction.maxRange, false);
        }
    }

    printInfo(`Произвожу бридж ${formatUnits(value!, 18)} ${randomLayer3Data!.chain.nativeCurrency} to Gnosis`);

    const data =
        randomLayer3Data!.functionSignature +
        functionBridgeSignature +
        encodeAbiParameters(
            [
                { name: 'amount', type: 'uint256' },
                { name: 'owner', type: 'address' },
                { name: 'chainId', type: 'uint256' },
                { name: 'params', type: 'bytes32' },
            ],
            [value!, account.address, BigInt(100), params],
        );

    const firstIndex = data.indexOf('0x');
    const secondIndex = data.indexOf('0x', firstIndex + 1);

    let preparedData = <`0x${string}`>'0x';

    if (secondIndex !== -1) {
        preparedData = data.slice(0, secondIndex) + data.slice(secondIndex + 2);
    }

    const walletClient = createWalletClient({
        chain: randomLayer3Data!.chain,
        transport: network?.rpcUrl == null ? http() : http(network.rpcUrl),
    });

    const preparedTransaction = await walletClient.prepareTransactionRequest({
        account,
        to: socketContractAddress,
        data: <`0x${string}`>preparedData,
        value: value,
    });

    const signature = await walletClient.signTransaction(preparedTransaction).catch((e) => {
        printError(`Произошла ошибка во время выполнения модуля layer3 bridge - ${e}`);
        return undefined;
    });

    if (signature !== undefined) {
        const hash = await walletClient.sendRawTransaction({ serializedTransaction: signature }).catch((e) => {
            printError(`Произошла ошибка во время выполнения layer3 bridge - ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${randomLayer3Data!.chain.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅Layer3: bridge ${formatUnits(value!, 18)} ${
                randomLayer3Data!.chain.nativeCurrency
            } to Gnosis <a href='${url}'>link</a>`,
        );

        return true;
    }

    return false;
}

async function getRandomLayer3Data(): Promise<ILayer3Data> {
    const keys = Object.keys(Layer3ConfigData.chains);
    const randomChain = keys[Math.floor(Math.random() * keys.length)];

    return Layer3ConfigData.chains[randomChain].data;
}
