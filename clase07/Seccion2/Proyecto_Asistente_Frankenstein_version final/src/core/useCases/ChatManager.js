import { Message, ROLES } from "../entities/Message.js";

/**
 * Caso de uso: ChatManager.
 * Orquesta el envío de mensajes y el historial. Depende solo
 * de abstracciones (ports); la implementación concreta se
 * inyecta desde fuera (ver DIContainer.js).
 */
export class ChatManager {
  constructor(chatRepository, modelClient) {
    this.chatRepository = chatRepository;
    this.modelClient = modelClient;
    this.historial = this.chatRepository.cargar();
  }

  /** Historial actual, en orden cronológico. */
  obtenerHistorial() {
    return [...this.historial];
  }

  /** Envía un mensaje y espera la respuesta real del modelo. */
  async enviarMensaje(texto) {
    const mensajeUsuario = new Message(ROLES.USUARIO, texto);
    this._agregarYPersistir(mensajeUsuario);

    // Se espera la respuesta real antes de continuar (sin race condition).
    const textoRespuesta = await this.modelClient.consultar(
      texto,
      this.historial
    );

    const mensajeIA = new Message(ROLES.IA, `🤖 ${textoRespuesta}`);
    this._agregarYPersistir(mensajeIA);

    return { mensajeUsuario, mensajeIA };
  }

  _agregarYPersistir(mensaje) {
    this.historial.push(mensaje);
    this.chatRepository.guardar(this.historial);
  }
}
