/*
  analyticsService.js
  Indicadores institucionales calculados por el servidor: GET /api/reportes/resumen.
*/
const analyticsService = {
  async resumen() {
    return api('GET', '/reportes/resumen');
  }
};
