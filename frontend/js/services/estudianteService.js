/*
  estudianteService.js
  Cliente del microservicio de estudiantes: /api/estudiantes (tabla estudiantes en PostgreSQL).
  El riesgo viene calculado por el servidor (motor de riesgo de la lógica de negocio).
*/
const estudianteService = {
  async listar(filtro) {
    return api('GET', '/estudiantes?q=' + encodeURIComponent(filtro || ''));
  },

  async obtener(id) {
    try {
      return await api('GET', '/estudiantes/' + encodeURIComponent(id));
    } catch (e) {
      if (e.status === 404) return null;
      throw e;
    }
  },

  async crear(estudiante) {
    return api('POST', '/estudiantes', {
      name: estudiante.name,
      grade: estudiante.grade,
      attendance: estudiante.attendance
    });
  },

  async actualizar(id, datos) {
    return api('PUT', '/estudiantes/' + encodeURIComponent(id), {
      name: datos.name,
      grade: datos.grade,
      attendance: datos.attendance
    });
  }
};
