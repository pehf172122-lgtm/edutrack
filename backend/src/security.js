const crypto = require('crypto');

// ---- Contraseñas: scrypt (incluido en Node, sin dependencias externas) ----
function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(password), salt, 64);
  return 'scrypt$' + salt.toString('hex') + '$' + hash.toString('hex');
}

function verifyPassword(password, stored) {
  try {
    const parts = String(stored).split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
    const expected = Buffer.from(parts[2], 'hex');
    const actual = crypto.scryptSync(String(password), Buffer.from(parts[1], 'hex'), expected.length);
    return crypto.timingSafeEqual(actual, expected);
  } catch (e) {
    return false;
  }
}

// ---- Tokens de sesión firmados con HMAC-SHA256 (formato datos.firma) ----
function sign(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

function signToken(payload, secret, ttlSeconds) {
  const body = Object.assign({}, payload, { exp: Math.floor(Date.now() / 1000) + ttlSeconds });
  const data = Buffer.from(JSON.stringify(body)).toString('base64url');
  return data + '.' + sign(data, secret);
}

function verifyToken(token, secret) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const expected = Buffer.from(sign(parts[0], secret));
  const given = Buffer.from(parts[1]);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  try {
    const body = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (!body.exp || body.exp < Math.floor(Date.now() / 1000)) return null;
    return body;
  } catch (e) {
    return null;
  }
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
