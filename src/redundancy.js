const Redis = require('ioredis');
const Redlock = require('redlock');

// Configuração do Redis (certifique-se de que as duas VPS apontem para o mesmo Redis ou para um cluster replicado)
const redis = new Redis(process.env.REDIS_URL);

const redlock = new Redlock([redis], {
  retryCount: 0, // Tentativa única para adquirir o lock
  // Pode ajustar retryDelay e outros parâmetros conforme necessário
});

// Função para tentar adquirir o lock
async function acquireLock(lockKey = 'telegram-monitor-lock', ttl = 30000) {
  try {
    const lock = await redlock.acquire([lockKey], ttl);
    console.log('Lock adquirido, este nó está ativo.');
    return lock;
  } catch (error) {
    console.log('Não foi possível adquirir o lock. Este nó ficará em standby.');
    return null;
  }
}

module.exports = { acquireLock };
