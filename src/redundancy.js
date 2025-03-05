const Redis = require('ioredis');
const { default: Redlock } = require('redlock'); // Importação ajustada para redlock v5 beta

// Configuração do Redis (certifique-se que a variável REDIS_URL esteja definida no .env)
const redis = new Redis(process.env.REDIS_URL);

// Cria a instância do Redlock com as configurações desejadas
const redlock = new Redlock([redis], {
  retryCount: 0, // Tenta apenas uma vez adquirir o lock
});

// Função para tentar adquirir o lock distribuído
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
