(function () {
  const session = authService.requireAuth();
  if (!session) return;
  renderSidebar('matricula');

  function indicadoresBadges(ind) {
    const out = [];
    if (ind && ind.prm) out.push('SE.PRM.ENRR');
    if (ind && ind.lit) out.push('SE.ADT.LITR.ZS');
    return out.join(' · ') || '—';
  }

  async function refreshTable() {
    const body = document.getElementById('matriculaTableBody');
    const empty = document.getElementById('matriculaEmpty');
    const list = await matriculaService.listar();
    body.innerHTML = '';
    empty.style.display = list.length ? 'none' : 'block';
    list.forEach(function (m) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + esc(m.name) + '</td><td>' + esc(m.grade) + '</td><td>' + esc(m.inst) + '</td><td>' + indicadoresBadges(m.indicadores) + '</td>';
      body.appendChild(tr);
    });
  }

  document.getElementById('btnSaveMatricula').addEventListener('click', async function () {
    const registro = {
      name: document.getElementById('mName').value.trim(),
      doc: document.getElementById('mDoc').value.trim(),
      grade: document.getElementById('mGrade').value.trim(),
      date: document.getElementById('mDate').value,
      inst: document.getElementById('mInst').value.trim(),
      indicadores: {
        prm: document.getElementById('indPrm').checked,
        lit: document.getElementById('indLit').checked
      }
    };
    const err = document.getElementById('mError');
    const toast = document.getElementById('matriculaToast');
    toast.classList.remove('show');
    try {
      await matriculaService.registrar(registro);
      err.classList.remove('show');
      toast.textContent = 'Registro de matrícula guardado para ' + registro.name + '.';
      toast.classList.remove('danger');
      toast.classList.add('show');
      ['mName', 'mDoc', 'mGrade', 'mInst', 'mDate'].forEach(function (id) { document.getElementById(id).value = ''; });
      refreshTable();
    } catch (e) {
      err.textContent = e.message;
      err.classList.add('show');
    }
  });

  document.getElementById('btnClearMatricula').addEventListener('click', function () {
    ['mName', 'mDoc', 'mGrade', 'mInst', 'mDate'].forEach(function (id) { document.getElementById(id).value = ''; });
    document.getElementById('mError').classList.remove('show');
    document.getElementById('matriculaToast').classList.remove('show');
  });

  refreshTable();
})();
