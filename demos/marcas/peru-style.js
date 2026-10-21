// Barbería Perú Style: blanco sobre negro, sans condensada en mayúsculas gruesas, bigote; un rótulo grande en contorno corre detrás de la portada.
module.exports = {
  id: "peru-style",
  fuentes: ["Bebas Neue", "Barlow:wght@400;500;600"],
  tema: { bg: "#070707", fg: "#ffffff", acento: "#ffffff", suave: "#a2a2a2", titulo: '"Bebas Neue", Impact, sans-serif', texto: '"Barlow"', esquema: "dark", radio: "2px", trazo: 2 },
  logo: "logo.svg",
  logoAlt: "Logo de Barbería Perú Style",
  hero: {
    titulo: `<span class="rot" aria-hidden="true">PERÚ STYLE · PERÚ STYLE · PERÚ STYLE ·</span><span class="a">PERÚ STYLE</span><span class="b">BARBERÍA</span>`,
    bajada: "Buenas charlas, atención personalizada y ambientes amenos."
  },
  efecto: {
    // Un rótulo en contorno se desplaza lento detrás del título.
    css: `/* Fondo: negro con grano de franjas finas y un brillo que sigue al cursor */
body::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(520px circle at var(--mx, 50%) var(--my, 30%), rgba(255, 255, 255, .09), transparent 70%); }
body::after { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: repeating-linear-gradient(0deg, transparent 0 3px, rgba(255, 255, 255, .02) 3px 4px); }
.btn, .cta { text-transform: uppercase; letter-spacing: .14em; font-size: 13px; font-weight: 600; color: #070707; }
.hero { isolation: isolate; }
.hero h1 { display: grid; gap: 4px; line-height: .9; font-weight: 400; position: relative; }
.hero h1 .a { font-size: clamp(76px, 20vw, 250px); letter-spacing: .01em; }
.hero h1 .b { font-size: clamp(22px, 4.4vw, 52px); letter-spacing: .5em; color: var(--suave); }
.hero h1 .rot { position: absolute; left: 0; top: -.35em; white-space: nowrap; font-size: clamp(60px, 12vw, 150px); color: transparent; -webkit-text-stroke: 1px rgba(255, 255, 255, .18); z-index: -1; pointer-events: none; }
h2 { letter-spacing: .02em; font-weight: 400; font-size: clamp(38px, 6vw, 72px); }
.sv span { font-family: "Bebas Neue", sans-serif; font-size: 28px; font-weight: 400; letter-spacing: .03em; }
.val .n { font-weight: 400; }
@media (prefers-reduced-motion: no-preference) {
  .hero h1 .rot { animation: rotulo 40s linear infinite; }
  @keyframes rotulo { from { transform: translateX(0); } to { transform: translateX(-40%); } }
}`,
    js: ""
  }
};
