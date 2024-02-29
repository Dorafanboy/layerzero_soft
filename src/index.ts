import { privateKeyToAccount } from 'viem/accounts';
import fs from 'fs';
import readline from 'readline';
import { printError, printInfo, printSuccess } from './data/logger/logPrinter';
import { delay } from './data/helpers/delayer';
import {
    AngleBridgeConfig,
    Config,
    DefiKingdom,
    GasZipConfig,
    L2PassConfig,
    Layer3Config,
    MerklyData,
    OkxData,
    StargateConfig,
    TelegramData,
} from './config';
import { gasRefuel, l2passMint } from './core/l2pass/l2pass';
import { stargateBridge } from './core/stargate/stargate';
import { withdrawAmount } from './data/okx/okx';
import {
    addTextMessage,
    initializeTelegramBot,
    resetTextMessage,
    sendMessage,
    stopTelegramBot,
} from './data/telegram/telegramBot';
import path from 'path';
import { minterBridge } from './core/minter/minter';
import { bridgeGold } from './core/defiKingdom/defiKingdom';
import { IFunction } from './data/utils/interfaces';
import { loadState, saveData } from './database/database';
import { gasZipBridge, test } from './core/gasZip/gasZip';
import { useAngleBridge } from './core/angleBridge/angleBridge';
import { Hex } from 'viem';
import { bridgeLayer3 } from './core/layer3/layer3';

let account;

const privateKeysFilePath = path.join(__dirname, 'assets', 'private_keys');
const subaccsFilePath = path.join(__dirname, 'assets', 'subaccs.txt');

const privateKeysPath = fs.createReadStream(privateKeysFilePath);
const subaccsPath = fs.createReadStream(subaccsFilePath);

const privateKeysLines = getFileLines(privateKeysFilePath);
const proxiesLines = getFileLines(subaccsFilePath);

let addressToWithdraw: Hex = '0x';

const functions: { [key: string]: IFunction } = {
    // minterBridge: { func: minterBridge, isUse: MerklyData.isUse },
    // l2passMint: { func: l2passMint, isUse: L2PassConfig.isUseBridgeNFT },
    // stargateBridge: { func: stargateBridge, isUse: StargateConfig.isUse },
    // gasRefuel: { func: gasRefuel, isUse: L2PassConfig.isUseGasRefuel },
    // bridgeGold: { func: bridgeGold, isUse: DefiKingdom.isUse },
    //gasZipBridge: { func: gasZipBridge, isUse: GasZipConfig.isUse },
    angleBridge: {
        func: (account) => useAngleBridge(account, addressToWithdraw),
        isUse: AngleBridgeConfig.isUse,
        addressToWithdraw,
    },
    // bridgeLayer3: { func: bridgeLayer3, isUse: Layer3Config.isUse },
};

const filteredFunctions = Object.keys(functions)
    .filter((key) => functions[key].isUse)
    .map((key) => functions[key].func);

if (filteredFunctions.length == 0) {
    printError(`Нету модулей для запуска`);
    throw `No modules`;
}

