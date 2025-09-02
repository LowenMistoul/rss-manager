FROM node:20-alpine AS build

WORKDIR /app

# Installer dépendances
COPY package*.json ./
RUN npm install

# Copier code et build
COPY . .
RUN npm run build

# Étape 2 : serveur Nginx pour servir le frontend
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port (frontend)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
