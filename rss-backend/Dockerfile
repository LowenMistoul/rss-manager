FROM node:20-alpine

WORKDIR /app

# Copier package.json et installer dépendances
COPY package*.json ./
RUN npm install --production

# Copier le reste du code
COPY . .

# Exposer le port (backend)
EXPOSE 3000

CMD ["npm", "start"]
