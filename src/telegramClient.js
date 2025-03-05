const { TelegramClient } = require('gramjs');
const { StringSession } = require('gramjs/sessions');
const { Api } = require('gramjs');
const input = require('input'); // para inputs interativos, se necessário

// Valores de configuração
const apiId = process.env.TELEGRAM_API_ID;
const apiHash = process.env.TELEGRAM_API_HASH;
const stringSession = new StringSession(process.env.TELEGRAM_SESSION_STRING); 

// Criação do cliente
const client = new TelegramClient(stringSession, Number(apiId), apiHash, {
  connectionRetries: 5,
});

// Função para iniciar o cliente e ouvir mensagens
async function startClient(onMessageCallback) {
  await client.start({
    // Se precisar de autenticação interativa (caso a session string não seja válida)
    // phoneNumber: async () => await input.text('Informe o número de telefone: '),
    // password: async () => await input.text('Informe a senha, se necessário: '),
    // phoneCode: async () => await input.text('Código recebido: '),
    // onError: (err) => console.error(err),
  });
  
  console.log('Cliente do Telegram conectado.');
  
  // Escuta de eventos de novas mensagens (incluindo mídia)
  client.addEventHandler(onMessageCallback, new Api.UpdateNewMessage({}));
  
  return client;
}

module.exports = { client, startClient };
