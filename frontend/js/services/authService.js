/*
  authService.js
  Cliente del microservicio de autenticación (POST /api/auth/login, /register, /logout).
  La autenticación real la hace el servidor con una cookie HttpOnly firmada;
  aquí solo se guarda el nombre y rol para mostrar la interfaz.
*/
function guardarSesion(s) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) {}
  return s;
}

const authService = {
  async login(email, password) {
    return guardarSesion(await api('POST', '/auth/login', { email: email, password: password }));
  },

  async register(nombre, email, password) {
    return guardarSesion(await api('POST', '/auth/register', { nombre: nombre, email: email, password: password }));
  },

  async logout() {
    try { await api('POST', '/auth/logout'); } catch (e) {}
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
  },

  getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  // Llamar al inicio de cada página protegida. Si la cookie expiró, la primera llamada a la API redirige al login.
  requireAuth() {
    const session = authService.getSession();
    if (!session) {
      window.location.href = 'index.html';
    }
    return session;
  }
};
