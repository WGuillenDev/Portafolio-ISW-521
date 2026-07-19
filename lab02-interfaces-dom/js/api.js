const API = {
  async peticion(endpoint) {
    const token = AUTH.obtenerToken();

    const respuesta = await fetch(CONFIG.BASE_URL + endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (respuesta.status === 401) {
      AUTH.limpiarSesion();
      UI.mostrarSesionExpirada();
      throw new Error("Sesión expirada");
    }

    if (respuesta.status === 429) {
      throw new Error("LIMITE_ALCANZADO");
    }

    if (respuesta.status === 500) {
      throw new Error("ERROR_SERVIDOR");
    }

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    return await respuesta.json();
  },

  async obtenerSedes() {
    const clave = CONFIG.CLAVES_STORAGE.SEDES;

    try {
      const datos = await UTILS.ejecutarConBackoff(() =>
        this.peticion(CONFIG.ENDPOINTS.SEDES)
      );
      STORAGE.guardar(clave, datos);
      return { datos, desdeCache: false };
    } catch (error) {
      if (error.message === "LIMITE_ALCANZADO") {
        await UI.mostrarCountdown(8);
        return this.obtenerSedes();
      }

      const cache = STORAGE.obtener(clave);
      if (cache) {
        return { datos: cache.datos, desdeCache: true };
      }

      throw error;
    }
  },

  async obtenerPartidos() {
    const clave = CONFIG.CLAVES_STORAGE.PARTIDOS;

    try {
      const datos = await UTILS.ejecutarConBackoff(() =>
        this.peticion(CONFIG.ENDPOINTS.PARTIDOS)
      );
      STORAGE.guardar(clave, datos);
      return { datos, desdeCache: false };
    } catch (error) {
      if (error.message === "LIMITE_ALCANZADO") {
        await UI.mostrarCountdown(8);
        return this.obtenerPartidos();
      }

      const cache = STORAGE.obtener(clave);
      if (cache) {
        return { datos: cache.datos, desdeCache: true };
      }

      throw error;
    }
  },

  async obtenerEquipos() {
    const clave = CONFIG.CLAVES_STORAGE.EQUIPOS;

    try {
      const datos = await UTILS.ejecutarConBackoff(() =>
        this.peticion(CONFIG.ENDPOINTS.EQUIPOS)
      );
      STORAGE.guardar(clave, datos);
      return { datos, desdeCache: false };
    } catch (error) {
      if (error.message === "LIMITE_ALCANZADO") {
        await UI.mostrarCountdown(8);
        return this.obtenerEquipos();
      }

      const cache = STORAGE.obtener(clave);
      if (cache) {
        return { datos: cache.datos, desdeCache: true };
      }

      throw error;
    }
  },
};