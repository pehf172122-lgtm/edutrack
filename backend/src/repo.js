const { query } = require('./db');
const { evaluarRiesgo } = require('./risk');

// Estudiantes con promedio y lectura derivados del historial (vista v_estudiantes_indicadores).
const SELECT_ESTUDIANTES =
  'SELECT id, nombre AS name, documento AS doc, grado AS grade, asistencia AS attendance, promedio, lectura ' +
  'FROM v_estudiantes_indicadores';

function conRiesgo(fila) {
  return Object.assign({}, fila, { riesgo: evaluarRiesgo(fila) });
}

async function listarEstudiantes(filtro) {
  const q = String(filtro || '').trim().replace(/[\\%_]/g, function (m) { return '\\' + m; });
  const r = await query(
    SELECT_ESTUDIANTES + " WHERE ($1::text = '' OR nombre ILIKE '%' || $1::text || '%') ORDER BY creado_en DESC, id DESC LIMIT 500",
    [q]
  );
  return r.rows.map(conRiesgo);
}

async function obtenerEstudiante(id) {
  const r = await query(SELECT_ESTUDIANTES + ' WHERE id = $1', [id]);
  return r.rows.length ? conRiesgo(r.rows[0]) : null;
}

module.exports = { listarEstudiantes, obtenerEstudiante, conRiesgo };
