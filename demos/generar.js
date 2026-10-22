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

// Ilustración referencial de un servicio de salón (cabello largo, antes y después).
function ilusSalon(t, despues) {
  const pelo = "#3b2a23", piel = "#e0b896";
  const fondo = despues
    ? '<path d="M122 120C100 170 110 235 92 285h216c-18-50-8-115-30-165 2-58-40-80-78-80s-80 22-78 80z" fill="' + pelo + '"/><path d="M150 70c-22 50-14 120-30 205" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".22"/>'
    : '<path d="M118 120C86 150 96 215 62 282l14 6h248l12-8c-30-60-18-130-52-160 4-54-44-86-82-86s-84 30-82 86z" fill="' + pelo + '"/><path d="M96 168c-10 14-8 30-16 44M306 172c8 14 10 28 20 40M110 250c-6 8-8 16-14 24M296 252c6 8 10 16 16 24M150 44c-4-10 6-18 14-12M236 42c6-10 18-4 14 8" fill="none" stroke="' + pelo + '" stroke-width="7" stroke-linecap="round"/>';
  const flequillo = despues
    ? '<path d="M138 112C146 74 178 64 206 66c30 2 52 18 56 50-22-26-60-34-124-4z" fill="' + pelo + '"/>'
    : '<path d="M136 116c-4-30 14-54 40-58-8 8-6 22 6 30 4-14 18-22 32-22-6 10-2 22 10 26 8-10 22-12 34-6-2 12 2 22 8 28-34-30-92-28-130 2z" fill="' + pelo + '"/>';
  return '<svg viewBox="0 0 400 300" role="img" aria-label="' + (despues ? "Después: cabello liso, suave y con brillo" : "Antes: cabello opaco y sin forma") + '"><rect width="400" height="300" fill="' + t.acento + '" opacity=".12"/>' +
    fondo + '<path d="M50 300c8-52 40-62 100-66h100c60 4 92 14 100 66z" fill="' + t.suave + '"/><rect x="176" y="204" width="48" height="54" rx="14" fill="' + piel + '"/>' +
    '<ellipse cx="200" cy="150" rx="58" ry="74" fill="' + piel + '"/>' + flequillo +
    '<g fill="' + pelo + '"><circle cx="178" cy="150" r="4.5"/><circle cx="222" cy="150" r="4.5"/></g><path d="M184 188q16 10 32 0" fill="none" stroke="' + t.acento + '" stroke-width="4" stroke-linecap="round"/></svg>';
}

