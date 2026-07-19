import { ModelClientPort } from "../../core/ports/ModelClientPort.js";

/**
 * Adapter driven: FetchModelClient.
 * Implementa ModelClientPort contra la API de prueba.
 * Nota: retorna texto en Lorem Ipsum, no en español;
 * se conserva como referencia. Adapter activo: KnowledgeBaseModelClient.
 */
export class FetchModelClient extends ModelClientPort {
  constructor(endpointBase) {
    super();
    this.endpointBase = endpointBase;
  }

  async consultar(texto, historial = []) {
    const indice = historial.length + 1;
    const respuesta = await fetch(`${this.endpointBase}/${indice}`);

    if (!respuesta.ok) {
      throw new Error(
        `FetchModelClient: la API respondió con Status ${respuesta.status}`
      );
    }

    const datos = await respuesta.json();

    if (!datos || typeof datos.title !== "string") {
      throw new Error("FetchModelClient: respuesta con formato inesperado");
    }

    return datos.title;
  }
}
