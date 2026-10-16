/*
  matriculaService.js
  Cliente del microservicio de matrícula (DFD 1): /api/matriculas.
  Solo el rol admin puede registrar; todos los usuarios autenticados pueden consultar.
*/
const matriculaService = {
  async listar() {
    return api('GET', '/matriculas');
  },

  async registrar(registro) {
    return api('POST', '/matriculas', registro);
  }
};
