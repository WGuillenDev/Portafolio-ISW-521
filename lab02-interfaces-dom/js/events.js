const EVENTOS = {

  //Estado interno
  _partidosCargados: null,
  _cargandoPartidos: false,

  //Inicializar todos los eventos
  inicializar() {
    this._eventoSedes();
    this._eventoReautenticar();
    this._eventoTema();
    this._eventoIdioma();
    this._eventoFuente();
    this._eventoAccesibilidad();
  },

  //Clic en sede
  _eventoSedes() {
    const listaSedes = document.getElementById("listaSedes");

    listaSedes.addEventListener("click", async (evento) => {
      const tarjeta = evento.target.closest(".sede-tarjeta");
      if (!tarjeta) return;
      if (this._cargandoPartidos) return;

      const sedeId = tarjeta.getAttribute("data-sede-id");
      const nombreSede = tarjeta.querySelector(".sede-tarjeta__nombre").textContent;

      UI.actualizarSedeActiva(sedeId);

      document.getElementById("partidos").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      if (this._partidosCargados === null) {
        this._cargandoPartidos = true;

        try {
          const resultado = await API.obtenerPartidos();
          this._partidosCargados = resultado.datos;

          if (resultado.desdeCache) {
            UI.mostrarBannerCache();
          } else {
            UI.ocultarBannerCache();
          }
        } catch {
          UI.mostrarErrorPartidos();
          this._cargandoPartidos = false;
          return;
        }

        this._cargandoPartidos = false;
      }

      const partidosDeSede = this._partidosCargados.filter(
        (p) => String(p.stadium_id) === String(sedeId)
      );

      UI.mostrarPartidos(partidosDeSede, nombreSede);
    });
  },

  //Reautenticar tras 401 
  _eventoReautenticar() {
    document.getElementById("btnReautenticar").addEventListener("click", async () => {
      UI.ocultarModal();

      try {
        await AUTH.iniciarSesion();
      } catch {
        UI.mostrarSesionExpirada();
      }
    });
  },

  //Tema oscuro / claro 
  _eventoTema() {
    document.getElementById("btnTema").addEventListener("click", () => {
      const actual = document.documentElement.getAttribute("data-tema");
      const nuevo = actual === "oscuro" ? "claro" : "oscuro";

      document.documentElement.setAttribute("data-tema", nuevo);
      localStorage.setItem(CONFIG.CLAVES_STORAGE.TEMA, nuevo);
    });
  },

  //Idioma ES / EN 
  _eventoIdioma() {
    document.getElementById("btnIdioma").addEventListener("click", () => {
      const actual = document.documentElement.getAttribute("data-idioma");
      const nuevo = actual === "ES" ? "EN" : "ES";

      document.documentElement.setAttribute("data-idioma", nuevo);
      localStorage.setItem(CONFIG.CLAVES_STORAGE.IDIOMA, nuevo);
      UI.aplicarIdioma();
    });
  },

  //Tamaño de fuente 
  _eventoFuente() {
    document.getElementById("fuenteMas").addEventListener("click", () => {
      this._cambiarFuente(2);
    });

    document.getElementById("fuenteMenos").addEventListener("click", () => {
      this._cambiarFuente(-2);
    });
  },

  _cambiarFuente(delta) {
    const actual = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    const nuevo = Math.min(Math.max(actual + delta, 12), 24);

    document.documentElement.style.fontSize = nuevo + "px";
    localStorage.setItem(CONFIG.CLAVES_STORAGE.FUENTE, nuevo + "px");
  },

  //Panel de accesibilidad 
  _eventoAccesibilidad() {
    const boton = document.getElementById("btnAccesibilidad");
    const panel = document.getElementById("panelAccesibilidad");

    boton.addEventListener("click", () => {
      const estaAbierto = !panel.hidden;
      panel.hidden = estaAbierto;
      boton.setAttribute("aria-expanded", String(!estaAbierto));
    });
  },
};