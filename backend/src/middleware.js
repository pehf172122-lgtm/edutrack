const { config } = require('./config');
const { verifyToken } = require('./security');
const { HttpError } = require('./errors');

const COOKIE = 'edutrack_token';

function parseCookies(header) {
  const out = {};
  String(header || '').split(';').forEach(function (part) {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function setSessionCookie(res, token) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProd,
    maxAge: config.sessionHours * 3600 * 1000,
    path: '/'
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE, { httpOnly: true, sameSite: 'lax', secure: config.isProd, path: '/' });
}

function requireAuth(req, res, next) {
  const token = parseCookies(req.headers.cookie)[COOKIE];
  const payload = verifyToken(token, config.sessionSecret);
  if (!payload) return next(new HttpError(401, 'Sesión no válida o expirada. Inicia sesión de nuevo.'));
  req.user = { id: payload.uid, email: payload.email, name: payload.name, role: payload.role };
  next();
}

function requireRole() {
  const roles = Array.prototype.slice.call(arguments);
  return function (req, res, next) {
    if (!req.user || roles.indexOf(req.user.role) === -1) {
      return next(new HttpError(403, 'No tienes permiso para realizar esta acción.'));
    }
    next();
  };
}

// Limitador simple en memoria para frenar fuerza bruta en login/registro.
function rateLimit(maxIntentos, ventanaMs) {
  const hits = new Map();
  return function (req, res, next) {
    const ahora = Date.now();
    const clave = req.ip;
    const lista = (hits.get(clave) || []).filter(function (t) { return ahora - t < ventanaMs; });
    if (lista.length >= maxIntentos) {
      return next(new HttpError(429, 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'));
    }
    lista.push(ahora);
    hits.set(clave, lista);
    next();
  };
}

function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Convierte errores de PostgreSQL y errores propios en respuestas JSON coherentes.
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  let status = err.status || 500;
  let message = err.message;

  if (err.type === 'entity.parse.failed') { status = 400; message = 'El cuerpo de la solicitud no es un JSON válido.'; }
  else if (err.type === 'entity.too.large') { status = 413; message = 'La solicitud es demasiado grande.'; }
  else if (err.code === '23505') { status = 409; message = 'Ya existe un registro con ese valor único (por ejemplo, el documento o el correo).'; }
  else if (err.code === '23503') { status = 400; message = 'El registro hace referencia a un dato que no existe.'; }
  else if (err.code === '23514' || err.code === '22003' || err.code === '22P02' || err.code === '23502') {
    status = 400; message = 'Alguno de los datos enviados no es válido.';
  } else if (!err.status) {
    status = 500; message = 'Error interno del servidor.';
  }

  if (status >= 500) console.error('[error]', req.method, req.originalUrl, err);
  res.status(status).json({ error: message });
}

module.exports = { requireAuth, requireRole, rateLimit, asyncHandler, errorHandler, setSessionCookie, clearSessionCookie };
