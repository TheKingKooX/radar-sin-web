// Lima Barber Club: azul marino con dorado y marrón, estilo de club clásico tipo insignia; dos aros dorados se trazan en la portada.
module.exports = {
  id: "limabarber",
  fuentes: ["Playfair Display:wght@500;700;800", "Lato:wght@300;400;700"],
  tema: { bg: "#191d2e", fg: "#f6efe0", acento: "#b88e40", suave: "#aab0c4", titulo: '"Playfair Display", Georgia, serif', texto: '"Lato"', esquema: "dark", radio: "3px", trazo: 1.5 },
  logo: "logo.svg",
  logoAlt: "Logo de Lima Barber Club",
  hero: {
    titulo: `<span class="a">LIMA BARBER</span><span class="b">CLUB</span>
    <svg class="aro" viewBox="0 0 200 200" aria-hidden="true"><circle pathLength="1" cx="100" cy="100" r="96"/><circle pathLength="1" cx="100" cy="100" r="88"/></svg>`,
    bajada: "Como en las mejores barberías del mundo."
  },
  efecto: {
    // Dos aros dorados, como el borde de una insignia, se dibujan detrás del título.
    css: `/* Fondo: azul noche con luces doradas que derivan y un brillo que sigue al cursor */
body::before { content: ""; position: fixed; inset: -15%; z-index: -1; pointer-events: none;
  background: radial-gradient(36% 36% at 16% 24%, rgba(184, 142, 64, .14), transparent 70%), radial-gradient(34% 34% at 84% 76%, rgba(123, 76, 38, .22), transparent 70%), radial-gradient(26% 26% at 62% 12%, rgba(253, 253, 253, .05), transparent 70%); }
body::after { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(440px circle at var(--mx, 50%) var(--my, 30%), rgba(184, 142, 64, .12), transparent 70%); }
@media (prefers-reduced-motion: no-preference) { body::before { animation: oro 26s ease-in-out infinite alternate; } @keyframes oro { to { transform: translate3d(5%, -4%, 0) scale(1.1); } } }
.btn, .cta { text-transform: uppercase; letter-spacing: .16em; font-size: 12px; font-weight: 700; color: #191d2e; }
.hero { isolation: isolate; }
.hero-in { position: static; }
.hero h1 { display: grid; gap: 8px; font-weight: 700; line-height: 1; }
.hero h1 .a { font-size: clamp(48px, 12vw, 150px); letter-spacing: .02em; }
.hero h1 .b { font-size: clamp(22px, 4.4vw, 54px); letter-spacing: .5em; color: var(--acento); font-weight: 500; }
.hero .aro { position: absolute; right: -6vw; top: 50%; width: min(52vw, 560px); transform: translateY(-50%); fill: none; stroke: var(--acento); stroke-width: .8; stroke-dasharray: 1; stroke-dashoffset: 0; opacity: .7; pointer-events: none; z-index: -1; }
.top .marca::before, .top .marca::after { border-radius: 50%; }
h2 { font-weight: 700; letter-spacing: .01em; }
.sv span { font-family: "Playfair Display", serif; font-size: 22px; font-weight: 600; }
.val .n { color: var(--acento); font-weight: 700; }
@media (prefers-reduced-motion: no-preference) {
  .hero .aro circle { stroke-dashoffset: 1; animation: traza 2.8s .2s cubic-bezier(.4, 0, .2, 1) forwards; }
  .hero .aro circle:nth-child(2) { animation-delay: .5s; }
  @keyframes traza { to { stroke-dashoffset: 0; } }
}`,
    js: ""
  }
};
