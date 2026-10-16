const express = require('express');
const { query } = require('../db');
const { validarDescarga } = require('../validate');
const { asyncHandler } = require('../middleware');
const { listarEstudiantes } = require('../repo');

const router = express.Router();

// Indicadores institucionales calculados en el servidor a partir de lo registrado en la base de datos.
router.get('/resumen', asyncHandler(async function (req, res) {
  const estudiantes = await listarEstudiantes('');
  const r = await query(
    'SELECT ' +
    '(SELECT count(*) FROM estudiantes)::int AS total, ' +
    '(SELECT count(*) FROM estudiantes e WHERE EXISTS (SELECT 1 FROM matriculas m WHERE m.estudiante_id = e.id))::int AS con_matricula, ' +
    '(SELECT count(*) FROM matriculas)::int AS total_matriculas, ' +
    'GREATEST((SELECT max(actualizado_en) FROM estudiantes), (SELECT max(creado_en) FROM matriculas), ' +
    '(SELECT max(creado_en) FROM rendimientos), (SELECT max(creado_en) FROM alertas_manuales), ' +
    '(SELECT max(creado_en) FROM reportes_descargas)) AS ultima'
  );
  const f = r.rows[0];
  const conLectura = estudiantes.filter(function (e) { return e.lectura !== null; });
  const cuenta = function (nivel) { return estudiantes.filter(function (e) { return e.riesgo.level === nivel; }).length; };

  res.json({
    totalEstudiantes: f.total,
    conMatricula: f.con_matricula,
    matriculaPct: f.total ? Math.round((f.con_matricula / f.total) * 100) : null,
    conLectura: conLectura.length,
    alfabetizacionPct: conLectura.length
      ? Math.round(conLectura.reduce(function (a, e) { return a + e.lectura; }, 0) / conLectura.length)
      : null,
    bajo: cuenta('bajo'),
    medio: cuenta('medio'),
    alto: cuenta('alto'),
    totalMatriculas: f.total_matriculas,
    ultimaActualizacion: f.ultima
  });
}));

router.get('/historial', asyncHandler(async function (req, res) {
  const r = await query('SELECT nombre_archivo FROM reportes_descargas ORDER BY creado_en DESC, id DESC LIMIT 20');
  res.json(r.rows.map(function (f) { return f.nombre_archivo; }));
}));

router.post('/descargas', asyncHandler(async function (req, res) {
  const d = validarDescarga(req.body);
  await query('INSERT INTO reportes_descargas (nombre_archivo, usuario_id) VALUES ($1, $2)', [d.nombre, req.user.id]);
  res.status(201).json({ ok: true });
}));

module.exports = router;
