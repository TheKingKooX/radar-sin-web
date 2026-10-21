// Emy's Salon: rojo vivo y blanco, trazo cursivo llamativo y cálido; manchas rojas y rosas que flotan.
module.exports = {
  id: "emys",
  sinFaq: true, // sin sección de preguntas frecuentes
  fusionUbicacion: true, // ubicación y opiniones en una sola sección, al pie
  fuentes: ["Pacifico", "Nunito:wght@300;400;600;700"],
  tema: { bg: "#fff8f6", fg: "#3a1414", acento: "#d8090b", suave: "#7a4a4a", titulo: '"Pacifico", cursive', texto: '"Nunito"', esquema: "light", radio: "999px", trazo: 1.6 },
  logo: "logo.svg",
  logoAlt: "Logo de Emy's Salon",
  hero: {
    titulo: `<span class="a">Emy's</span><span class="b">Salón &amp; Spa</span>`,
    bajada: "24 años de trayectoria en el rubro de la belleza."
  },
  efecto: {
    // El nombre en cursiva entra con un trazo suave; el fondo se llena de manchas cálidas.
    css: `/* Fondo: manchas rojas y rosadas que flotan despacio y un brillo que sigue al cursor */
body::before { content: ""; position: fixed; inset: -15%; z-index: -1; pointer-events: none;
  background: radial-gradient(36% 36% at 14% 24%, rgba(252, 2, 3, .12), transparent 70%), radial-gradient(34% 34% at 86% 18%, rgba(255, 170, 170, .38), transparent 70%), radial-gradient(40% 40% at 62% 88%, rgba(216, 9, 11, .10), transparent 70%); }
body::after { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 30%), rgba(255, 255, 255, .8), transparent 70%); }
@media (prefers-reduced-motion: no-preference) { body::before { animation: flota 24s ease-in-out infinite alternate; } @keyframes flota { to { transform: translate3d(5%, -4%, 0) rotate(6deg) scale(1.1); } } }
.btn:not(.sec), .cta { color: #fff; }
.hero h1 { display: grid; gap: 4px; font-weight: 400; line-height: 1.05; }
.hero h1 .a { font-size: clamp(76px, 20vw, 250px); color: var(--acento); letter-spacing: 0; }
.hero h1 .b { font-family: "Nunito", sans-serif; font-size: clamp(16px, 3vw, 32px); letter-spacing: .45em; text-transform: uppercase; font-weight: 600; color: var(--fg); }
h2 { font-weight: 400; letter-spacing: 0; font-size: clamp(34px, 5.4vw, 60px); }
.sv span { font-weight: 700; }
.val .n { color: var(--acento); font-weight: 400; font-family: "Pacifico", cursive; }
@media (prefers-reduced-motion: no-preference) {
  .hero h1 .a { animation: ent 1.2s cubic-bezier(.23, 1, .32, 1) both; }
  .hero h1 .b { animation: ent 1.2s .25s cubic-bezier(.23, 1, .32, 1) both; }
  @keyframes ent { from { opacity: 0; transform: translateX(-24px) rotate(-2deg); } }
}`,
    js: ""
  }
};
