const MAIN = {

  //Se ejecuta siempre al cargar la página, ANTES del login
  iniciar() {
    UI.aplicarTema();
    UI.aplicarIdioma();
    UI.aplicarFuente();
    EVENTOS.inicializarLogin();
  },

  //Se ejecuta SOLO después de un login exitoso 
  async iniciarApp() {
    UI.mostrarCargando();
    let hayDatosDeCache = false;

    try {
      const resultadoSedes = await API.obtenerSedes();
      if (resultadoSedes.desdeCache) hayDatosDeCache = true;

      UI.mostrarSedes(resultadoSedes.datos.stadiums);
      EVENTOS._sedesCargadas = resultadoSedes.datos.stadiums;
    } catch (error) {
      if (error.message !== "Sesión expirada") {
        UI.mostrarErrorPartidos();
      }
    }

    try {
      const resultadoEquipos = await API.obtenerEquipos();
      if (resultadoEquipos.desdeCache) hayDatosDeCache = true;

      EVENTOS._equiposCargados = resultadoEquipos.datos.teams;
    } catch {
      EVENTOS._equiposCargados = [];
    }

    if (hayDatosDeCache) {
      UI.mostrarBannerCache();
    } else {
      UI.ocultarBannerCache();
    }

    EVENTOS.inicializar();
  },

  //Carga de partidos compartida entre Tour de Sedes y Agenda Simultánea
  async asegurarPartidosCargados() {
    if (EVENTOS._partidosCargados !== null) return true;

    try {
      const resultado = await API.obtenerPartidos();
      EVENTOS._partidosCargados = resultado.datos.games;

      if (resultado.desdeCache) {
        UI.mostrarBannerCache();
      } else {
        UI.ocultarBannerCache();
      }

      return true;
    } catch {
      return false;
    }
  },

  //Cambia entre vistas del sidebar (Tour de Sedes / Agenda Simultánea / etc.)
  async cambiarVista(vista) {
    UI.mostrarVista(vista);

    if (vista === "agenda-simultanea" && !EVENTOS._agendaInicializada) {
      EVENTOS._agendaInicializada = true;

      const exito = await this.asegurarPartidosCargados();

      if (exito) {
        UI.iniciarVistaAgenda(EVENTOS._partidosCargados, EVENTOS._equiposCargados, EVENTOS._sedesCargadas);
      } else {
        UI.mostrarErrorAgenda();
      }
    }

    if (vista === "timeline-infinito" && !EVENTOS._timelineInicializada) {
      EVENTOS._timelineInicializada = true;

      const exito = await this.asegurarPartidosCargados();

      if (exito) {
        UI.iniciarVistaTimeline(EVENTOS._partidosCargados, EVENTOS._equiposCargados, EVENTOS._sedesCargadas);
      } else {
        UI.mostrarErrorTimeline();
      }
    }

    if (vista === "dashboard-fanatico" && !EVENTOS._dashboardInicializado) {
      EVENTOS._dashboardInicializado = true;

      const exitoPartidos = await this.asegurarPartidosCargados();
      const exitoGrupos = await this.asegurarGruposCargados();

      if (exitoPartidos && exitoGrupos) {
        UI.iniciarVistaDashboard();
      } else {
        UI.mostrarErrorDashboard();
      }
    }

     if (vista === "matriz-enfrentamientos" && !EVENTOS._matrizInicializada) {
      EVENTOS._matrizInicializada = true;

      const exitoGrupos = await this.asegurarGruposCargados();
      const exitoPartidos = await this.asegurarPartidosCargados();

      UI.iniciarVistaMatriz(exitoPartidos);

      if (!exitoGrupos) {
        UI.mostrarErrorDashboard();
      }
    }
  },

  //Carga de grupos — igual que el patrón asegurarPartidosCargados()
  async asegurarGruposCargados() {
    if (EVENTOS._gruposCargados !== null) return true;

    try {
      const resultado = await API.obtenerGrupos();
      EVENTOS._gruposCargados = resultado.datos.groups;

      if (resultado.desdeCache) {
        UI.mostrarBannerCache();
      } else {
        UI.ocultarBannerCache();
      }

      return true;
    } catch {
      return false;
    }
  },
};

document.addEventListener("DOMContentLoaded", () => {
  MAIN.iniciar();
});