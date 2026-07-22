const UTILS = {

  //Escapa caracteres HTML peligrosos para prevenir inyección (XSS)
  escaparHTML(valor) {
    if (valor === null || valor === undefined) return "";
    return String(valor)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  esperar(milisegundos) {
    return new Promise((resolve) => setTimeout(resolve, milisegundos));
  },

  calcularEspera(numeroIntento) {
    return CONFIG.REINTENTO.ESPERA_BASE_MS * Math.pow(2, numeroIntento);
  },

  async ejecutarConBackoff(funcionFetch) {
    let ultimoError;

    for (let intento = 0; intento < CONFIG.REINTENTO.MAX_INTENTOS; intento++) {
      try {
        return await funcionFetch();
      } catch (error) {
        ultimoError = error;

        if (error.message === "Sesión expirada") {
          throw error;
        }

        const esUltimoIntento = intento === CONFIG.REINTENTO.MAX_INTENTOS - 1;
        if (esUltimoIntento) break;

        const tiempoEspera = this.calcularEspera(intento);
        await this.esperar(tiempoEspera);
      }
    }

    throw ultimoError;
  },

  async ejecutarConCountdown(segundos, callbackPorSegundo) {
    for (let segundoActual = segundos; segundoActual > 0; segundoActual--) {
      callbackPorSegundo(segundoActual);
      await this.esperar(1000);
    }
  },

  formatearFecha(fechaString) {
    const fecha = new Date(fechaString.replace(" ", "T"));
    return fecha.toLocaleDateString("es-CR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  obtenerFechaSolo(fechaString) {
    if (!fechaString) return "";
    return fechaString.split(" ")[0];
  },

  parsearFechaSolo(fechaSolo) {
    const partes = fechaSolo.split("/");
    if (partes.length !== 3) return null;

    const [mes, dia, anio] = partes.map(Number);
    return new Date(anio, mes - 1, dia);
  },

  agruparPartidosPorFecha(partidos) {
    const grupos = {};

    for (const partido of partidos) {
      const fecha = this.obtenerFechaSolo(partido.local_date);
      if (!grupos[fecha]) grupos[fecha] = [];
      grupos[fecha].push(partido);
    }

    return grupos;
  },

 obtenerFechasSimultaneas(partidos) {
    const grupos = this.agruparPartidosPorFecha(partidos);

    return Object.keys(grupos)
      .filter((fecha) => grupos[fecha].length >= 2)
      .sort((a, b) => this.parsearFechaSolo(a) - this.parsearFechaSolo(b));
  },

  obtenerDiaSemanaCorto(fechaSolo) {
    const fecha = this.parsearFechaSolo(fechaSolo);
    if (!fecha) return "—";
    return fecha
      .toLocaleDateString("es-CR", { weekday: "short" })
      .replace(".", "")
      .toUpperCase();
  },

  formatearFechaCorta(fechaSolo) {
    const fecha = this.parsearFechaSolo(fechaSolo);
    if (!fecha) return fechaSolo;
    return fecha
      .toLocaleDateString("es-CR", { day: "2-digit", month: "short" })
      .replace(".", "");
  },

  formatearFechaCompleta(fechaSolo) {
    const fecha = this.parsearFechaSolo(fechaSolo);
    if (!fecha) return fechaSolo;
    return fecha.toLocaleDateString("es-CR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },
  parsearFechaHora(fechaHoraString) {
    if (!fechaHoraString) return null;

    const [fechaParte, horaParte] = fechaHoraString.split(" ");
    const fecha = this.parsearFechaSolo(fechaParte);
    if (!fecha) return null;

    if (horaParte) {
      const [horas, minutos] = horaParte.split(":").map(Number);
      fecha.setHours(horas || 0, minutos || 0, 0, 0);
    }

    return fecha;
  },

  ordenarPartidosCronologicamente(partidos) {
    return [...partidos].sort((a, b) => {
      const fechaA = this.parsearFechaHora(a.local_date);
      const fechaB = this.parsearFechaHora(b.local_date);
      return fechaA - fechaB;
    });
  },

  obtenerBloque(partidosOrdenados, indiceBloque, tamanoBloque = 10) {
    const inicio = indiceBloque * tamanoBloque;
    return partidosOrdenados.slice(inicio, inicio + tamanoBloque);
  },

  hayMasBloques(partidosOrdenados, indiceBloque, tamanoBloque = 10) {
    return indiceBloque * tamanoBloque < partidosOrdenados.length;
  },

  MAPA_COLOR_SEDE: {
    "1": "sede-mx-ciudaddemexico",
    "2": "sede-mx-guadalajara",
    "3": "sede-mx-monterrey",
    "4": "sede-us-dallas",
    "5": "sede-us-houston",
    "6": "sede-us-kansascity",
    "7": "sede-us-atlanta",
    "8": "sede-us-miami",
    "9": "sede-us-boston",
    "10": "sede-us-filadelfia",
    "11": "sede-us-nuevayork",
    "12": "sede-ca-toronto",
    "13": "sede-ca-vancouver",
    "14": "sede-us-seattle",
    "15": "sede-us-sanfrancisco",
    "16": "sede-us-losangeles",
  },

  obtenerClaveColorSede(sedeId) {
    return this.MAPA_COLOR_SEDE[String(sedeId)] || "";
  },

   MAPA_IMAGEN_SEDE: {
    "1": "assets/img/stadium-azteca-mexico-city.webp",
    "2": "assets/img/stadium-akron-guadalajara.webp",
    "3": "assets/img/stadium-bbva-monterrey.webp",
    "4": "assets/img/stadium-at_t-dallas.webp",
    "5": "assets/img/stadium-nrg-houston.webp",
    "6": "assets/img/stadium-geha-field-kansas-city.webp",
    "7": "assets/img/stadium-mercedes-benz-atlanta.webp",
    "8": "assets/img/stadium-hard-rock-miami.webp",
    "9": "assets/img/stadium-gillette-boston.webp",
    "10": "assets/img/stadium-lincoln-financial-philadelphia.webp",
    "11": "assets/img/stadium-metlife-new-york-new-jersey.webp",
    "12": "assets/img/stadium-bmo-field-toronto.webp",
    "13": "assets/img/stadium-bc-place-vancouver.webp",
    "14": "assets/img/stadium-lumen-field-seattle.webp",
    "15": "assets/img/stadium-levis-santa-clara.webp",
    "16": "assets/img/stadium-sofi-los-angeles.webp",
  },

  obtenerImagenSede(sedeId) {
    return this.MAPA_IMAGEN_SEDE[String(sedeId)] || null;
  },

  MAPA_COLOR_EQUIPO: {
    "Mexico": "#006341",
    "South Africa": "#007A4D",
    "South Korea": "#CD2E3A",
    "Czech Republic": "#D7141A",
    "Canada": "#FF0000",
    "Switzerland": "#D52B1E",
    "Qatar": "#8D1B3D",
    "Bosnia and Herzegovina": "#002395",
    "Brazil": "#009739",
    "Morocco": "#C1272D",
    "Haiti": "#00209F",
    "Scotland": "#005EB8",
    "United States": "#B22234",
    "USA": "#B22234",
    "Paraguay": "#D52B1E",
    "Australia": "#00843D",
    "Turkiye": "#E30A17",
    "Turkey": "#E30A17",
    "Germany": "#DD0000",
    "Curacao": "#002B7F",
    "Curaçao": "#002B7F",
    "Ivory Coast": "#F77F00",
    "Ecuador": "#FFDD00",
    "Netherlands": "#FF4F00",
    "Japan": "#BC002D",
    "Tunisia": "#E70013",
    "Sweden": "#006AA7",
    "Belgium": "#ED2939",
    "Egypt": "#CE1126",
    "Iran": "#239F40",
    "New Zealand": "#000000",
    "Spain": "#AA151B",
    "Cape Verde": "#003893",
    "Saudi Arabia": "#006C35",
    "Uruguay": "#0038A8",
    "France": "#0055A4",
    "Senegal": "#00853F",
    "Norway": "#EF2B2D",
    "Iraq": "#CE1126",
    "Argentina": "#75AADB",
    "Algeria": "#006233",
    "Austria": "#ED2939",
    "Jordan": "#CE1126",
    "Portugal": "#FF0000",
    "Colombia": "#FCD116",
    "Uzbekistan": "#0099B5",
    "Democratic Republic of the Congo": "#007FFF",
    "Congo DR": "#007FFF",
    "England": "#CE1124",
    "Croatia": "#FF0000",
    "Ghana": "#FCD116",
    "Panama": "#DA121A",
  },

  obtenerColorEquipo(nombreEquipoEn) {
    return this.MAPA_COLOR_EQUIPO[nombreEquipoEn] || "var(--favorito-acento-default)";
  },

  obtenerBanderaEquipo() {
    return '<i class="bi bi-flag-fill" aria-hidden="true"></i>';
  },

  buscarEquipoPorNombre(nombreEquipoEn, listaEquipos) {
    if (!listaEquipos || !nombreEquipoEn) return null;
    return listaEquipos.find((equipo) => equipo.name_en === nombreEquipoEn) || null;
  },

  obtenerBanderaHTML(nombreEquipoEn, listaEquipos) {
    const equipo = this.buscarEquipoPorNombre(nombreEquipoEn, listaEquipos);

    if (equipo && equipo.flag) {
      return `<img class="bandera-equipo" src="${equipo.flag}" alt="" loading="lazy">`;
    }

    return this.obtenerBanderaEquipo();
  },

  buscarSedePorId(sedeId, listaSedes) {
    if (!listaSedes || !sedeId) return null;
    return listaSedes.find((sede) => String(sede.id) === String(sedeId)) || null;
  },

  obtenerNombreSede(sedeId, listaSedes) {
    const sede = this.buscarSedePorId(sedeId, listaSedes);
    return sede ? sede.name_en : `Sede ${sedeId}`;
  },

  // Dashboard del Fanático — favorito, colores y cruces

  //Persistencia del equipo favorito — sobrevive a un refresco completo
  guardarFavorito(equipoId) {
    localStorage.setItem(CONFIG.CLAVES_STORAGE.FAVORITO, equipoId);
  },

  obtenerFavoritoGuardado() {
    return localStorage.getItem(CONFIG.CLAVES_STORAGE.FAVORITO);
  },

  buscarEquipoPorId(equipoId, listaEquipos) {
    if (!listaEquipos || !equipoId) return null;
    return listaEquipos.find((equipo) => String(equipo.id) === String(equipoId)) || null;
  },

  //Cruce equipo → grupo real (pts, gf, ga, gd, posición)
  obtenerEstadisticasGrupo(equipoId, listaEquipos, listaGrupos) {
    const equipo = this.buscarEquipoPorId(equipoId, listaEquipos);
    if (!equipo || !equipo.groups) return null;

    const grupo = listaGrupos.find((g) => g.name === equipo.groups);
    if (!grupo) return null;

    const equiposOrdenados = [...grupo.teams].sort((a, b) => {
      if (Number(b.pts) !== Number(a.pts)) return Number(b.pts) - Number(a.pts);
      return Number(b.gd) - Number(a.gd);
    });

    const posicion = equiposOrdenados.findIndex((t) => String(t.team_id) === String(equipoId)) + 1;
    const stats = grupo.teams.find((t) => String(t.team_id) === String(equipoId));

    if (!stats) return null;

    return {
      nombreGrupo: grupo.name,
      posicion,
      pts: stats.pts,
      gf: stats.gf,
      ga: stats.ga,
      gd: stats.gd,
      mp: stats.mp,
    };
  },

  //Filtrar partidos donde participa un equipo (local o visitante)
  filtrarPartidosPorEquipo(nombreEquipoEn, partidos) {
    return partidos.filter(
      (p) => p.home_team_name_en === nombreEquipoEn || p.away_team_name_en === nombreEquipoEn
    );
  },

  // Matriz de Enfrentamientos — cruce grupo-equipos-partidos

  //Los 4 equipos reales de un grupo, cruzando /get/teams por su campo "groups"
  obtenerEquiposDeGrupo(nombreGrupo, listaEquipos) {
    return listaEquipos
      .filter((equipo) => equipo.groups === nombreGrupo)
      .sort((a, b) => Number(a.id) - Number(b.id));
  },

  //Busca si ya existe un partido entre dos equipos, corrigiendo la orientación local/visitante
  obtenerResultadoCelda(nombreEquipoFila, nombreEquipoColumna, partidos) {
    const partido = partidos.find(
      (p) =>
        (p.home_team_name_en === nombreEquipoFila && p.away_team_name_en === nombreEquipoColumna) ||
        (p.home_team_name_en === nombreEquipoColumna && p.away_team_name_en === nombreEquipoFila)
    );

    if (!partido || partido.finished !== "TRUE") return null;

    const filaEsLocal = partido.home_team_name_en === nombreEquipoFila;

    return {
      marcadorFila: filaEsLocal ? partido.home_score : partido.away_score,
      marcadorColumna: filaEsLocal ? partido.away_score : partido.home_score,
    };
  },

  //Estadísticas reales para las 3 tarjetas del footer de la matriz
  calcularStatsMatriz(nombreGrupo, listaEquipos, listaGrupos, listaPartidos) {
    const equipos = this.obtenerEquiposDeGrupo(nombreGrupo, listaEquipos);
    const nombresEquipos = equipos.map((e) => e.name_en);

    let partidosJugados = 0;
    let golesTotales = 0;

    for (let i = 0; i < nombresEquipos.length; i++) {
      for (let j = i + 1; j < nombresEquipos.length; j++) {
        const resultado = this.obtenerResultadoCelda(nombresEquipos[i], nombresEquipos[j], listaPartidos);
        if (resultado) {
          partidosJugados++;
          golesTotales += Number(resultado.marcadorFila) + Number(resultado.marcadorColumna);
        }
      }
    }

    const totalPartidosPosibles = (nombresEquipos.length * (nombresEquipos.length - 1)) / 2;
    const golesPromedio = partidosJugados > 0 ? (golesTotales / partidosJugados).toFixed(1) : "—";

    const grupo = listaGrupos.find((g) => g.name === nombreGrupo);
    let nombreLider = "—";

    if (grupo) {
      const equipoLiderStats = [...grupo.teams].sort((a, b) => {
        if (Number(b.pts) !== Number(a.pts)) return Number(b.pts) - Number(a.pts);
        return Number(b.gd) - Number(a.gd);
      })[0];

      if (equipoLiderStats) {
        const equipoLider = this.buscarEquipoPorId(equipoLiderStats.team_id, listaEquipos);
        nombreLider = equipoLider ? equipoLider.name_en : "—";
      }
    }

    return {
      partidosJugados,
      totalPartidosPosibles,
      golesPromedio,
      nombreLider,
    };
  },
};