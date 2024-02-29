import { printInfo } from '../logger/logPrinter';

export async function delay(min: number, max: number, isMinutes: boolean) {
    const delayMinutes = Math.random() * (max - min) + min;
    const totalSeconds = isMinutes ? delayMinutes * 60 : delayMinutes;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    printInfo(`${isMinutes ? `Ожидаю ${minutes} минут ${seconds} секунд` : `Ожидаю ${seconds} секунд\n`}`);

    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, totalSeconds * 1000);
    });
}
