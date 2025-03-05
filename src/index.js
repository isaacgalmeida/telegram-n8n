require('dotenv').config();
const { startClient } = require('./telegramClient');
const { sendToN8N } = require('./webhook');
const { acquireLock } = require('./redundancy');

async function main() {
  // Tenta adquirir o lock para definir a instância ativa
  const lock = await acquireLock();

  if (!lock) {
    console.log('Instância em standby. Monitorando lock para assumir quando liberado...');
    // Implemente um mecanismo para re-tentar periodicamente (por exemplo, a cada 10 segundos)
    setInterval(async () => {
      const newLock = await acquireLock();
      if (newLock) {
        console.log('Esta instância assumiu o papel ativo.');
        startTelegramMonitoring();
      }
    }, 10000);
  } else {
    // Se o lock foi adquirido, inicia o monitoramento
    startTelegramMonitoring();
    
    // Renovação do lock (opcional) para evitar expiração
    setInterval(async () => {
      try {
        await lock.extend(30000);
        console.log('Lock renovado');
      } catch (err) {
        console.error('Falha ao renovar o lock:', err.message);
      }
    }, 25000);
  }
}

async function startTelegramMonitoring() {
  await startClient(async (update) => {
    // Extraia a mensagem ou mídia do update (ajuste conforme o formato do update recebido)
    const messageData = {
      id: update.message.id,
      text: update.message.message,
      // Se houver mídia, inclua detalhes ou URLs, se possível
      media: update.message.media ? update.message.media.toString() : null,
      date: update.message.date,
    };

    console.log('Mensagem recebida:', messageData);

    // Envia para o N8N
    await sendToN8N(messageData);
  });
}

main().catch((err) => console.error('Erro no main:', err));
