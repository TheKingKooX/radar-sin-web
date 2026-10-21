// NOA Salón: negro y dorado, sans geométrica fina con «SALON» espaciado; destellos dorados que flotan.
module.exports = {
  id: "noa",
  fuentes: ["Jost:wght@200;300;400;500"],
  tema: { bg: "#0b0a08", fg: "#f4ead8", acento: "#cb964a", suave: "#a89a85", titulo: '"Jost"', texto: '"Jost"', esquema: "dark", radio: "0", trazo: 1.2 },
  logo: "logo.svg",
  logoAlt: "Logo de NOA Salón",
  hero: {
    titulo: '<span class="a">NOA</span><span class="b">SALON</span>',
    bajada: "Peluquería y belleza en Magdalena del Mar."
  },
  efecto: {
    // Una línea dorada se traza bajo el título y el fondo respira con luces doradas.
    css: `/* Fondo: luces doradas que derivan despacio y un brillo que sigue al cursor */
body::before { content: ""; position: fixed; inset: -15%; z-index: -1; pointer-events: none;
  background: radial-gradient(36% 36% at 18% 28%, rgba(203, 150, 74, .16), transparent 70%), radial-gradient(32% 32% at 82% 72%, rgba(172, 120, 53, .14), transparent 70%), radial-gradient(26% 26% at 64% 14%, rgba(203, 150, 74, .08), transparent 70%); }
body::after { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 30%), rgba(203, 150, 74, .13), transparent 70%); }
@media (prefers-reduced-motion: no-preference) { body::before { animation: oro 24s ease-in-out infinite alternate; } @keyframes oro { to { transform: translate3d(5%, -4%, 0) scale(1.12); } } }
.btn, .cta { text-transform: uppercase; letter-spacing: .22em; font-size: 12px; font-weight: 500; color: #0b0a08; }
.hero h1 { display: grid; gap: 14px; font-weight: 200; line-height: 1; }
.hero h1 .a { font-size: clamp(88px, 22vw, 280px); letter-spacing: .18em; margin-right: -.18em; color: var(--acento); }
.hero h1 .b { font-size: clamp(14px, 2.4vw, 26px); letter-spacing: .9em; font-weight: 300; color: var(--fg); }
.hero-in::after { content: ""; display: block; height: 1px; width: min(100%, 520px); background: var(--acento); transform-origin: left; opacity: .7; order: 3; }
.hero .baja { letter-spacing: .08em; font-weight: 300; }
.sv span { font-weight: 400; letter-spacing: .04em; }
.val .n { font-weight: 200; color: var(--acento); }
@media (prefers-reduced-motion: no-preference) {
  .hero-in::after { animation: linea 1.8s .3s cubic-bezier(.2, .7, .2, 1) both; }
  @keyframes linea { from { transform: scaleX(0); } }
  .hero h1 .a { animation: ent 1.4s cubic-bezier(.2, .7, .2, 1) both; }
  .hero h1 .b { animation: ent 1.4s .3s cubic-bezier(.2, .7, .2, 1) both; }
  @keyframes ent { from { opacity: 0; letter-spacing: .5em; } }
}`,
    js: ""
  }
};
