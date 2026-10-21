// Genera demos/<id>/index.html desde ../datos.json y marcas/<id>.js.  Uso: node demos/generar.js [id]
const fs = require("fs");
const ARTE = require("./arte.js");
const path = require("path");

const CONT = JSON.parse(fs.readFileSync(path.join(__dirname, "contenido.json"), "utf8"));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const lista = (a) => (a.length > 1 ? a.slice(0, -1).join(", ") + " y " + a[a.length - 1] : a[0] || "");

// Móvil peruano (9 dígitos, empieza con 9) → WhatsApp; cualquier otro → llamada.
function whatsapp(t, texto) {
  let d = String(t).replace(/\D/g, "");
  if (d.startsWith("51")) d = d.slice(2);
  return /^9\d{8}$/.test(d) ? "https://wa.me/51" + d + (texto ? "?text=" + encodeURIComponent(texto) : "") : "tel:+51" + d;
}

// Íconos de línea genéricos (24x24) para llenar los huecos de imágenes. Se pintan con currentColor.
const ICONOS = {
  tijeras: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.1 8.1 20 20M8.1 15.9 20 4"/>',
  navaja: '<rect x="8" y="4" width="8" height="16" rx="1.5"/><path d="M8 9l8-3M8 14l8-3M8 19l8-3M10 2h4M10 22h4"/>',
  peine: '<path d="M3 7h18v5H3z"/><path d="M5 12v6M8 12v6M11 12v6M14 12v6M17 12v6M20 12v6"/>',
  hoja: '<path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15z"/><path d="m5 19 9-9"/>',
  pincel: '<path d="M4 20c0-3 2-5 5-5l9-9 3 3-9 9c0 3-2 5-5 5z"/>',
  estrella: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  pin: '<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  whatsapp: '<path d="M21 12a9 9 0 0 1-13.4 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z"/><path d="M9 8.5c0 3 2.5 6 6 6.5l1.2-1.6-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  telefono: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  enlace: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'
};
const icono = (n, cls) => `<svg class="${cls || "ic"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[n] || ICONOS.estrella}</svg>`;

// Ícono de una red social o enlace según su etiqueta (lt).
function iconoRed(lt) {
  lt = String(lt || "").toLowerCase();
  if (lt.includes("instagram")) return "instagram";
  if (lt.includes("facebook")) return "facebook";
  if (lt.includes("whatsapp")) return "whatsapp";
  if (lt.includes("reserva")) return "calendario";
  return "enlace";
}

// Elige el ícono según la palabra clave del servicio.
function iconoDe(s) {
  s = s.toLowerCase();
  if (/corte|fade|cabello|peluquer/.test(s)) return "tijeras";
  if (/barba|afeit/.test(s)) return "navaja";
  if (/facial|limpieza|masaje|spa|uñas|nail/.test(s)) return "hoja";
  if (/tinte|color|balayage|mecha|platin|lacead|ondula/.test(s)) return "pincel";
  if (/producto|asesor|dise|tratamiento|barber/.test(s)) return "peine";
  return "estrella";
}

// Hasta 6 mosaicos con los servicios reales y, si faltan, categorías genéricas según el tipo de negocio.
function mosaicos(d) {
  const base = d.k === "Barbería" ? ["Cortes", "Barba", "Estilo"] : d.k === "Spa" ? ["Masajes", "Relax", "Cuidado"] : ["Cabello", "Color", "Tratamientos"];
  const m = [];
  [...(d.sv || []), ...base].forEach((s) => { if (m.length < 6 && !m.some((x) => x.toLowerCase() === s.toLowerCase())) m.push(s); });
  return m.map((s) => ({ t: s, i: iconoDe(s) }));
}

