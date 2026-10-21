// Black Fade Studio: blanco sobre negro, letra gótica estilo grafiti para «Black», estética urbana; un degradado de fade recorre el fondo.
module.exports = {
  id: "blackfade",
  fuentes: ["UnifrakturCook:wght@700", "Chivo:wght@300;400;500;700"],
  tema: { bg: "#050505", fg: "#f3f3f3", acento: "#f3f3f3", suave: "#9a9a9a", titulo: '"UnifrakturCook", "Old English Text MT", serif', texto: '"Chivo"', esquema: "dark", radio: "0", trazo: 2 },
  logo: "logo.svg",
  logoAlt: "Logo de Black Fade Studio",
  hero: {
    titulo: '<span class="a">Black</span><span class="b">FADE STUDIO</span>',
    bajada: "Mereces verte bien."
  },
  efecto: {
    // Un degradado de negro a gris, como un fade de máquina, sube y baja por la portada.
    css: `/* Fondo: bandas verticales de gris que respiran, como un degradado de fade, y una luz que sigue al cursor */
body::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background: linear-gradient(180deg, #050505 0, #1a1a1a 38%, #050505 100%); background-size: 100% 220%; }
body::after { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(460px circle at var(--mx, 50%) var(--my, 30%), rgba(255, 255, 255, .08), transparent 70%); }
@media (prefers-reduced-motion: no-preference) { body::before { animation: fade 14s ease-in-out infinite alternate; } @keyframes fade { to { background-position: 0 100%; } } }
.btn, .cta { text-transform: uppercase; letter-spacing: .18em; font-size: 12px; font-weight: 700; color: #050505; }
.hero h1 { display: grid; gap: 6px; line-height: .9; font-weight: 700; }
.hero h1 .a { font-size: clamp(90px, 24vw, 300px); letter-spacing: 0; }
.hero h1 .b { font-family: "Chivo", sans-serif; font-size: clamp(16px, 3vw, 34px); letter-spacing: .6em; font-weight: 300; color: var(--suave); }
h2 { font-weight: 700; letter-spacing: 0; font-size: clamp(40px, 6vw, 72px); }
.sv span { font-family: "Chivo", sans-serif; font-weight: 500; }
.val .n { font-weight: 700; }
@media (prefers-reduced-motion: no-preference) {
  .hero h1 .a { animation: ent 1.2s cubic-bezier(.23, 1, .32, 1) both; }
  .hero h1 .b { animation: ent 1.2s .2s cubic-bezier(.23, 1, .32, 1) both; }
  @keyframes ent { from { opacity: 0; transform: translateY(18px); } }
}`,
    js: ""
  }
};
