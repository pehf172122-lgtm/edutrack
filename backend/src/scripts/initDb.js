// Uso: npm run db:init   (crea esquema + datos si la base está vacía)
//      npm run db:reset  (BORRA todo y recrea; bloqueado en producción)
const { config, assertConfig } = require('../config');
const { pool } = require('../db');
const { ensureDatabase, resetDatabase } = require('../initDb');

(async function () {
  try {
    assertConfig();
    if (process.argv.includes('--reset')) {
      if (config.isProd) throw new Error('db:reset está bloqueado cuando NODE_ENV=production.');
      await resetDatabase();
    } else {
      await ensureDatabase();
    }
  } catch (e) {
    console.error('[db] Error:', e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
