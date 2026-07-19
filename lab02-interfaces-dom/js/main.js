const MAIN = {

  //Se ejecuta siempre al cargar la página, ANTES del login
  iniciar() {
    UI.aplicarTema();
    UI.aplicarIdioma();
    UI.aplicarFuente();
    EVENTOS.inicializarLogin();
  },

  //Se ejecuta SOLO después de un login exitoso (ver events.js)
  async iniciarApp() {
    UI.mostrarCargando();

    try {
      const resultado = await API.obtenerSedes();

      if (resultado.desdeCache) {
        UI.mostrarBannerCache();
      } else {
        UI.ocultarBannerCache();
      }

      UI.mostrarSedes(resultado.datos.stadiums);
      EVENTOS._sedesCargadas = resultado.datos.stadiums;
    } catch (error) {
      if (error.message !== "Sesión expirada") {
        UI.mostrarErrorPartidos();
      }
    }

    EVENTOS.inicializar();
  },
};

document.addEventListener("DOMContentLoaded", () => {
  MAIN.iniciar();
});