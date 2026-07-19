# Asistente Frankenstein — Arquitectura Hexagonal

## Cómo correrlo

Los módulos ES6 (`import`/`export`) **no funcionan abriendo el `index.html` directamente con doble clic** (protocolo `file://`, bloqueado por CORS en la mayoría de navegadores). Necesitas un servidor local simple:

**Opción A — VS Code (recomendado, ya tienes la extensión abierta):**
1. Clic derecho sobre `index.html` → **"Open with Live Server"**.

**Opción B — Python (ya viene instalado en la mayoría de sistemas):**
```bash
cd Proyecto_Asistente_Frankenstein
python -m http.server 5500
```
Luego abre `http://localhost:5500` en el navegador.

**Opción C — Node:**
```bash
npx serve .
```

## Estructura

```
index.html
src/
├── core/                     Dominio: no importa nada de adapters/ ni infraestructure/
│   ├── entities/Message.js
│   ├── ports/ChatRepositoryPort.js
│   ├── ports/ModelClientPort.js
│   └── useCases/ChatManager.js
├── adapters/
│   ├── driven/                Implementaciones salientes (implementan los ports)
│   │   ├── LocalStorageChatRepository.js
│   │   └── FetchModelClient.js
│   └── driving/                Implementación entrante (UI)
│       └── UIAdapter.js
├── infraestructure/
│   ├── config.js
│   └── DIContainer.js          Único lugar que decide qué implementación concreta se inyecta
├── css/styles.css
└── main.js                     Composition root
```

## Correcciones aplicadas respecto al código original

1. **Serialización correcta en `localStorage`**: se usa `JSON.stringify`/`JSON.parse` en `LocalStorageChatRepository.js`, en vez de guardar el array directo (causaba `[object Object]`). Si detecta datos corruptos, se auto-limpia en vez de romper la app.
2. **Race condition eliminada**: `ChatManager.enviarMensaje()` usa `await` real sobre la respuesta del modelo, en vez del `setTimeout` fijo + variable compartida (`respuestaPendiente`) del código original.
3. **Endpoint corregido**: `/posts` en vez del typo original `/postss` (que devolvía 404).
4. **Bloqueo de UI eliminado**: se quitó la función `precalentar()` que congelaba el hilo principal con un bucle `while` bloqueante.
5. **Manejo de errores real**: el `catch` vacío original se reemplazó por errores propagados y mostrados al usuario en el estado de la UI.
6. **Respuestas coherentes en español**: `ModelClientPort.consultar(texto, historial)` ahora recibe el texto real del usuario (antes solo un índice). El adapter activo, `KnowledgeBaseModelClient`, reconoce palabras clave del dominio de la práctica (localStorage, condición de carrera, JSON, fetch, breakpoint, Call Stack, DevTools) y responde con contenido correcto y relacionado. `FetchModelClient` y `MockModelClient` se conservan como implementaciones alternativas del mismo puerto.

## Sobre el motor de respuestas (importante)

`KnowledgeBaseModelClient` es un motor de reglas por palabras clave, no un modelo de lenguaje real. Es la solución honesta para un proyecto 100% cliente (sin backend) que corre en tu navegador vía Live Server: conectar un LLM real (OpenAI, Anthropic, etc.) requeriría una API key, y exponerla en código que corre en el navegador no es seguro ni apropiado para este entregable. El motor sí lee el mensaje del usuario y responde según el tema detectado — cumple el objetivo de "razonar sobre la pregunta" dentro de las reglas del ejercicio (sin backend, sin credenciales externas).

## Regla de dependencia (verifícala tú mismo)

- Ningún archivo dentro de `core/` importa nada de `adapters/` ni de `infraestructure/`.
- `adapters/driven/*` importan de `core/ports/` (para implementar la interfaz) y de `core/entities/` (para reconstruir mensajes) — nunca de `core/useCases/`.
- `main.js` y `DIContainer.js` son los únicos que conocen todas las capas.
