const { Pool, types } = require('pg');
const { config } = require('./config');

// NUMERIC llega como texto por defecto: lo convertimos a número para el frontend.
types.setTypeParser(1700, function (v) { return v === null ? null : parseFloat(v); });
// BIGINT (por ejemplo COUNT) a entero.
types.setTypeParser(20, function (v) { return v === null ? null : parseInt(v, 10); });
// DATE como texto 'YYYY-MM-DD' (evita corrimientos por zona horaria).
types.setTypeParser(1082, function (v) { return v; });

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000
});

pool.on('error', function (err) {
  console.error('[pg] error inesperado en una conexión inactiva:', err.message);
});

module.exports = { pool: pool, query: function (text, params) { return pool.query(text, params); } };
