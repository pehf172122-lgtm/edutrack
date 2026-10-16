const path = require('path');
const express = require('express');
const { config, assertConfig } = require('./src/config');
const { pool } = require('./src/db');
const { ensureDatabase } = require('./src/initDb');
const { requireAuth, errorHandler } = require('./src/middleware');
const { HttpError } = require('./src/errors');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // Render está detrás de un proxy HTTPS

app.use(function (req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'");
  next();
});
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', async function (req, res) {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'ok' });
  } catch (e) {
    res.status(503).json({ status: 'error', db: 'sin conexión' });
  }
});

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/estudiantes', requireAuth, require('./src/routes/estudiantes'));
app.use('/api/matriculas', requireAuth, require('./src/routes/matriculas'));
app.use('/api/rendimiento', requireAuth, require('./src/routes/rendimiento'));
app.use('/api/alertas', requireAuth, require('./src/routes/alertas'));
app.use('/api/reportes', requireAuth, require('./src/routes/reportes'));
app.use('/api', function (req, res, next) { next(new HttpError(404, 'Ruta no encontrada.')); });

// El mismo servicio entrega el frontend estático (una sola URL pública).
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use(errorHandler);

async function main() {
  assertConfig();
  if (config.autoInitDb) await ensureDatabase();
  app.listen(config.port, function () {
    console.log('[servidor] EduTrack escuchando en el puerto ' + config.port);
  });
}

if (require.main === module) {
  main().catch(function (e) {
    console.error('[servidor] No se pudo iniciar:', e.message);
    process.exit(1);
  });
}

module.exports = app;
