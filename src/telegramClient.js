// src/telegramClient.js
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

const apiId = process.env.TELEGRAM_API_ID;
const apiHash = process.env.TELEGRAM_API_HASH;
const sessionString = process.env.TELEGRAM_SESSION_STRING;

if (!sessionString) {
  throw new Error("A variável TELEGRAM_SESSION_STRING não está definida ou está vazia.");
}

const stringSession = new StringSession(sessionString);
const client = new TelegramClient(stringSession, Number(apiId), apiHash, {
  connectionRetries: 5,
});

async function startClient(onMessageCallback) {
  await client.start({
    // Não passe botAuthToken ou funções para autenticação interativa se a sessão já for válida.
    onError: (err) => console.error(err),
  });
  
  console.log('Cliente do Telegram conectado.');
  client.addEventHandler(onMessageCallback, new Api.UpdateNewMessage({}));
  return client;
}

module.exports = { client, startClient };
