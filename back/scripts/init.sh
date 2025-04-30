#!/bin/sh

# Czekanie na bazę danych PostgreSQL
echo "Oczekiwanie na uruchomienie bazy danych..."
npx wait-on tcp:db:5432 -t 60000

# Uruchamianie migracji Prisma
echo "Uruchamianie migracji Prisma..."
npx prisma migrate deploy

# Generowanie klienta Prisma
echo "Generowanie klienta Prisma..."
npx prisma generate

# Uruchomienie aplikacji
echo "Uruchamianie serwera..."
npm run dev