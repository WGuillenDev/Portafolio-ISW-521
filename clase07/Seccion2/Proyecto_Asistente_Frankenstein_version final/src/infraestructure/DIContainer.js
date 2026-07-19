import { CONFIG } from "./config.js";
import { LocalStorageChatRepository } from "../adapters/driven/LocalStorageChatRepository.js";
import { KnowledgeBaseModelClient } from "../adapters/driven/KnowledgeBaseModelClient.js";
import { ChatManager } from "../core/useCases/ChatManager.js";

/**
 * Contenedor de inyección de dependencias.
 * Decide qué implementación concreta recibe cada caso de uso.
 * Cambiar de adapter se hace solo aquí, sin tocar core/.
 */
export function crearChatManager() {
  const chatRepository = new LocalStorageChatRepository(CONFIG.CLAVE_MEMORIA);
  const modelClient = new KnowledgeBaseModelClient();

  return new ChatManager(chatRepository, modelClient);
}
