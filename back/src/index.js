require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');

// Inicjalizacja Prisma Client
const prisma = new PrismaClient();

// Inicjalizacja Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Import tras
const labelRoutes = require('./routes/labels');

// Użycie tras
app.use('/api/labels', labelRoutes);

// Trasa główna API
app.get('/', (req, res) => {
  res.json({ message: 'API LabelApp działa poprawnie' });
});

// Obsługa błędów
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Wystąpił błąd serwera' });
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

// Obsługa zamykania połączenia do bazy danych przy zamknięciu aplikacji
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});