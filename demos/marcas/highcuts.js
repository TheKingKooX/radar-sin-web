// Highcuts Barber Shop: blanco y negro, Poppins en dos pesos (HIGH en negrita, CUTS en fino).
module.exports = {
  id: "highcuts",
  fuentes: ["Poppins:wght@300;400;600;700;800"],
  tema: { bg: "#000000", fg: "#fdfdfd", acento: "#fdfdfd", suave: "#afafaf", titulo: '"Poppins"', texto: '"Poppins"', esquema: "dark", radio: "999px", trazo: 2.2 },
  logo: "logo.jpg",
  logoAlt: "Logo de Highcuts Barber Shop",
  hero: {
    titulo: '<span class="a">HIGH</span><br><span class="b">CUTS</span>',
    bajada: "El estilo es una forma de decir quién eres sin tener que hablar."
  },
  efecto: {
    // "HIGH CUTS" crece y se desvanece al bajar por la portada.
    css: `/* Fondo: rejilla diagonal que se desliza y un foco de luz que sigue al cursor */
body::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 30%), rgba(255, 255, 255, .10), transparent 70%),
    linear-gradient(135deg, transparent 49.2%, rgba(255, 255, 255, .07) 50%, transparent 50.8%) 0 0 / 64px 64px; }
@media (prefers-reduced-motion: no-preference) { body::before { animation: rejilla 9s linear infinite; } @keyframes rejilla { to { background-position: 0 0, 64px 64px; } } }
.hero h1 { line-height: .9; transform: scale(calc(1 + var(--p, 0) * .4)); opacity: calc(1 - var(--p, 0) * .7); }
.hero h1 .a { font-weight: 800; } .hero h1 .b { font-weight: 300; }`,
    js: `(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var h = document.querySelector(".hero"), esp = false;
  function f() { h.style.setProperty("--p", Math.min(1, scrollY / (h.offsetHeight * .7)).toFixed(3)); esp = false; }
  addEventListener("scroll", function () { if (!esp) { esp = true; requestAnimationFrame(f); } }, { passive: true });
})();`
  }
};
