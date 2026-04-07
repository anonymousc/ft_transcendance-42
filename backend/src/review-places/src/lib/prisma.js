const { PrismaClient } = require('@prisma/client');

// Singleton — reused across all requests in the same process
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
});

module.exports = prisma;