// Un logo .svg se incrusta en el HTML para que use las fuentes de la página; el resto va como <img>.
function logoHtml(d, m) {
  if (!m.logo.endsWith(".svg")) return `<img src="${esc(m.logo)}" alt="${esc(m.logoAlt)}">`;
  const svg = fs.readFileSync(path.join(__dirname, d.id, m.logo), "utf8").replace(/<\?xml[^>]*\?>/, "").trim();
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/); // width/height dan la proporción al CSS (height fijo, width auto)
  return svg.replace("<svg", `<svg role="img" aria-label="${esc(m.logoAlt)}"${vb ? ` width="${vb[1]}" height="${vb[2]}"` : ""}`);
}

function pagina(d, m) {
  const wa = whatsapp(d.t, "Hola, quiero reservar en " + d.n);
  const esWa = wa.startsWith("https://wa.me");
  const ext = esWa ? ' target="_blank" rel="noopener"' : "";
  const fam = (f) => "family=" + f.replace(/ /g, "+");
  const fuentes = "https://fonts.googleapis.com/css2?" + m.fuentes.map(fam).join("&") + "&display=swap";
  const t = m.tema;
  const c = CONT[d.id] || {};
  const opciones = (d.sv || ["Consulta"]).map((s) => `<option>${esc(s)}</option>`).join("");
  const estrellas = (n) => "★".repeat(n) + "☆".repeat(5 - n);
  const resenas = (c.resenas || []).slice(0, 3).map((r, i) => `<li class="rev"><span class="av2" aria-hidden="true">${esc(r.a.charAt(0).toUpperCase())}</span><button type="button" class="bub" data-rv="${i}" aria-haspopup="dialog"><span class="rh"><b>${esc(r.a)}</b><span class="est" aria-label="${r.e} de 5 estrellas">${estrellas(r.e)}</span><span class="fe">${esc(r.f)}</span></span><span class="rtxt">${esc(r.t)}</span><span class="ver">Ver en Google ↗</span></button></li>`).join("");
  const resenasJson = JSON.stringify((c.resenas || []).map((r) => ({ a: r.a, e: r.e, f: r.f, t: r.t, u: r.u }))).replace(/</g, "\\u003c");
  const cita = JSON.stringify({ wa: whatsapp(d.t), n: d.n, h: c.horario || null, ant: 2 }).replace(/</g, "\\u003c");
  const tipo = d.k === "Salón" ? "un salón" : d.k === "Spa" ? "un spa" : "una barbería";
  const sobre = `${d.n} es ${tipo} en ${d.z}, con ${d.r.toFixed(1)} de puntaje y ${d.c} reseñas en Google. ` +
    (d.sv ? `Ofrece ${lista(d.sv.map((s) => s.toLowerCase()))}. ` : "") + "Reserva tu cita y ven a conocernos.";
  const porque = [
    ["estrella", `${d.r.toFixed(1)} ★ en Google`, `Calificación basada en ${d.c} reseñas de clientes en Google Maps.`],
    ["chat", esWa ? "Reserva fácil" : "Reserva por teléfono", esWa ? "Agenda tu cita por WhatsApp en pocos minutos." : "Llámanos y agenda tu cita."],
    ["pin", `En ${d.z}`, `${d.a}. Fácil de encontrar.`]
  ];
  const pasos = [
    ["chat", esWa ? "Escríbenos" : "Llámanos", esWa ? "Envíanos un mensaje por WhatsApp." : "Comunícate por teléfono."],
    ["calendario", "Elige tu horario", "Dinos el servicio que quieres y cuándo te viene mejor."],
    ["pin", "Ven al local", `Te esperamos en ${d.a}, ${d.z}.`]
  ];
  const faq = [
    ["¿Dónde están ubicados?", `${d.a}, ${d.z}, Lima.`],
    ["¿Cómo reservo una cita?", `${esWa ? "Escríbenos por WhatsApp al" : "Llámanos al"} ${d.t}.`]
  ];
  if (d.sv) faq.push(["¿Qué servicios ofrecen?", lista(d.sv) + "."]);
  const servicios = d.sv ? `
<section id="servicios"><div class="in-w">
  <span class="lbl rv">Servicios</span><h2 class="rv">Lo que hacemos</h2>
  <div class="svs">${d.sv.map((s, i) => `<div class="sv rv"><b>${String(i + 1).padStart(2, "0")}</b>${icono(iconoDe(s), "ic sic")}<span>${esc(s)}</span></div>`).join("")}</div>
</div></section>` : "";
  const sedes = d.su ? `
<section id="sedes"><div class="in-w">
  <span class="lbl rv">Sedes</span><h2 class="rv">Dónde encontrarnos</h2>
  <ul class="sedes">${d.su.map((s) => `<li class="rv">${esc(s)}</li>`).join("")}</ul>
</div></section>` : "";
  const red = d.l ? `<a class="btn sec" href="${esc(d.l)}" target="_blank" rel="noopener">${icono(iconoRed(d.lt))}<span>${esc(d.lt || "Red social")}</span></a>` : "";
  const llamar = esWa ? `<a class="btn sec" href="tel:+51${String(d.t).replace(/\D/g, "").replace(/^51/, "")}">${icono("telefono")}<span>Llamar</span></a>` : "";
  const valoracion = `<section id="valoracion"><div class="in-w">
  <span class="lbl rv">Opiniones en Google</span>
  <div class="val rv"><span class="n">${d.r.toFixed(1)} ★</span><p>${d.c} reseñas en Google Maps</p></div>
  ${resenas ? `<div class="opin${m.cinta === false ? "" : " cinta"}${m.cintaManual === false ? "" : " manual"}"><p class="opin-h"><span class="vivo" aria-hidden="true"></span>Lo que dicen en Google Maps<button type="button" class="feed-ctl" aria-pressed="false">Pausar</button></p><ul class="feed">${resenas}</ul><a class="mas" href="${esc(d.m)}" target="_blank" rel="noopener">Ver todas las reseñas en Google Maps →</a></div>` : ""}
</div></section>`;
  // Ubicación y opiniones en una sola sección (opcional por marca: fusionUbicacion: true): mapa a un lado, nota y reseñas al otro
  const marcaOpin = '<span class="lbl rv">Opiniones en Google</span>';
  const cuerpoOpin = valoracion.slice(valoracion.indexOf(marcaOpin) + marcaOpin.length, valoracion.lastIndexOf("</div></section>"));
  const fusion = `<section id="ubicacion" class="fus"><div class="in-w">
  <span class="lbl rv">Ubicación y opiniones</span><h2 class="rv">Visítanos y mira lo que dicen</h2>
  <div class="fus-g">
    <div class="fus-m rv"><address>${esc(d.a)}<br>${esc(d.z)}, Lima</address>
      <div class="mapa"><iframe title="Mapa de ${esc(d.n)}" loading="lazy" src="https://maps.google.com/maps?q=${d.la},${d.lo}&z=17&output=embed"></iframe></div>
      <a class="btn sec" href="${esc(d.m)}" target="_blank" rel="noopener">${icono("pin")}<span>Abrir en Google Maps</span></a></div>
    <div class="fus-o">${cuerpoOpin}</div>
  </div>
</div></section>`;
  const contacto = `<section id="contacto" class="cont"><div class="in-w">
  <h2 class="rv">Reserva tu cita</h2>
  <p class="rv" style="color:var(--suave)">${esc(d.t)}</p>
  <div class="acc rv"><a class="btn" href="${esc(wa)}"${ext}>${icono(esWa ? "whatsapp" : "telefono")}<span>${esWa ? "Escríbenos por WhatsApp" : "Llamar ahora"}</span></a>${llamar}${red}</div>
</div></section>`;
  const galeria = `<section id="galeria"><div class="in-w">
  <span class="lbl rv">Galería</span><h2 class="rv">Nuestro trabajo</h2>
  <div class="gal">${mosaicos(d).map((x, i) => `<figure class="rv" style="--i:${i}">${icono(x.i, "ic big")}<figcaption>${esc(x.t)}</figcaption></figure>`).join("")}</div>
</div></section>`;
  // Servicios y galería en tarjetas expandibles (opcional por marca: m.tarjetas = [{ img: [a, b], txt }] en el orden de d.sv)
  // Tarjetas: las de la marca (m.tarjetas, hechas a mano) o las automáticas con ilustraciones de demos/arte.js
  const cards = m.tarjetas && d.sv
    ? d.sv.map((s, k) => ({ titulo: s, detalle: "", txt: (m.tarjetas[k] || {}).txt || "", img: (m.tarjetas[k] || { img: [] }).img }))
    : !m.tarjetas && ARTE.ESTILOS[d.id] && m.sinTarjetas !== true ? ARTE.tarjetasDe(d, ARTE.serviciosBase(d)) : null;
  const tarjetas = cards ? `
<section id="servicios"><div class="in-w">
  <span class="lbl rv">Servicios y galería</span><h2 class="rv">Lo que hacemos</h2>
  <div class="sc-row rv" style="--abierta:${cards.length >= 5 ? 3 : 4.2}">${cards.map((t, k) => `<article class="sc${k === 0 ? " open" : ""}"><button type="button" class="sc-b" id="sc-h${k}" aria-expanded="${k === 0}" aria-controls="sc-p${k}"><span class="sc-n">${String(k + 1).padStart(2, "0")}</span><span class="sc-t">${esc(t.titulo)}</span></button><div class="sc-media" id="sc-p${k}" role="region" aria-labelledby="sc-h${k}">${t.img.map((f, q) => `<img class="${q === 0 ? "a on" : "b"}" src="${esc(f)}" alt="Ilustración referencial de ${esc(t.titulo)}" loading="lazy">`).join("")}<p class="sc-d">${esc(t.txt)}${t.detalle ? ` <span class="sc-p">${esc(t.detalle)}</span>` : ""}</p></div></article>`).join("")}</div>
  <p class="nota-ref rv">Ilustraciones referenciales.</p>
</div></section>` : "";
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(d.n)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fuentes}">
<link rel="stylesheet" href="../_comun/base.css">
<style>
:root { --bg: ${t.bg}; --fg: ${t.fg}; --acento: ${t.acento}; --suave: ${t.suave}; --f-titulo: ${t.titulo}; --f-texto: ${t.texto}; --radio: ${t.radio || "999px"}; --trazo: ${t.trazo || 1.6}; color-scheme: ${t.esquema || "dark"}; }
${m.efecto.css}
</style>
<noscript><style>.rv { opacity: 1 !important; transform: none !important; }</style></noscript>
</head>
<body>
<header class="top">
  <a class="marca" href="#inicio">${logoHtml(d, m)}</a>
  <nav><a href="#servicios">Servicios</a><a href="#ubicacion">Ubicación</a><a href="#contacto">Contacto</a><a class="cta" href="${esc(wa)}"${ext}>${icono(esWa ? "whatsapp" : "telefono")}<span>Reservar</span></a></nav>
