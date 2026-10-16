const express = require('express');
const { query } = require('../db');
const { config } = require('../config');
const { HttpError } = require('../errors');
const { hashPassword, verifyPassword, signToken } = require('../security');
const { validarLogin, validarRegistroUsuario } = require('../validate');
const { requireAuth, rateLimit, asyncHandler, setSessionCookie, clearSessionCookie } = require('../middleware');

const router = express.Router();
const limitador = rateLimit(20, 15 * 60 * 1000);

function emitirSesion(res, usuario) {
  const token = signToken(
    { uid: usuario.id, email: usuario.email, name: usuario.nombre, role: usuario.rol },
    config.sessionSecret,
    config.sessionHours * 3600
  );
  setSessionCookie(res, token);
  return { email: usuario.email, name: usuario.nombre, role: usuario.rol };
}

router.post('/login', limitador, asyncHandler(async function (req, res) {
  const datos = validarLogin(req.body);
  const r = await query('SELECT id, nombre, email, password_hash, rol FROM usuarios WHERE email = $1', [datos.email]);
  const usuario = r.rows[0];
  // Mismo mensaje exista o no el correo, para no revelar qué cuentas existen.
  if (!usuario || !verifyPassword(datos.password, usuario.password_hash)) {
    throw new HttpError(401, 'Correo o contraseña incorrectos.');
  }
  res.json(emitirSesion(res, usuario));
}));

// Autorregistro: siempre crea cuentas con rol "docente" (el rol admin solo se asigna en la base de datos).
router.post('/register', limitador, asyncHandler(async function (req, res) {
  const datos = validarRegistroUsuario(req.body);
  const existe = await query('SELECT 1 FROM usuarios WHERE email = $1', [datos.email]);
  if (existe.rows.length) throw new HttpError(409, 'Ya existe una cuenta con ese correo.');
  const r = await query(
    "INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, 'docente') RETURNING id, nombre, email, rol",
    [datos.nombre, datos.email, hashPassword(datos.password)]
  );
  res.status(201).json(emitirSesion(res, r.rows[0]));
}));

router.post('/logout', function (req, res) {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, function (req, res) {
  res.json({ email: req.user.email, name: req.user.name, role: req.user.role });
});

module.exports = router;
