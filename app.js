// app.js — point d'entrée
const { createServer } = require('./src/server');

// 0.0.0.0 (et non 127.0.0.1) pour que l'app soit joignable depuis l'extérieur du conteneur
const hostname = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT) || 3000;

// Exemple d'utilisation d'un secret Kubernetes injecté en variable d'environnement
if (process.env.API_KEY) {
  console.log('API_KEY chargee depuis le Secret Kubernetes');
}

createServer().listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
