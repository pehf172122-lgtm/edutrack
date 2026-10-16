(function () {
  const session = authService.requireAuth();
  if (!session) return;
  renderSidebar('estudiantes');

  const body = document.getElementById('studentTableBody');
  const empty = document.getElementById('studentEmpty');
  const search = document.getElementById('studentSearch');
  const profileCard = document.getElementById('profileCard');
  const profileBody = document.getElementById('profileBody');
  const formTitle = document.getElementById('formTitle');
  const btnSave = document.getElementById('btnSaveStudent');
  const formEl = document.getElementById('newStudentForm');

  let editingId = null;

  function riesgoTag(level) {
    if (level === 'alto') return '<span class="tag high">Alto</span>';
    if (level === 'medio') return '<span class="tag mid">Medio</span>';
    return '<span class="tag bajo">Bajo</span>';
  }

  async function refresh(filtro) {
    body.innerHTML = '<tr><td colspan="7" class="empty">Cargando...</td></tr>';
    const rows = await estudianteService.listar(filtro);
    body.innerHTML = '';
    empty.style.display = rows.length ? 'none' : 'block';
    rows.forEach(function (s) {
      const tr = document.createElement('tr');
      tr.setAttribute('data-clickable', 'true');
      tr.innerHTML = '<td>' + esc(s.name) + '</td><td>' + esc(s.grade) + '</td>' +
        '<td>' + (s.attendance != null ? s.attendance + '%' : '—') + '</td>' +
        '<td>' + (s.promedio != null ? s.promedio.toFixed(1) : '—') + '</td>' +
        '<td>' + (s.lectura != null ? s.lectura + '%' : '—') + '</td>' +
        '<td>' + riesgoTag(s.riesgo.level) + '</td>' +
        '<td><button class="btn ghost btn-edit" data-id="' + s.id + '">Editar</button></td>';
      tr.addEventListener('click', function () { openProfile(s.id); });
      tr.querySelector('.btn-edit').addEventListener('click', function (e) {
        e.stopPropagation();
        startEdit(s);
      });
      body.appendChild(tr);
    });
  }

  function startEdit(s) {
    editingId = s.id;
    formTitle.textContent = 'Editar estudiante';
    document.getElementById('nsName').value = s.name;
    document.getElementById('nsGrade').value = s.grade;
    document.getElementById('nsAttendance').value = s.attendance != null ? s.attendance : '';
    btnSave.textContent = 'Guardar cambios';
    formEl.style.display = 'block';
    formEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function resetForm() {
    editingId = null;
    formTitle.textContent = 'Nuevo estudiante';
    btnSave.textContent = 'Guardar estudiante';
    document.getElementById('nsName').value = '';
    document.getElementById('nsGrade').value = '';
    document.getElementById('nsAttendance').value = '';
    document.getElementById('nsError').classList.remove('show');
    formEl.style.display = 'none';
  }

  async function openProfile(id) {
    const s = await estudianteService.obtener(id);
    if (!s) return;
    const historial = await rendimientoService.porEstudiante(id);

    const motivosHtml = s.riesgo.motivos.length
      ? '<ul style="margin: 10px 0 0; padding-left: 18px; font-size: 13px; color: var(--ink-soft);">' +
        s.riesgo.motivos.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>'
      : '<p class="card-note" style="margin-top: 10px;">Sin señales de riesgo detectadas.</p>';

    const historialHtml = historial.length
      ? historial.map(function (r) {
          return '<div class="profile-history-row"><span>' + esc(r.period) + '</span>' +
            '<span>Mat: ' + (r.matematicas != null ? r.matematicas.toFixed(1) : '—') +
            ' · Leng: ' + (r.lenguaje != null ? r.lenguaje.toFixed(1) : '—') +
            ' · Lectura: ' + (r.lectura != null ? r.lectura + '%' : '—') + '</span></div>';
        }).join('')
      : '<p class="card-note">Sin registros de rendimiento todavía.</p>';

    profileBody.innerHTML =
      '<h2 style="font-size: 19px; margin-bottom: 2px;">' + esc(s.name) + '</h2>' +
      '<p class="card-note" style="margin-bottom: 1rem;">' + esc(s.grade) + ' · Código ' + s.id + '</p>' +
      '<div class="profile-grid">' +
        '<div class="profile-stat"><div class="profile-stat-label">Asistencia</div><div class="profile-stat-value">' + (s.attendance != null ? s.attendance + '%' : '—') + '</div></div>' +
        '<div class="profile-stat"><div class="profile-stat-label">Promedio</div><div class="profile-stat-value">' + (s.promedio != null ? s.promedio.toFixed(1) : '—') + '</div></div>' +
        '<div class="profile-stat"><div class="profile-stat-label">Lectura</div><div class="profile-stat-value">' + (s.lectura != null ? s.lectura + '%' : '—') + '</div></div>' +
        '<div class="profile-stat"><div class="profile-stat-label">Riesgo</div><div class="profile-stat-value">' + riesgoTag(s.riesgo.level) + '</div></div>' +
      '</div>' +
      '<div class="card-head"><span class="card-title" style="font-size: 13px;">Motivos detectados</span></div>' +
      motivosHtml +
      '<div class="card-head" style="margin-top: 1.1rem;"><span class="card-title" style="font-size: 13px;">Historial de rendimiento</span></div>' +
      '<div class="profile-history">' + historialHtml + '</div>' +
      '<div style="margin-top: 1rem;"><button class="btn ghost" id="btnEditFromProfile">Editar datos</button></div>';

    document.getElementById('btnEditFromProfile').addEventListener('click', function () {
      profileCard.style.display = 'none';
      startEdit(s);
    });

    profileCard.style.display = 'block';
    profileCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  document.getElementById('btnCloseProfile').addEventListener('click', function () {
    profileCard.style.display = 'none';
  });

  search.addEventListener('input', function (e) { refresh(e.target.value); });

  document.getElementById('btnNewStudent').addEventListener('click', function () {
    resetForm();
    formEl.style.display = 'block';
  });
  document.getElementById('btnCancelStudent').addEventListener('click', resetForm);

  btnSave.addEventListener('click', async function () {
    const name = document.getElementById('nsName').value.trim();
    const grade = document.getElementById('nsGrade').value.trim();
    const attendance = document.getElementById('nsAttendance').value.trim();
    const err = document.getElementById('nsError');
    if (!name || !grade) { err.textContent = 'Completa el nombre y el grado antes de guardar.'; err.classList.add('show'); return; }
    err.classList.remove('show');

    try {
      if (editingId) {
        await estudianteService.actualizar(editingId, { name: name, grade: grade, attendance: attendance });
      } else {
        await estudianteService.crear({ name: name, grade: grade, attendance: attendance });
      }
    } catch (e) {
      err.textContent = e.message;
      err.classList.add('show');
      return;
    }
    resetForm();
    refresh(search.value);
  });

  refresh('');
})();
