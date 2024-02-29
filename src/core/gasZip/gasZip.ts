import {
    createPublicClient,
    createWalletClient,
    encodePacked,
    formatUnits,
    Hex,
    hexToSignature,
    http,
    parseEther,
    parseUnits,
    PrivateKeyAccount,
    PublicClient,
    SignTypedDataParameters,
    SimulateContractReturnType,
    zeroAddress,
} from 'viem';
import { Config, GasZipConfig } from '../../config';
import { printError, printInfo, printSuccess } from '../../data/logger/logPrinter';
import { addTextMessage } from '../../data/telegram/telegramBot';
import { IBridgeChainsData, IChainData, IKeyValue } from '../../data/utils/interfaces';
import { GasZipConfigData } from './gasZipConfig';
import { gasZipABI } from '../../abis/gasZipABI';
import { getBridgeBalance } from '../../data/utils/utils';
import { delay } from '../../data/helpers/delayer';
import * as console from 'console';
import { celo, polygon } from 'viem/chains';

const contractAddress = '0x26DA582889f59EaaE9dA1f063bE0140CD93E6a4f';

export async function gasZipBridge(account: PrivateKeyAccount) {
    printInfo(`Выполняю модуль Gas Zip Bridge`);

    let currentTry: number = 0,
        network,
        lzFee,
        adapterParamsDeposit;

    let bridgeData: IBridgeChainsData | null;
    let client!: PublicClient;

    while (currentTry <= Config.retryCount) {
        if (currentTry == Config.retryCount) {
            printError(
                `Не нашел баланс для бриджа в Gas Zip Bridge. Превышено количество попыток - [${currentTry}/${Config.retryCount}]\n`,
            );
            return false;
        }

        bridgeData = await getManyBridgeData();

        if (bridgeData == null) {
            printError(`Ошибка выше`);
            return false;
        }

        network = Config.rpcs.find((chain) => chain.chain === bridgeData!.chain.network);

        client = createPublicClient({
            chain: bridgeData.chain,
            transport: network?.rpcUrl == null ? http() : http(network.rpcUrl),
        });

        const balance = await getBridgeBalance(client, account.address);

        printInfo(
            `Пытаюсь произвести бридж из сети ${bridgeData.chain.name} в сети ${bridgeData.chainsName.join(', ')}`,
        );

        currentTry++;

        lzFee = await estimateFees(bridgeData.chainData, client);

        if (balance >= lzFee) {
            currentTry = Config.retryCount + 1;
        } else {
            await delay(Config.delayBetweenAction.minRange, Config.delayBetweenAction.maxRange, false);
        }

        adapterParamsDeposit = await getAdapterParams(bridgeData.chainData);
    }

    let outputMessage = ``;

    for (let i = 0; i < bridgeData!.chainsName.length; i++) {
        outputMessage += `${bridgeData!.chainsName[i]}(${bridgeData!.chainData[i].valueInEther})${
            i != bridgeData!.chainsName.length - 1 ? `,` : ``
        } `;
    }

    printInfo(`Произвожу бридж из сети ${bridgeData!.chain.name} в сети ${outputMessage}`);

    const walletClient = createWalletClient({
        chain: bridgeData!.chain,
        transport: network?.rpcUrl == null ? http() : http(network.rpcUrl),
    });

    const { request } = await client
        .simulateContract({
            address: contractAddress,
            abi: gasZipABI,
            functionName: 'sendDeposits',
            value: lzFee,
            args: [adapterParamsDeposit, account.address],
            account: account,
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля Gas Zip Bridge - ${e}`);
            return { request: undefined };
        });

    if (request !== undefined) {
        const hash = await walletClient.writeContract(request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля Gas Zip Bridge - ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${bridgeData!.chain.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅Gas Zip: bridge ${bridgeData!.chain.name} in chains ${outputMessage} for ${Number(
                formatUnits(lzFee!, 18),
            ).toFixed(5)} ${bridgeData!.chain.nativeCurrency.symbol}  <a href='${url}'>link</a>`,
        );

        return true;
    }

    return false;
}

async function getManyBridgeData(): Promise<IBridgeChainsData | null> {
    const keys = Object.keys(GasZipConfig.values);

    const randomChainFirst = getKeyValue(keys).key;

    const chainName = GasZipConfigData.chains[randomChainFirst].chain.name;

    printInfo(`Буду производить бридж из сети - ${chainName}`);

    const chainCount = Math.floor(
        Math.random() * (GasZipConfig.chainAmount.maxRange - GasZipConfig.chainAmount.minRange) +
            GasZipConfig.chainAmount.minRange,
    );

    const chains: IChainData[] = [];
    const chainsName: string[] = [];

    printInfo(`Буду бриджить в ${chainCount} сетей`);

    if (chainCount > keys.length) {
        printError(`Количество сетей для получения меньше чем количество доступных [GasZipConfig values]`);
        return null;
    }

    for (let i = 0; i < chainCount; i++) {
        const randomChainSecond = getKeyValue(keys);

        const range =
            Math.random() * (randomChainSecond.value.range.maxRange - randomChainSecond.value.range.minRange) +
            randomChainSecond.value.range.minRange;

        const fixed = Math.floor(
            Math.random() * (randomChainSecond.value.fixed.maxRange - randomChainSecond.value.fixed.minRange) +
                randomChainSecond.value.fixed.minRange,
        );

        const v2LZid = Config.rpcs.find((rpc) => rpc.chain === randomChainSecond.key)?.id;
        const chain = GasZipConfigData.chains[randomChainSecond.key].chain;

        chainsName.push(chain.name);
        chains.push({ v2LZid: 30000 + v2LZid!, chainId: chain.id.toString(), valueInEther: range.toFixed(fixed) });
    }

    printInfo(`В качестве сетей получателей были выбраны: ${chainsName.join(', ')}`);

    return {
        chain: GasZipConfigData.chains[randomChainFirst].chain,
        chainData: chains,
        chainsName: chainsName,
    };
}

