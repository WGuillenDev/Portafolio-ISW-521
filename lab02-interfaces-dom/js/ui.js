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
  mostrarPartidos(partidos, nombreSede) {
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
            ${UTILS.obtenerBanderaEquipo()}
            <span class="partido-card__equipo-nombre">${partido.home_team_name_en || "—"}</span>
          </span>
          <span class="partido-card__vs" aria-label="versus">VS</span>
          <span class="partido-card__equipo">
            ${UTILS.obtenerBanderaEquipo()}
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
};