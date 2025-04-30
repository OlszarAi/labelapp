FROM node:18.19.1-alpine

# Ustawienie środowiska
ENV NODE_ENV development

WORKDIR /usr/src/app

# Instalacja pakietu wait-on do oczekiwania na dostępność bazy danych
RUN npm install -g wait-on

# Kopiowanie plików package.json i package-lock.json
COPY package*.json ./

# Instalacja zależności
RUN npm install

# Kopiowanie reszty plików projektu
COPY . .

# Nadanie uprawnień wykonywania dla skryptu inicjalizacyjnego
RUN chmod +x ./scripts/init.sh

# Generowanie klienta Prisma
RUN npx prisma generate

# Uruchamianie jako użytkownik node (bezpieczeństwo)
USER node

# Ekspozycja portu API
EXPOSE 3001

# Uruchomienie skryptu inicjalizacyjnego
CMD ["./scripts/init.sh"]