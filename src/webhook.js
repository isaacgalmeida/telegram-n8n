const axios = require('axios');
const { client } = require('./telegramClient');

// URL do webhook do N8N (pode vir de variável de ambiente)
const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

// ID do chat ou grupo para notificação de erros
const telegramErrorChatId = process.env.TELEGRAM_ERROR_CHAT_ID;

async function sendToN8N(messageData) {
  try {
    // Envia os dados via POST para o N8N
    const response = await axios.post(n8nWebhookUrl, messageData);
    console.log('Mensagem enviada para o N8N:', response.status);
  } catch (error) {
    console.error('Erro ao enviar para o N8N:', error.message);
    // Notifica o grupo no Telegram sobre o erro
    await notifyError(error.message, messageData);
  }
}

async function notifyError(errorMessage, messageData) {
  try {
    // Envia uma mensagem para o grupo usando o próprio client
    await client.sendMessage(telegramErrorChatId, {
      message: `Erro ao enviar mensagem para o N8N: ${errorMessage}\nDados: ${JSON.stringify(messageData)}`,
    });
  } catch (notifyError) {
    console.error('Falha ao notificar o grupo sobre o erro:', notifyError.message);
  }
}

module.exports = { sendToN8N };
