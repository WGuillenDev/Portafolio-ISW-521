const EVENTOS = {

  //Estado interno
  _partidosCargados: null,
  _cargandoPartidos: false,
  _sedesCargadas: [],
  _equiposCargados: [],
  _autenticando: false,
  _agendaInicializada: false,
  _fechasSimultaneas: [],
  _indiceFechaActual: 0,
  _timelineInicializada: false,
  _timelinePartidosOrdenados: [],
  _timelineIndiceBloque: 0,
  _timelineObserver: null,

  //Eventos que deben existir ANTES del login (formulario de acceso)
  inicializarLogin() {
    this._eventoLogin();
    this._eventoToggleClave();
    this._eventoReautenticar();
  },

  //Eventos que solo tienen sentido DESPUÉS de un login exitoso
  inicializar() {
    this._eventoSidebar();
    this._eventoSedes();
    this._eventoNavegacionFecha();
    this._eventoReintentarTimeline();
    this._eventoTema();
    this._eventoIdioma();
    this._eventoFuente();
    this._eventoAccesibilidad();
  },

 //Envío del formulario de login
  _eventoLogin() {
    const formulario = document.getElementById("formularioLogin");

    formulario.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      if (this._autenticando) return;

      const usuario = document.getElementById("loginUsuario").value.trim();
      const contrasena = document.getElementById("loginContrasena").value;
      const error = document.getElementById("loginError");
      const boton = document.getElementById("btnLogin");
      const botonTexto = document.getElementById("btnLoginTexto");

      error.hidden = true;
      error.textContent = "";
      this._autenticando = true;
      boton.disabled = true;
      botonTexto.textContent = "Verificando...";

      try {
        await AUTH.iniciarSesion(usuario, contrasena);
        UI.ocultarLogin();
        UI.mostrarApp();
        await MAIN.iniciarApp();
      } catch {
        error.textContent = "Usuario o contraseña incorrectos.";
        error.hidden = false;
        document.getElementById("loginContrasena").focus();
      } finally {
        this._autenticando = false;
        boton.disabled = false;
        botonTexto.textContent = "Iniciar sesión";
      }
    });
  },

  //Mostrar/ocultar contraseña en el login
  _eventoToggleClave() {
    const boton = document.getElementById("btnMostrarClave");
    const input = document.getElementById("loginContrasena");
    const icono = boton.querySelector("i");

    boton.addEventListener("click", () => {
      const mostrando = input.type === "text";
      input.type = mostrando ? "password" : "text";
      boton.setAttribute("aria-pressed", String(!mostrando));
      icono.classList.toggle("bi-eye", mostrando);
      icono.classList.toggle("bi-eye-slash", !mostrando);
    });
  },

  //Reautenticar tras 401 — vuelve a mostrar el login de pantalla completa
  _eventoReautenticar() {
    document.getElementById("btnReautenticar").addEventListener("click", () => {
      UI.ocultarModal();
      UI.ocultarApp();
      UI.mostrarLogin();
      document.getElementById("loginContrasena").value = "";
      document.getElementById("loginUsuario").focus();
    });
  },

