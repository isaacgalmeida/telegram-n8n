// src/telegramClient.js

const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const readline = require('readline');

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const sessionStringFromEnv = process.env.TELEGRAM_SESSION_STRING || "";
const stringSession = new StringSession(sessionStringFromEnv);
const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

async function startClient(onMessageCallback) {
  const interactiveOptions = {};
  if (!sessionStringFromEnv) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    interactiveOptions.phoneNumber = async () =>
      new Promise((resolve) =>
        rl.question("Por favor, informe seu número: ", resolve)
      );
    interactiveOptions.password = async () =>
      new Promise((resolve) =>
        rl.question("Por favor, informe sua senha (se necessário): ", resolve)
      );
    interactiveOptions.phoneCode = async () =>
      new Promise((resolve) =>
        rl.question("Por favor, informe o código recebido: ", resolve)
      );
  }

  try {
    await client.start({
      ...interactiveOptions,
      onError: (err) => console.error("Erro no start:", err),
    });
  } catch (err) {
    console.error("Falha na autenticação:", err);
    throw err;
  }

  if (!sessionStringFromEnv) {
    console.log("Session string gerada, salve-a para evitar login interativo novamente:");
    console.log(client.session.save());
  }

  console.log("Cliente do Telegram conectado.");
  // Usa o filtro correto para novas mensagens
  client.addEventHandler(onMessageCallback, new NewMessage({}));
  return client;
}

module.exports = { client, startClient };
