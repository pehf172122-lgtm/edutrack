(async function () {
  const session = authService.requireAuth();
  if (!session) return;

  renderSidebar('dashboard');
  document.getElementById('greeting').textContent = 'Hola, ' + session.name;

  function levelTag(level) {
    return level === 'alto'
      ? '<span class="tag high">Riesgo alto</span>'
      : '<span class="tag mid">Riesgo medio</span>';
  }

  function formatLastUpdate(ts) {
    if (!ts) { document.getElementById('lastUpdate').textContent = 'Sin movimientos aún'; return; }
    const d = new Date(ts);
    const fecha = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    const hora = d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
    document.getElementById('lastUpdate').textContent = 'Actualizado: ' + fecha + ' · ' + hora;
  }

  // --- Datos base ---
  const estudiantes = await estudianteService.listar('');
  const matriculas = await matriculaService.listar();
  const alertas = await alertaService.listar();
  const resumen = await analyticsService.resumen();
  formatLastUpdate(resumen.ultimaActualizacion);

  // --- KPI: Matrícula primaria ---
  const matriculaKpi = document.getElementById('kpiMatricula');
  const matriculaNote = document.getElementById('kpiMatriculaNote');
  if (resumen.totalEstudiantes === 0) {
    matriculaKpi.textContent = '—';
    matriculaNote.textContent = 'Sin estudiantes registrados aún.';
  } else {
    matriculaKpi.textContent = resumen.matriculaPct + '%';
    matriculaNote.textContent = resumen.conMatricula + ' de ' + resumen.totalEstudiantes + ' estudiantes con matrícula registrada';
  }

  // --- KPI: Alfabetización ---
  const alfabetizacionKpi = document.getElementById('kpiAlfabetizacion');
  const alfabetizacionNote = document.getElementById('kpiAlfabetizacionNote');
  if (resumen.conLectura === 0) {
    alfabetizacionKpi.textContent = '—';
    alfabetizacionNote.textContent = 'Aún no hay registros de lectura en Rendimiento académico.';
  } else {
    alfabetizacionKpi.textContent = resumen.alfabetizacionPct + '%';
    alfabetizacionNote.textContent = 'Promedio sobre ' + resumen.conLectura + ' estudiante(s) con datos de lectura';
  }

  // --- KPI: riesgo ---
  const bajo = resumen.bajo, medio = resumen.medio, alto = resumen.alto;
  document.getElementById('alertCount').textContent = medio + alto;
  document.getElementById('riskBreakdown').textContent = alto + ' alto · ' + medio + ' medio';

  // --- Tendencia de matrícula por período (mes-año de la fecha ingresada) ---
  const porPeriodo = {};
  matriculas.forEach(function (m) {
    if (!m.date) return;
    const d = new Date(m.date + 'T12:00:00');
    const key = d.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' });
    porPeriodo[key] = (porPeriodo[key] || 0) + 1;
  });
  const periodos = Object.keys(porPeriodo);
  const trendBars = document.getElementById('trendBars');
  if (!periodos.length) {
    trendBars.innerHTML = '<p class="empty" style="width:100%;">Registra matrículas con fecha para ver la tendencia.</p>';
  } else {
    const max = Math.max.apply(null, periodos.map(function (k) { return porPeriodo[k]; }));
    trendBars.innerHTML = periodos.map(function (k) {
      const h = Math.max(8, Math.round((porPeriodo[k] / max) * 100));
      return '<div class="bar-col"><div class="bar' + (porPeriodo[k] === max ? ' peak' : '') + '" style="height:' + h + '%"></div><span class="bar-year">' + k + '</span></div>';
    }).join('');
  }

  // --- Estado de estudiantes (riesgo) ---
  const total = estudiantes.length || 1;
  const riskSummary = document.getElementById('riskSummary');
  if (!estudiantes.length) {
    riskSummary.innerHTML = '<p class="empty">Sin estudiantes registrados aún.</p>';
  } else {
    function fila(label, count, cls, color) {
      const pct = Math.round((count / total) * 100);
      return '<div class="risk-summary-row">' +
        '<span class="risk-dot ' + cls + '"></span>' +
        '<div style="flex:1;"><div class="risk-summary-label">' + label + '</div>' +
        '<div class="risk-bar-track"><div class="risk-bar-fill" style="width:' + pct + '%; background:' + color + ';"></div></div></div>' +
        '<span class="risk-summary-value">' + count + '</span>' +
        '</div>';
    }
    riskSummary.innerHTML =
      fila('Bajo riesgo', bajo, 'bajo', 'var(--teal)') +
      fila('Riesgo medio', medio, 'medio', 'var(--amber)') +
      fila('Riesgo alto', alto, 'alto', 'var(--sdg-red)');
  }

  // --- Alertas recientes ---
  const preview = document.getElementById('alertPreview');
  const dashEmpty = document.getElementById('dashAlertEmpty');
  preview.innerHTML = alertas.slice(0, 5).map(function (a) {
    return '<div class="alert-row"><div class="alert-top"><span>' + esc(a.studentLabel) + ' · ' + esc(a.grade) + '</span>' + levelTag(a.level) + '</div></div>';
  }).join('');
  dashEmpty.style.display = alertas.length ? 'none' : 'block';
})();
