import { format } from 'winston';
import winston = require('winston');

const myCustomLevels = {
    levels: {
        ERROR: 0,
        INFO: 1,
        SUCCESS: 2,
    },
    colors: {
        ERROR: 'red',
        INFO: 'blue',
        SUCCESS: 'green',
    },
};

const logger = winston.createLogger({
    levels: myCustomLevels.levels,
    format: format.combine(
        format.colorize({ level: true, colors: myCustomLevels.colors }),
        format.printf(({ level, message }) => {
            const timestamp = new Date().toLocaleString();
            return `[${timestamp}]\t${level}\t${message}`;
        }),
    ),
    transports: [new winston.transports.Console({ level: 'SUCCESS' })],
});

export function printSuccess(message: string) {
    logger.log('SUCCESS', message);
}

export function printError(message: string) {
    logger.log('ERROR', message);
}

export function printInfo(message: string) {
    logger.log('INFO', message);
}
