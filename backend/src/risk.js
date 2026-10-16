/*
  Motor de riesgo de deserción (lógica de negocio).
  Evalúa asistencia, promedio y lectura con umbrales fijos y devuelve
  nivel (bajo/medio/alto), motivos y recomendación. Se calcula en cada
  lectura; nunca se guarda "congelado" en la base de datos.
*/
function aNumero(v) {
  return v !== null && v !== undefined && v !== '' ? Number(v) : null;
}

function evaluarRiesgo(estudiante) {
  const asistencia = aNumero(estudiante.attendance);
  const promedio = aNumero(estudiante.promedio);
  const lectura = aNumero(estudiante.lectura);
  const motivos = [];
  let score = 0;

  if (asistencia !== null) {
    if (asistencia < 70) { motivos.push('Asistencia del ' + asistencia + '%, por debajo del mínimo recomendado (70%).'); score += 2; }
    else if (asistencia < 85) { motivos.push('Asistencia del ' + asistencia + '%, levemente por debajo de lo esperado.'); score += 1; }
  }
  if (promedio !== null) {
    if (promedio < 3.0) { motivos.push('Promedio académico de ' + promedio.toFixed(1) + ', por debajo del mínimo aprobatorio.'); score += 2; }
    else if (promedio < 3.8) { motivos.push('Promedio académico de ' + promedio.toFixed(1) + ', cercano al mínimo.'); score += 1; }
  }
  if (lectura !== null) {
    if (lectura < 65) { motivos.push('Nivel de lectura del ' + lectura + '%, por debajo de lo esperado para el grado.'); score += 2; }
    else if (lectura < 80) { motivos.push('Nivel de lectura del ' + lectura + '%, requiere refuerzo.'); score += 1; }
  }

  let level = 'bajo';
  if (score >= 3) level = 'alto';
  else if (score >= 1) level = 'medio';

  let rec = '';
  if (level === 'alto') rec = 'Contactar al acudiente y activar plan de refuerzo académico inmediato.';
  else if (level === 'medio') rec = 'Seguimiento del docente titular y tutoría de refuerzo.';

  return {
    level: level,
    motivos: motivos,
    rec: rec,
    hasData: asistencia !== null || promedio !== null || lectura !== null
  };
}

module.exports = { evaluarRiesgo };
