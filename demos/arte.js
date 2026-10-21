// Ilustraciones referenciales para las tarjetas de servicios: un dibujo de línea por servicio, con el estilo artístico de cada página.
// Uso: node demos/arte.js [id]   → escribe demos/<id>/img/s<N>-a.svg y s<N>-b.svg.  generar.js usa tarjetasDe(d) para armar las tarjetas.
const fs = require("fs");
const path = require("path");

// ---- Estilo de cada página: paleta, tipo de fondo decorativo y marco ----
const ESTILOS = {
  arturo: { bg: ["#f3f3f3", "#d6d7d9"], linea: "#4d5258", acento: "#8a9097", manchas: ["#ffffff", "#b4b6b9"], deco: "metal", marco: "doble", grosor: 2 },
  barone: { bg: ["#0b0906", "#1c140a"], linea: "#e2ad49", acento: "#e2ad49", manchas: ["#8d6e33", "#e2ad49"], deco: "destellos", marco: "doble", grosor: 2.2 },
  blackfade: { bg: ["#080808", "#262626"], linea: "#f3f3f3", acento: "#f3f3f3", manchas: ["#444444", "#111111"], deco: "bandas", marco: "esquinas", grosor: 2.4 },
  dinasty: { bg: ["#fefdfc", "#f1e7d4"], linea: "#1d1810", acento: "#b97a17", manchas: ["#e9d3a4", "#b97a17"], deco: "franjas", marco: "rect", grosor: 2.6 },
  elite: { bg: ["#fafafa", "#e4e4e4"], linea: "#2b2b2b", acento: "#7a7a7a", manchas: ["#d0d0d0", "#ffffff"], deco: "marmol", marco: "rect", grosor: 1.6 },
  emmanuel: { bg: ["#110d0c", "#271d17"], linea: "#c9a95a", acento: "#ecebcb", manchas: ["#544d4c", "#c9a95a"], deco: "anillos", marco: "circulo", grosor: 2 },
  emys: { bg: ["#fff8f6", "#ffd6d3"], linea: "#d8090b", acento: "#fc0203", manchas: ["#ffaaaa", "#fc0203"], deco: "acuarela", marco: "rect", grosor: 2.4 },
  highcuts: { bg: ["#000000", "#161616"], linea: "#fdfdfd", acento: "#fdfdfd", manchas: ["#333333", "#000000"], deco: "geometria", marco: "esquinas", grosor: 2 },
  labarberia: { bg: ["#0d0b0b", "#1f1a1a"], linea: "#ffffff", acento: "#ffffff", manchas: ["#3a3434", "#0d0b0b"], deco: "poste", marco: "rect", grosor: 2.6 },
  "lapynta-salon": { bg: ["#050505", "#181818"], linea: "#ffffff", acento: "#ffffff", manchas: ["#3a3a3a", "#050505"], deco: "rombos", marco: "rect", grosor: 1.8 },
  lapynta: { bg: ["#ece3c6", "#dccf9f"], linea: "#324b4e", acento: "#a93935", manchas: ["#f4ecd2", "#a93935"], deco: "zigzag", marco: "ninguno", grosor: 2.6 },
  limabarber: { bg: ["#191d2e", "#262d48"], linea: "#b88e40", acento: "#f6efe0", manchas: ["#7b4c26", "#b88e40"], deco: "anillos", marco: "circulo", grosor: 2.2 },
  noa: { bg: ["#0b0a08", "#1f1911"], linea: "#cb964a", acento: "#f4ead8", manchas: ["#ac7835", "#cb964a"], deco: "destellos", marco: "rect", grosor: 1.8 },
  "peru-style": { bg: ["#070707", "#1b1b1b"], linea: "#ffffff", acento: "#ffffff", manchas: ["#333333", "#070707"], deco: "tramado", marco: "rect", grosor: 3 },
  rytual: { bg: ["#0a2964", "#143f95"], linea: "#ffffff", acento: "#8b97ae", manchas: ["#3c64be", "#8b97ae"], deco: "anillos", marco: "doble", grosor: 1.8 },
  serbio: { bg: ["#131313", "#2c2c2c"], linea: "#f1f1f1", acento: "#c6363c", manchas: ["#555555", "#872728"], deco: "humo", marco: "rect", grosor: 2.4 }
};

