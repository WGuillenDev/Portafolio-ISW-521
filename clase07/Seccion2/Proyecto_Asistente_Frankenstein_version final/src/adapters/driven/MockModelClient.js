import { ModelClientPort } from "../../core/ports/ModelClientPort.js";

/**
 * Adapter driven: MockModelClient.
 * Implementa ModelClientPort con frases fijas en español,
 * sin analizar el texto del usuario. Se conserva como
 * referencia; el adapter activo es KnowledgeBaseModelClient.
 */
export class MockModelClient extends ModelClientPort {
  constructor() {
    super();
    this.respuestas = [
      "Entendido, cuéntame más sobre eso.",
      "Interesante, ¿por qué lo preguntas?",
      "Estoy procesando tu mensaje, dame un momento.",
      "Buena pregunta, déjame pensarlo.",
      "Claro, ¿puedes darme más contexto?",
      "Recibido. ¿Necesitas algo más?",
    ];
  }

  async consultar(texto, historial = []) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const i = historial.length % this.respuestas.length;
    return this.respuestas[i];
  }
}
