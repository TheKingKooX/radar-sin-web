// Barone Barbería Premium: dorado sobre negro, serif romana en mayúsculas, corona y barba; la corona se traza al cargar.
module.exports = {
  id: "barone",
  fuentes: ["Cinzel:wght@500;600;700", "Lato:wght@300;400;700"],
  tema: { bg: "#050403", fg: "#f3e7c9", acento: "#e2ad49", suave: "#b79a5e", titulo: '"Cinzel", Georgia, serif', texto: '"Lato"', esquema: "dark", radio: "2px", trazo: 1.4 },
  logo: "logo.svg",
  logoAlt: "Logo de Barone Barbería Premium",
  hero: {
    titulo: `<svg class="corona" viewBox="0 0 120 70" aria-hidden="true"><path pathLength="1" d="M10 58 6 18l26 20 28-30 28 30 26-20-4 40Z"/><path pathLength="1" d="M10 66h100"/></svg>
    <span class="a">BARONE</span><span class="b">BARBERÍA PREMIUM</span>`,
    bajada: "Valora tu tiempo en la silla, conoce tu estilo."
  },
  efecto: {
    // La corona dorada se dibuja sobre el título y el fondo brilla como metal.
    css: `/* Fondo: destellos dorados que derivan y una luz cálida que sigue al cursor */
body::before { content: ""; position: fixed; inset: -15%; z-index: -1; pointer-events: none;
  background: radial-gradient(34% 34% at 14% 22%, rgba(226, 173, 73, .15), transparent 70%), radial-gradient(30% 30% at 86% 78%, rgba(141, 110, 51, .20), transparent 70%), radial-gradient(22% 22% at 60% 12%, rgba(226, 173, 73, .08), transparent 70%); }
body::after { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 30%), rgba(226, 173, 73, .12), transparent 70%); }
@media (prefers-reduced-motion: no-preference) { body::before { animation: brillo 22s ease-in-out infinite alternate; } @keyframes brillo { to { transform: translate3d(5%, -4%, 0) scale(1.12); } } }
.btn, .cta { text-transform: uppercase; letter-spacing: .16em; font-size: 12px; font-weight: 700; color: #050403; }
.hero h1 { display: grid; gap: 10px; font-weight: 600; line-height: 1; justify-items: start; }
.hero h1 .corona { width: clamp(70px, 11vw, 130px); fill: none; stroke: var(--acento); stroke-width: 2.2; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 0; margin-bottom: 8px; }
.hero h1 .a { font-size: clamp(56px, 14vw, 180px); letter-spacing: .1em; color: var(--acento); }
.hero h1 .b { font-size: clamp(14px, 2.4vw, 26px); letter-spacing: .5em; color: var(--fg); font-weight: 500; }
h2 { font-weight: 600; letter-spacing: .04em; }
.sv span { font-family: "Cinzel", serif; font-size: 19px; font-weight: 600; letter-spacing: .04em; }
.val .n { color: var(--acento); font-weight: 500; }
@media (prefers-reduced-motion: no-preference) {
  .hero h1 .corona { stroke-dashoffset: 1; animation: traza 2.4s .2s cubic-bezier(.4, 0, .2, 1) forwards; }
  .hero h1 .a { animation: ent 1.4s .4s cubic-bezier(.2, .7, .2, 1) both; }
  @keyframes traza { to { stroke-dashoffset: 0; } }
  @keyframes ent { from { opacity: 0; letter-spacing: .3em; } }
}`,
    js: ""
  }
};