async function main() {
    const rl = readline.createInterface({
        input: privateKeysPath,
        crlfDelay: Infinity,
    });

    let index = 0,
        modulesCount = 0;

    process.on('SIGINT', () => {
        saveData({ accountIndex: index, remainingModules: modulesCount });
        printInfo(
            `Записал состояние в базу данных, номер аккаунта - ${
                index + 1
            }, кол-во оставшихся модулей - ${modulesCount}`,
        );
        process.exit();
    });

    let rlSubaccs: readline.Interface | undefined;
    let subaccsIterator: AsyncIterableIterator<string> | undefined;

    if (Config.IsUseSubaccs) {
        if (privateKeysLines.length !== proxiesLines.length) {
            printError(
                `Длинны файлов приватников - ${privateKeysLines.length} и субакков - ${proxiesLines.length} не совпадают `,
            );
            return;
        }

        rlSubaccs = readline.createInterface({
            input: subaccsPath,
            crlfDelay: Infinity,
        });

        subaccsIterator = rlSubaccs[Symbol.asyncIterator]() as AsyncIterableIterator<string>;
    }

    const data = fs.readFileSync(privateKeysFilePath, 'utf8');

    const count = data.split('\n').length;
    await initializeTelegramBot(TelegramData.telegramBotId, TelegramData.telegramId);

    let isLoadState = Config.IsLoadState;

    for await (const line of rl) {
        try {
            if (line == '') {
                printError(`Ошибка, пустая строка в файле private_keys.txt`);
                return;
            }

            if (Config.IsShuffleWallets) {
                if (Config.IsShuffleSubaccs) {
                    printInfo(`Произвожу перемешивание кошельков вместе с приватными ключами.`);
                    await shuffleManyData();
                } else {
                    printInfo(`Произвожу перемешивание только кошельков.`);
                    await shuffleData();
                }

                printSuccess(`Кошельки успешно перемешаны.\n`);
            }

            const state = loadState();

            if (isLoadState && state.accountIndex != 0) {
                if (index >= state.accountIndex - 1) {
                    isLoadState = false;
                    printInfo(`Загружаю аккаунт, с которого продолжить работу из базы данных.\n`);
                    index++;
                } else {
                    index++;
                }
            } else {
                addressToWithdraw = Config.IsUseSubaccs ? (await subaccsIterator!.next()).value : '0x';

                account = privateKeyToAccount(<`0x${string}`>line);
                printInfo(`Start [${index + 1}/${count} - ${account.address}]\n`);

                await addTextMessage(`${index + 1}/${count} - ${account.address}\n`);

                await withdrawAmount(account.address, OkxData.bridgeData, OkxData.isUse);

                modulesCount = Math.floor(
                    Math.random() * (Config.modulesCount.maxRange - Config.modulesCount.minRange) +
                        Config.modulesCount.minRange,
                );

                const state = loadState();

                if (Config.IsLoadState && state.remainingModules != 0) {
                    const remainingModules = state.remainingModules;

                    printInfo(`Загружаю количество оставшихся модулей на аккаунте из базы данных.`);

                    modulesCount = remainingModules;
                }

                printInfo(`Буду выполнять ${modulesCount} модулей на аккаунте\n`);

                for (let i = modulesCount; i > 0; ) {
                    const randomFunction = filteredFunctions[Math.floor(Math.random() * filteredFunctions.length)];

                    const result = await randomFunction(account);
                    i--;

                    if (i != 0) {
                        printInfo(`Осталось выполнить ${i} модулей на аккаунте\n`);

                        if (result == true) {
                            await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);
                        } else {
                            await delay(Config.delayBetweenAction.minRange, Config.delayBetweenAction.maxRange, false);
                        }
                    }
                }

                printSuccess(`Ended [${index + 1}/${count} - ${account.address}]\n`);

                await sendMessage();
                await resetTextMessage();

                fs.appendFile('assets/completed_accounts', `${line}\n`, 'utf8', (err) => {
                    if (err) {
                        printError(`Произошла ошибка при записи в файл: ${err}`);
                    }
                });

                index++;

                if (index == count) {
                    printSuccess(`Все аккаунты отработаны`);
                    rl.close();
                    await stopTelegramBot();
                    return;
                }

                printInfo(`Ожидаю получение нового аккаунта`);
                await delay(Config.delayBetweenAccounts.minRange, Config.delayBetweenAccounts.maxRange, false);
            }
        } catch (e) {
            printError(`Произошла ошибка при обработке строки: ${e}\n`);

            await addTextMessage(`❌Аккаунт отработал с ошибкой`);
            await sendMessage();
            await resetTextMessage();

            printInfo(`Ожидаю получение нового аккаунта`);
            await delay(Config.delayBetweenAccounts.minRange, Config.delayBetweenAccounts.maxRange, true);
            fs.appendFile('assets/uncompleted_accounts', `${line}\n`, 'utf8', (err) => {
                if (err) {
                    printError(`Произошла ошибка при записи в файл: ${err}`);
                }
            });

            index++;
        }
    }
}

async function shuffleData() {
    try {
        const data1 = fs.readFileSync(privateKeysFilePath, 'utf8');
        const lines1 = data1.split('\n');

        for (let i = lines1.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [lines1[i], lines1[j]] = [lines1[j], lines1[i]];
        }

        await fs.writeFileSync(privateKeysFilePath, lines1.join('\n'), 'utf8');
    } catch (error) {
        printError(`Произошла ошибка во время перемешивания данных: ${error}`);
    }
}

function getFileLines(filePath: string) {
    const data = fs.readFileSync(filePath, 'utf8');
    return data.split('\n');
}

async function shuffleManyData() {
    try {
        const data1 = fs.readFileSync(privateKeysFilePath, 'utf8');
        const data2 = fs.readFileSync(subaccsFilePath, 'utf8');

        const lines1 = data1.split('\n');
        const lines2 = data2.split('\n');

        for (let i = lines1.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [lines1[i], lines1[j]] = [lines1[j], lines1[i]];
            [lines2[i], lines2[j]] = [lines2[j], lines2[i]];
        }

        await fs.writeFileSync(privateKeysFilePath, lines1.join('\n'), 'utf8');
        await fs.writeFileSync(subaccsFilePath, lines2.join('\n'), 'utf8');
    } catch (error) {
        printError(`Произошла ошибка во время перемешивания данных: ${error}`);
    }
}

main();
