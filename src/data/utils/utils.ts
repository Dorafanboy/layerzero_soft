import { IBridgeRange, IFixedRange, IOneToOneBridgeData } from './interfaces';
import { formatUnits, Hex, parseEther, parseUnits, PublicClient } from 'viem';
import { Config, L2PassConfig, MerklyData } from '../../config';
import { delay } from '../helpers/delayer';
import { printInfo } from '../logger/logPrinter';
import { agEURAbi } from '../../abis/agEURAbi';
import { MinterMerklyConfig } from '../../core/minter/minterConfig';
import * as console from 'console';

export async function getValue(
    client: PublicClient,
    address: Hex,
    bridgeRange: IBridgeRange,
    fixedRange: IFixedRange,
    isBridge: boolean,
    tokenBalance: bigint = BigInt(-1),
): Promise<bigint> {
    const balance = tokenBalance == BigInt(-1) ? await getBridgeBalance(client, address) : tokenBalance;

    let value = 0,
        fixed,
        currentTry = 0;
    let weiValue: bigint = parseEther('0');
    const decimals = isBridge ? 18 : 6;

    if (balance == parseEther('0')) {
        return BigInt(-1);
    }

    while (weiValue > balance || weiValue == parseEther('0')) {
        if (currentTry < Config.retryCount) {
            value = Math.random() * (bridgeRange.maxRange - bridgeRange.minRange) + bridgeRange.minRange;
            fixed = Math.floor(Math.random() * (fixedRange.maxRange - fixedRange.minRange) + fixedRange.minRange);

            weiValue = parseEther(value.toFixed(fixed));
            const compareValue = isBridge ? weiValue : parseUnits(value.toFixed(fixed), 6);

            if (compareValue > balance) {
                printInfo(
                    `Полученное значение для ${isBridge ? 'бриджа' : 'свапа'} ${value.toFixed(
                        fixed,
                    )} больше чем баланс ${Number(formatUnits(balance, decimals)).toFixed(fixed)}`,
                );

                currentTry++;
                await delay(Config.delayBetweenAction.minRange, Config.delayBetweenAction.maxRange, false);
            } else {
                return isBridge ? weiValue : parseUnits(value.toFixed(fixed), 6);
            }
        } else {
            printInfo(
                `Не было найдено необходимого кол-во средств для ${isBridge ? 'бриджа' : 'свапа'} в сети ${client.chain
                    ?.name}\n`,
            );

            return BigInt(-1);
        }
    }

    return isBridge ? weiValue : parseUnits(value.toFixed(fixed), 6);
}

export async function getBridgeBalance(client: PublicClient, address: Hex) {
    const balance = await client.getBalance({
        address: address,
    });

    await checkZeroBalance(client, balance);

    return balance;
}

export async function getSwapBalance(client: PublicClient, address: Hex, tokenAddress: Hex) {
    const balance = await client.readContract({
        address: tokenAddress,
        abi: agEURAbi,
        functionName: 'balanceOf',
        args: [address],
    });

    await checkZeroBalance(client, parseUnits(balance.toString(), 0));

    return balance;
}

async function checkZeroBalance(client: PublicClient, balance: bigint) {
    if (balance == parseEther('0')) {
        printInfo(`Баланс аккаунта в сети ${client.chain?.name} равен нулю\n`);
        await delay(Config.delayBetweenAction.minRange, Config.delayBetweenAction.maxRange, false);

        return parseEther('0');
    }
}

export async function getBridgeData(
    isMerkly: boolean,
    firstChain?: string,
    secondChain?: string,
): Promise<IOneToOneBridgeData> {
    let randomChainFirst = firstChain,
        randomChainSecond = secondChain;
    let maxValueBridge;

    const keys = Object.keys(MinterMerklyConfig.chains);

    do {
        if (randomChainFirst == randomChainSecond) {
            randomChainFirst = keys[Math.floor(Math.random() * keys.length)];
            randomChainSecond = keys[Math.floor(Math.random() * keys.length)];
        }

        const path = `${MinterMerklyConfig.chains[randomChainFirst!].chain.name},${
            MinterMerklyConfig.chains[randomChainSecond!].chain.name
        }`;

        maxValueBridge = isMerkly ? MerklyData.values[path] : L2PassConfig.values[path];

        console.log(maxValueBridge);
        if (maxValueBridge == undefined) {
            randomChainFirst = '';
            randomChainSecond = '';
        }
    } while (randomChainFirst == randomChainSecond);

    return {
        firstChainData: MinterMerklyConfig.chains[randomChainFirst!],
        secondChainData: MinterMerklyConfig.chains[randomChainSecond!],
        value: maxValueBridge!,
    };
}
