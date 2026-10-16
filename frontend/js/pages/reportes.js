(async function () {
  const session = authService.requireAuth();
  if (!session) return;
  renderSidebar('reportes');

  let resumen = null;

  async function loadResumen() {
    resumen = await analyticsService.resumen();

    document.getElementById('repMatricula').textContent = resumen.matriculaPct != null ? resumen.matriculaPct + '%' : 'Sin dato';
    document.getElementById('repAlfabetizacion').textContent = resumen.alfabetizacionPct != null ? resumen.alfabetizacionPct + '%' : 'Sin dato';
    document.getElementById('repTotal').textContent = resumen.totalEstudiantes;
    document.getElementById('repRiesgo').textContent = (resumen.medio + resumen.alto) + ' (' + resumen.alto + ' alto · ' + resumen.medio + ' medio)';

    const matriculaPct = resumen.matriculaPct || 0;
    const alfabetizacionPct = resumen.alfabetizacionPct || 0;
    document.getElementById('compareBars').innerHTML =
      '<div class="compare-col">' +
        '<span class="compare-value">' + (resumen.matriculaPct != null ? matriculaPct + '%' : 'Sin dato') + '</span>' +
        '<div class="compare-bar" style="height:' + Math.max(4, matriculaPct) + '%; background: var(--navy-soft);"></div>' +
        '<span class="compare-label">SE.PRM.ENRR</span>' +
      '</div>' +
      '<div class="compare-col">' +
        '<span class="compare-value">' + (resumen.alfabetizacionPct != null ? alfabetizacionPct + '%' : 'Sin dato') + '</span>' +
        '<div class="compare-bar" style="height:' + Math.max(4, alfabetizacionPct) + '%; background: var(--teal);"></div>' +
        '<span class="compare-label">SE.ADT.LITR.ZS</span>' +
      '</div>' +
      '<div class="compare-col">' +
        '<span class="compare-value">100%</span>' +
        '<div class="compare-bar" style="height:100%; background: var(--sdg-red);"></div>' +
        '<span class="compare-label">Meta ODS</span>' +
      '</div>';
  }

  async function loadHistorial() {
    const hist = document.getElementById('exportHistory');
    const empty = document.getElementById('historyEmpty');
    const items = await reporteService.historial();
    hist.innerHTML = items.map(function (name) { return '<span>' + esc(name) + '</span>'; }).join('');
    empty.style.display = items.length ? 'none' : 'block';
  }

  function construirContenido() {
    const fecha = new Date().toLocaleString('es-CO');
    const lineas = [
      'EduTrack — Reporte institucional',
      'Período: 2026',
      'Generado: ' + fecha,
      '',
      'Indicadores ODS 4',
      '  Matrícula primaria (SE.PRM.ENRR): ' + (resumen.matriculaPct != null ? resumen.matriculaPct + '%' : 'sin dato'),
      '  Alfabetización (SE.ADT.LITR.ZS): ' + (resumen.alfabetizacionPct != null ? resumen.alfabetizacionPct + '%' : 'sin dato'),
      '',
      'Estudiantes monitoreados: ' + resumen.totalEstudiantes,
      '  Riesgo alto: ' + resumen.alto,
      '  Riesgo medio: ' + resumen.medio,
      '  Riesgo bajo: ' + resumen.bajo,
      '',
      'Matrículas registradas: ' + resumen.totalMatriculas,
      '',
      'Nota: los datos provienen de lo registrado en el sistema (Estudiantes,',
      'Matrícula, Rendimiento) y almacenado en PostgreSQL; no están conectados',
      'a la API del Banco Mundial.'
    ];
    return lineas.join('\n');
  }

  document.getElementById('btnExport').addEventListener('click', async function (e) {
    const btn = e.currentTarget;
    const toast = document.getElementById('exportToast');
    btn.disabled = true;
    btn.textContent = 'Generando...';

    await loadResumen();
    const contenido = construirContenido();
    const nombre = 'Reporte_EduTrack_' + new Date().toISOString().slice(0, 10) + '.txt';

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    await reporteService.registrarDescarga(nombre);
    toast.textContent = 'Reporte descargado: ' + nombre;
    toast.classList.add('show');
    btn.disabled = false;
    btn.textContent = 'Descargar reporte (.txt)';
    loadHistorial();
  });

  await loadResumen();
  loadHistorial();
})();
