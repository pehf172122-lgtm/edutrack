const test = require('node:test');
const assert = require('node:assert');
const v = require('../src/validate');

const rechaza = (fn, fragmento) => assert.throws(fn, (e) => e.status === 400 && e.message.includes(fragmento));

test('estudiante válido: normaliza espacios y números', () => {
  const r = v.validarEstudiante({ name: '  Ana   María  Pérez ', grade: '4° A', attendance: '90,5' });
  assert.strictEqual(r.name, 'Ana María Pérez');
  assert.strictEqual(r.attendance, 90.5);
  assert.strictEqual(r.doc, null);
});

test('estudiante: asistencia vacía es opcional', () => {
  assert.strictEqual(v.validarEstudiante({ name: 'Ana Pérez', grade: '1° A', attendance: '' }).attendance, null);
});

test('estudiante: rechaza datos incorrectos', () => {
  rechaza(() => v.validarEstudiante({ name: '', grade: '4° A' }), 'nombre');
  rechaza(() => v.validarEstudiante({ name: 'Ana Pérez', grade: '' }), 'grado');
  rechaza(() => v.validarEstudiante({ name: 'Ana Pérez', grade: '4° A', attendance: '150' }), 'mayor');
  rechaza(() => v.validarEstudiante({ name: 'Ana Pérez', grade: '4° A', attendance: 'abc' }), 'número');
  rechaza(() => v.validarEstudiante({ name: 'Ana Pérez', grade: '<script>' }), 'caracteres');
  rechaza(() => v.validarEstudiante({ name: { x: 1 }, grade: '4° A' }), 'no es válido');
});

test('matrícula: campos obligatorios, fecha e indicadores', () => {
  const ok = v.validarMatricula({ name: 'Ana Pérez', doc: '1067890101', grade: '3° B', date: '2026-03-04', inst: 'I.E. Simón Bolívar' });
  assert.strictEqual(ok.prm, true);
  assert.strictEqual(ok.lit, true);
  assert.strictEqual(v.validarMatricula({ name: 'Ana Pérez', doc: '1067890101', grade: '3° B', inst: 'I.E. X', indicadores: { prm: false, lit: true } }).prm, false);
  rechaza(() => v.validarMatricula({ name: 'Ana Pérez', doc: '', grade: '3° B', inst: 'I.E. X' }), 'documento');
  rechaza(() => v.validarMatricula({ name: 'Ana Pérez', doc: '1067890101', grade: '3° B', inst: 'I.E. X', date: '2026-02-31' }), 'fecha');
  rechaza(() => v.validarMatricula({ name: 'Ana Pérez', doc: '1067890101', grade: '3° B', inst: 'I.E. X', date: '04/03/2026' }), 'formato');
});

test('rendimiento: rangos, redondeo y al menos un dato', () => {
  const r = v.validarRendimiento({ estudianteId: '7', period: 'Periodo 3 — 2026', matematicas: '3,85', lenguaje: '', lectura: '85' });
  assert.strictEqual(r.estudianteId, 7);
  assert.strictEqual(r.matematicas, 3.9);
  assert.strictEqual(r.lenguaje, null);
  rechaza(() => v.validarRendimiento({ estudianteId: '7', period: 'P3', matematicas: '', lenguaje: '', lectura: '' }), 'al menos una nota');
  rechaza(() => v.validarRendimiento({ estudianteId: '7', period: 'P3', matematicas: '5.5' }), 'mayor');
  rechaza(() => v.validarRendimiento({ estudianteId: '', period: 'P3', matematicas: '4' }), 'estudiante');
  rechaza(() => v.validarRendimiento({ estudianteId: '7', period: 'P3', lectura: '101' }), 'mayor');
});

test('alerta manual: nivel permitido', () => {
  assert.strictEqual(v.validarAlerta({ studentLabel: 'Ana Pérez', grade: '5° C', level: 'alto', reason: 'Aviso del docente' }).level, 'alto');
  rechaza(() => v.validarAlerta({ studentLabel: 'Ana Pérez', grade: '5° C', level: 'bajo', reason: 'Aviso del docente' }), 'nivel');
});

test('login y registro de usuario', () => {
  assert.strictEqual(v.validarLogin({ email: 'ADMIN@EduTrack.edu.co', password: 'x' }).email, 'admin@edutrack.edu.co');
  rechaza(() => v.validarLogin({ email: 'no-es-correo', password: 'x' }), 'correo');
  rechaza(() => v.validarLogin({ email: 'a@b.co' }), 'contraseña');
  rechaza(() => v.validarRegistroUsuario({ nombre: 'Ana', email: 'a@b.co', password: '1234' }), '8 caracteres');
  assert.strictEqual(v.validarRegistroUsuario({ nombre: 'Ana Gómez', email: 'ana@b.co', password: '12345678' }).email, 'ana@b.co');
});

test('descarga: nombre de archivo seguro', () => {
  assert.strictEqual(v.validarDescarga({ nombre: 'Reporte_EduTrack_2026-10-16.txt' }).nombre, 'Reporte_EduTrack_2026-10-16.txt');
  rechaza(() => v.validarDescarga({ nombre: '../../etc/passwd' }), 'caracteres');
});
