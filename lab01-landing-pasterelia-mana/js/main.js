// Dark mode
const CLAVE_TEMA = "tema";
const VALOR_OSCURO = "oscuro";
const CLASE_OSCURO = "tema-oscuro";

function obtenerTemaActual() {
  return localStorage.getItem(CLAVE_TEMA);
}

function aplicarTema(tema) {
  const esOscuro = tema === VALOR_OSCURO;
  document.documentElement.classList.toggle(CLASE_OSCURO, esOscuro);
  actualizarBoton(esOscuro);
}

function actualizarBoton(esOscuro) {
  const texto = document.querySelector(".header__toggle-texto");
  const boton = document.getElementById("toggleTema");
  if (!texto || !boton) return;
  texto.textContent = esOscuro ? "Modo claro" : "Modo oscuro";
  boton.setAttribute("aria-pressed", esOscuro);
}

function alternarTema() {
  const esOscuroAhora =
    document.documentElement.classList.contains(CLASE_OSCURO);
  const nuevoTema = esOscuroAhora ? null : VALOR_OSCURO;

  if (nuevoTema) {
    localStorage.setItem(CLAVE_TEMA, nuevoTema);
  } else {
    localStorage.removeItem(CLAVE_TEMA);
  }

  aplicarTema(nuevoTema);
}

function iniciarDarkMode() {
  const boton = document.getElementById("toggleTema");
  if (!boton) return;

  // Sincronizar estado del botón con lo que el IIFE ya aplicó
  const temaGuardado = obtenerTemaActual();
  actualizarBoton(temaGuardado === VALOR_OSCURO);

  boton.addEventListener("click", alternarTema);
}

// Menú móvil
function iniciarMenuMovil() {
  const boton = document.getElementById("menuMovil");
  const links = document.querySelector(".header__links");
  if (!boton || !links) return;

  boton.addEventListener("click", function () {
    const estaAbierto = boton.getAttribute("aria-expanded") === "true";
    boton.setAttribute("aria-expanded", !estaAbierto);
    links.classList.toggle("header__links--visible", !estaAbierto);
  });

  // Cerrar menú al hacer clic en un link
  links.querySelectorAll(".header__link").forEach(function (link) {
    link.addEventListener("click", function () {
      boton.setAttribute("aria-expanded", "false");
      links.classList.remove("header__links--visible");
    });
  });
}

// Tamaño de fuente
const CLAVE_FUENTE = "tamanoFuente";
const FUENTE_MIN = 87.5;
const FUENTE_MAX = 125;
const FUENTE_PASO = 12.5;
const FUENTE_BASE = 100;

function obtenerFuenteActual() {
  const guardado = localStorage.getItem(CLAVE_FUENTE);
  return guardado ? Number(guardado) : FUENTE_BASE;
}

function aplicarFuente(porcentaje) {
  document.documentElement.style.fontSize = porcentaje + "%";
  localStorage.setItem(CLAVE_FUENTE, porcentaje);
  actualizarBotonesFuente(porcentaje);
}

function actualizarBotonesFuente(porcentaje) {
  const btnMenos = document.getElementById("fuenteMenos");
  const btnMas = document.getElementById("fuenteMas");
  if (!btnMenos || !btnMas) return;
  btnMenos.disabled = porcentaje <= FUENTE_MIN;
  btnMas.disabled = porcentaje >= FUENTE_MAX;
}

function cambiarFuente(direccion) {
  const actual = obtenerFuenteActual();
  let nuevo = actual + direccion * FUENTE_PASO;
  nuevo = Math.min(FUENTE_MAX, Math.max(FUENTE_MIN, nuevo));
  aplicarFuente(nuevo);
}

function iniciarTamanoFuente() {
  const btnMenos = document.getElementById("fuenteMenos");
  const btnMas = document.getElementById("fuenteMas");
  if (!btnMenos || !btnMas) return;

  // Sincronizar estado visual con lo que el IIFE ya aplicó
  actualizarBotonesFuente(obtenerFuenteActual());

  btnMenos.addEventListener("click", function () {
    cambiarFuente(-1);
  });

  btnMas.addEventListener("click", function () {
    cambiarFuente(1);
  });
}

// Panel flotante de accesibilidad
function iniciarPanelAccesibilidad() {
  const boton = document.getElementById("botonAccesibilidad");
  const panel = document.getElementById("panelAccesibilidad");
  if (!boton || !panel) return;

  boton.addEventListener("click", function () {
    const estaAbierto = boton.getAttribute("aria-expanded") === "true";
    boton.setAttribute("aria-expanded", !estaAbierto);
    panel.hidden = estaAbierto;
  });

  // Cerrar el panel si se hace clic fuera de él
  document.addEventListener("click", function (evento) {
    const clicDentro =
      panel.contains(evento.target) || boton.contains(evento.target);
    if (!clicDentro && !panel.hidden) {
      boton.setAttribute("aria-expanded", "false");
      panel.hidden = true;
    }
  });
}

// Inicialización
document.addEventListener("DOMContentLoaded", function () {
  iniciarDarkMode();
  iniciarMenuMovil();
  iniciarTamanoFuente();
  iniciarPanelAccesibilidad();
});