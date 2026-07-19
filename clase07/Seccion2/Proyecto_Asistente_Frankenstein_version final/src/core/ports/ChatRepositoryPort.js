/**
 * Puerto: ChatRepositoryPort.
 * Contrato de persistencia del historial. El core solo
 * conoce esta interfaz, nunca una implementación concreta.
 */
export class ChatRepositoryPort {
  /** Persiste el historial completo. */
  guardar(historial) {
    throw new Error("ChatRepositoryPort.guardar() no implementado");
  }

  /** Retorna el historial persistido. Siempre un array. */
  cargar() {
    throw new Error("ChatRepositoryPort.cargar() no implementado");
  }

  /** Limpia el historial persistido. */
  limpiar() {
    throw new Error("ChatRepositoryPort.limpiar() no implementado");
  }
}
