// Barbería Emmanuel: negro cálido, crema y dorado, Cinzel + Cormorant; brillo de lámina dorada sobre el monograma.
const ruido = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' seed='3'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 .95 0 0 0 0 .8 0 0 0 .06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
module.exports = {
  id: "emmanuel",
  fuentes: ["Cinzel:wght@500;600;700", "Cormorant Garamond:wght@400;500;600"],
  tema: { bg: "#110d0c", fg: "#ecebcb", acento: "#c9a95a", suave: "#b9b3a0", titulo: '"Cinzel", serif', texto: '"Cormorant Garamond", Georgia, serif', esquema: "dark", radio: "2px", trazo: 1.3 },
  logo: "logo.svg",
  logoAlt: "Logo de Barbería Emmanuel",
  hero: {
    titulo: '<span class="mono" aria-hidden="true">EM</span><span class="a">Barbería</span><span class="b">EMMANUEL</span>',
    bajada: "Corte para adultos y niños, y tratamiento completo."
  },
  efecto: {
    // Un brillo dorado recorre el monograma y el nombre, como una lámina metálica.
    css: `/* Fondo: polvo dorado que asciende despacio en dos capas */
body::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background-image: radial-gradient(circle, rgba(233, 215, 154, .7) 0 1px, transparent 1.7px), radial-gradient(circle, rgba(201, 169, 90, .55) 0 1.3px, transparent 2.2px);
  background-size: 120px 120px, 190px 190px; background-position: 0 0, 40px 70px; opacity: .55; }
body::after { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background-image: radial-gradient(circle, rgba(233, 215, 154, .38) 0 2px, transparent 5px); background-size: 280px 280px; background-position: 90px 30px; opacity: .6; }
@media (prefers-reduced-motion: no-preference) {
  body::before { animation: polvo 40s linear infinite; } body::after { animation: polvo2 70s linear infinite; }
  @keyframes polvo { to { background-position: 0 -120px, 40px -120px; } }
  @keyframes polvo2 { to { background-position: 90px -250px; } }
}
.btn:not(.sec), .cta { background: linear-gradient(120deg, #8a6f2f, #e9d79a 45%, #c9a95a); border-color: #c9a95a; color: #110d0c; }
.btn { letter-spacing: .12em; text-transform: uppercase; font-size: 13px; font-family: "Cinzel", serif; }
body { background-image: ${ruido}; }
body { font-size: 19px; }
.hero h1 { display: grid; gap: 8px; font-weight: 600; }
.foil, .hero h1 .mono, .hero h1 .b { background: linear-gradient(100deg, #8a6f2f 0%, #f4efd0 30%, #c9a95a 50%, #f4efd0 70%, #8a6f2f 100%); background-size: 250% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; }
.hero h1 .mono { font-size: clamp(90px, 20vw, 240px); font-weight: 700; letter-spacing: -.06em; line-height: .9; }
.hero h1 .a { font-size: clamp(16px, 2.6vw, 28px); letter-spacing: .5em; text-transform: uppercase; color: var(--suave); font-weight: 500; }
.hero h1 .b { font-size: clamp(34px, 8vw, 96px); letter-spacing: .08em; font-weight: 700; }
.sv span { font-family: "Cormorant Garamond", serif; font-size: 25px; }
.lbl { color: var(--acento); }
@media (prefers-reduced-motion: no-preference) {
  .hero h1 .mono, .hero h1 .b { animation: lamina 6s ease-in-out infinite alternate; }
  @keyframes lamina { from { background-position: 100% 0; } to { background-position: 0 0; } }
}`,
    js: ""
  }
};