// Datos de ejemplo (referenciales) para la calculadora, el equipo, la promoción y la tarjeta de sellos.
// Una marca puede definir los suyos en marcas/<id>.js; los precios reales de la ficha de Google (S/ y min) se respetan.
const NOMBRES = { b: ["Mauro", "Diego", "Joaquín", "Renzo", "Andrés", "Fabián", "Sebastián", "Álvaro", "Matías"], s: ["Valeria", "Camila", "Lucía", "Daniela", "Andrea", "Fiorella", "Paola", "Carla", "Rocío"] };
function precioDe(s) {
  s = s.toLowerCase();
  const tabla = [[/tinte|color|balayage|mecha|platin/, [90, 120]], [/tratamiento|keratina|alisado|laceado|botox/, [70, 60]], [/barba|afeit/, [15, 20]], [/ceja|perfil/, [8, 10]], [/u[ñn]as|manicur|pedicur|nail/, [35, 50]], [/facial|limpieza|masaje|spa/, [40, 40]], [/peinado|ondula|planch|secado/, [35, 40]], [/ni[ñn]|kids|infantil/, [18, 30]], [/corte|fade|cabello|peluquer/, [25, 45]]];
  const t = tabla.find((x) => x[0].test(s));
  return t ? t[1] : [30, 45];
}
function defaultsMarca(d) {
  const barberia = d.k === "Barbería", spa = d.k === "Spa";
  const genericos = barberia ? ["Corte", "Barba", "Corte + barba", "Perfilado de cejas"] : spa ? ["Masaje relajante", "Limpieza facial", "Manicure", "Pedicure"] : ["Corte de cabello", "Peinado", "Tinte", "Tratamiento capilar"];
  const precios = [];
  (d.sv || []).forEach((s) => {
    if (precios.length >= 4 || /venta|asesor|belleza y cuidado|looks|^barbería$|^cabello$|^peluquería$/i.test(s)) return;
    const [p0, m0] = precioDe(s), pr = s.match(/S\/\s*(\d+)/), mi = s.match(/(\d+)\s*min/);
    precios.push({ n: s.replace(/\s*\(.*?\)/g, "").trim(), p: pr ? +pr[1] : p0, m: mi ? +mi[1] : m0 });
  });
  genericos.forEach((n) => { if (precios.length < 4 && !precios.some((x) => x.n.toLowerCase().startsWith(n.toLowerCase().split(" ")[0]))) { const [p, m] = precioDe(n); precios.push({ n, p, m }); } });
  const pool = NOMBRES[barberia ? "b" : "s"], h0 = [...d.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % pool.length;
  const roles = barberia ? [["Maestro barbero", "Cortes clásicos y navaja"], ["Barbero", "Fade y degradados"], ["Barbero", "Diseño de barba"]] : spa ? [["Terapeuta", "Masajes"], ["Esteticista", "Cuidado facial"], ["Terapeuta", "Relajación"]] : [["Estilista", "Corte y peinado"], ["Colorista", "Tinte y mechas"], ["Especialista capilar", "Tratamientos"]];
  return {
    precios,
    equipo: roles.map((r, i) => ({ n: pool[(h0 + i * 3) % pool.length], r: r[0], e: r[1] })),
    promo: barberia ? { t: "Corte + barba", d: "Llévate el combo completo a precio especial durante este mes.", precio: "S/ 30" } : spa ? { t: "Masaje + facial", d: "Un momento de relax a precio especial durante este mes.", precio: "S/ 80" } : { t: "Corte + tratamiento", d: "Cuida tu cabello con un precio especial durante este mes.", precio: "S/ 70" },
    fidelidad: { n: 5, premio: barberia ? "Corte gratis" : "Servicio de cortesía" }
  };
}

// Ilustración referencial de un corte (antes o después) con los colores de la marca.
function ilusCorte(t, despues, salon) {
  if (salon) return ilusSalon(t, despues);
  const pelo = "#2d2825", piel = "#d9ae8a";
  const cabello = despues
    ? '<path d="M139 124C139 82 168 70 200 70s61 12 61 54c-12-20-32-27-61-27s-49 7-61 27z" fill="' + pelo + '"/><ellipse cx="141" cy="140" rx="7" ry="22" fill="' + pelo + '" opacity=".22"/><ellipse cx="259" cy="140" rx="7" ry="22" fill="' + pelo + '" opacity=".22"/>'
    : '<path d="M124 150C96 84 140 36 200 42s104 44 76 108c8-34-14-56-40-60-12 10-24 14-36 14s-24-4-36-14c-26 4-48 26-40 60z" fill="' + pelo + '"/><path d="M118 100c-12-6-14-22-2-30M284 96c12-6 16-22 4-30M170 40c-6-14 8-24 18-18M224 40c10-12 24-4 20 10" fill="none" stroke="' + pelo + '" stroke-width="9" stroke-linecap="round"/>';
  const barba = despues
    ? '<path d="M146 168c4 36 26 52 54 52s50-16 54-52c-10 22-28 30-54 30s-44-8-54-30z" fill="' + pelo + '" opacity=".85"/><path d="M146 168c4 36 26 52 54 52s50-16 54-52" fill="none" stroke="' + t.acento + '" stroke-width="2" opacity=".7"/>'
    : '<path d="M142 166c2 44 28 62 58 62s56-18 58-62c-14 16-24 36-58 34-34 2-44-18-58-34z" fill="' + pelo + '" opacity=".55"/><g stroke="' + pelo + '" stroke-width="2" stroke-linecap="round" opacity=".6"><path d="M150 186l-6 6M162 204l-6 8M246 206l6 8M256 188l6 6M200 232v8"/></g>';
  return '<svg viewBox="0 0 400 300" role="img" aria-label="' + (despues ? "Después: corte limpio y definido" : "Antes: cabello y barba sin arreglar") + '"><rect width="400" height="300" fill="' + t.acento + '" opacity=".12"/>' +
    '<path d="M50 300c8-52 40-62 100-66h100c60 4 92 14 100 66z" fill="' + t.suave + '"/><rect x="176" y="204" width="48" height="54" rx="14" fill="' + piel + '"/>' +
    '<ellipse cx="200" cy="148" rx="62" ry="78" fill="' + piel + '"/>' + cabello + barba +
    '<g fill="' + pelo + '"><circle cx="177" cy="146" r="4.5"/><circle cx="223" cy="146" r="4.5"/></g><path d="M186 186q14 8 28 0" fill="none" stroke="' + pelo + '" stroke-width="3" stroke-linecap="round"/></svg>';
}

// Divisor de marca entre secciones (m.divisor): la portada ya trae el suyo.
function conDivisores(html, cls) {
  let n = 0;
  return html.replace(/<\/section>\s*(?=<section)/g, (x) => (n++ === 0 ? x : x + '<div class="' + cls + '" aria-hidden="true"></div>\n'));
}

function pagina(d, m) {
  // Por defecto todas las demos llevan los extras, con datos de ejemplo según el tipo de negocio; la marca puede cambiarlos.
  m = Object.assign({ extras: true, animaciones: true, antesDespues: true, divisor: "orn" }, defaultsMarca(d), m);
  const salon = d.k !== "Barbería";
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
  // Ubicación y opiniones en una sola sección (por defecto; fusionUbicacion: false la separa): mapa a un lado, nota y reseñas al otro
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
  // Extras opcionales (m.extras): cifras animadas, antes y después, "abierto ahora" y barra de reserva en el celular.
  const dias = c.horario ? Object.keys(c.horario).filter((k) => c.horario[k]).length : 0;
  const cifras = m.extras ? `
<section id="cifras"><div class="in-w">
  <div class="cifras">
    <div class="cifra rv"><b data-n="${d.r.toFixed(1)}" data-dec="1">${d.r.toFixed(1)}</b><span>de puntaje en Google ★</span></div>
    <div class="cifra rv"><b data-n="${d.c}">${d.c}</b><span>reseñas de clientes</span></div>
    ${dias ? `<div class="cifra rv"><b data-n="${dias}">${dias}</b><span>días de atención a la semana</span></div>` : ""}
  </div>
</div></section>` : "";
  const antes = m.extras && m.antesDespues ? `
<section id="resultado"><div class="in-w">
  <span class="lbl rv">Resultado</span><h2 class="rv">Antes y después</h2>
  <p class="rv" style="color:var(--suave);margin-top:10px">Desliza para ver la diferencia de ${salon ? "un buen servicio" : "un buen corte"}.</p>
  <div class="ba rv" style="--p:50%">
    <div class="ba-i">${ilusCorte(t, true, salon)}</div>
    <div class="ba-i ba-b">${ilusCorte(t, false, salon)}</div>
    <span class="ba-t ba-tb">Antes</span><span class="ba-t ba-ta">Después</span>
    <span class="ba-l" aria-hidden="true"><i></i></span>
    <input type="range" min="0" max="100" value="50" aria-label="Comparar antes y después">
  </div>
  <p class="nota-ref rv">Ilustración referencial.</p>
</div></section>` : "";
  const barra = m.extras ? `<div class="barra-res" id="barraRes"><span class="ahora" data-ahora hidden></span><a class="btn" href="${esc(wa)}"${ext}>Reservar</a></div>` : "";
  // Más extras opcionales de la marca: calculadora (m.precios), equipo (m.equipo), promoción (m.promo) y tarjeta de sellos (m.fidelidad).
  const px = m.precios || [];
  const calc = m.extras && px.length ? `
<section id="calcula"><div class="in-w">
  <span class="lbl rv">Tu cita</span><h2 class="rv">Arma tu servicio</h2>
  <form class="calc rv" id="calc" onsubmit="return false">
    <ul class="calc-l">${px.map((x) => `<li><label><input type="checkbox" data-p="${x.p}" data-m="${x.m}" data-n="${esc(x.n)}"><span class="ck" aria-hidden="true"></span><span class="nm">${esc(x.n)}</span><span class="du">${x.m} min</span><b>S/ ${x.p}</b></label></li>`).join("")}</ul>
    <div class="calc-t">
      <div><span>Total estimado</span><b id="calcTotal">S/ 0</b></div>
      <div><span>Duración</span><b id="calcMin">0 min</b></div>
      <a class="btn" id="calcBtn" href="${esc(wa)}"${ext}>Pedir por WhatsApp</a>
    </div>
    <p class="nota-ref">Precios y duraciones referenciales.</p>
  </form>
</div></section>` : "";
  const eq = m.equipo || [];
  const equipo = m.extras && eq.length ? `
<section id="equipo"><div class="in-w">
  <span class="lbl rv">Equipo</span><h2 class="rv">Quién te atiende</h2>
  <div class="eq">${eq.map((x) => `<article class="rv"><span class="eq-av" aria-hidden="true">${esc(x.n.charAt(0))}</span><h3>${esc(x.n)}</h3><p class="eq-r">${esc(x.r)}</p><p class="eq-e">${esc(x.e)}</p><a class="btn sec" href="${esc(whatsapp(d.t, "Hola, quiero reservar con " + x.n + " en " + d.n))}"${ext}>Reservar con ${esc(x.n)}</a></article>`).join("")}</div>
  <p class="nota-ref rv">Equipo referencial.</p>
</div></section>` : "";
  const pr = m.promo;
  const promo = m.extras && pr ? `
<section id="promo"><div class="in-w">
  <div class="promo rv">
    <div class="promo-i"><span class="lbl">Promoción del mes</span><h3>${esc(pr.t)}</h3><p>${esc(pr.d)}</p><p class="promo-p">${esc(pr.precio)}</p></div>
    <div class="cuenta" id="cuenta" role="timer" aria-label="Tiempo que queda de la promoción"><span><b data-u="d">--</b>días</span><span><b data-u="h">--</b>horas</span><span><b data-u="m">--</b>min</span><span><b data-u="s">--</b>seg</span></div>
    <a class="btn" href="${esc(whatsapp(d.t, "Hola, quiero la promoción: " + pr.t))}"${ext}>Quiero la promo</a>
  </div>
  <p class="nota-ref rv">Promoción de ejemplo. Termina el último día del mes.</p>
</div></section>` : "";
  const fd = m.fidelidad;
  const fidel = m.extras && fd ? `
<section id="fidelidad"><div class="in-w">
  <span class="lbl rv">Fidelidad</span><h2 class="rv">Tu tarjeta de sellos</h2>
  <div class="fid rv" id="fid" data-n="${fd.n}" data-k="fid-${esc(d.id)}" data-premio="${esc(fd.premio)}">
    <ol class="fid-s">${Array.from({ length: fd.n }, (_, i) => `<li><span>${i + 1}</span></li>`).join("")}</ol>
    <p class="fid-t" id="fidT" aria-live="polite">Cada visita suma un sello. A la visita ${fd.n}: ${esc(fd.premio.toLowerCase())}.</p>
    <div class="acc"><button class="btn" type="button" id="fidBtn">Marcar una visita</button><button class="btn sec" type="button" id="fidReset">Reiniciar</button></div>
  </div>
  <p class="nota-ref rv">Demostración: se guarda solo en este dispositivo.</p>
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
<body${m.animaciones ? ' class="anim"' : ""}>
<header class="top">
  <a class="marca" href="#inicio">${logoHtml(d, m)}</a>
  <nav><a href="#servicios">Servicios</a><a href="#ubicacion">Ubicación</a><a href="#contacto">Contacto</a><a class="cta" href="${esc(wa)}"${ext}>${icono(esWa ? "whatsapp" : "telefono")}<span>Reservar</span></a></nav>
</header>
<main>
<section id="inicio" class="hero"><div class="hero-in">
  <h1 aria-label="${esc(d.n)}"${m.extras ? ' data-par style="--kx:1;--ky:.14"' : ""}>${m.hero.titulo}</h1>
  <p class="baja"${m.extras ? ' data-par style="--kx:.5;--ky:.07"' : ""}>${esc(m.hero.bajada)}</p>
  ${m.extras ? '<p class="ahora" data-ahora hidden></p>' : ""}
  <div class="acc"><a class="btn" href="${esc(wa)}"${ext}>${icono(esWa ? "whatsapp" : "telefono")}<span>${esWa ? "Reservar por WhatsApp" : "Llamar para reservar"}</span></a><a class="btn sec" href="#ubicacion">${icono("pin")}<span>Cómo llegar</span></a></div>
</div></section>
<section id="nosotros"><div class="in-w">
  <span class="lbl rv">Nosotros</span>
  <div class="about"><h2 class="rv">${esc(d.n)}</h2><p class="rv">${esc(sobre)}</p></div>
  <div class="why">${porque.map((p) => `<div class="rv">${icono(p[0])}<h3>${esc(p[1])}</h3><p>${esc(p[2])}</p></div>`).join("")}</div>
</div></section>
${cifras}
${promo}
${equipo}
${tarjetas || servicios}
${tarjetas ? "" : galeria}
${antes}
${calc}
${fidel}
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
${m.fusionUbicacion !== false ? "" : m.opinionesAlFinal === false ? valoracion : ""}
${sedes}
${m.sinFaq !== false ? "" : `<section id="faq"><div class="in-w">
  <span class="lbl rv">Preguntas frecuentes</span><h2 class="rv">Antes de venir</h2>
  <div class="faq">${faq.map((q) => `<details class="rv"><summary>${esc(q[0])}</summary><p>${esc(q[1])}</p></details>`).join("")}</div>
</div></section>`}
${m.fusionUbicacion !== false ? "" : `<section id="ubicacion"><div class="in-w ubi">
  <div class="rv"><span class="lbl">Ubicación</span><h2>Visítanos</h2>
    <address>${esc(d.a)}<br>${esc(d.z)}, Lima</address>
    <a class="btn sec" href="${esc(d.m)}" target="_blank" rel="noopener">${icono("pin")}<span>Abrir en Google Maps</span></a></div>
  <div class="mapa rv"><iframe title="Mapa de ${esc(d.n)}" loading="lazy" src="https://maps.google.com/maps?q=${d.la},${d.lo}&z=17&output=embed"></iframe></div>
</div></section>`}
${m.contactoAlFinal !== false ? "" : contacto}
${m.fusionUbicacion !== false ? fusion : m.opinionesAlFinal === false ? "" : valoracion}
${m.contactoAlFinal !== false ? contacto : ""}
</main>
<footer><span>${esc(d.n)}</span><span>${esc(d.a)}, ${esc(d.z)}</span></footer>
${barra}
<script>window.CITA = ${cita}; window.RESENAS = ${resenasJson};</script>
<script src="../_comun/base.js"></script>
<script>${m.efecto.js}</script>
</body>
</html>
`;
  // Botones solo con ícono: el texto pasa a aria-label y title (accesibilidad y tooltip).
  return (m.divisor ? conDivisores(html, m.divisor === true ? "divisor" : "divisor orn") : html).replace(/<a class="([^"]*)"([^>]*)>(<svg class="ic"[\s\S]*?<\/svg>)<span>([^<]*)<\/span><\/a>/g,
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