// ---- Dibujos: cada uno devuelve el contenido del <g> (trazo = línea, relleno = ninguno) en un lienzo de 600x700 ----
function mechones(n, x0, x1, y0, y1, k, ondas) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * i) / (n - 1), d = (i % 2 ? 1 : -1) * k * (0.6 + (i % 3) * 0.25), q = ondas ? 2.2 : 1;
    s += `<path d="M${x} ${y0} C${x + d * q} ${y0 + (y1 - y0) * 0.3}, ${x - d * q} ${y0 + (y1 - y0) * 0.65}, ${x + d * 0.3} ${y1}" opacity="${0.55 + (i % 4) * 0.12}"/>`;
  }
  return s;
}
const D = {
  tijeras: () => `<circle cx="226" cy="540" r="48"/><circle cx="374" cy="540" r="48"/><path d="M250 495C300 380 360 250 410 150M350 495C300 380 240 250 190 150M268 500C318 386 374 262 418 160M332 500C282 386 226 262 182 160"/><circle cx="300" cy="332" r="9"/>`,
  peine: () => `<rect x="120" y="280" width="360" height="86" rx="16"/><path d="${[...Array(15)].map((_, i) => `M${142 + i * 23.5} 366v110`).join("")}"/><path d="M140 310h320" opacity=".45"/>`,
  maquinilla: () => `<rect x="232" y="200" width="136" height="330" rx="44"/><path d="M252 200v-44h96v44"/><path d="${[...Array(7)].map((_, i) => `M${258 + i * 14} 156v-30`).join("")}"/><circle cx="300" cy="430" r="16"/><path d="M262 330h76" opacity=".5"/>`,
  navaja: () => `<g transform="translate(300 350) scale(1.35) rotate(-18) translate(-300 -406)"><rect x="100" y="378" width="206" height="56" rx="26"/><path d="M300 384H492Q516 384 510 406L498 434H300Z"/><circle cx="300" cy="406" r="9"/><path d="M130 406h130" opacity=".45"/><path d="M330 400H470" opacity=".45"/></g>`,
  brocha: () => `<path d="M268 330h64l-14 250h-36z"/><path d="M222 330C222 230 262 170 300 170s78 60 78 160z"/><path d="M262 300v-70M300 300v-90M338 300v-70" opacity=".5"/>`,
  barba: () => `<path d="M200 250C200 150 400 150 400 250v90C400 460 340 520 300 540 260 520 200 460 200 340z"/><path d="M200 340C222 404 262 424 300 424s78-20 100-84"/><path d="M252 396c22-16 34-6 48 0 14-6 26-16 48 0" opacity=".8"/><path d="M262 300h0M338 300h0" stroke-width="7"/>`,
  rostro: () => `<path d="M300 150C392 150 424 250 412 340 400 450 352 540 300 540 248 540 200 450 188 340 176 250 208 150 300 150z"/><path d="M246 330q22 16 44 0M310 330q22 16 44 0M300 360v50q-10 8-20 0" opacity=".8"/><path d="M262 462q38 24 76 0" opacity=".8"/><path d="M450 170c60 16 92 62 84 120-62-10-98-56-84-120zM450 170c26 38 54 74 84 120" opacity=".7"/>`,
  jarra: () => `<rect x="190" y="330" width="220" height="200" rx="24"/><rect x="178" y="286" width="244" height="50" rx="12"/><path d="M230 410h140M230 450h90" opacity=".5"/><path d="M430 200c50 14 76 50 70 96-50-8-76-44-70-96z" opacity=".8"/>`,
  mechonesRectos: () => mechones(17, 130, 470, 90, 610, 32) + `<path d="M130 90C230 60 370 60 470 90" stroke-width="3"/>`,
  mechonesOnda: () => mechones(13, 140, 460, 90, 610, 40, true),
  ondas: () => mechones(11, 150, 450, 110, 600, 46, true),
  plancha: () => `<g transform="rotate(-18 300 350)"><rect x="236" y="110" width="62" height="400" rx="31"/><rect x="302" y="110" width="62" height="400" rx="31"/><circle cx="300" cy="150" r="14"/><path d="M236 480h128M270 200v220M334 200v220" opacity=".4"/></g>`,
  balayage: () => mechones(17, 130, 470, 90, 610, 30).replace(/opacity="[^"]*"/g, (m, i) => m) + `<path d="M120 470C200 440 400 500 480 460" stroke-width="5" opacity=".8"/>`,
  paleta: () => `<circle cx="235" cy="290" r="120"/><circle cx="365" cy="290" r="120"/><circle cx="300" cy="404" r="120"/><path d="M470 120L360 252" stroke-width="5"/><path d="M360 252c-22 6-30 26-22 42 22 4 44-14 22-42z" fill="currentColor" opacity=".8" stroke="none"/>`,
  gota: () => `<path d="M300 130C300 130 205 250 205 335a95 95 0 0 0 190 0C395 250 300 130 300 130z"/><path d="M255 340a48 48 0 0 0 40 45" opacity=".6"/><ellipse cx="300" cy="560" rx="80" ry="18"/><ellipse cx="300" cy="560" rx="140" ry="32" opacity=".7"/><ellipse cx="300" cy="560" rx="205" ry="46" opacity=".45"/>`,
  gotero: () => `<rect x="215" y="270" width="170" height="270" rx="26"/><rect x="262" y="226" width="76" height="46" rx="8"/><path d="M280 226c0-70 40-70 40 0"/><rect x="238" y="340" width="124" height="110" rx="6" opacity=".6"/><path d="M262 372h76M262 396h76M262 420h46" opacity=".5"/><path d="M300 560c0 0-18 28-18 42a18 18 0 0 0 36 0c0-14-18-42-18-42z"/>`,
  ojo: () => `<path d="M120 360C214 240 386 240 480 360 386 480 214 480 120 360z"/><circle cx="300" cy="360" r="58"/><circle cx="300" cy="360" r="22" fill="currentColor" stroke="none" opacity=".8"/><path d="${[...Array(9)].map((_, i) => { const t = (i / 8) * Math.PI * 0.75 + Math.PI * 0.125, x = 300 - Math.cos(t) * 150, y = 330 - Math.sin(t) * 80; return `M${x.toFixed(0)} ${y.toFixed(0)}l${(-Math.cos(t) * 34).toFixed(0)} ${(-Math.sin(t) * 40).toFixed(0)}`; }).join("")}"/>`,
  ceja: () => `<path d="M130 400C220 290 380 280 470 350" stroke-width="12" opacity=".35"/><path d="M130 400C220 290 380 280 470 350"/><path d="${[...Array(14)].map((_, i) => `M${150 + i * 23} ${392 - Math.sin(i / 13 * Math.PI) * 78}l14 -18`).join("")}" opacity=".7"/>`,
  esmalte: () => `<rect x="232" y="330" width="136" height="200" rx="26"/><rect x="270" y="282" width="60" height="50"/><rect x="278" y="160" width="44" height="124" rx="16"/><path d="M262 400h76M262 440h50" opacity=".5"/>`,
  unas: () => `<path d="${[[150, 330, 70], [240, 270, 82], [335, 250, 86], [430, 280, 80], [505, 360, 64]].map(([x, y, w]) => `M${x - w / 2} ${y + 150}V${y + 30}a${w / 2} ${w / 2} 0 0 1 ${w} 0V${y + 150}z`).join("")}"/>`,
  labial: () => `<rect x="258" y="360" width="84" height="190" rx="12"/><rect x="268" y="290" width="64" height="72"/><path d="M270 290l8-110 40 36 0 74z"/><path d="M270 430h60" opacity=".5"/>`,
  brochaMaq: () => `<path d="M290 330h20l8 250h-36z"/><path d="M235 330C225 230 265 170 300 170s75 60 65 160z"/><path d="M270 300c-6-50 4-80 30-96" opacity=".5"/>`,
  recogido: () => `<circle cx="300" cy="220" r="76"/><path d="M200 330C200 280 240 270 300 296c60-26 100-16 100 34v60C400 470 350 540 300 540S200 470 200 390z"/><path d="M455 160l70 36M470 200l56-20" stroke-width="4"/>`,
  frascos: () => `<rect x="130" y="250" width="110" height="290" rx="22"/><rect x="160" y="206" width="50" height="46" rx="8"/><rect x="150" y="330" width="70" height="90" opacity=".6"/><rect x="262" y="320" width="100" height="220" rx="20"/><rect x="288" y="284" width="48" height="38" rx="8"/><path d="M312 284v-40h40" /><rect x="392" y="400" width="104" height="140" rx="18"/><rect x="386" y="372" width="116" height="32" rx="8"/><path d="M90 540h420" stroke-width="3"/>`,
  estante: () => `<path d="M80 470h440" stroke-width="3"/><path d="M80 470v150M520 470v150" opacity=".35"/><rect x="120" y="300" width="84" height="170" rx="16"/><rect x="140" y="264" width="44" height="38" rx="8"/><rect x="236" y="340" width="78" height="130" rx="14"/><rect x="258" y="312" width="34" height="30" rx="6"/><rect x="346" y="366" width="96" height="104" rx="16"/><rect x="340" y="344" width="108" height="26" rx="6"/>`,
  hoja: () => `<path d="M130 520C130 270 260 150 470 150 470 400 340 520 130 520z"/><path d="M130 520L400 250" opacity=".7"/><path d="M250 400l80-4M290 340l70-6" opacity=".5"/>`,
  poste: () => `<rect x="238" y="180" width="124" height="360" rx="62"/><path d="${[...Array(7)].map((_, i) => `M240 ${230 + i * 46}L360 ${196 + i * 46}`).join("")}" opacity=".7"/><path d="M226 180h148M226 540h148"/>`,
  destello: () => `<path d="M300 160l24 112 112 24-112 24-24 112-24-112-112-24 112-24z"/><path d="M460 130l10 34 34 10-34 10-10 34-10-34-34-10 34-10z" opacity=".7"/><path d="M130 480l8 26 26 8-26 8-8 26-8-26-26-8 26-8z" opacity=".7"/>`
};

