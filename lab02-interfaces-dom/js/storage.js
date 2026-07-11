const STORAGE = {
  guardar(clave, datos) {
    const registro = {
      datos: datos,
      timestamp: Date.now(),
    };
    localStorage.setItem(clave, JSON.stringify(registro));
  },

  obtener(clave) {
    const registro = localStorage.getItem(clave);
    if (!registro) return null;

    try {
      return JSON.parse(registro);
    } catch {
      return null;
    }
  },

  tieneDatos(clave) {
    return localStorage.getItem(clave) !== null;
  },

  limpiar(clave) {
    localStorage.removeItem(clave);
  },
};