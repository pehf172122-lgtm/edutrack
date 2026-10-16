// Genera database/seed.sql y database/edutrack_dump.sql (esquema + datos de ejemplo).
// Uso: node database/generate_seed.js
const fs = require('fs');
const path = require('path');
const { hashPassword } = require('../backend/src/security');

const q = function (v) { return v === null || v === undefined ? 'NULL' : "'" + String(v).replace(/'/g, "''") + "'"; };
const n = function (v) { return v === null || v === undefined ? 'NULL' : String(v); };

const usuarios = [
  [1, 'Coordinador', 'coordinador@edutrack.edu.co', 'demo1234', 'admin'],
  [2, 'Docente', 'docente@edutrack.edu.co', 'demo1234', 'docente']
];
const instituciones = [[1, 'Institución Educativa Simón Bolívar'], [2, 'Institución Educativa San José']];

// id, nombre, documento, grado, asistencia
const estudiantes = [
  [1, 'Valentina Rojas Pérez', '1067890101', '5° A', 96],
  [2, 'Santiago Herrera Díaz', '1067890102', '5° A', 88],
  [3, 'Camila Torres Núñez', '1067890103', '4° B', 62],
  [4, 'Juan David Castro Mora', '1067890104', '4° B', 91],
  [5, 'Mariana López Vega', '1067890105', '3° A', 74],
  [6, 'Samuel Ortega Ruiz', '1067890106', '3° A', 95],
  [7, 'Isabella Mendoza Ríos', '1067890107', '5° B', 82],
  [8, 'Mateo Gómez Arias', '1067890108', '2° C', 58],
  [9, 'Sofía Martínez Cruz', '1067890109', '2° C', 93],
  [10, 'Daniel Vargas Soto', null, '1° A', 89],
  [11, 'Luciana Pardo Mesa', null, '1° A', 79],
  [12, 'Tomás Acosta Lara', null, '3° B', null]
];

// estudiante_id, institucion_id, grado, fecha
const matriculas = [
  [1, 1, '5° A', '2026-02-02'], [2, 1, '5° A', '2026-02-03'], [3, 1, '4° B', '2026-02-10'],
  [4, 1, '4° B', '2026-03-04'], [5, 2, '3° A', '2026-03-09'], [6, 2, '3° A', '2026-03-16'],
  [7, 1, '5° B', '2026-05-12'], [8, 2, '2° C', '2026-06-01'], [9, 2, '2° C', '2026-08-18']
];

// estudiante_id, periodo, matematicas, lenguaje, lectura, observaciones
const rendimientos = [
  [3, 'Periodo 2 — 2026', 3.1, 3.3, 66, 'Desempeño aceptable, con inasistencias.'],
  [5, 'Periodo 2 — 2026', 3.9, 3.8, 79, null],
  [8, 'Periodo 2 — 2026', 3.4, 3.6, 72, null],
  [1, 'Periodo 3 — 2026', 4.5, 4.2, 92, 'Excelente desempeño.'],
  [2, 'Periodo 3 — 2026', 3.6, 3.9, 78, null],
  [3, 'Periodo 3 — 2026', 2.4, 2.8, 58, 'Bajó el rendimiento; requiere refuerzo.'],
  [4, 'Periodo 3 — 2026', 4.0, 4.1, 85, null],
  [5, 'Periodo 3 — 2026', 3.2, 3.4, 70, null],
  [6, 'Periodo 3 — 2026', 4.4, 4.6, 90, null],
  [7, 'Periodo 3 — 2026', 4.1, 3.9, 81, null],
  [8, 'Periodo 3 — 2026', 2.9, 3.1, 60, 'Faltas frecuentes en matemáticas.'],
  [9, 'Periodo 3 — 2026', 4.7, 4.8, 95, null],
  [11, 'Periodo 3 — 2026', 3.8, 3.7, 83, null]
];

const alertas = [
  ['Tomás Acosta Lara', '3° B', 'medio', 'Aviso verbal del docente titular: inasistencias recurrentes sin justificar.', 'Contactar al acudiente esta semana.', 1]
];

let sql = '-- =====================================================================\n' +
  '-- EduTrack - Datos de ejemplo (generado con database/generate_seed.js)\n' +
  '-- Usuarios de prueba (contraseña: demo1234):\n' +
  '--   coordinador@edutrack.edu.co  (rol admin)\n' +
  '--   docente@edutrack.edu.co      (rol docente)\n' +
  '-- =====================================================================\n\n';

sql += 'INSERT INTO usuarios (id, nombre, email, password_hash, rol) VALUES\n' +
  usuarios.map(function (u) { return '  (' + [u[0], q(u[1]), q(u[2]), q(hashPassword(u[3])), q(u[4])].join(', ') + ')'; }).join(',\n') + ';\n\n';
sql += 'INSERT INTO instituciones (id, nombre) VALUES\n' +
  instituciones.map(function (i) { return '  (' + i[0] + ', ' + q(i[1]) + ')'; }).join(',\n') + ';\n\n';
sql += 'INSERT INTO estudiantes (id, nombre, documento, grado, asistencia, creado_por) VALUES\n' +
  estudiantes.map(function (e) { return '  (' + [e[0], q(e[1]), q(e[2]), q(e[3]), n(e[4]), 1].join(', ') + ')'; }).join(',\n') + ';\n\n';
sql += 'INSERT INTO matriculas (estudiante_id, institucion_id, grado, fecha_matricula, registrado_por) VALUES\n' +
  matriculas.map(function (m) { return '  (' + [m[0], m[1], q(m[2]), q(m[3]), 1].join(', ') + ')'; }).join(',\n') + ';\n\n';
sql += 'INSERT INTO rendimientos (estudiante_id, periodo, matematicas, lenguaje, lectura, observaciones, registrado_por) VALUES\n' +
  rendimientos.map(function (r) { return '  (' + [r[0], q(r[1]), n(r[2]), n(r[3]), n(r[4]), q(r[5]), 2].join(', ') + ')'; }).join(',\n') + ';\n\n';
sql += 'INSERT INTO alertas_manuales (estudiante_nombre, grado, nivel, motivo, recomendacion, registrado_por) VALUES\n' +
  alertas.map(function (a) { return '  (' + [q(a[0]), q(a[1]), q(a[2]), q(a[3]), q(a[4]), a[5]].join(', ') + ')'; }).join(',\n') + ';\n\n';
sql += "INSERT INTO reportes_descargas (nombre_archivo, usuario_id) VALUES ('Reporte_EduTrack_2026-10-01.txt', 1);\n\n";
sql += '-- Ajusta las secuencias de identidad tras insertar ids explícitos.\n' +
  ['usuarios', 'instituciones', 'estudiantes'].map(function (t) {
    return "SELECT setval(pg_get_serial_sequence('" + t + "', 'id'), (SELECT max(id) FROM " + t + '));';
  }).join('\n') + '\n';

const dir = __dirname;
fs.writeFileSync(path.join(dir, 'seed.sql'), sql);
fs.writeFileSync(path.join(dir, 'edutrack_dump.sql'),
  '-- EduTrack: copia de respaldo (esquema + datos de ejemplo).\n' +
  '-- Restaurar:  psql "$DATABASE_URL" -f database/edutrack_dump.sql\n\n' +
  fs.readFileSync(path.join(dir, 'schema.sql'), 'utf8') + '\n' + sql);
console.log('seed.sql y edutrack_dump.sql generados.');
