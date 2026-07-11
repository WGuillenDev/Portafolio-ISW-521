const UI = {

  //Preferencias guardadas 
  aplicarTema() {
    const tema = localStorage.getItem(CONFIG.CLAVES_STORAGE.TEMA) || "claro";
    document.documentElement.setAttribute("data-tema", tema);
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

  //Modal sesión expirada (401) 
  mostrarSesionExpirada() {
    const modal = document.getElementById("modalSesion");
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.getElementById("btnReautenticar").focus();
  },

  ocultarModal() {
    const modal = document.getElementById("modalSesion");
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
  },

  //Skeleton loading 
  mostrarCargando() {
    const listaSedes = document.getElementById("listaSedes");
    listaSedes.innerHTML = "";

    for (let i = 0; i < 16; i++) {
      const esqueleto = document.createElement("div");
      esqueleto.className = "sede-esqueleto";
      esqueleto.setAttribute("aria-hidden", "true");
      listaSedes.appendChild(esqueleto);
    }
  },

  //Render de sedes
  mostrarSedes(sedes) {
    const grupos = {
      Mexico: sedes.filter((s) => s.country === "Mexico"),
      USA: sedes.filter(
        (s) => s.country !== "Mexico" && s.country !== "Canada"
      ),
      Canada: sedes.filter((s) => s.country === "Canada"),
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
        tarjeta.className = "sede-tarjeta";
        tarjeta.setAttribute("role", "listitem");
        tarjeta.setAttribute("data-sede-id", sede.id);
        tarjeta.setAttribute(
          "aria-label",
          `Ver partidos de ${sede.name}, ${sede.city}`
        );

        tarjeta.innerHTML = `
          <span class="sede-tarjeta__nombre">${sede.name}</span>
          <span class="sede-tarjeta__ciudad">
            <i class="bi bi-geo-alt-fill" aria-hidden="true"></i>
            ${sede.city}
          </span>
          <span class="sede-tarjeta__capacidad">
            <i class="bi bi-people-fill" aria-hidden="true"></i>
            ${sede.capacity ? sede.capacity.toLocaleString("es-CR") : "—"}
          </span>
        `;

        lista.appendChild(tarjeta);
      }
    }
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
        <p class="panel-partidos__vacio">${textos.sinPartidos}</p>
      `;
      return;
    }

    for (const partido of partidos) {
      const tarjeta = document.createElement("article");
      tarjeta.className = "partido-tarjeta";
      tarjeta.setAttribute("role", "listitem");

      tarjeta.innerHTML = `
        <div class="partido-tarjeta__fecha">
          <i class="bi bi-calendar-event" aria-hidden="true"></i>
          ${UTILS.formatearFecha(partido.local_date)}
        </div>
        <div class="partido-tarjeta__equipos">
          <span class="partido-tarjeta__equipo">${partido.home_team_country || "—"}</span>
          <span class="partido-tarjeta__vs" aria-label="versus">VS</span>
          <span class="partido-tarjeta__equipo">${partido.away_team_country || "—"}</span>
        </div>
        <div class="partido-tarjeta__resultado">
          ${
            partido.home_score !== null && partido.away_score !== null
              ? `<span class="partido-tarjeta__marcador">${partido.home_score} — ${partido.away_score}</span>`
              : `<span class="partido-tarjeta__pendiente">
                  <i class="bi bi-clock" aria-hidden="true"></i>
                  Pendiente
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
    document.querySelectorAll(".sede-tarjeta").forEach((tarjeta) => {
      const esActiva = tarjeta.getAttribute("data-sede-id") === String(sedeId);
      tarjeta.classList.toggle("sede-tarjeta--activa", esActiva);
      tarjeta.setAttribute("aria-pressed", String(esActiva));
    });
  },
};