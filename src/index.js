const { startClient } = require('./telegramClient');
const { sendToN8N } = require('./webhook');
const { acquireLock } = require('./redundancy');
// Importa o filtro correto para novas mensagens
const { NewMessage } = require('telegram/events');

async function startTelegramMonitoring() {
  await startClient(async (update) => {
    // Extrai os dados da mensagem recebida
    const messageData = {
      id: update.message.id,
      text: update.message.message,
      media: update.message.media ? update.message.media.toString() : null,
      date: update.message.date,
    };

    console.log('Mensagem recebida:', messageData);
    await sendToN8N(messageData);
  }, new NewMessage({}));
}

async function main() {
  // Tenta adquirir o lock para definir a instância ativa
  const lock = await acquireLock();

  if (!lock) {
    console.log('Instância em standby. Monitorando lock para assumir quando liberado...');
    // Tenta a cada 10 segundos adquirir o lock
    setInterval(async () => {
      const newLock = await acquireLock();
      if (newLock) {
        console.log('Esta instância assumiu o papel ativo.');
        await startTelegramMonitoring();
      }
    }, 10000);
  } else {
    // Se o lock foi adquirido, inicia o monitoramento
    await startTelegramMonitoring();
    
    // Renovação do lock para evitar expiração
    setInterval(async () => {
      try {
        await lock.extend(30000);
        console.log('Lock renovado');
      } catch (err) {
        console.error('Falha ao renovar o lock:', err.message);
      }
    }, 25000);
  }
  
  // Impede que o processo termine, mantendo o event loop ativo
  setInterval(() => {}, 1000);
}

main().catch((err) => console.error('Erro no main:', err));
