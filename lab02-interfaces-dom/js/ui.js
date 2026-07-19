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
    };
    const mapaTitulos = {
      "tour-sedes": "Tour Virtual de Sedes",
      "agenda-simultanea": "Agenda Simultánea",
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
};