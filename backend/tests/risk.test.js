const test = require('node:test');
const assert = require('node:assert');
const { evaluarRiesgo } = require('../src/risk');

test('sin datos: riesgo bajo y hasData=false', () => {
  const r = evaluarRiesgo({ attendance: null, promedio: null, lectura: null });
  assert.strictEqual(r.level, 'bajo');
  assert.strictEqual(r.hasData, false);
});

test('todos los indicadores bajos: riesgo alto con 3 motivos', () => {
  const r = evaluarRiesgo({ attendance: 60, promedio: 2.5, lectura: 55 });
  assert.strictEqual(r.level, 'alto');
  assert.strictEqual(r.motivos.length, 3);
  assert.ok(r.rec.length > 0);
});

test('un indicador levemente bajo: riesgo medio', () => {
  const r = evaluarRiesgo({ attendance: 80, promedio: 4.2, lectura: 90 });
  assert.strictEqual(r.level, 'medio');
});

test('valores buenos: riesgo bajo', () => {
  const r = evaluarRiesgo({ attendance: 95, promedio: 4.5, lectura: 92 });
  assert.strictEqual(r.level, 'bajo');
  assert.strictEqual(r.rec, '');
});

test('los datos de ejemplo del seed producen la distribución esperada', () => {
  const casos = [
    [96, 4.4, 92, 'bajo'], [88, 3.8, 78, 'medio'], [62, 2.6, 58, 'alto'], [74, 3.3, 70, 'alto'],
    [58, 3.0, 60, 'alto'], [82, 4.0, 81, 'medio'], [89, null, null, 'bajo'], [79, 3.8, 83, 'medio']
  ];
  casos.forEach(c => assert.strictEqual(evaluarRiesgo({ attendance: c[0], promedio: c[1], lectura: c[2] }).level, c[3], JSON.stringify(c)));
});
