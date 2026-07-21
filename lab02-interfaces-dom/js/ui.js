const UI = {

  //Preferencias guardadas 
  aplicarTema() {
    const tema = localStorage.getItem(CONFIG.CLAVES_STORAGE.TEMA) || "claro";
    document.documentElement.setAttribute("data-tema", tema);
    this.actualizarTextoTema(tema);
  },

  actualizarTextoTema(tema) {
    const idioma = document.documentElement.getAttribute("data-idioma") || "ES";
    const textos = CONFIG.IDIOMAS[idioma];
    const span = document.getElementById("btnTemaTexto");
    if (!span) return;
    span.textContent = tema === "oscuro" ? textos.modoClaro : textos.modoOscuro;
  },

  aplicarIdioma() {
    const idioma = localStorage.getItem(CONFIG.CLAVES_STORAGE.IDIOMA) || "ES";
    document.documentElement.setAttribute("data-idioma", idioma);

    const textos = CONFIG.IDIOMAS[idioma];
    document.querySelectorAll("[data-i18n]").forEach((elemento) => {
      const clave = elemento.getAttribute("data-i18n");
      if (textos[clave]) elemento.textContent = textos[clave];
    });
  },

  aplicarFuente() {
    const fuente = localStorage.getItem(CONFIG.CLAVES_STORAGE.FUENTE);
    if (fuente) document.documentElement.style.fontSize = fuente;
  },
  
  //Control de pantallas — login vs. aplicación
  mostrarLogin() {
    const login = document.getElementById("pantallaLogin");
    login.hidden = false;
    document.getElementById("loginUsuario").focus();
  },

  ocultarLogin() {
    document.getElementById("pantallaLogin").hidden = true;
  },

  mostrarApp() {
    document.getElementById("appRaiz").hidden = false;
    this.actualizarNombreUsuario();
  },

  actualizarNombreUsuario() {
    const elemento = document.getElementById("perfilUsuarioNombre");
    if (!elemento) return;
    elemento.textContent = AUTH.obtenerUsuarioActual() || "—";
  },

  ocultarApp() {
    document.getElementById("appRaiz").hidden = true;
  },

  //Modal sesión expirada (401) 
 mostrarSesionExpirada() {
    const modal = document.getElementById("modalSesion");
    modal.classList.add("visible");
    modal.setAttribute("aria-hidden", "false");
    document.getElementById("btnReautenticar").focus();
  },

  ocultarModal() {
    const modal = document.getElementById("modalSesion");
    modal.classList.remove("visible");
    modal.setAttribute("aria-hidden", "true");
  },

  //Skeleton loading 
 mostrarCargando() {
  const contenedores = [
    document.getElementById("sedesMexico"),
    document.getElementById("sedesUSA"),
    document.getElementById("sedesCanada"),
  ];

  for (const contenedor of contenedores) {
    contenedor.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      const esqueleto = document.createElement("div");
      esqueleto.className = "skeleton skeleton--sede";
      esqueleto.setAttribute("aria-hidden", "true");
      contenedor.appendChild(esqueleto);
    }
  }
},

  //Render de sedes
  mostrarSedes(sedes) {
    const grupos = {
      Mexico: sedes.filter((s) => s.country_en === "Mexico"),
      USA: sedes.filter(
        (s) => s.country_en !== "Mexico" && s.country_en !== "Canada"
      ),
      Canada: sedes.filter((s) => s.country_en === "Canada"),
    };

    const contenedores = {
      Mexico: document.getElementById("sedesMexico"),
      USA: document.getElementById("sedesUSA"),
      Canada: document.getElementById("sedesCanada"),
    };

    for (const pais of Object.keys(grupos)) {
      const lista = contenedores[pais];
      lista.innerHTML = "";

      for (const sede of grupos[pais]) {
        const tarjeta = document.createElement("button");
        const claveColor = UTILS.obtenerClaveColorSede(sede.id);
        const rutaImagen = UTILS.obtenerImagenSede(sede.id);

        tarjeta.className = `sede-card ${claveColor}`;
        tarjeta.setAttribute("role", "listitem");
        tarjeta.setAttribute("data-sede-id", sede.id);
        tarjeta.setAttribute(
          "aria-label",
          `Ver partidos de ${sede.name_en}, ${sede.city_en}`
        );

        tarjeta.innerHTML = `
          <div class="sede-card__imagen-wrap">
            ${rutaImagen ? `<img class="sede-card__imagen" src="${rutaImagen}" alt="" loading="lazy">` : ""}
          </div>
          <div class="sede-card__cuerpo">
            <span class="sede-card__nombre">${sede.name_en}</span>
            <span class="sede-card__ciudad">
              <i class="bi bi-geo-alt-fill" aria-hidden="true"></i>
              ${sede.city_en}
            </span>
            <span class="sede-card__capacidad">
              <i class="bi bi-people-fill" aria-hidden="true"></i>
              ${sede.capacity ? sede.capacity.toLocaleString("es-CR") : "—"}
            </span>
          </div>
        `;

        const img = tarjeta.querySelector(".sede-card__imagen");
        if (img) {
          img.addEventListener("error", () => { img.remove(); }, { once: true });
        }
        lista.appendChild(tarjeta);
      }
    }
  },
  //Hero de sede seleccionada
  mostrarHeroSede(sede) {
    document.getElementById("sedeActiva").hidden = true;

    const hero = document.getElementById("sedeHero");
    const rutaImagen = UTILS.obtenerImagenSede(sede.id);

    document.getElementById("sedeHeroNombre").textContent = sede.name_en;
    document.getElementById("sedeHeroCiudad").textContent = sede.city_en;
    document.getElementById("sedeHeroCapacidad").textContent =
      sede.capacity ? `${sede.capacity.toLocaleString("es-CR")} espectadores` : "";

    const imagen = document.getElementById("sedeHeroImagen");
    imagen.hidden = true;
    imagen.removeAttribute("src");

    if (rutaImagen) {
      const imagenNueva = new Image();
      imagenNueva.onload = () => {
        imagen.src = imagenNueva.src;
        imagen.alt = `Vista del ${sede.name_en}`;
        imagen.hidden = false;
      };
      imagenNueva.onerror = () => {
        imagen.hidden = true;
      };
      imagenNueva.src = rutaImagen;
    }

    hero.hidden = false;
  },

  //Render de partidos
  mostrarPartidos(partidos, nombreSede, equipos = []) {
    const idioma = document.documentElement.getAttribute("data-idioma") || "ES";
    const textos = CONFIG.IDIOMAS[idioma];

    document.getElementById("sedeActiva").innerHTML = `
      <i class="bi bi-geo-alt-fill" aria-hidden="true"></i>
      <span>${nombreSede}</span>
    `;

    const lista = document.getElementById("listaPartidos");
    lista.innerHTML = "";

    if (partidos.length === 0) {
      lista.innerHTML = `
        <div class="mensaje-estado">
          <i class="bi bi-calendar-x mensaje-estado__icono" aria-hidden="true"></i>
          <span class="mensaje-estado__texto">${textos.sinPartidos}</span>
        </div>
      `;
      return;
    }

    for (const partido of partidos) {
      const tarjeta = document.createElement("article");
      tarjeta.className = "partido-card";
      tarjeta.setAttribute("role", "listitem");

      tarjeta.innerHTML = `
       <div class="partido-card__fecha">
          <i class="bi bi-calendar-event" aria-hidden="true"></i>
          ${partido.local_date}
        </div>
        <div class="partido-card__equipos">
          <span class="partido-card__equipo">
            ${UTILS.obtenerBanderaHTML(partido.home_team_name_en, equipos)}
            <span class="partido-card__equipo-nombre">${partido.home_team_name_en || "—"}</span>
          </span>
          <span class="partido-card__vs" aria-label="versus">VS</span>
          <span class="partido-card__equipo">
            ${UTILS.obtenerBanderaHTML(partido.away_team_name_en, equipos)}
            <span class="partido-card__equipo-nombre">${partido.away_team_name_en || "—"}</span>
          </span>
        </div>
        <div class="partido-card__footer">
          ${
            partido.finished === "TRUE"
              ? `<span class="partido-card__marcador">${partido.home_score} — ${partido.away_score}</span>`
              : `<span class="badge-partido badge-partido--pendiente">
                   <i class="bi bi-clock" aria-hidden="true"></i> Pendiente
                 </span>`
          }
        </div>
      `;

      tarjeta.querySelectorAll(".bandera-equipo").forEach((img) => {
        img.addEventListener("error", () => {
          img.outerHTML = UTILS.obtenerBanderaEquipo();
        }, { once: true });
      });

      lista.appendChild(tarjeta);
    }
  },

  //Reto de resiliencia: fallo de /get/games 
  mostrarErrorPartidos() {
    const idioma = document.documentElement.getAttribute("data-idioma") || "ES";
    const textos = CONFIG.IDIOMAS[idioma];

    const lista = document.getElementById("listaPartidos");
    lista.innerHTML = `
      <p class="panel-partidos__error">
        <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
        ${textos.sinPartidos}
      </p>
    `;
  },

  //Countdown 429 
  async mostrarCountdown(segundos) {
    const banner = document.getElementById("bannerCountdown");
    const contador = document.getElementById("contadorSegundos");

    banner.hidden = false;

    await UTILS.ejecutarConCountdown(segundos, (restante) => {
      contador.textContent = restante;
    });

    banner.hidden = true;
  },

  //Banner datos caché 
  mostrarBannerCache() {
    document.getElementById("bannerCache").hidden = false;
  },

  ocultarBannerCache() {
    document.getElementById("bannerCache").hidden = true;
  },

