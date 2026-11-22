// test/server.test.js — tests unitaires (défi : tests automatisés)
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { createServer } = require('../src/server');

let server;
let base;

before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

test('GET / renvoie Hello World', async () => {
  const res = await fetch(`${base}/`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(await res.text(), 'Hello World\n');
});

test('GET /health renvoie ok', async () => {
  const res = await fetch(`${base}/health`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { status: 'ok' });
});

test('GET /metrics expose les metriques Prometheus', async () => {
  const res = await fetch(`${base}/metrics`);
  assert.strictEqual(res.status, 200);
  assert.match(await res.text(), /http_requests_total \d+/);
});

test('route inconnue renvoie 404', async () => {
  const res = await fetch(`${base}/inconnu`);
  assert.strictEqual(res.status, 404);
});
