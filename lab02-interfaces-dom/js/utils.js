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
};