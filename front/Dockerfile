FROM node:18.19.1-alpine

# Ustawienie środowiska
ENV NODE_ENV development

WORKDIR /usr/src/app

# Kopiowanie plików package.json i package-lock.json
COPY package*.json ./

# Instalacja zależności
RUN npm install

# Kopiowanie reszty plików projektu
COPY . .

# Uruchamianie jako użytkownik node (bezpieczeństwo)
USER node

# Ekspozycja portu aplikacji Next.js
EXPOSE 3000

# Uruchomienie aplikacji
CMD npm run dev