//Estado sede activa
  actualizarSedeActiva(sedeId) {
    document.querySelectorAll(".sede-card").forEach((tarjeta) => {
      const esActiva = tarjeta.getAttribute("data-sede-id") === String(sedeId);
      tarjeta.classList.toggle("activa", esActiva);
      tarjeta.setAttribute("aria-pressed", String(esActiva));
    });
  },

  //Control de vistas del sidebar
  mostrarVista(vista) {
    document.querySelectorAll(".vista").forEach((el) => {
      el.hidden = true;
    });

    const mapaIds = {
      "tour-sedes": "vistaTourSedes",
      "agenda-simultanea": "vistaAgendaSimultanea",
      "timeline-infinito": "vistaTimelineInfinito",
      "dashboard-fanatico": "vistaDashboardFanatico",
      "matriz-enfrentamientos": "vistaMatrizEnfrentamientos",
    };
    const mapaTitulos = {
      "tour-sedes": "Tour Virtual de Sedes",
      "agenda-simultanea": "Agenda Simultánea",
      "timeline-infinito": "Timeline Infinito",
      "dashboard-fanatico": "Dashboard del Fanático",
      "matriz-enfrentamientos": "Matriz de Enfrentamientos",
    };

    const idVista = mapaIds[vista];
    if (idVista) document.getElementById(idVista).hidden = false;
    document.getElementById("topbarTitulo").textContent = mapaTitulos[vista] || "";
  },

  actualizarLinkActivo(vista) {
    document.querySelectorAll(".sidebar__link[data-vista]").forEach((boton) => {
      const esActivo = boton.getAttribute("data-vista") === vista;
      boton.classList.toggle("sidebar__link--activo", esActivo);
      if (esActivo) {
        boton.setAttribute("aria-current", "page");
      } else {
        boton.removeAttribute("aria-current");
      }
    });
  },

  //Primera vez que se visita Agenda Simultánea
  iniciarVistaAgenda(partidos, equipos, sedes) {
    const fechas = UTILS.obtenerFechasSimultaneas(partidos);
    EVENTOS._fechasSimultaneas = fechas;
    EVENTOS._indiceFechaActual = 0;

    if (fechas.length === 0) {
      this._mostrarAgendaVacia();
      return;
    }

    this.mostrarFechaAgenda(fechas[0], 0, fechas, partidos, equipos, sedes);
  },

  _mostrarAgendaVacia() {
    document.getElementById("fechaDiaSemana").textContent = "—";
    document.getElementById("fechaCompleta").textContent = "Sin fechas simultáneas";
    document.getElementById("fechaCantidad").textContent = "";
    document.getElementById("pestanasFecha").innerHTML = "";
    document.getElementById("agendaGrid").innerHTML = `
      <div class="mensaje-estado">
        <i class="bi bi-calendar-x mensaje-estado__icono" aria-hidden="true"></i>
        <span class="mensaje-estado__texto">No hay fechas con 2 o más partidos simultáneos.</span>
      </div>
    `;
  },

  //Reto de resiliencia: /get/games falla y no hay caché disponible
  mostrarErrorAgenda() {
    document.getElementById("fechaDiaSemana").textContent = "—";
    document.getElementById("fechaCompleta").textContent = "No se pudieron cargar los partidos";
    document.getElementById("fechaCantidad").textContent = "";
    document.getElementById("pestanasFecha").innerHTML = "";

    const grid = document.getElementById("agendaGrid");
    grid.innerHTML = "";

    for (let i = 0; i < 2; i++) {
      const esqueleto = document.createElement("div");
      esqueleto.className = "skeleton skeleton--partido";
      esqueleto.setAttribute("aria-hidden", "true");
      grid.appendChild(esqueleto);
    }

    const reintentar = document.createElement("button");
    reintentar.className = "mensaje-estado__btn agenda-grid__reintentar";
    reintentar.textContent = "Reintentar";
    reintentar.addEventListener("click", async () => {
      EVENTOS._agendaInicializada = false;
      await MAIN.cambiarVista("agenda-simultanea");
    }, { once: true });

    grid.appendChild(reintentar);
  },

  //Cambiar de fecha (flechas o pestañas) — sin peticiones nuevas de red
  mostrarFechaAgenda(fecha, indice, fechasSimultaneas, partidosCargados, equiposCargados, sedesCargadas) {
    const grupos = UTILS.agruparPartidosPorFecha(partidosCargados);

    this._renderSelectorFecha(fecha, indice, fechasSimultaneas, grupos);
    this._renderPestanasFecha(fechasSimultaneas, indice, grupos);
    this._renderColumnasAgenda(grupos[fecha] || [], equiposCargados, sedesCargadas);
  },

  _renderSelectorFecha(fecha, indice, fechasSimultaneas, grupos) {
    document.getElementById("fechaDiaSemana").textContent = UTILS.obtenerDiaSemanaCorto(fecha);
    document.getElementById("fechaCompleta").textContent = UTILS.formatearFechaCompleta(fecha);

    const cantidad = grupos[fecha] ? grupos[fecha].length : 0;
    document.getElementById("fechaCantidad").innerHTML = `
      <i class="bi bi-arrow-left-right" aria-hidden="true"></i>
      ${cantidad} partidos simultáneos
    `;

    document.getElementById("fechaAnterior").disabled = indice === 0;
    document.getElementById("fechaSiguiente").disabled = indice === fechasSimultaneas.length - 1;
  },

  _renderPestanasFecha(fechas, indiceActivo, grupos) {
    const contenedor = document.getElementById("pestanasFecha");
    contenedor.innerHTML = "";

    fechas.forEach((fecha, indice) => {
      const boton = document.createElement("button");
      const activa = indice === indiceActivo;

      boton.className = `pestana-fecha${activa ? " pestana-fecha--activa" : ""}`;
      boton.setAttribute("role", "listitem");
      boton.setAttribute("data-indice", String(indice));
      boton.setAttribute("aria-current", activa ? "true" : "false");

      const cantidad = grupos[fecha] ? grupos[fecha].length : 0;

      boton.innerHTML = `
        ${UTILS.formatearFechaCorta(fecha)}
        <span class="pestana-fecha__contador">${cantidad}</span>
      `;

      contenedor.appendChild(boton);
    });
  },

  _renderColumnasAgenda(partidosDelDia, equipos, sedes) {
    const grid = document.getElementById("agendaGrid");
    grid.innerHTML = "";

    if (partidosDelDia.length === 0) {
      grid.innerHTML = `
        <div class="mensaje-estado">
          <i class="bi bi-calendar-x mensaje-estado__icono" aria-hidden="true"></i>
          <span class="mensaje-estado__texto">No hay partidos simultáneos para esta fecha.</span>
        </div>
      `;
      return;
    }

    for (const partido of partidosDelDia) {
      const columna = document.createElement("article");
      columna.className = "agenda-columna";
      columna.setAttribute("role", "listitem");

      const nombreSede = UTILS.obtenerNombreSede(partido.stadium_id, sedes);

      columna.innerHTML = `
        <div class="agenda-columna__hora">
          <i class="bi bi-clock" aria-hidden="true"></i>
          ${partido.local_date}
        </div>
        <div class="agenda-columna__cuerpo">
          <div class="agenda-columna__equipos">
            <div class="agenda-columna__equipo">
              ${UTILS.obtenerBanderaHTML(partido.home_team_name_en, equipos)}
              <span class="partido-card__equipo-nombre">${partido.home_team_name_en || "—"}</span>
            </div>
            <span class="partido-card__vs" aria-label="versus">VS</span>
            <div class="agenda-columna__equipo">
              ${UTILS.obtenerBanderaHTML(partido.away_team_name_en, equipos)}
              <span class="partido-card__equipo-nombre">${partido.away_team_name_en || "—"}</span>
            </div>
          </div>
          <div class="agenda-columna__resultado">
            ${
              partido.finished === "TRUE"
                ? `<span class="partido-card__marcador">${partido.home_score} — ${partido.away_score}</span>`
                : `<span class="badge-partido badge-partido--pendiente">
                     <i class="bi bi-clock" aria-hidden="true"></i> Pendiente
                   </span>`
            }
          </div>
        </div>
        <div class="agenda-columna__footer">
          <span class="agenda-columna__footer-item">
            <i class="bi bi-building" aria-hidden="true"></i> ${nombreSede}
          </span>
        </div>
      `;

      columna.querySelectorAll(".bandera-equipo").forEach((img) => {
        img.addEventListener("error", () => {
          img.outerHTML = UTILS.obtenerBanderaEquipo();
        }, { once: true });
      });

      grid.appendChild(columna);
    }
  },

  //Primera vez que se visita Timeline Infinito
  iniciarVistaTimeline(partidos) {
    const ordenados = UTILS.ordenarPartidosCronologicamente(partidos);
    EVENTOS._timelinePartidosOrdenados = ordenados;
    EVENTOS._timelineIndiceBloque = 0;

    document.getElementById("timelineLista").innerHTML = "";
    document.getElementById("timelineError").hidden = true;
    this._actualizarContadorTimeline(0, ordenados.length);

    EVENTOS._cargarSiguienteBloqueTimeline();
    EVENTOS.configurarObserverTimeline();
  },

  //Reto de resiliencia: /get/games falla y no hay caché disponible
  mostrarErrorTimeline() {
    document.getElementById("timelineLista").innerHTML = "";
    document.getElementById("timelineCargando").hidden = true;
    document.getElementById("timelineError").hidden = false;
    this._actualizarContadorTimeline(0, 0);
  },

  //Inserta un bloque de 10 partidos, agrupando por fecha sin duplicar encabezados
  agregarBloqueTimeline(bloque, equipos, sedes) {
    const lista = document.getElementById("timelineLista");

    for (const partido of bloque) {
      const fecha = UTILS.obtenerFechaSolo(partido.local_date);
      const ultimoGrupo = lista.lastElementChild;
      let contenedorPartidos;

      if (ultimoGrupo && ultimoGrupo.getAttribute("data-fecha") === fecha) {
        contenedorPartidos = ultimoGrupo.querySelector(".timeline-fecha-partidos");
      } else {
        const nuevoGrupo = document.createElement("div");
        nuevoGrupo.className = "timeline-fecha-grupo";
        nuevoGrupo.setAttribute("data-fecha", fecha);
        nuevoGrupo.innerHTML = `
          <div class="timeline-fecha-punto" aria-hidden="true"></div>
          <h3 class="timeline-fecha-titulo">${UTILS.formatearFechaCompleta(fecha)}</h3>
          <div class="timeline-fecha-partidos" role="list"></div>
        `;
        lista.appendChild(nuevoGrupo);
        contenedorPartidos = nuevoGrupo.querySelector(".timeline-fecha-partidos");
      }

      contenedorPartidos.appendChild(this._crearTarjetaTimeline(partido, equipos, sedes));
    }

    const totalMostrados = lista.querySelectorAll(".timeline-partido").length;
    this._actualizarContadorTimeline(totalMostrados, EVENTOS._timelinePartidosOrdenados.length);
  },

  _crearTarjetaTimeline(partido, equipos, sedes) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "timeline-partido";
    tarjeta.setAttribute("role", "listitem");

    const nombreSede = UTILS.obtenerNombreSede(partido.stadium_id, sedes);
    const horaSolo = (partido.local_date || "").split(" ")[1];

    tarjeta.innerHTML = `
      <div class="timeline-partido__header">
        <span class="timeline-partido__hora">
          <i class="bi bi-clock" aria-hidden="true"></i>
          ${horaSolo || "—"}
        </span>
        <span class="timeline-partido__grupo">Grupo ${partido.group || "—"}</span>
      </div>
      <div class="timeline-partido__cuerpo">
        <div class="agenda-columna__equipos">
          <div class="agenda-columna__equipo">
            ${UTILS.obtenerBanderaHTML(partido.home_team_name_en, equipos)}
            <span class="partido-card__equipo-nombre">${partido.home_team_name_en || "—"}</span>
          </div>
          <span class="partido-card__vs" aria-label="versus">VS</span>
          <div class="agenda-columna__equipo">
            ${UTILS.obtenerBanderaHTML(partido.away_team_name_en, equipos)}
            <span class="partido-card__equipo-nombre">${partido.away_team_name_en || "—"}</span>
          </div>
        </div>
        <div class="agenda-columna__resultado">
          ${
            partido.finished === "TRUE"
              ? `<span class="partido-card__marcador">${partido.home_score} — ${partido.away_score}</span>`
              : `<span class="badge-partido badge-partido--pendiente">
                   <i class="bi bi-clock" aria-hidden="true"></i> Pendiente
                 </span>`
          }
        </div>
      </div>
      <div class="timeline-partido__footer">
        <i class="bi bi-building" aria-hidden="true"></i> ${nombreSede}
      </div>
    `;

    tarjeta.querySelectorAll(".bandera-equipo").forEach((img) => {
      img.addEventListener("error", () => {
        img.outerHTML = UTILS.obtenerBanderaEquipo();
      }, { once: true });
    });

    return tarjeta;
  },

  _actualizarContadorTimeline(mostrados, total) {
    document.getElementById("timelineContador").textContent =
      `${mostrados} de ${total} partidos mostrados`;
  },

