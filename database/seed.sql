-- =====================================================================
-- EduTrack - Datos de ejemplo (generado con database/generate_seed.js)
-- Usuarios de prueba (contraseña: demo1234):
--   coordinador@edutrack.edu.co  (rol admin)
--   docente@edutrack.edu.co      (rol docente)
-- =====================================================================

INSERT INTO usuarios (id, nombre, email, password_hash, rol) VALUES
  (1, 'Coordinador', 'coordinador@edutrack.edu.co', 'scrypt$ccb8c064e5024463c61121151f8588e4$6693cdcfe564e1ec1e87c6088d3ec57da42afa9ca2527d14901561799b44b5e2222b1f8711063e5524fa4eef89f1486ee72ec875e0db32e67977b8f73f3b9908', 'admin'),
  (2, 'Docente', 'docente@edutrack.edu.co', 'scrypt$55e68e2c083124f23a7615b57a16289d$f0e81c5515bda6c898530b0cd931073a132eba6aad3e27baa0cf1abd71ef2b8709368942f3c403bdd671c0be1ffbb2a1b86a41fb794ad19f8dc6ee535ea76476', 'docente');

INSERT INTO instituciones (id, nombre) VALUES
  (1, 'Institución Educativa Simón Bolívar'),
  (2, 'Institución Educativa San José');

INSERT INTO estudiantes (id, nombre, documento, grado, asistencia, creado_por) VALUES
  (1, 'Valentina Rojas Pérez', '1067890101', '5° A', 96, 1),
  (2, 'Santiago Herrera Díaz', '1067890102', '5° A', 88, 1),
  (3, 'Camila Torres Núñez', '1067890103', '4° B', 62, 1),
  (4, 'Juan David Castro Mora', '1067890104', '4° B', 91, 1),
  (5, 'Mariana López Vega', '1067890105', '3° A', 74, 1),
  (6, 'Samuel Ortega Ruiz', '1067890106', '3° A', 95, 1),
  (7, 'Isabella Mendoza Ríos', '1067890107', '5° B', 82, 1),
  (8, 'Mateo Gómez Arias', '1067890108', '2° C', 58, 1),
  (9, 'Sofía Martínez Cruz', '1067890109', '2° C', 93, 1),
  (10, 'Daniel Vargas Soto', NULL, '1° A', 89, 1),
  (11, 'Luciana Pardo Mesa', NULL, '1° A', 79, 1),
  (12, 'Tomás Acosta Lara', NULL, '3° B', NULL, 1);

INSERT INTO matriculas (estudiante_id, institucion_id, grado, fecha_matricula, registrado_por) VALUES
  (1, 1, '5° A', '2026-02-02', 1),
  (2, 1, '5° A', '2026-02-03', 1),
  (3, 1, '4° B', '2026-02-10', 1),
  (4, 1, '4° B', '2026-03-04', 1),
  (5, 2, '3° A', '2026-03-09', 1),
  (6, 2, '3° A', '2026-03-16', 1),
  (7, 1, '5° B', '2026-05-12', 1),
  (8, 2, '2° C', '2026-06-01', 1),
  (9, 2, '2° C', '2026-08-18', 1);

INSERT INTO rendimientos (estudiante_id, periodo, matematicas, lenguaje, lectura, observaciones, registrado_por) VALUES
  (3, 'Periodo 2 — 2026', 3.1, 3.3, 66, 'Desempeño aceptable, con inasistencias.', 2),
  (5, 'Periodo 2 — 2026', 3.9, 3.8, 79, NULL, 2),
  (8, 'Periodo 2 — 2026', 3.4, 3.6, 72, NULL, 2),
  (1, 'Periodo 3 — 2026', 4.5, 4.2, 92, 'Excelente desempeño.', 2),
  (2, 'Periodo 3 — 2026', 3.6, 3.9, 78, NULL, 2),
  (3, 'Periodo 3 — 2026', 2.4, 2.8, 58, 'Bajó el rendimiento; requiere refuerzo.', 2),
  (4, 'Periodo 3 — 2026', 4, 4.1, 85, NULL, 2),
  (5, 'Periodo 3 — 2026', 3.2, 3.4, 70, NULL, 2),
  (6, 'Periodo 3 — 2026', 4.4, 4.6, 90, NULL, 2),
  (7, 'Periodo 3 — 2026', 4.1, 3.9, 81, NULL, 2),
  (8, 'Periodo 3 — 2026', 2.9, 3.1, 60, 'Faltas frecuentes en matemáticas.', 2),
  (9, 'Periodo 3 — 2026', 4.7, 4.8, 95, NULL, 2),
  (11, 'Periodo 3 — 2026', 3.8, 3.7, 83, NULL, 2);

INSERT INTO alertas_manuales (estudiante_nombre, grado, nivel, motivo, recomendacion, registrado_por) VALUES
  ('Tomás Acosta Lara', '3° B', 'medio', 'Aviso verbal del docente titular: inasistencias recurrentes sin justificar.', 'Contactar al acudiente esta semana.', 1);

INSERT INTO reportes_descargas (nombre_archivo, usuario_id) VALUES ('Reporte_EduTrack_2026-10-01.txt', 1);

-- Ajusta las secuencias de identidad tras insertar ids explícitos.
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), (SELECT max(id) FROM usuarios));
SELECT setval(pg_get_serial_sequence('instituciones', 'id'), (SELECT max(id) FROM instituciones));
SELECT setval(pg_get_serial_sequence('estudiantes', 'id'), (SELECT max(id) FROM estudiantes));
