/**
 * Puerto: ModelClientPort.
 * Contrato para consultar al modelo. No mezcla
 * responsabilidades de persistencia (Interface Segregation).
 */
export class ModelClientPort {
  /**
   * Consulta al modelo y retorna el texto de respuesta.
   * @param {string} texto - mensaje del usuario
   * @param {import('../entities/Message.js').Message[]} historial - historial actual
   */
  async consultar(texto, historial) {
    throw new Error("ModelClientPort.consultar() no implementado");
  }
}
