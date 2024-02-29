import TelegramApi from 'node-telegram-bot-api';

let message = '';
let telegramBot: TelegramApi;
let userId: string;

export async function initializeTelegramBot(telegramBotId: string, receiveUserId: string) {
    telegramBot = new TelegramApi(telegramBotId.toString(), { polling: true });
    userId = receiveUserId;
}

export async function addTextMessage(text: string) {
    message += text + '\n';
}

export async function sendMessage() {
    await telegramBot.sendMessage(userId, message, { parse_mode: 'HTML' });
}

export async function resetTextMessage() {
    message = '';
}

export async function stopTelegramBot() {
    await telegramBot.stopPolling();
}
