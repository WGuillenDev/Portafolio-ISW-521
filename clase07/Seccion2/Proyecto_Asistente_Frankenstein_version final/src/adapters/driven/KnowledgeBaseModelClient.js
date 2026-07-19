import { ModelClientPort } from "../../core/ports/ModelClientPort.js";

/**
 * Adapter driven: KnowledgeBaseModelClient.
 * Implementa ModelClientPort con un motor de reglas: busca
 * palabras clave en el texto del usuario y responde con
 * contenido real relacionado, en vez de rotar frases fijas.
 * No es un modelo de lenguaje real, pero sí razona sobre
 * el input en vez de ignorarlo (a diferencia de un mock puro).
 */
export class KnowledgeBaseModelClient extends ModelClientPort {
  constructor() {
    super();

    // Cada regla: palabras clave -> función que arma la respuesta.
    // Se evalúan en orden; gana la primera coincidencia.
    this.reglas = [
      {
        palabras: ["recuerdas", "memoria", "acuerdas"],
        responder: (texto, historial) =>
          `¡Claro! Tu historial tiene ${historial.length} mensajes guardados correctamente.`,
      },
      {
        palabras: ["condicion de carrera", "condición de carrera", "race condition"],
        responder: () =>
          "Ocurre cuando dos operaciones asíncronas compiten y el resultado depende del orden de llegada, no de la lógica del programa.",
      },
      {
        palabras: ["localstorage", "local storage"],
        responder: () =>
          "localStorage guarda pares clave-valor como texto plano. Si guardas un objeto sin JSON.stringify, se serializa mal (aparece como [object Object]).",
      },
      {
        palabras: ["json"],
        responder: () =>
          "JSON es un formato de texto para representar datos. JSON.stringify convierte un objeto a texto; JSON.parse hace el camino inverso.",
      },
      {
        palabras: ["fetch", "network", "peticion", "petición", "api"],
        responder: () =>
          "Un fetch es una petición HTTP asíncrona. En DevTools ▸ Network puedes ver su Status, tiempo de respuesta y el contenido devuelto.",
      },
      {
        palabras: ["breakpoint", "call stack", "debugger", "paso a paso"],
        responder: () =>
          "Un breakpoint detiene la ejecución en una línea exacta. El Call Stack muestra qué función llamó a cuál, en orden inverso de ejecución.",
      },
      {
        palabras: ["devtools", "herramientas de desarrollador"],
        responder: () =>
          "Las DevTools del navegador permiten inspeccionar Elements, depurar en Sources, revisar Network y administrar datos en Application.",
      },
      {
        palabras: ["hola", "buenas", "como estas", "cómo estás"],
        responder: () => "¡Hola! Soy el Asistente Frankenstein. ¿En qué puedo ayudarte?",
      },
      {
        palabras: ["que dia es hoy", "qué día es hoy", "fecha"],
        responder: () =>
          `Hoy es ${new Date().toLocaleDateString("es-CR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}.`,
      },
    ];

    this.respuestasGenericas = [
      "Entendido, cuéntame más sobre eso.",
      "Interesante, ¿puedes darme más contexto?",
      "No tengo una regla específica para eso, pero sigo aquí.",
    ];
  }

  async consultar(texto, historial = []) {
    // Simula una latencia real de red.
    await new Promise((resolve) => setTimeout(resolve, 350));

    const textoNormalizado = texto.toLowerCase();
    const regla = this.reglas.find((r) =>
      r.palabras.some((p) => textoNormalizado.includes(p))
    );

    if (regla) return regla.responder(texto, historial);

    const indice = historial.length % this.respuestasGenericas.length;
    return this.respuestasGenericas[indice];
  }
}
