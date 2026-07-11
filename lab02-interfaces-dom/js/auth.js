const AUTH = {
  generarToken(nombreUsuario) {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(
      JSON.stringify({
        usuario: nombreUsuario,
        expiracion: Date.now() + 1000 * 60 * 60,
      })
    );
    const firma = btoa("wc26-firma-utn");
    return `${header}.${payload}.${firma}`;
  },

  async iniciarSesion() {
    const { username, password } = CONFIG.CREDENCIALES;

    if (!username || !password) {
      throw new Error("Credenciales no configuradas");
    }

    const token = this.generarToken(username);
    localStorage.setItem(CONFIG.CLAVES_STORAGE.TOKEN, token);
    return token;
  },

  obtenerToken() {
    return localStorage.getItem(CONFIG.CLAVES_STORAGE.TOKEN);
  },

  tokenEsValido() {
    const token = this.obtenerToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.expiracion > Date.now();
    } catch {
      return false;
    }
  },

  limpiarSesion() {
    localStorage.removeItem(CONFIG.CLAVES_STORAGE.TOKEN);
  },
};