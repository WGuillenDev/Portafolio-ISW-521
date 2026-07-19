import { crearChatManager } from "./infraestructure/DIContainer.js";
import { UIAdapter } from "./adapters/driving/UIAdapter.js";

/**
 * Composition root: arma las dependencias y arranca la app.
 * Único archivo que conoce todas las capas.
 */
function arrancar() {
  const chatManager = crearChatManager();

  const elementos = {
    chat: document.getElementById("chat"),
    entrada: document.getElementById("entrada"),
    estado: document.getElementById("estado"),
    btnEnviar: document.getElementById("btnEnviar"),
  };

  const ui = new UIAdapter(chatManager, elementos);
  ui.iniciar();
}

document.addEventListener("DOMContentLoaded", arrancar);
