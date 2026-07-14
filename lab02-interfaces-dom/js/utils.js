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

  normalizarClaveCiudad(paisEn, ciudadEn) {
    const codigoPais = paisEn === "Mexico" ? "mx"
      : paisEn === "Canada" ? "ca"
      : "us";

    const ciudadNormalizada = ciudadEn
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();

    return `sede-${codigoPais}-${ciudadNormalizada}`;
  },

   MAPA_IMAGEN_SEDE: {
    "1": { archivo: "Estadio Azteca y sus alrededores 20.jpg", licencia: "CC BY 4.0" },
    "2": { archivo: "EstadioAkronGDL.jpg", licencia: "Commons" },
    "3": { archivo: "Mexico Guadalupe Monterrey Estadio BBVA Bancomer fifa world cup 2026 1.JPG", licencia: "CC BY-SA 3.0 de" },
    "4": { archivo: "AT&T Stadium 2022-08-24.jpg", licencia: "Dominio público" },
    "5": { archivo: "NRG Stadium SBLI.jpg", licencia: "Dominio público" },
    "6": { archivo: "Arrowhead Stadium 2010.JPG", licencia: "CC BY 3.0" },
    "7": { archivo: "Mercedes-Benz Stadium Interior in 2024.jpg", licencia: "CC BY 4.0" },
    "8": { archivo: "Hard Rock Stadium.jpg", licencia: "CC BY-SA 4.0" },
    "9": { archivo: "Gillette Stadium entrance and lighthouse.jpg", licencia: "CC BY-SA 4.0" },
    "10": { archivo: "Lincoln Financial Field, Philadelphia, 2024.jpg", licencia: "CC BY-SA 4.0" },
    "11": { archivo: "MetLife Stadium, East Rutherford NJ.jpg", licencia: "CC BY-SA 4.0" },
    "12": { archivo: "BMO Field, Toronto, Ontario (29969149766).jpg", licencia: "CC BY-SA 2.0" },
    "13": { archivo: "BCPLACESTADIUM.jpg", licencia: "Dominio público" },
    "14": { archivo: "Sounder and CenturyLink Field (14441428905).jpg", licencia: "Por confirmar" },
    "15": { archivo: "Levi's Stadium from air.jpg", licencia: "CC BY-SA 3.0" },
    "16": { archivo: "SoFi Stadium.jpg", licencia: "CC BY 2.0" },
  },

  obtenerImagenSede(sedeId) {
    const datos = this.MAPA_IMAGEN_SEDE[String(sedeId)];
    if (!datos) return null;

    const nombreCodificado = encodeURIComponent(datos.archivo);
    return {
      url: `https://commons.wikimedia.org/wiki/Special:FilePath/${nombreCodificado}`,
      licencia: datos.licencia,
    };
  },
};