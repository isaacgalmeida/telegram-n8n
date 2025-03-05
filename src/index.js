// src/index.js
const { startClient, client } = require('./telegramClient');
const { sendToN8N } = require('./webhook');
const { acquireLock } = require('./redundancy');
const { NewMessage } = require('telegram/events');

async function startTelegramMonitoring() {
  await startClient(async (update) => {
    let mediaLink = null;
    if (update.message.media) {
      try {
        // Se for uma foto (MessageMediaPhoto), use a propriedade "photo"
        let mediaObj = update.message.media;
        if (mediaObj.photo) {
          mediaObj = mediaObj.photo;
        }
        mediaLink = await client.getFileLink(mediaObj);
      } catch (err) {
        console.error("Erro ao obter link da mídia:", err);
      }
    }
    
    const messageData = {
      id: update.message.id,
      text: update.message.message,
      media: mediaLink || null,
      date: update.message.date,
    };

    console.log('Mensagem recebida:', messageData);
    await sendToN8N(messageData);
  }, new NewMessage({}));
}

async function main() {
  const lock = await acquireLock();

  if (!lock) {
    console.log('Instância em standby. Monitorando lock para assumir quando liberado...');
    setInterval(async () => {
      const newLock = await acquireLock();
      if (newLock) {
        console.log('Esta instância assumiu o papel ativo.');
        await startTelegramMonitoring();
      }
    }, 10000);
  } else {
    await startTelegramMonitoring();
    
    setInterval(async () => {
      try {
        await lock.extend(30000);
        console.log('Lock renovado');
      } catch (err) {
        console.error('Falha ao renovar o lock:', err.message);
      }
    }, 25000);
  }
  
  // Mantém o processo ativo
  setInterval(() => {}, 1000);
}

main().catch((err) => console.error('Erro no main:', err));
