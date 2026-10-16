/*
  reporteService.js
  Cliente del microservicio de reportes (DFD 4): historial de descargas en /api/reportes.
*/
const reporteService = {
  async historial() {
    return api('GET', '/reportes/historial');
  },

  async registrarDescarga(nombre) {
    return api('POST', '/reportes/descargas', { nombre: nombre });
  }
};