// ---- Servicio → categoría (dos dibujos por categoría) y texto genérico, sin promesas ni cifras ----
const CATEGORIAS = [
  [/lacead|alisad/, ["mechonesRectos", "plancha"], "Cabello liso, suave y fácil de peinar."],
  [/ondulaci|rizo|permanente/, ["ondas", "mechonesOnda"], "Ondas definidas y con movimiento."],
  [/tinte|color|balayage|mecha|platin|decolor/, ["balayage", "paleta"], "Color, mechas y degradados a tu medida."],
  [/facial|limpieza|mascarilla|masaje|ritual|spa/, ["rostro", "jarra"], "Cuidado de la piel y un momento de relax."],
  [/tratamiento|hidrat|keratin|botox/, ["gota", "gotero"], "Cuidado para devolver brillo y cuerpo."],
  [/barba|afeit|perfil/, ["navaja", "barba"], "Perfilado y arreglo de barba."],
  [/ceja|pesta/, ["ojo", "ceja"], "Una mirada definida y cuidada."],
  [/u[ñn]as|nail|manicur/, ["esmalte", "unas"], "Manos cuidadas y esmaltes a tu gusto."],
  [/maquill/, ["labial", "brochaMaq"], "Maquillaje profesional para cada ocasión."],
  [/peinado|recogido/, ["recogido", "peine"], "Peinados para el día a día y para eventos."],
  [/producto|venta/, ["frascos", "estante"], "Productos para cuidar tu cabello en casa."],
  [/depila/, ["hoja", "gota"], "Depilación y acabado cuidado."],
  [/dise[ñn]o|camuflaje|ocultar/, ["navaja", "poste"], "Detalles y diseños hechos con precisión."],
  [/asesor|looks?|estilo/, ["peine", "poste"], "Asesoría para encontrar tu estilo."],
  [/corte|fade|cabello|peluquer|degradad|cl[aá]sic|kids|ni[ñn]os|caballero/, ["tijeras", "peine"], "Cortes precisos, a tu estilo."],
  [/belleza|cuidado personal/, ["rostro", "jarra"], "Belleza y cuidado personal."],
  [/barber/, ["poste", "tijeras"], "Barbería con atención personalizada."]
];
function categoria(nombre) {
  const n = nombre.toLowerCase();
  const c = CATEGORIAS.find((x) => x[0].test(n));
  return c ? { dibujos: c[1], txt: c[2] } : { dibujos: ["destello", "tijeras"], txt: "Atención profesional, a tu medida." };
}

