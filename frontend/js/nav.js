/*
  nav.js
  Construye el menu lateral en cada pagina protegida y controla el logout.
  Se apoya en authService para el guard de sesion.
*/

const NAV_ITEMS = [
  { view: 'dashboard', label: 'Panel principal', href: 'dashboard.html', icon: '🏫' },
  { view: 'estudiantes', label: 'Estudiantes', href: 'estudiantes.html', icon: '🎒' },
  { view: 'matricula', label: 'Matrícula', href: 'matricula.html', icon: '📋' },
  { view: 'rendimiento', label: 'Rendimiento académico', href: 'rendimiento.html', icon: '✏️' },
  { view: 'alertas', label: 'Alertas tempranas', href: 'alertas.html', icon: '🔔' },
  { view: 'reportes', label: 'Reportes', href: 'reportes.html', icon: '📊' }
];

function renderSidebar(activeView) {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  nav.innerHTML = NAV_ITEMS.map(function (item) {
    const current = item.view === activeView ? ' aria-current="page"' : '';
    return '<a class="nav-item" href="' + item.href + '"' + current + '><span class="nav-icon">' + item.icon + '</span>' + item.label + '</a>';
  }).join('');

  const session = authService.getSession();
  const foot = document.getElementById('sideFoot');
  if (foot && session) {
    foot.innerHTML = 'Sesión activa: ' + esc(session.name) + '<br>' +
      'Período: ' + new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }) +
      '<button class="logout" id="btnLogout">Cerrar sesión</button>';
    document.getElementById('btnLogout').addEventListener('click', async function () {
      await authService.logout();
      window.location.href = 'index.html';
    });
  }
}