//Clic en sede
  _eventoSedes() {
    const listaSedes = document.getElementById("sedes");

    listaSedes.addEventListener("click", async (evento) => {
      const tarjeta = evento.target.closest(".sede-card");
      if (!tarjeta) return;
      if (this._cargandoPartidos) return;

      const sedeId = tarjeta.getAttribute("data-sede-id");
      const nombreSede = tarjeta.querySelector(".sede-card__nombre").textContent;

      const sedeData = this._sedesCargadas.find((s) => String(s.id) === sedeId);
      if (sedeData) UI.mostrarHeroSede(sedeData);

      UI.actualizarSedeActiva(sedeId);

      document.getElementById("partidos").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      this._cargandoPartidos = true;
      const exito = await MAIN.asegurarPartidosCargados();
      this._cargandoPartidos = false;

      if (!exito) {
        UI.mostrarErrorPartidos();
        return;
      }

      const partidosDeSede = this._partidosCargados.filter(
        (p) => String(p.stadium_id) === String(sedeId)
      );

      UI.mostrarPartidos(partidosDeSede, nombreSede, this._equiposCargados);
    });
  },

  //Clic en los ítems del sidebar — cambia de vista
  _eventoSidebar() {
    const nav = document.querySelector(".sidebar__nav");

    nav.addEventListener("click", async (evento) => {
      const boton = evento.target.closest(".sidebar__link[data-vista]");
      if (!boton || boton.disabled) return;

      const vista = boton.getAttribute("data-vista");
      UI.actualizarLinkActivo(vista);
      await MAIN.cambiarVista(vista);
    });
  },

  //Navegación de fecha en Agenda Simultánea — flechas y pestañas
  _eventoNavegacionFecha() {
    document.getElementById("fechaAnterior").addEventListener("click", () => {
      this._cambiarFechaAgenda(this._indiceFechaActual - 1);
    });

    document.getElementById("fechaSiguiente").addEventListener("click", () => {
      this._cambiarFechaAgenda(this._indiceFechaActual + 1);
    });

    document.getElementById("pestanasFecha").addEventListener("click", (evento) => {
      const pestana = evento.target.closest(".pestana-fecha");
      if (!pestana) return;

      const indice = Number(pestana.getAttribute("data-indice"));
      this._cambiarFechaAgenda(indice);
    });
  },

  _cambiarFechaAgenda(nuevoIndice) {
    if (nuevoIndice < 0 || nuevoIndice >= this._fechasSimultaneas.length) return;

    this._indiceFechaActual = nuevoIndice;
    const fecha = this._fechasSimultaneas[nuevoIndice];

    UI.mostrarFechaAgenda(
      fecha,
      nuevoIndice,
      this._fechasSimultaneas,
      this._partidosCargados,
      this._equiposCargados,
      this._sedesCargadas
    );
  },

  //Reto de resiliencia: botón de reintento manual de Timeline Infinito
  _eventoReintentarTimeline() {
    document.getElementById("btnReintentarTimeline").addEventListener("click", async () => {
      this._timelineInicializada = false;
      await MAIN.cambiarVista("timeline-infinito");
    });
  },

  //Configura el IntersectionObserver sobre el centinela — se llama una sola vez
  configurarObserverTimeline() {
    if (this._timelineObserver) return;

    const centinela = document.getElementById("timelineCentinela");

    this._timelineObserver = new IntersectionObserver((entradas) => {
      const [entrada] = entradas;
      if (entrada.isIntersecting) {
        this._cargarSiguienteBloqueTimeline();
      }
    }, {
      root: null,
      rootMargin: "200px",
      threshold: 0,
    });

    this._timelineObserver.observe(centinela);
  },

  _cargarSiguienteBloqueTimeline() {
    const hayMas = UTILS.hayMasBloques(this._timelinePartidosOrdenados, this._timelineIndiceBloque);
    if (!hayMas) return;

    document.getElementById("timelineCargando").hidden = false;

    const bloque = UTILS.obtenerBloque(this._timelinePartidosOrdenados, this._timelineIndiceBloque);
    UI.agregarBloqueTimeline(bloque, this._equiposCargados, this._sedesCargadas);

    this._timelineIndiceBloque++;
    document.getElementById("timelineCargando").hidden = true;

    const quedaMas = UTILS.hayMasBloques(this._timelinePartidosOrdenados, this._timelineIndiceBloque);
    if (!quedaMas && this._timelineObserver) {
      this._timelineObserver.disconnect();
      this._timelineObserver = null;
    }
  },

  //Tema oscuro / claro
  _eventoTema() {
    document.getElementById("btnTema").addEventListener("click", () => {
      const actual = document.documentElement.getAttribute("data-tema");
      const nuevo = actual === "oscuro" ? "claro" : "oscuro";

      document.documentElement.setAttribute("data-tema", nuevo);
      localStorage.setItem(CONFIG.CLAVES_STORAGE.TEMA, nuevo);
      UI.actualizarTextoTema(nuevo);
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
