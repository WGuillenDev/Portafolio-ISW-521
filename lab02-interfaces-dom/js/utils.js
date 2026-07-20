const UTILS = {
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
};