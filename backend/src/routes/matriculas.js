const express = require('express');
const { pool, query } = require('../db');
const { validarMatricula } = require('../validate');
const { asyncHandler, requireRole } = require('../middleware');

const router = express.Router();

const SELECT_MATRICULAS =
  'SELECT m.id, e.nombre AS name, e.documento AS doc, m.grado AS grade, m.fecha_matricula AS date, ' +
  'i.nombre AS inst, m.ind_prm, m.ind_lit ' +
  'FROM matriculas m ' +
  'JOIN estudiantes e ON e.id = m.estudiante_id ' +
  'JOIN instituciones i ON i.id = m.institucion_id';

function aApi(f) {
  return { id: f.id, name: f.name, doc: f.doc, grade: f.grade, date: f.date, inst: f.inst, indicadores: { prm: f.ind_prm, lit: f.ind_lit } };
}

router.get('/', asyncHandler(async function (req, res) {
  const r = await query(SELECT_MATRICULAS + ' ORDER BY m.creado_en DESC, m.id DESC LIMIT 500');
  res.json(r.rows.map(aApi));
}));

// Solo el rol admin (coordinador) registra matrículas.
router.post('/', requireRole('admin'), asyncHandler(async function (req, res) {
  const d = validarMatricula(req.body);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const inst = await client.query(
      'INSERT INTO instituciones (nombre) VALUES ($1) ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id',
      [d.inst]
    );

    // Se enlaza al estudiante por documento; si no existe se crea (o se completa uno registrado solo por nombre).
    let estudianteId;
    const porDoc = await client.query('SELECT id FROM estudiantes WHERE documento = $1', [d.doc]);
    if (porDoc.rows.length) {
      estudianteId = porDoc.rows[0].id;
    } else {
      const porNombre = await client.query(
        'SELECT id FROM estudiantes WHERE documento IS NULL AND lower(nombre) = lower($1) ORDER BY id LIMIT 1',
        [d.name]
      );
      if (porNombre.rows.length) {
        estudianteId = porNombre.rows[0].id;
        await client.query('UPDATE estudiantes SET documento = $1, actualizado_en = now() WHERE id = $2', [d.doc, estudianteId]);
      } else {
        const nuevo = await client.query(
          'INSERT INTO estudiantes (nombre, documento, grado, creado_por) VALUES ($1, $2, $3, $4) RETURNING id',
          [d.name, d.doc, d.grade, req.user.id]
        );
        estudianteId = nuevo.rows[0].id;
      }
    }

    const m = await client.query(
      'INSERT INTO matriculas (estudiante_id, institucion_id, grado, fecha_matricula, ind_prm, ind_lit, registrado_por) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [estudianteId, inst.rows[0].id, d.grade, d.date, d.prm, d.lit, req.user.id]
    );
    await client.query('COMMIT');

    const fila = await query(SELECT_MATRICULAS + ' WHERE m.id = $1', [m.rows[0].id]);
    res.status(201).json(aApi(fila.rows[0]));
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}));

module.exports = router;
