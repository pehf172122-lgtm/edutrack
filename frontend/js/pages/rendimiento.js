(async function () {
  const session = authService.requireAuth();
  if (!session) return;
  renderSidebar('rendimiento');

  function riesgoTag(level) {
    if (level === 'alto') return '<span class="tag high">Alto</span>';
    if (level === 'medio') return '<span class="tag mid">Medio</span>';
    return '<span class="tag bajo">Bajo</span>';
  }

  const select = document.getElementById('rEstudiante');
  const note = document.getElementById('noStudentsNote');
  const btn = document.getElementById('btnSaveRendimiento');

  async function loadStudentOptions() {
    const estudiantes = await estudianteService.listar('');
    if (!estudiantes.length) {
      select.innerHTML = '<option value="">Sin estudiantes disponibles</option>';
      note.style.display = 'block';
      btn.disabled = true;
      return;
    }
    note.style.display = 'none';
    btn.disabled = false;
    select.innerHTML = estudiantes.map(function (e) {
      return '<option value="' + e.id + '" data-name="' + esc(e.name) + '">' + esc(e.name) + ' · ' + esc(e.grade) + '</option>';
    }).join('');
  }

  async function refreshTable() {
    const body = document.getElementById('rendimientoTableBody');
    const empty = document.getElementById('rendimientoEmpty');
    const estudiantes = (await estudianteService.listar('')).filter(function (e) {
      return e.promedio != null || e.lectura != null;
    });
    body.innerHTML = '';
    empty.style.display = estudiantes.length ? 'none' : 'block';
    estudiantes.forEach(function (e) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + esc(e.name) + '</td>' +
        '<td>' + (e.promedio != null ? e.promedio.toFixed(1) : '—') + '</td>' +
        '<td>' + (e.lectura != null ? e.lectura + '%' : '—') + '</td>' +
        '<td>' + (e.attendance != null ? e.attendance + '%' : '—') + '</td>' +
        '<td>' + riesgoTag(e.riesgo.level) + '</td>';
      body.appendChild(tr);
    });
  }

  btn.addEventListener('click', async function () {
    const opt = select.options[select.selectedIndex];
    const err = document.getElementById('rError');
    const toast = document.getElementById('rendimientoToast');
    toast.classList.remove('show');
    const registro = {
      estudianteId: select.value,
      estudianteName: opt ? opt.getAttribute('data-name') : '',
      period: document.getElementById('rPeriodo').value.trim(),
      matematicas: document.getElementById('rMate').value.trim(),
      lenguaje: document.getElementById('rLeng').value.trim(),
      lectura: document.getElementById('rLectura').value.trim(),
      observaciones: document.getElementById('rObs').value.trim()
    };
    try {
      await rendimientoService.registrar(registro);
      err.classList.remove('show');
      toast.textContent = 'Rendimiento guardado para ' + registro.estudianteName + '. El riesgo se recalculó automáticamente.';
      toast.classList.add('show');
      ['rPeriodo', 'rMate', 'rLeng', 'rLectura', 'rObs'].forEach(function (id) { document.getElementById(id).value = ''; });
      refreshTable();
    } catch (e) {
      err.textContent = e.message;
      err.classList.add('show');
    }
  });

  await loadStudentOptions();
  refreshTable();
})();
