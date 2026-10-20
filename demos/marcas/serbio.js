// El Serbio Barbershop: negro humo, gris y rojo; Bebas Neue + Inter; humo que deriva sobre la portada.
module.exports = {
  id: "serbio",
  fuentes: ["Bebas Neue", "Inter:wght@400;500;600"],
  tema: { bg: "#131313", fg: "#f1f1f1", acento: "#c6363c", suave: "#a9a9a9", titulo: '"Bebas Neue", Impact, sans-serif', texto: '"Inter"', esquema: "dark", radio: "6px", trazo: 2.2 },
  logo: "logo.svg",
  logoAlt: "Logo de El Serbio Barbershop",
  hero: {
    titulo: '<span class="a">EL SERBIO</span><span class="b">BARBER SHOP</span>',
    bajada: "Capacitados para darte la mejor experiencia."
  },
  efecto: {
    // Manchas de humo desenfocadas, grises y con un toque rojo, derivan detrás del título.
    css: `/* Fondo: humo gris y rojo que deriva por toda la página, con grano de película */
body::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; inset: -20%;
  background: radial-gradient(40% 40% at 20% 30%, rgba(150, 150, 150, .15), transparent 70%), radial-gradient(36% 36% at 85% 60%, rgba(198, 54, 60, .13), transparent 70%), radial-gradient(45% 45% at 50% 100%, rgba(150, 150, 150, .10), transparent 70%); }
body::after { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; opacity: .5; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
@media (prefers-reduced-motion: no-preference) { body::before { animation: humo 22s ease-in-out infinite alternate; } @keyframes humo { to { transform: translate3d(7%, 5%, 0) rotate(-6deg) scale(1.12); } } }
.btn, .cta { text-transform: uppercase; letter-spacing: .1em; font-size: 14px; }
.btn, .cta { color: #fff; }
.btn.sec { color: var(--fg); }
.hero h1 { display: grid; gap: 4px; font-weight: 400; }
.hero h1 .a { font-size: clamp(72px, 19vw, 240px); letter-spacing: .02em; line-height: .88; }
.hero h1 .b { font-size: clamp(20px, 3.4vw, 40px); letter-spacing: .5em; color: var(--acento); }
.hero::before, .hero::after { content: ""; position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none; }
.hero::before { width: 60vw; height: 60vw; left: -12vw; top: -8vw; background: radial-gradient(circle, rgba(150, 150, 150, .32), transparent 65%); }
.hero::after { width: 52vw; height: 52vw; right: -10vw; bottom: -14vw; background: radial-gradient(circle, rgba(198, 54, 60, .26), transparent 65%); }
.sv span { font-family: "Bebas Neue", sans-serif; font-weight: 400; font-size: 32px; letter-spacing: .03em; }
@media (prefers-reduced-motion: no-preference) {
  .hero::before { animation: humo1 14s ease-in-out infinite alternate; }
  .hero::after { animation: humo2 17s ease-in-out infinite alternate; }
  @keyframes humo1 { to { transform: translate(14vw, 8vw) scale(1.15); } }
  @keyframes humo2 { to { transform: translate(-12vw, -7vw) scale(1.2); } }
}`,
    js: ""
  }
};
