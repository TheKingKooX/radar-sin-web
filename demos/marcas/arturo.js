// Salón de Belleza Arturo: gris plata y acero, logo original 3D metalizado, brillo que barre el logo.
module.exports = {
  id: "arturo",
  fuentes: ["Montserrat:wght@300;400;500;600", "Great Vibes"],
  tema: { bg: "#e9e9e9", fg: "#22262b", acento: "#4d5258", suave: "#4d5258", titulo: '"Great Vibes", cursive', texto: '"Montserrat"', esquema: "light", radio: "999px", trazo: 1.2 },
  logo: "logo.jpg",
  logoAlt: "Logo de Arturo Salón & Spa",
  hero: {
    titulo: '<span class="lg"><img src="logo.jpg" alt=""></span>',
    bajada: "Cabello y tinte en San Miguel."
  },
  efecto: {
    // Un destello metálico recorre el logo cada pocos segundos.
    css: `/* Fondo: brillo de metal cepillado que barre la página y un reflejo que sigue al cursor */
body::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background: linear-gradient(115deg, transparent 0, rgba(255, 255, 255, .6) 18%, transparent 36%, rgba(77, 82, 88, .09) 58%, transparent 78%, rgba(255, 255, 255, .55) 100%) 0 0 / 300% 100%; }
body::after { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(380px circle at var(--mx, 50%) var(--my, 30%), rgba(255, 255, 255, .7), transparent 70%); }
@media (prefers-reduced-motion: no-preference) { body::before { animation: metal 22s ease-in-out infinite alternate; } @keyframes metal { to { background-position: 100% 0; } } }
.btn:not(.sec), .cta { background: linear-gradient(135deg, #7b8188, #3f444a); border-color: #4d5258; }
.hero h1 { line-height: 1; letter-spacing: 0; }
.lg { position: relative; display: block; width: clamp(300px, 62vw, 800px); overflow: hidden; border-radius: 22px; box-shadow: 0 30px 60px -30px rgba(34, 38, 43, .45); }
.lg img { width: 100%; height: auto; }
.lg::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(105deg, transparent 38%, rgba(255, 255, 255, .95) 50%, transparent 62%); background-size: 260% 100%; background-position: 130% 0; mix-blend-mode: overlay; }
h2, .val .n { font-family: "Great Vibes", cursive; font-weight: 400; letter-spacing: 0; }
h2 { font-size: clamp(40px, 6vw, 68px); }
.lbl, .sv b, .why h3, .pasos h3, .gal figcaption, .pasos .num { font-family: "Montserrat"; font-weight: 500; }
.why h3, .pasos h3 { font-size: 19px; }
.hero .baja { font-weight: 300; letter-spacing: .06em; }
@media (prefers-reduced-motion: no-preference) {
  .lg::after { animation: brillo 5s 1s ease-in-out infinite; }
  @keyframes brillo { 0% { background-position: 130% 0; } 45%, 100% { background-position: -30% 0; } }
}`,
    js: ""
  }
};
