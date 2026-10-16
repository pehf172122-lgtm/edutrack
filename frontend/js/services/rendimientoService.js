/*
  rendimientoService.js
  Cliente del microservicio de rendimiento (DFD 2 / D2): /api/rendimiento.
  El promedio y la lectura del estudiante se derivan en la base de datos (vista v_estudiantes_indicadores).
*/
const rendimientoService = {
  async listar() {
    return api('GET', '/rendimiento');
  },

  async porEstudiante(estudianteId) {
    return api('GET', '/rendimiento/estudiante/' + encodeURIComponent(estudianteId));
  },

  async registrar(registro) {
    return api('POST', '/rendimiento', registro);
  }
};
