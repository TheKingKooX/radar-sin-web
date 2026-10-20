// La Barbería (Men's Club): blanco sobre negro, Montserrat en mayúsculas gruesas, bigote.
module.exports = {
  id: "labarberia",
  fuentes: ["Montserrat:wght@400;500;600;800"],
  tema: { bg: "#0d0b0b", fg: "#ffffff", acento: "#ffffff", suave: "#a8a6a4", titulo: '"Montserrat"', texto: '"Montserrat"', esquema: "dark", radio: "4px", trazo: 2.2 },
  logo: "logo.svg",
  logoAlt: "Logo de La Barbería Men's Club",
  hero: {
    titulo: `<span class="a">LA BARBERIA</span><span class="b">MEN'S CLUB</span>
    <svg class="bg-b" viewBox="0 0 120 40" aria-hidden="true"><path pathLength="1" d="M60 22c-7-10-20-12-34-5-9 5-19 6-24 4 9 16 26 21 40 12 7-4 12-8 18-11zm0 0c7-10 20-12 34-5 9 5 19 6 24 4-9 16-26 21-40 12-7-4-12-8-18-11z"/></svg>`,
    bajada: "Creada para todo el público masculino, la mejor opción para un buen corte."
  },
  efecto: {
    // El bigote se dibuja al cargar y una cinta con los servicios corre bajo la portada.
    css: `/* Fondo: franjas de poste de barbero que avanzan despacio */
body::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, .045) 25%, transparent 25% 50%, rgba(255, 255, 255, .045) 50% 75%, transparent 75%) 0 0 / 72px 72px; }
body::after { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(ellipse at 50% 0, transparent 30%, #0d0b0b 95%); }
@media (prefers-reduced-motion: no-preference) { body::before { animation: poste 6s linear infinite; } @keyframes poste { to { background-position: 72px 0; } } }
.btn, .cta { text-transform: uppercase; letter-spacing: .08em; font-size: 14px; }
.hero h1 { display: grid; gap: 6px; font-weight: 800; line-height: .92; }
.hero h1 .a { font-size: clamp(48px, 12vw, 150px); letter-spacing: -.02em; }
.hero h1 .b { font-size: clamp(16px, 2.6vw, 30px); letter-spacing: .5em; font-weight: 500; color: var(--suave); }
.hero .bg-b { width: clamp(120px, 22vw, 260px); margin-top: 12px; fill: none; stroke: #fff; stroke-width: 1.6; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 0; }
.marq { overflow: hidden; border-block: 1px solid color-mix(in srgb, #fff 18%, transparent); padding: 16px 0; white-space: nowrap; }
.marq div { display: inline-block; }
.marq span { font-size: 22px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; margin: 0 28px; }
.marq span::before { content: "✂"; margin-right: 28px; color: var(--suave); }
@media (prefers-reduced-motion: no-preference) {
  .hero .bg-b { stroke-dashoffset: 1; animation: traza 2.2s .3s ease forwards; }
  @keyframes traza { to { stroke-dashoffset: 0; } }
  .marq div { animation: corre 28s linear infinite; }
  @keyframes corre { to { transform: translateX(-50%); } }
}`,
    js: `(function () {
  var s = [].map.call(document.querySelectorAll(".sv span"), function (e) { return e.textContent; });
  if (!s.length) return;
  var fila = s.concat(s, s, s).map(function (t) { return "<span>" + t + "</span>"; }).join("");
  var m = document.createElement("div"); m.className = "marq"; m.setAttribute("aria-hidden", "true");
  m.innerHTML = "<div>" + fila + fila + "</div>";
  document.querySelector(".hero").after(m);
})();`
  }
};
