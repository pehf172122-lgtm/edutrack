const { HttpError } = require('./errors');

function fail(message) {
  throw new HttpError(400, message);
}

function vacio(v) {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
}

function texto(v, etiqueta, opts) {
  const o = opts || {};
  if (vacio(v)) {
    if (o.required) fail(etiqueta + ' es obligatorio.');
    return null;
  }
  if (typeof v !== 'string' && typeof v !== 'number') fail(etiqueta + ' no es válido.');
  const s = String(v).trim().replace(/\s+/g, ' ');
  if (o.min && s.length < o.min) fail(etiqueta + ' debe tener al menos ' + o.min + ' caracteres.');
  if (o.max && s.length > o.max) fail(etiqueta + ' no puede superar ' + o.max + ' caracteres.');
  if (o.pattern && !o.pattern.test(s)) fail(o.patternMsg || etiqueta + ' tiene un formato no válido.');
  return s;
}

function numero(v, etiqueta, opts) {
  const o = opts || {};
  if (vacio(v)) {
    if (o.required) fail(etiqueta + ' es obligatorio.');
    return null;
  }
  const s = String(v).trim().replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(s)) fail(etiqueta + ' debe ser un número.');
  let n = Number(s);
  if (o.min !== undefined && n < o.min) fail(etiqueta + ' no puede ser menor que ' + o.min + '.');
  if (o.max !== undefined && n > o.max) fail(etiqueta + ' no puede ser mayor que ' + o.max + '.');
  if (o.decimals !== undefined) n = Number(n.toFixed(o.decimals));
  return n;
}

function entero(v, etiqueta) {
  const s = String(v === undefined || v === null ? '' : v).trim();
  if (!/^\d+$/.test(s) || Number(s) < 1 || Number(s) > 2147483647) fail(etiqueta + ' no es válido.');
  return Number(s);
}

function fecha(v, etiqueta) {
  if (vacio(v)) return null;
  const s = String(v).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) fail(etiqueta + ' debe tener el formato AAAA-MM-DD.');
  const d = new Date(s + 'T12:00:00Z');
  if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) fail(etiqueta + ' no es una fecha válida.');
  const anio = Number(s.slice(0, 4));
  if (anio < 2000 || anio > new Date().getFullYear() + 1) fail(etiqueta + ' está fuera del rango permitido.');
  return s;
}

const GRADO = /^[0-9A-Za-zÁÉÍÓÚáéíóúÑñ°º ._-]+$/;
const DOCUMENTO = /^[A-Za-z0-9.-]+$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validarLogin(b) {
  const body = b || {};
  const email = texto(body.email, 'El correo', { required: true, max: 150 });
  if (!EMAIL.test(email)) fail('El correo no tiene un formato válido.');
  if (typeof body.password !== 'string' || !body.password) fail('La contraseña es obligatoria.');
  return { email: email.toLowerCase(), password: body.password };
}

function validarRegistroUsuario(b) {
  const body = b || {};
  const nombre = texto(body.nombre, 'El nombre', { required: true, min: 2, max: 100 });
  const email = texto(body.email, 'El correo', { required: true, max: 150 });
  if (!EMAIL.test(email)) fail('El correo no tiene un formato válido.');
  const password = typeof body.password === 'string' ? body.password : '';
  if (password.length < 8) fail('La contraseña debe tener al menos 8 caracteres.');
  if (password.length > 100) fail('La contraseña no puede superar 100 caracteres.');
  return { nombre: nombre, email: email.toLowerCase(), password: password };
}

function validarEstudiante(b) {
  const body = b || {};
  return {
    name: texto(body.name, 'El nombre', { required: true, min: 2, max: 120 }),
    grade: texto(body.grade, 'El grado', { required: true, max: 20, pattern: GRADO, patternMsg: 'El grado contiene caracteres no permitidos.' }),
    attendance: numero(body.attendance, 'La asistencia', { min: 0, max: 100, decimals: 2 }),
    doc: texto(body.doc, 'El documento', { min: 5, max: 20, pattern: DOCUMENTO, patternMsg: 'El documento solo puede tener letras, números, puntos y guiones.' })
  };
}

function validarMatricula(b) {
  const body = b || {};
  const ind = body.indicadores || {};
  return {
    name: texto(body.name, 'El nombre', { required: true, min: 2, max: 120 }),
    doc: texto(body.doc, 'El documento de identidad', { required: true, min: 5, max: 20, pattern: DOCUMENTO, patternMsg: 'El documento solo puede tener letras, números, puntos y guiones.' }),
    grade: texto(body.grade, 'El grado', { required: true, max: 20, pattern: GRADO, patternMsg: 'El grado contiene caracteres no permitidos.' }),
    date: fecha(body.date, 'La fecha de matrícula'),
    inst: texto(body.inst, 'La institución educativa', { required: true, min: 2, max: 150 }),
    prm: ind.prm === undefined ? true : ind.prm === true,
    lit: ind.lit === undefined ? true : ind.lit === true
  };
}

function validarRendimiento(b) {
  const body = b || {};
  const r = {
    estudianteId: entero(body.estudianteId, 'El estudiante'),
    period: texto(body.period, 'El período', { required: true, min: 2, max: 40 }),
    matematicas: numero(body.matematicas, 'La nota de matemáticas', { min: 0, max: 5, decimals: 1 }),
    lenguaje: numero(body.lenguaje, 'La nota de lenguaje', { min: 0, max: 5, decimals: 1 }),
    lectura: numero(body.lectura, 'El nivel de lectura', { min: 0, max: 100, decimals: 2 }),
    observaciones: texto(body.observaciones, 'Las observaciones', { max: 500 })
  };
  if (r.matematicas === null && r.lenguaje === null && r.lectura === null) {
    fail('Registra al menos una nota o el nivel de lectura.');
  }
  return r;
}

function validarAlerta(b) {
  const body = b || {};
  const level = texto(body.level, 'El nivel', { required: true });
  if (level !== 'alto' && level !== 'medio') fail('El nivel debe ser "alto" o "medio".');
  return {
    studentLabel: texto(body.studentLabel, 'El estudiante', { required: true, min: 2, max: 120 }),
    grade: texto(body.grade, 'El grado', { required: true, max: 20, pattern: GRADO, patternMsg: 'El grado contiene caracteres no permitidos.' }),
    level: level,
    reason: texto(body.reason, 'El motivo', { required: true, min: 3, max: 300 }),
    rec: texto(body.rec, 'La recomendación', { max: 300 })
  };
}

function validarDescarga(b) {
  const body = b || {};
  return {
    nombre: texto(body.nombre, 'El nombre del archivo', { required: true, min: 3, max: 120, pattern: /^[\w.\- ]+$/, patternMsg: 'El nombre del archivo contiene caracteres no permitidos.' })
  };
}

module.exports = {
  validarLogin, validarRegistroUsuario, validarEstudiante, validarMatricula,
  validarRendimiento, validarAlerta, validarDescarga, entero
};
