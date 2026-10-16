const express = require('express');
const { query } = require('../db');
const { validarAlerta } = require('../validate');
const { asyncHandler, requireRole } = require('../middleware');
const { listarEstudiantes } = require('../repo');

const router = express.Router();

// Automáticas: todo estudiante con riesgo medio o alto. Manuales: casos excepcionales registrados por el coordinador.
router.get('/', asyncHandler(async function (req, res) {
  const estudiantes = await listarEstudiantes('');
  const automaticas = estudiantes
    .filter(function (e) { return e.riesgo.level === 'medio' || e.riesgo.level === 'alto'; })
    .map(function (e) {
      return { id: 'auto-' + e.id, studentLabel: e.name, grade: e.grade, level: e.riesgo.level, motivos: e.riesgo.motivos, rec: e.riesgo.rec, manual: false };
    });

  const r = await query(
    'SELECT id, estudiante_nombre, grado, nivel, motivo, recomendacion FROM alertas_manuales ORDER BY creado_en DESC, id DESC LIMIT 200'
  );
  const manuales = r.rows.map(function (a) {
    return { id: 'manual-' + a.id, studentLabel: a.estudiante_nombre, grade: a.grado, level: a.nivel, motivos: [a.motivo], rec: a.recomendacion || '', manual: true };
  });

  const orden = { alto: 0, medio: 1 };
  res.json(automaticas.concat(manuales).sort(function (a, b) { return orden[a.level] - orden[b.level]; }));
}));

router.post('/', requireRole('admin'), asyncHandler(async function (req, res) {
  const d = validarAlerta(req.body);
  const r = await query(
    'INSERT INTO alertas_manuales (estudiante_nombre, grado, nivel, motivo, recomendacion, registrado_por) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [d.studentLabel, d.grade, d.level, d.reason, d.rec, req.user.id]
  );
  res.status(201).json({ id: 'manual-' + r.rows[0].id, studentLabel: d.studentLabel, grade: d.grade, level: d.level, motivos: [d.reason], rec: d.rec || '', manual: true });
}));

module.exports = router;
