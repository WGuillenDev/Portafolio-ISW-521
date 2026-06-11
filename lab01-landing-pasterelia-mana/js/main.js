// Pastelería Maná | main.js | WGuillenDev | ISW-521 | UTN | 2026

// Dark mode
const CLAVE_TEMA = 'tema';
const VALOR_OSCURO = 'oscuro';
const CLASE_OSCURO = 'tema-oscuro';

function obtenerTemaActual() {
    return localStorage.getItem(CLAVE_TEMA);
}

function aplicarTema(tema) {
    const esOscuro = tema === VALOR_OSCURO;
    document.documentElement.classList.toggle(CLASE_OSCURO, esOscuro);
    actualizarBoton(esOscuro);
}

function actualizarBoton(esOscuro) {
    const texto = document.querySelector('.header__toggle-texto');
    const boton = document.getElementById('toggleTema');
    if (!texto || !boton) return;
    texto.textContent = esOscuro ? 'Modo claro' : 'Modo oscuro';
    boton.setAttribute('aria-pressed', esOscuro);
}

function alternarTema() {
    const esOscuroAhora = document.documentElement.classList.contains(CLASE_OSCURO);
    const nuevoTema = esOscuroAhora ? null : VALOR_OSCURO;

    if (nuevoTema) {
        localStorage.setItem(CLAVE_TEMA, nuevoTema);
    } else {
        localStorage.removeItem(CLAVE_TEMA);
    }

    aplicarTema(nuevoTema);
}

function iniciarDarkMode() {
    const boton = document.getElementById('toggleTema');
    if (!boton) return;

    // Sincronizar estado del botón con lo que el IIFE ya aplicó
    const temaGuardado = obtenerTemaActual();
    actualizarBoton(temaGuardado === VALOR_OSCURO);

    boton.addEventListener('click', alternarTema);
}

// Menú móvil
function iniciarMenuMovil() {
    const boton = document.getElementById('menuMovil');
    const links = document.querySelector('.header__links');
    if (!boton || !links) return;

    boton.addEventListener('click', function () {
        const estaAbierto = boton.getAttribute('aria-expanded') === 'true';
        boton.setAttribute('aria-expanded', !estaAbierto);
        links.classList.toggle('header__links--visible', !estaAbierto);
    });

    // Cerrar menú al hacer clic en un link
    links.querySelectorAll('.header__link').forEach(function (link) {
        link.addEventListener('click', function () {
            boton.setAttribute('aria-expanded', 'false');
            links.classList.remove('header__links--visible');
        });
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    iniciarDarkMode();
    iniciarMenuMovil();
});