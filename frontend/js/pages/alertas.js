(function () {
  const session = authService.requireAuth();
  if (!session) return;
  renderSidebar('alertas');

  let currentFilter = 'todos';
  let cache = [];

  function levelTag(level) {
    return level === 'alto'
      ? '<span class="tag high">Riesgo alto</span>'
      : '<span class="tag mid">Riesgo medio</span>';
  }

  function render() {
    const list = document.getElementById('fullAlertList');
    const empty = document.getElementById('alertEmpty');
    const visible = currentFilter === 'todos' ? cache : cache.filter(function (a) { return a.level === currentFilter; });

    list.innerHTML = '';
    empty.style.display = visible.length ? 'none' : 'block';

    visible.forEach(function (a) {
      const row = document.createElement('div');
      row.className = 'alert-row';
      const motivosHtml = a.motivos.filter(Boolean).map(function (m) { return '- ' + esc(m); }).join('<br>');
      row.innerHTML = '<div class="alert-top"><span>' + esc(a.studentLabel) + ' · ' + esc(a.grade) + '</span>' + levelTag(a.level) + '</div>' +
        '<div class="alert-source">' + (a.manual ? 'Registrada manualmente' : 'Generada por análisis automático') + '</div>' +
        '<div class="alert-detail"><strong>Motivos detectados:</strong><br>' + motivosHtml +
        (a.rec ? '<br><br><strong>Recomendación:</strong> ' + esc(a.rec) : '') + '</div>';
      row.addEventListener('click', function () { row.classList.toggle('open'); });
      list.appendChild(row);
    });
  }

  async function refresh() {
    cache = await alertaService.listar();
    document.getElementById('alertTotal').textContent = cache.length;
    document.getElementById('alertHigh').textContent = cache.filter(function (a) { return a.level === 'alto'; }).length;
    document.getElementById('alertMid').textContent = cache.filter(function (a) { return a.level === 'medio'; }).length;
    render();
  }

  document.getElementById('filterRow').addEventListener('click', function (e) {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    document.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
    btn.classList.add('active');
    currentFilter = btn.getAttribute('data-filter');
    render();
  });

  document.getElementById('toggleManualForm').addEventListener('click', function () {
    const form = document.getElementById('manualForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('btnSaveAlerta').addEventListener('click', async function () {
    const alerta = {
      studentLabel: document.getElementById('aName').value.trim(),
      grade: document.getElementById('aGrade').value.trim(),
      level: document.getElementById('aLevel').value,
      reason: document.getElementById('aReason').value.trim(),
      rec: document.getElementById('aRec').value.trim()
    };
    const err = document.getElementById('aError');
    try {
      await alertaService.crear(alerta);
      err.classList.remove('show');
      ['aName', 'aGrade', 'aReason', 'aRec'].forEach(function (id) { document.getElementById(id).value = ''; });
      document.getElementById('manualForm').style.display = 'none';
      refresh();
    } catch (e) {
      err.textContent = e.message;
      err.classList.add('show');
    }
  });

  refresh();
})();
