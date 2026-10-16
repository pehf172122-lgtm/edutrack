const test = require('node:test');
const assert = require('node:assert');
const { hashPassword, verifyPassword, signToken, verifyToken } = require('../src/security');

test('hash de contraseña: verifica la correcta y rechaza la incorrecta', () => {
  const h = hashPassword('demo1234');
  assert.ok(h.startsWith('scrypt$'));
  assert.ok(verifyPassword('demo1234', h));
  assert.ok(!verifyPassword('otra', h));
  assert.ok(!verifyPassword('demo1234', 'basura'));
});

test('dos hashes de la misma contraseña son distintos (sal aleatoria)', () => {
  assert.notStrictEqual(hashPassword('x1234567'), hashPassword('x1234567'));
});

test('token firmado: se valida con el mismo secreto', () => {
  const t = signToken({ uid: 1, role: 'admin' }, 'secreto-largo-de-prueba', 60);
  const p = verifyToken(t, 'secreto-largo-de-prueba');
  assert.strictEqual(p.uid, 1);
  assert.strictEqual(p.role, 'admin');
});

test('token: rechaza secreto distinto, manipulación y expiración', () => {
  const t = signToken({ uid: 1, role: 'docente' }, 'secreto-largo-de-prueba', 60);
  assert.strictEqual(verifyToken(t, 'otro-secreto-distinto'), null);
  const [datos, firma] = t.split('.');
  const falso = Buffer.from(JSON.stringify({ uid: 1, role: 'admin', exp: 9999999999 })).toString('base64url');
  assert.strictEqual(verifyToken(falso + '.' + firma, 'secreto-largo-de-prueba'), null);
  assert.strictEqual(verifyToken(signToken({ uid: 1 }, 'secreto-largo-de-prueba', -10), 'secreto-largo-de-prueba'), null);
  assert.strictEqual(verifyToken(undefined, 'x'), null);
  assert.strictEqual(verifyToken('sin-punto', 'x'), null);
});
