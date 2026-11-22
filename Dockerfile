# Dockerfile
# node:14 (celui du sujet) n'est plus maintenu : on utilise node:20 LTS
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Bundle app source
COPY . .

# Ne pas tourner en root
USER node

EXPOSE 3000
CMD [ "node", "app.js" ]
