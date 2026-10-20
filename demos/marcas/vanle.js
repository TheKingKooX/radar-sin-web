// Vanlé Salón San Miguel: blanco, granate y gris, Jost fino; el aro del logo se dibuja en la portada.
module.exports = {
  id: "vanle",
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
}`,
    js: ""
  }
};