function getKeyValue(keys: string[]): IKeyValue {
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const randomValue = GasZipConfig.values[randomKey];

    keys.splice(keys.indexOf(randomKey), 1);

    return {
        key: randomKey,
        value: randomValue,
    };
}

function createReceiveOptions(gasLimit: bigint) {
    return encodePacked(
        ['bytes', 'uint8', 'uint16', 'uint8', 'bytes'],
        [encodePacked(['uint16'], [3]), 1, 16 + 1, 1, encodePacked(['uint128'], [gasLimit])],
    );
}

async function estimateFees(chainsData: IChainData[], client: PublicClient): Promise<bigint> {
    const feeChains: {
        v2LZid: number;
        chainId: string;
    }[] = [];

    const options: `0x${string}`[] = [];
    const messages: `0x${string}`[] = [];

    for (const chainData of chainsData) {
        feeChains.push({
            v2LZid: chainData.v2LZid,
            chainId: chainData.chainId,
        });

        options.push(createNativeOption(BigInt(20_000), parseEther(chainData.valueInEther), zeroAddress));
        messages.push('0x');
    }

    let fees: bigint[] = [];
    try {
        const v2LZids = feeChains.map((feeChain) => feeChain.v2LZid);

        fees = (await client.readContract({
            address: contractAddress,
            abi: gasZipABI,
            functionName: 'estimateFees',
            args: [v2LZids, messages, options],
        })) as bigint[];
    } catch (error) {
        printError(`Произошла ошибка во время расчета комиссии : ${error}`);
    }

    const lzFees = fees.reduce((p, c) => p + c, BigInt(0));
    return lzFees;
}

function createNativeOption(gasLimit: bigint, amount: bigint, to: string) {
    return encodePacked(
        ['bytes', 'uint8', 'uint16', 'uint8', 'bytes'],
        [
            createReceiveOptions(gasLimit),
            1,
            32 + 16 + 1,
            2,
            encodePacked(['uint128', 'bytes32'], [amount, `0x${to.slice(2).padStart(64, '0')}` as `0x${string}`]),
        ],
    );
}

function createOptimizedAdapterParams(dstChainId: bigint, nativeAmount: bigint) {
    return (dstChainId << BigInt(224)) | nativeAmount;
}

async function getAdapterParams(chainsData: IChainData[]) {
    const adapterParamsDeposit = [];

    for (const chainData of chainsData) {
        adapterParamsDeposit.push(
            createOptimizedAdapterParams(BigInt(chainData.v2LZid), parseEther(chainData.valueInEther)),
        );
    }

    return adapterParamsDeposit;
}

export async function test(account: PrivateKeyAccount) {
    const message: SignTypedDataParameters<{ Permit: { name: string; type: string }[] }> = {
        account: account,
        primaryType: 'Permit',
        types: {
            Permit: [
                {
                    name: 'owner',
                    type: 'address',
                },
                {
                    name: 'spender',
                    type: 'address',
                },
                {
                    name: 'value',
                    type: 'uint256',
                },
                {
                    name: 'nonce',
                    type: 'uint256',
                },
                {
                    name: 'deadline',
                    type: 'uint256',
                },
            ],
        },
        domain: {
            name: 'agEUR',
            version: '1',
            chainId: 42220,
            verifyingContract: '0xC16B81Af351BA9e64C1a069E3Ab18c244A1E3049',
        },
        message: {
            owner: account.address,
            spender: '0xf1dDcACA7D17f8030Ab2eb54f2D9811365EFe123',
            value: parseUnits('1', 18),
            nonce: BigInt(0),
            deadline: BigInt(1708415971),
        },
    };

    const walletClient = createWalletClient({
        chain: celo,
        transport: http('https://1rpc.io/celo'),
    });

    console.log(message);
    const signature = await walletClient.signTypedData(message);
    const { r, s, v } = hexToSignature(signature);

    console.log(r, s, v);
    return false;
}

async function getMessageStructure(address: Hex, value: string, spender: Hex, deadline: string) {
    return {
        owner: address,
        spender: spender,
        value: value,
        nonce: 0,
        deadline: deadline,
    };
}
