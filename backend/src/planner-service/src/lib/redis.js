const Redis = require('ioredis');

const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 5) return null;
    return Math.min(times * 200, 2000);
  },
});

client.on('error', (err) => {
  console.error('[redis] connection error:', err.message);
});

module.exports = client;