//Primera vez que se visita Dashboard del Fanático
  iniciarVistaDashboard() {
    this.mostrarOpcionesFavoritos(EVENTOS._equiposCargados);

    const favoritoGuardado = UTILS.obtenerFavoritoGuardado();
    if (favoritoGuardado) {
      EVENTOS._favoritoActualId = favoritoGuardado;
      this.mostrarDashboardDeEquipo(favoritoGuardado);
    }
  },

  //Reto de resiliencia: /get/games o /get/groups fallan sin caché disponible
  mostrarErrorDashboard() {
    document.getElementById("dashboardContenido").hidden = true;

    const vacio = document.getElementById("dashboardVacio");
    vacio.hidden = false;
    vacio.innerHTML = `
      <i class="bi bi-exclamation-triangle-fill mensaje-estado__icono" aria-hidden="true"></i>
      <span class="mensaje-estado__texto">No se pudieron cargar los datos de las selecciones.</span>
    `;
  },

  //Lista filtrable de equipos dentro del panel desplegable
  mostrarOpcionesFavoritos(equipos) {
    const lista = document.getElementById("listaEquiposFavoritos");
    lista.innerHTML = "";

    if (equipos.length === 0) {
      lista.innerHTML = `<p class="mensaje-estado__texto" style="padding: var(--espacio-md);">No se encontraron selecciones.</p>`;
      return;
    }

    for (const equipo of equipos) {
      const opcion = document.createElement("button");
      opcion.className = "selector-favorito__opcion";
      opcion.setAttribute("role", "listitem");
      opcion.setAttribute("data-equipo-id", equipo.id);

      opcion.innerHTML = `
        ${equipo.flag ? `<img class="bandera-equipo" src="${equipo.flag}" alt="" loading="lazy">` : UTILS.obtenerBanderaEquipo()}
        <span>${equipo.name_en}</span>
      `;

      lista.appendChild(opcion);
    }
  },

  //Renderiza banner, stats y tabla del equipo elegido
  mostrarDashboardDeEquipo(equipoId) {
    const equipo = UTILS.buscarEquipoPorId(equipoId, EVENTOS._equiposCargados);
    if (!equipo) return;

    document.getElementById("dashboardVacio").hidden = true;
    document.getElementById("dashboardContenido").hidden = false;
    document.getElementById("favoritoActualTexto").textContent = equipo.name_en;

    const color = UTILS.obtenerColorEquipo(equipo.name_en);
    document.getElementById("favoritoBanner").style.setProperty("--favorito-acento", color);

    const banderaWrap = document.getElementById("favoritoBannerBandera");
    banderaWrap.innerHTML = equipo.flag
      ? `<img src="${equipo.flag}" alt="" loading="lazy">`
      : UTILS.obtenerBanderaEquipo();

    document.getElementById("favoritoBannerNombre").textContent = equipo.name_en;

    const stats = UTILS.obtenerEstadisticasGrupo(equipoId, EVENTOS._equiposCargados, EVENTOS._gruposCargados);
    const badges = document.getElementById("favoritoBannerBadges");

    if (stats) {
      badges.innerHTML = `
        <span class="favorito-banner__badge">Grupo ${stats.nombreGrupo}</span>
        <span class="favorito-banner__badge">${stats.posicion}º lugar</span>
        <span class="favorito-banner__badge">${equipo.fifa_code || ""}</span>
      `;
      document.getElementById("statPuntos").textContent = stats.pts;
      document.getElementById("statGolesFavor").textContent = stats.gf;
      document.getElementById("statGolesContra").textContent = stats.ga;
      document.getElementById("statPosicion").textContent = `${stats.posicion}º lugar`;
    } else {
      badges.innerHTML = "";
      ["statPuntos", "statGolesFavor", "statGolesContra", "statPosicion"].forEach((id) => {
        document.getElementById(id).textContent = "—";
      });
    }

    const partidos = UTILS.filtrarPartidosPorEquipo(equipo.name_en, EVENTOS._partidosCargados || []);
    this._renderTablaFavorito(partidos, EVENTOS._equiposCargados, EVENTOS._sedesCargadas);
  },

  _renderTablaFavorito(partidos, equipos, sedes) {
    const cuerpo = document.getElementById("favoritoTablaCuerpo");
    cuerpo.innerHTML = "";

    if (partidos.length === 0) {
      cuerpo.innerHTML = `
        <tr><td colspan="4" class="mensaje-estado__texto" style="text-align:center;">
          Sin partidos programados todavía.
        </td></tr>
      `;
      return;
    }

    const ordenados = UTILS.ordenarPartidosCronologicamente(partidos);

    for (const partido of ordenados) {
      const fila = document.createElement("tr");
      const nombreSede = UTILS.obtenerNombreSede(partido.stadium_id, sedes);

      const equipoLocal = UTILS.buscarEquipoPorNombre(partido.home_team_name_en, equipos);
      const equipoVisita = UTILS.buscarEquipoPorNombre(partido.away_team_name_en, equipos);
      const codigoLocal = (equipoLocal && equipoLocal.fifa_code) || (partido.home_team_name_en || "—").slice(0, 3).toUpperCase();
      const codigoVisita = (equipoVisita && equipoVisita.fifa_code) || (partido.away_team_name_en || "—").slice(0, 3).toUpperCase();

      fila.innerHTML = `
        <td>
          ${partido.local_date || "—"}
          <br><span class="favorito-tabla__sede">${nombreSede}</span>
        </td>
        <td>
          <div class="favorito-tabla__equipos">
            <span class="favorito-tabla__equipo" title="${partido.home_team_name_en || ""}">
              ${UTILS.obtenerBanderaHTML(partido.home_team_name_en, equipos)}
              ${codigoLocal}
            </span>
            <span class="partido-card__vs" aria-label="versus">VS</span>
            <span class="favorito-tabla__equipo" title="${partido.away_team_name_en || ""}">
              ${UTILS.obtenerBanderaHTML(partido.away_team_name_en, equipos)}
              ${codigoVisita}
            </span>
          </div>
        </td>
        <td class="favorito-tabla__marcador">
          ${partido.finished === "TRUE" ? `${partido.home_score} — ${partido.away_score}` : "—"}
        </td>
        <td>
          ${
            partido.finished === "TRUE"
              ? `<span class="badge-partido badge-partido--finalizado">Finalizado</span>`
              : `<span class="badge-partido badge-partido--pendiente">Pendiente</span>`
          }
        </td>
      `;

      fila.querySelectorAll(".bandera-equipo").forEach((img) => {
        img.addEventListener("error", () => {
          img.outerHTML = UTILS.obtenerBanderaEquipo();
        }, { once: true });
      });

      cuerpo.appendChild(fila);
    }
  },

  //Primera vez que se visita Matriz de Enfrentamientos
  iniciarVistaMatriz(exitoPartidos) {
    this._renderSelectorGrupos();

    document.getElementById("matrizBannerError").hidden = exitoPartidos;

    const primerGrupo = EVENTOS._gruposCargados[0];
    if (primerGrupo) {
      EVENTOS._grupoActualSeleccionado = primerGrupo.name;
      document.querySelector(`.grupo-boton[data-grupo="${primerGrupo.name}"]`)
        ?.classList.add("grupo-boton--activo");
      this.mostrarMatrizDeGrupo(primerGrupo.name);
    }
  },

  //Genera los 12 botones de grupo a partir de los datos reales de /get/groups
  _renderSelectorGrupos() {
    const contenedor = document.getElementById("selectorGrupos");
    contenedor.innerHTML = "";

    for (const grupo of EVENTOS._gruposCargados) {
      const boton = document.createElement("button");
      boton.className = "grupo-boton";
      boton.setAttribute("data-grupo", grupo.name);
      boton.textContent = `Grupo ${grupo.name}`;
      contenedor.appendChild(boton);
    }
  },

  //Construye la matriz 4x4 completa para el grupo elegido (encabezados + filas + celdas)
  mostrarMatrizDeGrupo(nombreGrupo) {
    document.getElementById("matrizGrupoTitulo").textContent = `Grupo ${nombreGrupo}`;

    const equipos = UTILS.obtenerEquiposDeGrupo(nombreGrupo, EVENTOS._equiposCargados);
    const partidos = EVENTOS._partidosCargados || [];

    //Encabezado — celda vacía + 4 columnas de equipo
    const head = document.getElementById("matrizTablaHead");
    head.innerHTML = `
      <tr>
        <th class="matriz-tabla__esquina" scope="col"></th>
        ${equipos.map((equipo) => `
          <th class="matriz-tabla__columna-equipo" scope="col">
            <div class="matriz-tabla__equipo-cabecera">
              ${UTILS.obtenerBanderaHTML(equipo.name_en, EVENTOS._equiposCargados)}
              <span class="matriz-tabla__codigo">${equipo.fifa_code || equipo.name_en}</span>
            </div>
          </th>
        `).join("")}
      </tr>
    `;

    //Cuerpo — una fila por equipo, con su encabezado + 4 celdas
    const cuerpo = document.getElementById("matrizTablaCuerpo");
    cuerpo.innerHTML = "";

    for (const equipoFila of equipos) {
      const fila = document.createElement("tr");

      let celdasHTML = `
        <th class="matriz-tabla__fila-equipo" scope="row">
          <div class="matriz-tabla__equipo-fila">
            <span class="matriz-tabla__codigo">${equipoFila.fifa_code || equipoFila.name_en}</span>
            ${UTILS.obtenerBanderaHTML(equipoFila.name_en, EVENTOS._equiposCargados)}
          </div>
        </th>
      `;

      for (const equipoColumna of equipos) {
        if (equipoFila.id === equipoColumna.id) {
          celdasHTML += `<td class="matriz-tabla__diagonal">×</td>`;
        } else {
          celdasHTML += `
            <td class="matriz-tabla__celda"
              data-fila="${equipoFila.name_en}"
              data-columna="${equipoColumna.name_en}">
              ${this._construirContenidoCelda(equipoFila.name_en, equipoColumna.name_en, partidos)}
            </td>
          `;
        }
      }

      fila.innerHTML = celdasHTML;
      cuerpo.appendChild(fila);
    }

    this._actualizarStatsMatriz(nombreGrupo);
  },

  //Reto de resiliencia: actualiza SOLO el contenido de las celdas, sin tocar la estructura de la tabla
  actualizarCeldasMatriz(nombreGrupo) {
    const partidos = EVENTOS._partidosCargados || [];
    const celdas = document.querySelectorAll(".matriz-tabla__celda[data-fila][data-columna]");

    celdas.forEach((celda) => {
      const nombreFila = celda.getAttribute("data-fila");
      const nombreColumna = celda.getAttribute("data-columna");
      celda.innerHTML = this._construirContenidoCelda(nombreFila, nombreColumna, partidos);
    });

    this._actualizarStatsMatriz(nombreGrupo);
  },

  _construirContenidoCelda(nombreEquipoFila, nombreEquipoColumna, partidos) {
    const resultado = UTILS.obtenerResultadoCelda(nombreEquipoFila, nombreEquipoColumna, partidos);

    if (!resultado) {
      return `
        <div class="matriz-tabla__celda-contenido">
          <span class="badge-partido badge-partido--pendiente">Pendiente</span>
        </div>
      `;
    }

    return `
      <div class="matriz-tabla__celda-contenido">
        <span class="matriz-tabla__marcador">${resultado.marcadorFila} — ${resultado.marcadorColumna}</span>
        <span class="badge-partido badge-partido--finalizado">Finalizado</span>
      </div>
    `;
  },

  _actualizarStatsMatriz(nombreGrupo) {
    const stats = UTILS.calcularStatsMatriz(
      nombreGrupo,
      EVENTOS._equiposCargados,
      EVENTOS._gruposCargados,
      EVENTOS._partidosCargados || []
    );

    document.getElementById("matrizGolesPromedio").textContent = stats.golesPromedio;
    document.getElementById("matrizPartidosJugados").textContent =
      `${stats.partidosJugados}/${stats.totalPartidosPosibles}`;
    document.getElementById("matrizLiderGrupo").textContent = stats.nombreLider;
  },
};