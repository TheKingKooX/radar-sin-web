// Lapynta Barbería: crema, rojo y verde azulado con zigzag vintage, tipografía western; el zigzag corre por la portada.
const zig = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='40'%3E%3Cpath d='M0 30 20 10 40 30 60 10 80 30' fill='none' stroke='%23a93935' stroke-width='6'/%3E%3Cpath d='M0 40 20 20 40 40 60 20 80 40' fill='none' stroke='%23324b4e' stroke-width='6'/%3E%3C/svg%3E\")";
module.exports = {
  id: "lapynta",
  cinta: true, // reseñas como cinta continua con desvanecido arriba y abajo
  fuentes: ["Rye", "Josefin Sans:wght@300;400;600"],
  tema: { bg: "#ece3c6", fg: "#2a3335", acento: "#a93935", suave: "#4b5d5f", titulo: '"Rye", Georgia, serif', texto: '"Josefin Sans"', esquema: "light", radio: "4px", trazo: 1.8 },
  logo: "logo.jpg",
  logoAlt: "Logo de Lapynta Barbería",
  hero: {
    titulo: '<span class="a">LAPYNTA</span><span class="b">BARBERÍA</span>',
    bajada: "Staff de barberos profesionales a tu servicio."
  },
  efecto: {
    // Cintas en zigzag rojo y verde azulado corren arriba y abajo de la portada.
    css: `/* Fondo: crema con grano suave y una luz que sigue al cursor */
body::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(40% 40% at 15% 20%, rgba(169, 57, 53, .10), transparent 70%), radial-gradient(40% 40% at 85% 80%, rgba(50, 75, 78, .14), transparent 70%); }
body::after { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 30%), rgba(255, 252, 240, .7), transparent 70%); }
.btn, .cta { text-transform: uppercase; letter-spacing: .14em; font-size: 13px; font-weight: 600; color: #fff; }
.hero::before, .hero::after { content: ""; position: absolute; left: 0; right: 0; height: 40px; background: ${zig} 0 0 / 80px 40px repeat-x; }
.hero::before { top: 76px; } .hero::after { bottom: 0; }
.hero h1 { display: grid; gap: 8px; line-height: 1; font-weight: 400; }
.hero h1 .a { font-size: clamp(54px, 14vw, 180px); color: var(--acento); letter-spacing: .02em; }
.hero h1 .b { font-family: "Josefin Sans", sans-serif; font-size: clamp(16px, 3vw, 32px); letter-spacing: .5em; font-weight: 600; color: #324b4e; }
h2 { font-weight: 400; letter-spacing: .01em; }
.sv span { font-weight: 600; }
.val .n { color: var(--acento); font-weight: 400; }
.marca img { box-shadow: 0 0 0 2px #324b4e; }
@media (prefers-reduced-motion: no-preference) {
  .hero::before { animation: zig 6s linear infinite; } .hero::after { animation: zig 6s linear infinite reverse; }
  @keyframes zig { to { background-position: 80px 0; } }
}`,
    js: ""
  }
};
