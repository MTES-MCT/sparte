FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste du code
COPY . .

# Exposer le port du dev server
EXPOSE 3000

# Lancer le dev server
CMD ["npm", "run", "dev"]
