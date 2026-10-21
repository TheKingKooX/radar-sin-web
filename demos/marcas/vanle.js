// Vanlé Salón San Miguel: blanco, granate y gris, Jost fino; el aro del logo se dibuja en la portada.
module.exports = {
  id: "vanle",
  // Servicios y galería en tarjetas expandibles (en el orden de los servicios); imágenes en estilo línea granate sobre acuarela rosa
  tarjetas: [
    { img: ["img/laceados-1.svg", "img/laceados-2.svg"], txt: "Cabello liso, suave y fácil de peinar con técnicas de laceado." },
    { img: ["img/tratamientos-1.svg", "img/tratamientos-2.svg"], txt: "Hidratación y cuidado para devolver brillo y cuerpo al cabello." },
    { img: ["img/color-1.svg", "img/color-2.svg"], txt: "Color, mechas y balayage con degradados a tu medida." },
    { img: ["img/productos-1.svg", "img/productos-2.svg"], txt: "Productos para cuidar tu cabello en casa." }
  ],
  opinionesAlFinal: true, // la sección de opiniones va al pie, después del contacto
  cintaManual: true, // la cinta de reseñas se puede desplazar a mano
  fuentes: ["Jost:wght@300;400;500;600"],
  tema: { bg: "#fcfcfb", fg: "#2f2f2f", acento: "#872b39", suave: "#6a6a6a", titulo: '"Jost"', texto: '"Jost"', esquema: "light", radio: "999px", trazo: 1.5 },
  logo: "logo.svg",
  logoAlt: "Logo de Vanlé Salón",
  hero: {
    titulo: `<span class="a">VANLÉ</span><span class="b">SALÓN SAN MIGUEL</span>
    <svg class="ring" viewBox="0 0 200 200" aria-hidden="true"><circle pathLength="1" cx="100" cy="100" r="96"/></svg>`,
    bajada: "Tu cabello, tus reglas… y un precio justo."
  },
  efecto: {
    // El aro granate del logo se dibuja grande detrás del título al cargar.
    css: `/* Fondo: manchas suaves en rosa y granate que flotan despacio */
body::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; inset: -15%;
  background: radial-gradient(38% 38% at 15% 25%, rgba(135, 43, 57, .13), transparent 70%), radial-gradient(34% 34% at 85% 20%, rgba(229, 178, 182, .38), transparent 70%), radial-gradient(40% 40% at 60% 90%, rgba(135, 43, 57, .09), transparent 70%); }
@media (prefers-reduced-motion: no-preference) { body::before { animation: flota 26s ease-in-out infinite alternate; } @keyframes flota { to { transform: translate3d(5%, -4%, 0) rotate(8deg) scale(1.1); } } }
.hero h1 { display: grid; gap: 10px; font-weight: 300; }
.hero h1 .a { font-size: clamp(56px, 14vw, 170px); letter-spacing: .08em; line-height: 1; color: #4a4a4a; }
.hero h1 .b { font-size: clamp(14px, 2.2vw, 24px); letter-spacing: .6em; font-weight: 400; color: var(--acento); }
.hero .ring { position: absolute; right: -4vw; top: 50%; width: min(58vw, 620px); transform: translateY(-50%); fill: none; stroke: var(--acento); stroke-width: 1.1; stroke-dasharray: 1; stroke-dashoffset: 0; opacity: .85; pointer-events: none; z-index: -1; }
.hero-in { position: static; }
.hero { isolation: isolate; }
.sv span { font-weight: 500; }
.val .n { font-weight: 300; color: var(--acento); }
@media (prefers-reduced-motion: no-preference) {
  .hero .ring { stroke-dashoffset: 1; animation: aro 2.8s .2s cubic-bezier(.4, 0, .2, 1) forwards; }
  @keyframes aro { to { stroke-dashoffset: 0; } }
}
/* Logo del encabezado: cuando la persona está quieta y la página está arriba, el logo respira con un halo granate, dos ondas se expanden desde el aro y un destello recorre el borde (3,6 s en bucle). No depende de "reducir movimiento": es un detalle decorativo que la persona apaga al moverse. */
.top .marca { position: relative; display: inline-block; line-height: 0; border-radius: 50%; }
.top .marca::before, .top .marca::after { content: ""; position: absolute; inset: 0; border-radius: 50%; border: 3px solid #872b39; opacity: 0; pointer-events: none; }
.marca svg .barrido { fill: none; stroke: #f6c4ca; stroke-width: 11; stroke-linecap: round; stroke-dasharray: .22 .78; stroke-dashoffset: 0; opacity: 0; transform: rotate(-90deg); transform-origin: 100px 100px; transition: opacity .35s ease; }
html.quieto .top .marca svg { animation: respira 3.6s ease-in-out infinite; }
html.quieto .top .marca::before { animation: onda 3.6s cubic-bezier(.23, 1, .32, 1) infinite; }
html.quieto .top .marca::after { animation: onda 3.6s 1.8s cubic-bezier(.23, 1, .32, 1) infinite; }
html.quieto .marca svg .barrido { opacity: 1; animation: barrido 3.6s cubic-bezier(.45, 0, .25, 1) infinite; }
html.quieto .marca svg path { animation: latido 3.6s ease-in-out infinite; }
@keyframes respira { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(135, 43, 57, 0)); } 50% { transform: scale(1.14); filter: drop-shadow(0 0 7px rgba(135, 43, 57, .6)); } }
@keyframes onda { 0% { transform: scale(1); opacity: .85; } 80%, 100% { transform: scale(2.3); opacity: 0; } }
@keyframes barrido { to { stroke-dashoffset: -1; } }
@keyframes latido { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }`,
    js: `(function () {
  var logo = document.querySelector(".marca svg");
  if (!logo) return;
  var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  c.setAttribute("class", "barrido"); c.setAttribute("cx", "100"); c.setAttribute("cy", "100"); c.setAttribute("r", "96"); c.setAttribute("pathLength", "1");
  logo.appendChild(c);
})();`
  }
};
