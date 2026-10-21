// Lapynta Salón: negro, rombo con monograma «LP» y «LAPYNTA» espaciado en blanco; rombos concéntricos que giran despacio.
module.exports = {
  id: "lapynta-salon",
  fuentes: ["Montserrat:wght@200;300;400;500;600"],
  tema: { bg: "#050505", fg: "#ffffff", acento: "#ffffff", suave: "#9c9c9c", titulo: '"Montserrat"', texto: '"Montserrat"', esquema: "dark", radio: "0", trazo: 1.2 },
  logo: "logo.svg",
  logoAlt: "Logo de Lapynta Salón",
  hero: {
    titulo: `<span class="a">LAPYNTA</span><span class="b">SALÓN</span>
    <svg class="rom" viewBox="0 0 200 200" aria-hidden="true"><path pathLength="1" d="M100 6 194 100 100 194 6 100Z"/><path pathLength="1" d="M100 34 166 100 100 166 34 100Z"/><path pathLength="1" d="M100 62 138 100 100 138 62 100Z"/></svg>`,
    bajada: "Un lugar pensado en ti."
  },
  efecto: {
    // Tres rombos se dibujan detrás del título y giran muy despacio.
    css: `/* Fondo: negro con un resplandor gris que sigue al cursor */
body::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(520px circle at var(--mx, 50%) var(--my, 30%), rgba(255, 255, 255, .08), transparent 70%); }
body::after { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: repeating-linear-gradient(45deg, transparent 0 46px, rgba(255, 255, 255, .025) 46px 47px); }
.btn, .cta { text-transform: uppercase; letter-spacing: .24em; font-size: 12px; font-weight: 500; }
.hero { isolation: isolate; }
.hero-in { position: static; }
.hero h1 { display: grid; gap: 12px; font-weight: 300; line-height: 1; }
.hero h1 .a { font-size: clamp(52px, 13vw, 170px); letter-spacing: .3em; margin-right: -.3em; }
.hero h1 .b { font-size: clamp(13px, 2vw, 22px); letter-spacing: .8em; color: var(--suave); font-weight: 400; }
.hero .rom { position: absolute; right: -5vw; top: 50%; width: min(56vw, 600px); transform: translateY(-50%); fill: none; stroke: #fff; stroke-width: .6; stroke-dasharray: 1; stroke-dashoffset: 0; opacity: .5; pointer-events: none; z-index: -1; }
.sv span { font-weight: 400; letter-spacing: .03em; }
.val .n { font-weight: 200; }
@media (prefers-reduced-motion: no-preference) {
  .hero .rom path { stroke-dashoffset: 1; animation: traza 2.6s .2s cubic-bezier(.4, 0, .2, 1) forwards; }
  .hero .rom path:nth-child(2) { animation-delay: .5s; } .hero .rom path:nth-child(3) { animation-delay: .8s; }
  .hero .rom { animation: gira 90s linear infinite; }
  @keyframes traza { to { stroke-dashoffset: 0; } }
  @keyframes gira { to { transform: translateY(-50%) rotate(360deg); } }
}`,
    js: ""
  }
};
