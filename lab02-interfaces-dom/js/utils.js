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

  BANDERAS_PAISES: {
    "Mexico": "mx",
    "South Africa": "za",
    "South Korea": "kr",
    "Czech Republic": "cz",
    "Canada": "ca",
    "Switzerland": "ch",
    "Qatar": "qa",
    "Bosnia and Herzegovina": "ba",
    "Brazil": "br",
    "Morocco": "ma",
    "Haiti": "ht",
    "Scotland": "gb-sct",
    "United States": "us",
    "USA": "us",
    "Paraguay": "py",
    "Australia": "au",
    "Turkiye": "tr",
    "Turkey": "tr",
    "Germany": "de",
    "Curacao": "cw",
    "Curaçao": "cw",
    "Ivory Coast": "ci",
    "Ecuador": "ec",
    "Netherlands": "nl",
    "Japan": "jp",
    "Tunisia": "tn",
    "Sweden": "se",
    "Belgium": "be",
    "Egypt": "eg",
    "Iran": "ir",
    "New Zealand": "nz",
    "Spain": "es",
    "Cape Verde": "cv",
    "Saudi Arabia": "sa",
    "Uruguay": "uy",
    "France": "fr",
    "Senegal": "sn",
    "Norway": "no",
    "Iraq": "iq",
    "Argentina": "ar",
    "Algeria": "dz",
    "Austria": "at",
    "Jordan": "jo",
    "Portugal": "pt",
    "Colombia": "co",
    "Uzbekistan": "uz",
    "Democratic Republic of the Congo": "cd",
    "Congo DR": "cd",
    "England": "gb-eng",
    "Croatia": "hr",
    "Ghana": "gh",
    "Panama": "pa",
  },

  obtenerBandera(nombreEquipo) {
    const codigo = this.BANDERAS_PAISES[nombreEquipo];
    if (!codigo) return null;
    return `https://flagcdn.com/w40/${codigo}.png`;
  },
};