const express = require('express');
const { query } = require('../db');
const { validarRendimiento, entero } = require('../validate');
const { asyncHandler } = require('../middleware');

const router = express.Router();

const SELECT_RENDIMIENTO =
  'SELECT r.id, r.estudiante_id AS "estudianteId", e.nombre AS "estudianteName", r.periodo AS period, ' +
  'r.matematicas, r.lenguaje, r.lectura, COALESCE(r.observaciones, \'\') AS observaciones ' +
  'FROM rendimientos r JOIN estudiantes e ON e.id = r.estudiante_id';

router.get('/', asyncHandler(async function (req, res) {
  const r = await query(SELECT_RENDIMIENTO + ' ORDER BY r.id DESC LIMIT 500');
  res.json(r.rows);
}));

router.get('/estudiante/:id', asyncHandler(async function (req, res) {
  const r = await query(SELECT_RENDIMIENTO + ' WHERE r.estudiante_id = $1 ORDER BY r.id DESC', [entero(req.params.id, 'El estudiante')]);
  res.json(r.rows);
}));

router.post('/', asyncHandler(async function (req, res) {
  const d = validarRendimiento(req.body);
  const r = await query(
    'INSERT INTO rendimientos (estudiante_id, periodo, matematicas, lenguaje, lectura, observaciones, registrado_por) ' +
    'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    [d.estudianteId, d.period, d.matematicas, d.lenguaje, d.lectura, d.observaciones, req.user.id]
  );
  const fila = await query(SELECT_RENDIMIENTO + ' WHERE r.id = $1', [r.rows[0].id]);
  res.status(201).json(fila.rows[0]);
}));

module.exports = router;
