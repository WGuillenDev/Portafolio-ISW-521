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

  async iniciarSesion(usuario, contrasena) {
    const credencialesValidas =
      usuario === CONFIG.CREDENCIALES.username &&
      contrasena === CONFIG.CREDENCIALES.password;

    if (!credencialesValidas) {
      throw new Error("CREDENCIALES_INVALIDAS");
    }

    const token = this.generarToken(usuario);
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