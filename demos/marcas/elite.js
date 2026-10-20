// Elite Barbería: fondo blanco con textura de mármol, serif en mayúsculas muy espaciadas, líneas finas.
const mármol = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.012 .02' numOctaves='4' seed='7'/%3E%3CfeColorMatrix values='0 0 0 0 .45 0 0 0 0 .45 0 0 0 0 .45 0 0 0 .32 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
module.exports = {
  id: "elite",
  fuentes: ["Cormorant Garamond:wght@400;500;600", "Jost:wght@300;400;500"],
  tema: { bg: "#f9f9f9", fg: "#2b2b2b", acento: "#2b2b2b", suave: "#6b6b6b", titulo: '"Cormorant Garamond", Georgia, serif', texto: '"Jost"', esquema: "light", radio: "0", trazo: 1 },
  logo: "logo.svg",
  logoAlt: "Logo de Elite Barbería",
  hero: {
    titulo: '<span class="a">ELITE</span><span class="b">BARBERÍA</span>',
    bajada: "Barbería de élite, barberos de alta gama."
  },
  efecto: {
    // Textura de mármol y líneas finas que se expanden bajo el título.
    css: `/* Fondo: nubes grises suaves que derivan sobre el mármol y una luz que sigue al cursor */
body::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; inset: -20%;
  background: radial-gradient(38% 38% at 20% 30%, rgba(150, 150, 150, .20), transparent 70%), radial-gradient(34% 34% at 80% 70%, rgba(150, 150, 150, .16), transparent 70%), radial-gradient(30% 30% at 60% 15%, rgba(255, 255, 255, .8), transparent 70%); }
body::after { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 30%), rgba(255, 255, 255, .75), transparent 70%); }
@media (prefers-reduced-motion: no-preference) { body::before { animation: nubes 30s ease-in-out infinite alternate; } @keyframes nubes { to { transform: translate3d(6%, 4%, 0) rotate(5deg); } } }
.btn, .cta { text-transform: uppercase; letter-spacing: .2em; font-size: 12px; font-weight: 500; }
body { background-image: ${mármol}; background-size: 320px; }
.hero h1 { display: grid; gap: 14px; font-weight: 500; text-align: left; }
.hero h1 .a { font-size: clamp(56px, 14vw, 170px); letter-spacing: .22em; line-height: 1; }
.hero h1 .b { font-size: clamp(18px, 3.2vw, 36px); letter-spacing: .5em; font-weight: 500; }
.hero-in::after { content: ""; display: block; height: 1px; width: 100%; background: var(--fg); transform-origin: left; order: 3; opacity: .55; }
.hero .baja { font-family: "Cormorant Garamond", serif; font-size: clamp(20px, 2.6vw, 28px); font-style: italic; color: var(--fg); }
.sv span { font-family: "Cormorant Garamond", serif; font-size: 26px; font-weight: 500; }
@media (prefers-reduced-motion: no-preference) {
  .hero-in::after { animation: linea 1.6s .2s cubic-bezier(.2, .7, .2, 1) both; }
  @keyframes linea { from { transform: scaleX(0); } }
  .hero h1 .a { animation: ent 1.2s cubic-bezier(.2, .7, .2, 1) both; }
  .hero h1 .b { animation: ent 1.2s .25s cubic-bezier(.2, .7, .2, 1) both; }
  @keyframes ent { from { opacity: 0; letter-spacing: .6em; } }
}`,
    js: ""
  }
};