// Hasta 6 servicios: los reales y, si faltan, categorías genéricas según el tipo de negocio.
function serviciosBase(d) {
  const base = d.k === "Barbería" ? ["Cortes", "Barba", "Estilo"] : d.k === "Spa" ? ["Masajes", "Relax", "Cuidado"] : ["Cabello", "Color", "Tratamientos"];
  const m = [];
  [...(d.sv || []), ...base].forEach((s) => { if (m.length < 6 && !m.some((x) => x.toLowerCase() === s.toLowerCase())) m.push(s); });
  return m;
}

// Tarjetas de una página: título sin el paréntesis de precio, dibujos y texto (el precio, si existe, va en el texto).
function tarjetasDe(d, servicios) {
  return servicios.map((s, i) => {
    const m = s.match(/^(.*?)\s*\((.*)\)\s*$/), titulo = (m ? m[1] : s).trim(), detalle = m ? m[2] : "";
    const c = categoria(titulo);
    return { titulo, detalle, txt: c.txt, img: [`img/s${i + 1}-a.svg`, `img/s${i + 1}-b.svg`], dibujos: c.dibujos };
  });
}

// ---- Fondo decorativo y marco según el estilo ----
function deco(st) {
  const [m1, m2] = st.manchas, W = 600, H = 700;
  const blobs = `<g filter="url(#difuso)"><ellipse cx="170" cy="210" rx="190" ry="230" fill="${m1}" opacity=".55"/><ellipse cx="450" cy="520" rx="200" ry="200" fill="${m2}" opacity=".3"/></g>`;
  switch (st.deco) {
    case "destellos": return blobs + `<g fill="${st.linea}" opacity=".7"><path d="M90 120l6 18 18 6-18 6-6 18-6-18-18-6 18-6z"/><path d="M500 90l5 14 14 5-14 5-5 14-5-14-14-5 14-5z"/><path d="M520 610l6 18 18 6-18 6-6 18-6-18-18-6 18-6z"/></g>`;
    case "anillos": return blobs + `<g fill="none" stroke="${st.linea}" opacity=".22"><circle cx="300" cy="350" r="150"/><circle cx="300" cy="350" r="215"/><circle cx="300" cy="350" r="280"/></g>`;
    case "franjas": return `<g stroke="${st.acento}" stroke-width="2" opacity=".28">${[...Array(26)].map((_, i) => `<path d="M${-200 + i * 50} 760L${200 + i * 50} -60"/>`).join("")}</g>` + blobs;
    case "tramado": return blobs + `<g stroke="${st.linea}" stroke-width="1" opacity=".12">${[...Array(50)].map((_, i) => `<path d="M0 ${i * 14}H600"/>`).join("")}</g>`;
    case "bandas": return `<rect width="${W}" height="${H}" fill="url(#bandasg)"/>`;
    case "zigzag": return `<g fill="none" stroke-width="7"><path d="M-10 60l30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26" stroke="${st.acento}"/><path d="M-10 84l30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26" stroke="${st.linea}"/><path d="M-10 616l30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26" stroke="${st.linea}"/><path d="M-10 640l30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26 30 26 30-26" stroke="${st.acento}"/></g>` + blobs;
    case "rombos": return blobs + `<g fill="none" stroke="${st.linea}" opacity=".2"><path d="M300 40L560 350 300 660 40 350z"/><path d="M300 110L490 350 300 590 110 350z"/><path d="M300 180L420 350 300 520 180 350z"/></g>`;
    case "geometria": return blobs + `<g fill="none" stroke="${st.linea}" opacity=".16"><circle cx="300" cy="350" r="250"/><path d="M300 40V660M-10 350H610"/><circle cx="300" cy="350" r="120"/></g>`;
    case "poste": return `<g stroke="${st.linea}" stroke-width="14" opacity=".1">${[...Array(16)].map((_, i) => `<path d="M${-160 + i * 56} 760L${100 + i * 56} -60"/>`).join("")}</g>` + blobs;
    case "marmol": return blobs + `<g fill="none" stroke="${st.linea}" opacity=".16"><path d="M0 180C120 120 200 260 340 200S520 120 600 190"/><path d="M0 420C140 380 220 520 360 450S520 400 600 470"/><path d="M0 590C100 560 240 640 380 600"/></g>`;
    case "metal": return `<g filter="url(#difuso)"><path d="M-100 700L300-100 460-100 60 700z" fill="#fff" opacity=".7"/><path d="M300 800L700 0 780 0 380 800z" fill="#fff" opacity=".5"/></g>` + blobs;
    case "humo": return `<g filter="url(#difuso)"><ellipse cx="150" cy="520" rx="220" ry="150" fill="${m1}" opacity=".5"/><ellipse cx="470" cy="180" rx="200" ry="170" fill="${m1}" opacity=".4"/><ellipse cx="520" cy="620" rx="110" ry="90" fill="${m2}" opacity=".45"/></g>`;
    default: return blobs;
  }
}
function marco(st) {
  const l = st.linea;
  switch (st.marco) {
    case "rect": return `<rect x="26" y="26" width="548" height="648" fill="none" stroke="${l}" stroke-width="1.4" opacity=".5"/>`;
    case "doble": return `<rect x="22" y="22" width="556" height="656" fill="none" stroke="${l}" stroke-width="1.4" opacity=".55"/><rect x="36" y="36" width="528" height="628" fill="none" stroke="${l}" stroke-width=".8" opacity=".4"/>`;
    case "circulo": return `<circle cx="300" cy="350" r="296" fill="none" stroke="${l}" stroke-width="1.6" opacity=".5"/><circle cx="300" cy="350" r="284" fill="none" stroke="${l}" stroke-width=".8" opacity=".35"/>`;
    case "esquinas": return `<path d="M30 90V30H90M510 30h60v60M570 610v60H510M90 670H30v-60" fill="none" stroke="${l}" stroke-width="2.4" opacity=".7"/>`;
    default: return "";
  }
}

