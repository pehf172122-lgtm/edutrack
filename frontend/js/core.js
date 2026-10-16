/*
  core.js
  Utilidades compartidas por todas las páginas:
  - api(): cliente HTTP hacia el backend (/api/...). La sesión viaja en una cookie HttpOnly.
  - esc(): escapa texto antes de insertarlo con innerHTML (evita inyección de HTML/JS).
*/
const SESSION_KEY = 'edutrack_session';

async function api(method, url, body) {
  const opts = { method: method, headers: {}, credentials: 'same-origin' };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch('/api' + url, opts);
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
  }
  let data = null;
  try { data = await res.json(); } catch (e) {}

  const esAuth = url.indexOf('/auth/login') === 0 || url.indexOf('/auth/register') === 0;
  if (res.status === 401 && !esAuth) {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
    window.location.href = 'index.html';
    throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || 'Error inesperado (' + res.status + ').');
    err.status = res.status;
    throw err;
  }
  return data;
}

function esc(valor) {
  return String(valor === null || valor === undefined ? '' : valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
