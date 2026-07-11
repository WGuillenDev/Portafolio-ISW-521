const CONFIG = {
  BASE_URL: "https://worldcup26.ir",

  ENDPOINTS: {
    SEDES: "/get/stadiums",
    PARTIDOS: "/get/games",
  },

  REINTENTO: {
    MAX_INTENTOS: 4,
    ESPERA_BASE_MS: 1000,
  },

  CLAVES_STORAGE: {
    TOKEN: "wc26_token",
    SEDES: "wc26_sedes",
    PARTIDOS: "wc26_partidos",
  },

  CREDENCIALES: {
    username: "estudiante",
    password: "elPatoInformatico2026",
  },

  IDIOMAS: {
    ES: {
      sedes: "Sedes",
      partidos: "Partidos",
      sedeActiva: "Sede activa",
      capacidad: "Capacidad",
      ciudad: "Ciudad",
      pais: "País",
      datosNoActualizados: "Datos no actualizados",
      sesionExpirada: "Sesión expirada",
      reintentar: "Reintentar",
      cargando: "Cargando...",
      sinPartidos: "No se pudieron cargar los partidos de esta sede",
      reintentandoEn: "Reintentando en",
      segundos: "segundos",
      modoOscuro: "Modo oscuro",
      modoClaro: "Modo claro",
      cambiarIdioma: "English",
    },
    EN: {
      sedes: "Stadiums",
      partidos: "Matches",
      sedeActiva: "Active venue",
      capacidad: "Capacity",
      ciudad: "City",
      pais: "Country",
      datosNoActualizados: "Outdated data",
      sesionExpirada: "Session expired",
      reintentar: "Retry",
      cargando: "Loading...",
      sinPartidos: "Could not load matches for this stadium",
      reintentandoEn: "Retrying in",
      segundos: "seconds",
      modoOscuro: "Dark mode",
      modoClaro: "Light mode",
      cambiarIdioma: "Español",
    },
  },
};