function svg(id, st, dibujo) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" role="img" aria-label="Ilustración referencial">
<defs>
<linearGradient id="fondo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${st.bg[0]}"/><stop offset="1" stop-color="${st.bg[1]}"/></linearGradient>
<linearGradient id="bandasg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${st.bg[0]}"/><stop offset=".35" stop-color="${st.manchas[0]}"/><stop offset=".7" stop-color="${st.bg[0]}"/><stop offset="1" stop-color="${st.manchas[0]}"/></linearGradient>
<filter id="difuso" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="34"/></filter>
<filter id="grano"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${id.length + 3}"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .08 0"/></filter>
</defs>
<rect width="600" height="700" fill="url(#fondo)"/>
${deco(st)}
<rect width="600" height="700" filter="url(#grano)"/>
${marco(st)}
<g fill="none" stroke="${st.linea}" color="${st.acento}" stroke-width="${st.grosor}" stroke-linecap="round" stroke-linejoin="round">${dibujo}</g>
</svg>`;
}

function generar(d) {
  const st = ESTILOS[d.id];
  if (!st) throw new Error("Sin estilo de arte para " + d.id);
  const carpeta = path.join(__dirname, d.id, "img");
  fs.mkdirSync(carpeta, { recursive: true });
  tarjetasDe(d, serviciosBase(d)).forEach((t, i) => {
    fs.writeFileSync(path.join(carpeta, `s${i + 1}-a.svg`), svg(d.id, st, D[t.dibujos[0]]()));
    fs.writeFileSync(path.join(carpeta, `s${i + 1}-b.svg`), svg(d.id, st, D[t.dibujos[1]]()));
  });
}

if (require.main === module) {
  const datos = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "datos.json"), "utf8"));
  const ids = process.argv[2] ? [process.argv[2]] : Object.keys(ESTILOS);
  ids.forEach((id) => { generar(datos.find((x) => x.id === id)); console.log("arte:", id); });
}

module.exports = { ESTILOS, tarjetasDe, categoria, serviciosBase };
