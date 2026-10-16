const express = require('express');
const { query } = require('../db');
const { HttpError } = require('../errors');
const { validarEstudiante, entero } = require('../validate');
const { asyncHandler } = require('../middleware');
const { listarEstudiantes, obtenerEstudiante } = require('../repo');

const router = express.Router();

router.get('/', asyncHandler(async function (req, res) {
  res.json(await listarEstudiantes(req.query.q));
}));

router.get('/:id', asyncHandler(async function (req, res) {
  const est = await obtenerEstudiante(entero(req.params.id, 'El identificador'));
  if (!est) throw new HttpError(404, 'Estudiante no encontrado.');
  res.json(est);
}));

router.post('/', asyncHandler(async function (req, res) {
  const d = validarEstudiante(req.body);
  const r = await query(
    'INSERT INTO estudiantes (nombre, documento, grado, asistencia, creado_por) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [d.name, d.doc, d.grade, d.attendance, req.user.id]
  );
  res.status(201).json(await obtenerEstudiante(r.rows[0].id));
}));

router.put('/:id', asyncHandler(async function (req, res) {
  const id = entero(req.params.id, 'El identificador');
  const d = validarEstudiante(req.body);
  const r = await query(
    'UPDATE estudiantes SET nombre = $1, grado = $2, asistencia = $3, actualizado_en = now() WHERE id = $4 RETURNING id',
    [d.name, d.grade, d.attendance, id]
  );
  if (!r.rows.length) throw new HttpError(404, 'Estudiante no encontrado.');
  res.json(await obtenerEstudiante(id));
}));

module.exports = router;
