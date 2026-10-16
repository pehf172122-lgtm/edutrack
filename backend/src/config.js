require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

const config = {
  isProd,
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: String(process.env.DATABASE_SSL || 'false').toLowerCase() === 'true',
  sessionSecret: process.env.SESSION_SECRET,
  sessionHours: Number(process.env.SESSION_HOURS) || 8,
  autoInitDb: String(process.env.AUTO_INIT_DB === undefined ? 'true' : process.env.AUTO_INIT_DB).toLowerCase() !== 'false'
};

// Falla temprano si falta la configuración mínima (las credenciales viven en variables de entorno).
function assertConfig() {
  const faltan = [];
  if (!config.databaseUrl) faltan.push('DATABASE_URL');
  if (!config.sessionSecret || config.sessionSecret.length < 16) faltan.push('SESSION_SECRET (mínimo 16 caracteres)');
  if (faltan.length) {
    throw new Error('Faltan variables de entorno: ' + faltan.join(', ') + '. Revisa .env.example.');
  }
}

module.exports = { config, assertConfig };
