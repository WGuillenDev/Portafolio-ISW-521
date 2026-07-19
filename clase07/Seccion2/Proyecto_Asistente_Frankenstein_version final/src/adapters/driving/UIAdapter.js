/**
 * Adapter driving: UIAdapter.
 * Traduce eventos del DOM en llamadas al caso de uso y
 * refleja el resultado en pantalla. Sin lógica de negocio.
 */
export class UIAdapter {
  constructor(chatManager, elementos) {
    this.chatManager = chatManager;
    this.chat = elementos.chat;
    this.entrada = elementos.entrada;
    this.estado = elementos.estado;
    this.btnEnviar = elementos.btnEnviar;
  }

  /** Engancha los listeners y pinta el historial ya persistido. */
  iniciar() {
    this._pintarHistorialInicial();

    this.btnEnviar.addEventListener("click", () => this._manejarEnvio());
    this.entrada.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this._manejarEnvio();
    });
  }

  _pintarHistorialInicial() {
    const historial = this.chatManager.obtenerHistorial();
    historial.forEach((mensaje) => this._pintarMensaje(mensaje));

    if (historial.length > 0) {
      this._actualizarEstado(`Memoria restaurada: ${historial.length} mensajes`);
    }
  }

  async _manejarEnvio() {
    const texto = this.entrada.value.trim();
    if (!texto) return;

    this.entrada.value = "";
    this.btnEnviar.disabled = true;
    this._actualizarEstado("Pensando...");

    try {
      const { mensajeUsuario, mensajeIA } = await this.chatManager.enviarMensaje(
        texto
      );
      this._pintarMensaje(mensajeUsuario);
      this._pintarMensaje(mensajeIA);
      this._actualizarEstado("✓ Respuesta recibida (fetch OK)");
    } catch (error) {
      console.error("[UIAdapter] Error al enviar mensaje:", error);
      this._actualizarEstado("⚠ Error al consultar el modelo. Revisa la consola.");
    } finally {
      this.btnEnviar.disabled = false;
      this.entrada.focus();
    }
  }

  _pintarMensaje(mensaje) {
    const li = document.createElement("li");
    li.className = `msg ${mensaje.rol}`;
    li.textContent = mensaje.texto;
    this.chat.appendChild(li);
    this.chat.scrollTop = this.chat.scrollHeight;
  }

  _actualizarEstado(texto) {
    this.estado.textContent = texto;
  }
}
