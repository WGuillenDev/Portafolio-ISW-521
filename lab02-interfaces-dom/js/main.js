const MAIN = {

  async iniciar() {
    UI.aplicarTema();
    UI.aplicarIdioma();
    UI.aplicarFuente();
    UI.mostrarCargando();

    try {
      await AUTH.iniciarSesion();

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