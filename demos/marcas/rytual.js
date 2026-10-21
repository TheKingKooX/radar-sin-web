// Barbería Rytual by Steffano Negrette: azul marino, serif blanca de trazo fino; humo azul que deriva y anillos tipo ritual.
module.exports = {
  id: "rytual",
  fuentes: ["Cormorant Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400", "Jost:wght@300;400;500"],
  tema: { bg: "#0a2964", fg: "#ffffff", acento: "#ffffff", suave: "#b4bdd0", titulo: '"Cormorant Garamond", Georgia, serif', texto: '"Jost"', esquema: "dark", radio: "0", trazo: 1.1 },
  logo: "logo.svg",
  logoAlt: "Logo de Barbería Rytual by Steffano Negrette",
  hero: {
    titulo: `<span class="a">RYTUAL</span><span class="b">by Steffano Negrette</span>
    <svg class="anillo" viewBox="0 0 200 200" aria-hidden="true"><circle pathLength="1" cx="100" cy="100" r="96"/><circle pathLength="1" cx="100" cy="100" r="70"/></svg>`,
    bajada: "Reinventamos el concepto de la barbería para una experiencia única."
  },
  efecto: {
    // Dos anillos finos se trazan detrás del título; el fondo se mueve como humo azul.
    css: `/* Fondo: humo azul claro que deriva y una luz que sigue al cursor */
body::before { content: ""; position: fixed; inset: -20%; z-index: -1; pointer-events: none;
  background: radial-gradient(34% 34% at 20% 30%, rgba(139, 151, 174, .30), transparent 70%), radial-gradient(38% 38% at 80% 65%, rgba(60, 100, 190, .38), transparent 70%), radial-gradient(28% 28% at 55% 10%, rgba(255, 255, 255, .08), transparent 70%); }
body::after { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(460px circle at var(--mx, 50%) var(--my, 30%), rgba(255, 255, 255, .10), transparent 70%); }
@media (prefers-reduced-motion: no-preference) { body::before { animation: humo 28s ease-in-out infinite alternate; } @keyframes humo { to { transform: translate3d(7%, -5%, 0) rotate(7deg) scale(1.15); } } }
.btn, .cta { text-transform: uppercase; letter-spacing: .2em; font-size: 12px; font-weight: 500; color: #0a2964; }
.hero { isolation: isolate; }
.hero-in { position: static; }
.hero h1 { display: grid; gap: 8px; font-weight: 300; line-height: 1; }
.hero h1 .a { font-size: clamp(64px, 17vw, 220px); letter-spacing: .12em; margin-right: -.12em; }
.hero h1 .b { font-size: clamp(18px, 3vw, 34px); font-style: italic; font-weight: 300; color: var(--suave); letter-spacing: .06em; }
.hero .anillo { position: absolute; right: -6vw; top: 50%; width: min(56vw, 600px); transform: translateY(-50%); fill: none; stroke: #fff; stroke-width: .5; stroke-dasharray: 1; stroke-dashoffset: 0; opacity: .6; pointer-events: none; z-index: -1; }
.hero .baja { font-family: "Cormorant Garamond", serif; font-style: italic; font-size: clamp(20px, 2.6vw, 28px); color: var(--fg); }
h2 { font-weight: 400; letter-spacing: .02em; }
.sv span { font-family: "Cormorant Garamond", serif; font-size: 26px; font-weight: 400; }
.val .n { font-weight: 300; }
@media (prefers-reduced-motion: no-preference) {
  .hero .anillo circle { stroke-dashoffset: 1; animation: traza 3s .2s cubic-bezier(.4, 0, .2, 1) forwards; }
  .hero .anillo circle:nth-child(2) { animation-delay: .6s; }
  @keyframes traza { to { stroke-dashoffset: 0; } }
}`,
    js: ""
  }
};
