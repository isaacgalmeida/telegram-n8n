// src/telegramClient.js

const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram');
const readline = require('readline');

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;

// Se TELEGRAM_SESSION_STRING estiver vazia, usaremos o fluxo interativo para gerar uma session string.
const sessionStringFromEnv = process.env.TELEGRAM_SESSION_STRING || "";
const stringSession = new StringSession(sessionStringFromEnv);
const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

async function startClient(onMessageCallback) {
  // Se não foi fornecida uma session string válida, configuramos o fluxo interativo.
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

  // Se utilizou o fluxo interativo, exibe a session string gerada para que você a salve.
  if (!sessionStringFromEnv) {
    console.log("Session string gerada, salve-a para evitar login interativo novamente:");
    console.log(client.session.save());
  }

  console.log("Cliente do Telegram conectado.");
  client.addEventHandler(onMessageCallback, new Api.UpdateNewMessage({}));
  return client;
}

module.exports = { client, startClient };
