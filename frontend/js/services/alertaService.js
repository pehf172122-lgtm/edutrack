/*
  alertaService.js
  Cliente del microservicio de alertas (DFD 3): /api/alertas.
  Las automáticas las genera el servidor a partir del riesgo; las manuales las registra el admin.
*/
const alertaService = {
  async listar() {
    return api('GET', '/alertas');
  },

  async crear(alerta) {
    return api('POST', '/alertas', alerta);
  }
};
