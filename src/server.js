// src/server.js — application web Node.js (sans dépendance externe)
const http = require('http');

// Métriques simples au format Prometheus (défi : monitoring)
const metrics = { requests: 0, startedAt: Date.now() };

function handler(req, res) {
  metrics.requests += 1;

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok' }));
  }

  if (req.url === '/metrics') {
    const uptime = (Date.now() - metrics.startedAt) / 1000;
    res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
    return res.end(
      '# HELP http_requests_total Total des requetes HTTP recues\n' +
      '# TYPE http_requests_total counter\n' +
      `http_requests_total ${metrics.requests}\n` +
      '# HELP app_uptime_seconds Temps depuis le demarrage\n' +
      '# TYPE app_uptime_seconds gauge\n' +
      `app_uptime_seconds ${uptime}\n`
    );
  }

  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('Hello World\n');
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found\n');
}

function createServer() {
  return http.createServer(handler);
}

module.exports = { createServer };
