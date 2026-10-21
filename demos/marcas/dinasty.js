// Dinasty Barbershop: blanco con dorado, sans ancha en mayúsculas pesadas, estilo guerrero; destellos dorados que cruzan como espadas.
module.exports = {
  id: "dinasty",
  fuentes: ["Archivo Black", "Archivo:wght@400;500;600"],
  tema: { bg: "#fefdfc", fg: "#1d1810", acento: "#b97a17", suave: "#6f6554", titulo: '"Archivo Black", "Archivo", sans-serif', texto: '"Archivo"', esquema: "light", radio: "2px", trazo: 1.8 },
  logo: "logo.jpg",
  logoAlt: "Logo de Dinasty Barbershop",
  hero: {
    titulo: `<span class="a">DINASTY</span><span class="b">BARBERSHOP</span>
    <svg class="esp" viewBox="0 0 200 200" aria-hidden="true"><path pathLength="1" d="M20 180 180 20M20 20 180 180"/></svg>`,
    bajada: "Llevamos tu estilo al siguiente nivel."
  },
  efecto: {
    // Dos espadas doradas se cruzan al cargar y un destello las recorre.
    css: `/* Fondo: franjas doradas en diagonal que avanzan despacio y un brillo que sigue al cursor */
body::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background: repeating-linear-gradient(115deg, transparent 0 90px, rgba(185, 122, 23, .07) 90px 92px, transparent 92px 150px, rgba(241, 231, 212, .55) 150px 152px); background-size: 300px 100%; }
body::after { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 30%), rgba(241, 231, 212, .8), transparent 70%); }
@media (prefers-reduced-motion: no-preference) { body::before { animation: franja 18s linear infinite; } @keyframes franja { to { background-position: 300px 0; } } }
.btn, .cta { text-transform: uppercase; letter-spacing: .14em; font-size: 12px; font-weight: 600; color: #fff; }
.hero { isolation: isolate; }
.hero-in { position: static; }
.hero h1 { display: grid; gap: 6px; line-height: .95; font-weight: 400; }
.hero h1 .a { font-size: clamp(54px, 14.5vw, 190px); letter-spacing: .02em; }
.hero h1 .b { font-family: "Archivo", sans-serif; font-size: clamp(14px, 2.4vw, 26px); letter-spacing: .6em; font-weight: 600; color: var(--acento); }
.hero .esp { position: absolute; right: -2vw; top: 50%; width: min(46vw, 480px); transform: translateY(-50%); fill: none; stroke: var(--acento); stroke-width: 2.4; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 0; opacity: .35; pointer-events: none; z-index: -1; }
h2 { font-family: "Archivo Black", sans-serif; font-weight: 400; letter-spacing: -.01em; }
.sv span { font-weight: 600; }
.val .n { font-family: "Archivo Black", sans-serif; color: var(--acento); font-weight: 400; }
@media (prefers-reduced-motion: no-preference) {
  .hero .esp path { stroke-dashoffset: 1; animation: traza 1.6s .3s cubic-bezier(.5, 0, .2, 1) forwards; }
  @keyframes traza { to { stroke-dashoffset: 0; } }
  .hero h1 .a { animation: ent 1s cubic-bezier(.2, .7, .2, 1) both; }
  @keyframes ent { from { opacity: 0; transform: translateX(-40px); } }
}`,
    js: ""
  }
};
