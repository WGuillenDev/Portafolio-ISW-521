/**
 * Entidad de dominio: Message.
 * Modela y valida un mensaje. No conoce storage, API ni DOM.
 */

export const ROLES = Object.freeze({
  USUARIO: "user",
  IA: "ia",
});

export class Message {
  /**
   * @param {string} rol   - ROLES.USUARIO | ROLES.IA
   * @param {string} texto - contenido del mensaje
   * @param {number} [timestamp] - fecha de creación (ms epoch)
   */
  constructor(rol, texto, timestamp = Date.now()) {
    if (rol !== ROLES.USUARIO && rol !== ROLES.IA) {
      throw new Error(`Message: rol inválido "${rol}"`);
    }
    if (typeof texto !== "string" || texto.trim().length === 0) {
      throw new Error("Message: el texto no puede estar vacío");
    }

    this.rol = rol;
    this.texto = texto.trim();
    this.timestamp = timestamp;
  }

  /** Convierte la entidad a un objeto plano serializable. */
  toPlainObject() {
    return { rol: this.rol, texto: this.texto, timestamp: this.timestamp };
  }

  /** Reconstruye una entidad a partir de un objeto plano (ej. JSON.parse). */
  static fromPlainObject(obj) {
    if (!obj || typeof obj !== "object") {
      throw new Error("Message.fromPlainObject: objeto inválido");
    }
    return new Message(obj.rol, obj.texto, obj.timestamp);
  }
}