</header>
<main>
<section id="inicio" class="hero"><div class="hero-in">
  <h1 aria-label="${esc(d.n)}">${m.hero.titulo}</h1>
  <p class="baja">${esc(m.hero.bajada)}</p>
  <div class="acc"><a class="btn" href="${esc(wa)}"${ext}>${icono(esWa ? "whatsapp" : "telefono")}<span>${esWa ? "Reservar por WhatsApp" : "Llamar para reservar"}</span></a><a class="btn sec" href="#ubicacion">${icono("pin")}<span>Cómo llegar</span></a></div>
</div></section>
<section id="nosotros"><div class="in-w">
  <span class="lbl rv">Nosotros</span>
  <div class="about"><h2 class="rv">${esc(d.n)}</h2><p class="rv">${esc(sobre)}</p></div>
  <div class="why">${porque.map((p) => `<div class="rv">${icono(p[0])}<h3>${esc(p[1])}</h3><p>${esc(p[2])}</p></div>`).join("")}</div>
</div></section>
${tarjetas || servicios}
${tarjetas ? "" : galeria}
<section id="reservar"><div class="in-w">
  <span class="lbl rv">Reservar</span><h2 class="rv">Cómo reservar</h2>
  <ol class="pasos">${pasos.map((p, i) => `<li class="rv"><span class="num">${i + 1}</span>${icono(p[0])}<h3>${esc(p[1])}</h3><p>${esc(p[2])}</p></li>`).join("")}</ol>
  <form id="cita" class="cita rv" novalidate>
    <label>Servicio<select name="s">${opciones}</select></label>
    <label>Día<input type="date" name="d" required></label>
    <label>${c.horario ? "Hora" : "Franja"}<select name="h" required></select></label>
    <label>Tu nombre<input type="text" name="n" autocomplete="given-name" maxlength="40" required></label>
    <button class="btn" type="submit">Solicitar cita</button>
    <p class="nota">Horario referencial. El negocio confirma tu cita por WhatsApp.</p>
    <p class="err" role="alert"></p>
  </form>
