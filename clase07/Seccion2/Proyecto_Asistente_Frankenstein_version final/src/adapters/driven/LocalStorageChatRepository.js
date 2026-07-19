import { ChatRepositoryPort } from "../../core/ports/ChatRepositoryPort.js";
import { Message } from "../../core/entities/Message.js";

/**
 * Adapter driven: LocalStorageChatRepository.
 * Implementa ChatRepositoryPort usando localStorage.
 * Serializa con JSON.stringify/parse; si el dato guardado
 * está corrupto, se limpia en vez de romper la aplicación.
 */
export class LocalStorageChatRepository extends ChatRepositoryPort {
  constructor(clave = "memoria_llm") {
    super();
    this.clave = clave;
  }

  guardar(historial) {
    const plano = historial.map((m) => m.toPlainObject());
    localStorage.setItem(this.clave, JSON.stringify(plano));
  }

  cargar() {
    const guardado = localStorage.getItem(this.clave);
    if (guardado === null) return [];

    try {
      const plano = JSON.parse(guardado);
      if (!Array.isArray(plano)) throw new Error("formato inesperado");
      return plano.map((obj) => Message.fromPlainObject(obj));
    } catch (error) {
      // Dato corrupto: se limpia y se arranca con historial vacío.
      console.warn("[LocalStorageChatRepository] Historial corrupto:", error);
      this.limpiar();
      return [];
    }
  }

  limpiar() {
    localStorage.removeItem(this.clave);
  }
}
