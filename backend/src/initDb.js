const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const DB_DIR = path.join(__dirname, '..', '..', 'database');

function leer(nombre) {
  return fs.readFileSync(path.join(DB_DIR, nombre), 'utf8');
}

// Crea el esquema (y carga los datos de ejemplo) solo si la base está vacía.
async function ensureDatabase(opciones) {
  const conSeed = !opciones || opciones.seed !== false;
  const existe = await pool.query("SELECT to_regclass('public.usuarios') AS t");
  if (existe.rows[0].t) {
    console.log('[db] El esquema ya existe; no se modifica.');
    return false;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(leer('schema.sql'));
    if (conSeed) await client.query(leer('seed.sql'));
    await client.query('COMMIT');
    console.log('[db] Esquema creado' + (conSeed ? ' y datos de ejemplo cargados.' : '.'));
    return true;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function resetDatabase() {
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  return ensureDatabase();
}

module.exports = { ensureDatabase, resetDatabase };
