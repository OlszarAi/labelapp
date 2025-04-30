const { PrismaClient } = require('@prisma/client');

// Inicjalizacja Prisma Client z logowaniem zapytań w trybie deweloperskim
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Eksport instancji Prisma Client
module.exports = prisma;