</div></section>
${m.fusionUbicacion ? "" : m.opinionesAlFinal === false ? valoracion : ""}
${sedes}
${m.sinFaq ? "" : `<section id="faq"><div class="in-w">
  <span class="lbl rv">Preguntas frecuentes</span><h2 class="rv">Antes de venir</h2>
  <div class="faq">${faq.map((q) => `<details class="rv"><summary>${esc(q[0])}</summary><p>${esc(q[1])}</p></details>`).join("")}</div>
</div></section>`}
${m.fusionUbicacion ? "" : `<section id="ubicacion"><div class="in-w ubi">
  <div class="rv"><span class="lbl">Ubicación</span><h2>Visítanos</h2>
    <address>${esc(d.a)}<br>${esc(d.z)}, Lima</address>
    <a class="btn sec" href="${esc(d.m)}" target="_blank" rel="noopener">${icono("pin")}<span>Abrir en Google Maps</span></a></div>
  <div class="mapa rv"><iframe title="Mapa de ${esc(d.n)}" loading="lazy" src="https://maps.google.com/maps?q=${d.la},${d.lo}&z=17&output=embed"></iframe></div>
</div></section>`}
${m.contactoAlFinal ? "" : contacto}
${m.fusionUbicacion ? fusion : m.opinionesAlFinal === false ? "" : valoracion}
${m.contactoAlFinal ? contacto : ""}
</main>
<footer><span>${esc(d.n)}</span><span>${esc(d.a)}, ${esc(d.z)}</span></footer>
<script>window.CITA = ${cita}; window.RESENAS = ${resenasJson};</script>
<script src="../_comun/base.js"></script>
<script>${m.efecto.js}</script>
</body>
</html>
`;
  // Botones solo con ícono: el texto pasa a aria-label y title (accesibilidad y tooltip).
  return html.replace(/<a class="([^"]*)"([^>]*)>(<svg class="ic"[\s\S]*?<\/svg>)<span>([^<]*)<\/span><\/a>/g,
    (m, cls, att, svg, txt) => `<a class="${cls} ico"${att} aria-label="${txt}" title="${txt}">${svg}</a>`);
}

if (require.main === module) {
  const datos = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "datos.json"), "utf8"));
  const dirMarcas = path.join(__dirname, "marcas");
  const ids = process.argv[2] ? [process.argv[2]] : fs.readdirSync(dirMarcas).map((f) => f.replace(/\.js$/, ""));
  ids.forEach((id) => {
    const d = datos.find((x) => x.id === id);
    if (!d) throw new Error("No existe el negocio " + id);
    const m = require(path.join(dirMarcas, id + ".js"));
    fs.mkdirSync(path.join(__dirname, id), { recursive: true });
    fs.writeFileSync(path.join(__dirname, id, "index.html"), pagina(d, m));
    console.log("demos/" + id + "/index.html");
  });
}

module.exports = { pagina, whatsapp };
