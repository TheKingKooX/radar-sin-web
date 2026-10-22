#!/usr/bin/env node
// Recolector de negocios de Google Maps: replica el proceso manual (buscar por rubro en varias zonas del radio, filtrar por reseñas
// y abrir cada ficha para leer web, teléfono y dirección). Sin dependencias: maneja Chrome o Edge por el protocolo DevTools.
// Uso: node herramientas/mapas.js --centro "Av. La Mar 2591, San Miguel" --radio 5 --rubro belleza --min-resenas 100 --app
// Ayuda: node herramientas/mapas.js --ayuda
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const RUBROS = {
  belleza: ["barbería", "peluquería", "salón de belleza", "spa", "uñas manicure", "centro de estética"],
  comida: ["restaurante", "cafetería", "panadería pastelería", "pollería", "cevichería", "bar"],
  salud: ["clínica", "dentista", "farmacia", "laboratorio clínico", "fisioterapia"],
  fitness: ["gimnasio", "yoga", "academia de baile"],
  tiendas: ["tienda de ropa", "zapatería", "joyería", "ferretería", "librería", "minimarket", "florería"],
  hogar: ["electricista", "gasfitero", "carpintería", "lavandería", "mudanzas"],
  auto: ["taller mecánico", "lavado de autos", "repuestos automotrices", "grifo"],
  profesional: ["estudio de abogados", "contador", "inmobiliaria", "agencia de marketing", "seguros"],
  educacion: ["academia", "colegio", "instituto", "jardín de niños"],
  mascotas: ["veterinaria", "tienda de mascotas", "peluquería canina"],
  turismo: ["hotel", "hostal", "agencia de viajes", "salón de eventos"],
  ocio: ["discoteca", "karaoke", "cine", "salón de juegos"]
};

function ayuda() {
  console.log(`Recolector de negocios de Google Maps

Opciones:
  --centro "texto o lat,lng"   Centro de la búsqueda (obligatorio)
  --radio 5                    Radio en km (por defecto 5)
  --rubro belleza|comida|...|todos   Grupo de búsquedas (por defecto belleza). Rubros: ${Object.keys(RUBROS).join(", ")}
  --consultas "a,b,c"          Búsquedas propias en lugar de un rubro
  --min-resenas 100            Reseñas mínimas (por defecto 100)
  --teselas 1|5|9              Zonas por búsqueda dentro del círculo (por defecto 5)
  --salida zona.json           Archivo de resultados (por defecto zona-<centro>.json en la raíz del proyecto)
  --app                        Además, deja los resultados cargados en Explorar (index.html)
  --incluir-conocidos          No excluir los negocios que ya están en datos.json
  --limite 0                   Visitar como máximo N fichas (0 = todas); sirve para pruebas
  --ver                        Mostrar la ventana del navegador (por defecto se abre fuera de pantalla)
  --navegador ruta             Ejecutable de Chrome o Edge (o variable NAVEGADOR)
  --sin-verificar              No buscar el nombre de cada negocio en Google para detectar webs que Maps no muestra
  --pausa 1800                 Pausa mínima entre páginas, en milisegundos

Si Google muestra una verificación o un aviso de tráfico inusual, el programa se detiene y guarda lo avanzado:
no intenta saltarla. Vuelve a ejecutarlo más tarde; lo ya leído queda en .cache-mapas y no se repite.`);
}

function leerArgs() {
  const a = process.argv.slice(2), o = { radio: 5, rubro: "belleza", minResenas: 100, teselas: 5, limite: 0, pausa: 1800, conocidos: false, app: false, ver: false };
  for (let i = 0; i < a.length; i++) {
    const k = a[i], v = () => a[++i];
    if (k === "--ayuda" || k === "-h") { ayuda(); process.exit(0); }
    else if (k === "--centro") o.centro = v();
    else if (k === "--radio") o.radio = parseFloat(v());
    else if (k === "--rubro") o.rubro = v();
    else if (k === "--consultas") o.consultas = v().split(",").map((s) => s.trim()).filter(Boolean);
    else if (k === "--min-resenas") o.minResenas = parseInt(v(), 10);
    else if (k === "--teselas") o.teselas = parseInt(v(), 10);
    else if (k === "--salida") o.salida = v();
    else if (k === "--limite") o.limite = parseInt(v(), 10);
    else if (k === "--max-por-rubro") o.maxPorRubro = parseInt(v(), 10);
    else if (k === "--web") o.web = v();
    else if (k === "--sin-verificar") o.verificarWeb = false;
    else if (k === "--pausa") o.pausa = parseInt(v(), 10);
    else if (k === "--navegador") o.navegador = v();
    else if (k === "--app") o.app = true;
    else if (k === "--incluir-conocidos") o.conocidos = true;
    else if (k === "--ver") o.ver = true;
    else { console.error("Opción desconocida: " + k); process.exit(1); }
  }
  if (!o.centro) { console.error('Falta --centro. Ejemplo: --centro "Av. La Mar 2591, San Miguel"'); process.exit(1); }
  if (!(o.radio > 0 && o.radio <= 25)) { console.error("El radio debe estar entre 0 y 25 km."); process.exit(1); }
  if (![1, 5, 9].includes(o.teselas)) { console.error("--teselas debe ser 1, 5 o 9."); process.exit(1); }
  if (!o.consultas) {
    const claves = o.rubro === "todos" ? Object.keys(RUBROS) : o.rubro.split(",");
    for (const c of claves) if (!RUBROS[c]) { console.error("Rubro desconocido: " + c); process.exit(1); }
    o.consultas = claves.flatMap((c) => RUBROS[c]);
    o.grupos = claves.map((c) => ({ k: c, consultas: RUBROS[c] }));
  }
  return o;
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const azar = (a, b) => a + Math.random() * (b - a);

/* ---------- Navegador por DevTools (sin dependencias) ---------- */
function buscarNavegador(pedido) {
  const lista = [pedido, process.env.NAVEGADOR,
    "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge"];
  return lista.filter(Boolean).find((p) => fs.existsSync(p));
}

class Pagina {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pend = new Map();
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && this.pend.has(m.id)) { const p = this.pend.get(m.id); this.pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
    };
  }
  enviar(metodo, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method: metodo, params }));
    return new Promise((res, rej) => { this.pend.set(id, { res, rej }); setTimeout(() => { if (this.pend.has(id)) { this.pend.delete(id); rej(new Error("tiempo agotado en " + metodo)); } }, 120000); });
  }
  async evaluar(expr) {
    const r = await this.enviar("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || "error en la página");
    return r.result.value;
  }
  async ir(url) { await this.enviar("Page.navigate", { url }); await dormir(1200); }
  async url() { try { return await this.evaluar("location.href"); } catch (e) { return ""; } }
  async cerrar() { try { this.ws.close(); } catch (e) {} }
}

async function abrirNavegador(o) {
  const exe = buscarNavegador(o.navegador);
  if (!exe) throw new Error("No encontré Chrome ni Edge. Indica la ruta con --navegador o la variable NAVEGADOR.");
  const puerto = 9300 + Math.floor(Math.random() * 500), perfil = fs.mkdtempSync(path.join(os.tmpdir(), "mapas-"));
  const args = ["--remote-debugging-port=" + puerto, "--user-data-dir=" + perfil, "--window-size=900,1000", "--lang=es-PE", "--accept-lang=es-PE,es",
    "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows"];
  // Con la ventana real Google entrega la lista completa (con reseñas); en modo sin ventana la lista no trae el número de reseñas.
  args.push("--mute-audio");
  if (!o.ver) args.push("--window-position=-2400,-2400");
  args.push("about:blank");
  const proc = spawn(exe, args, { stdio: "ignore", detached: false });
  let info = null;
  for (let i = 0; i < 60 && !info; i++) {
    await dormir(500);
    try { const r = await fetch("http://127.0.0.1:" + puerto + "/json/list"); const l = await r.json(); info = l.find((t) => t.type === "page"); } catch (e) {}
  }
  if (!info) { proc.kill(); throw new Error("El navegador no respondió."); }
  const ws = new WebSocket(info.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("No pude conectar con el navegador.")); });
  const pagina = new Pagina(ws);
  await pagina.enviar("Page.enable"); await pagina.enviar("Runtime.enable");
  await pagina.enviar("Emulation.setDeviceMetricsOverride", { width: 900, height: 1000, deviceScaleFactor: 1, mobile: false });
  return { pagina, cerrar: async () => { await pagina.cerrar(); try { proc.kill(); } catch (e) {} await dormir(500); try { fs.rmSync(perfil, { recursive: true, force: true }); } catch (e) {} } };
}

/* ---------- Funciones que se ejecutan dentro de la página de Google Maps ---------- */
async function paginaLista() {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let i = 0; i < 30 && !document.querySelector('div[role="feed"]'); i++) await sleep(500);
  const feed = document.querySelector('div[role="feed"]');
  if (!feed) return { error: "sin lista", texto: document.body.innerText.slice(0, 300) };
  let ultimo = 0, igual = 0;
  for (let i = 0; i < 45; i++) {
    feed.scrollTop = feed.scrollHeight; await sleep(1100);
    const n = feed.querySelectorAll("a.hfpxzc").length;
    if (/llegado al final|final de la lista/i.test(feed.innerText)) break;
    if (n === ultimo) { if (++igual >= 3) break; } else { igual = 0; ultimo = n; }
  }
  const items = [];
  feed.querySelectorAll("a.hfpxzc").forEach((a) => {
    const card = a.closest(".Nv2PK") || a.parentElement, h = a.href;
    const m = h.match(/!3d(-?[0-9.]+)!4d(-?[0-9.]+)/), k = h.match(/!1s(0x[0-9a-f]+):(0x[0-9a-f]+)/);
    if (!m || !k) return;
    let cid = ""; try { cid = BigInt(k[2]).toString(); } catch (e) {}
    const rt = (card.querySelector(".MW4etd") || {}).innerText || "";
    const rv = ((card.querySelector(".UY7F9") || {}).textContent || "").replace(/[()]/g, "").trim();
    const img = card.querySelector('span[role="img"][aria-label]'), ar = img ? img.getAttribute("aria-label") : "";
    let c = 0;
    const mm = ar.match(/([0-9][0-9.,]*)\s*(mil)?\s*rese[ñn]as/i) || rv.match(/([0-9][0-9.,]*)\s*(mil|k)?/i);
    if (mm) c = /mil|k/i.test(mm[2] || "") ? Math.round(parseFloat(mm[1].replace(",", ".")) * 1000) : parseInt(mm[1].replace(/[.,]/g, ""), 10) || 0;
    const lineas = card.innerText.split("\n").map((s) => s.trim()).filter(Boolean);
    const det = lineas.find((l) => l.indexOf("·") > -1 && !/Cerrado|Abierto|Abre/.test(l)) || "";
    items.push({ cid, n: (a.getAttribute("aria-label") || "").replace(/·Enlace visitado/g, "").trim(), r: parseFloat(rt.replace(",", ".")) || 0, c, det, la: +m[1], lo: +m[2] });
  });
  return { items };
}

async function paginaDetalle() {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let i = 0; i < 50 && !document.querySelector('[data-item-id="address"]'); i++) {
    const sc = document.querySelector(".m6QErb.DxyBCb.kA9KIf.dS8AEf") || document.querySelector('div[role="main"]');
    if (sc) sc.scrollTop = (i % 4) * 260 + 200;
    await sleep(500);
  }
  await sleep(400);
  const dir = document.querySelector('[data-item-id="address"]'), au = document.querySelector('a[data-item-id="authority"]'), ph = document.querySelector('button[data-item-id^="phone"]');
  const limpiar = (e) => (e ? (e.getAttribute("aria-label") || "").replace(/^[^:]*:\s*/, "").trim() : "");
  return { ok: !!dir, web: au ? au.href : "", tel: limpiar(ph), dir: limpiar(dir), h1: (document.querySelector("h1") || {}).innerText || "", texto: document.body.innerText.slice(0, 300) };
}

/* ---------- Clasificación del enlace web ---------- */
const REDES = { "instagram.com": "Instagram", "facebook.com": "Facebook", "fb.com": "Facebook", "fb.me": "Facebook", "tiktok.com": "TikTok", "wa.me": "WhatsApp", "whatsapp.com": "WhatsApp", "youtube.com": "YouTube", "youtu.be": "YouTube" };
const AGREG = ["linktr.ee", "beacons.ai", "bio.link", "taplink.cc", "msha.ke", "lnk.bio", "campsite.bio", "solo.to", "carrd.co"];
const RESERVAS = ["agendapro.com", "fresha.com", "weibook.co", "booksy.com", "treatwell.com", "calendly.com", "setmore.com", "simplybook.me", "planity.com", "timify.com", "mindbodyonline.com", "reservo.cl", "squareup.com", "booker.com"];
const coincide = (host, lista) => lista.find((h) => host === h || host.endsWith("." + h));
function tipoWeb(uri) {
  if (!uri) return "sin enlace";
  let host = ""; try { host = new URL(uri).hostname.toLowerCase().replace(/^www\./, ""); } catch (e) {}
  if (coincide(host, Object.keys(REDES)) || coincide(host, AGREG)) return "solo red social";
  if (coincide(host, RESERVAS)) return "solo reservas";
  return "web propia";
}
function limpiarUrl(u) { try { const x = new URL(u); ["utm_source", "utm_medium", "utm_campaign", "utm_content", "igsh", "igshid", "igsi", "ig", "hl", "_rdc", "_rdr", "refsrc", "locale"].forEach((p) => x.searchParams.delete(p)); return x.toString().replace(/\?$/, ""); } catch (e) { return u; } }

/* ---------- Utilidades de mapa ---------- */
function dkm(a, b) {
  const r = Math.PI / 180, dl = (b.la - a.la) * r, dn = (b.lo - a.lo) * r;
  const x = Math.sin(dl / 2) ** 2 + Math.cos(a.la * r) * Math.cos(b.la * r) * Math.sin(dn / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
}
function teselas(c, radioKm, n) {
  if (n === 1) return [c];
  const d = radioKm * 0.45, dLa = d / 111.32, dLo = d / (111.32 * Math.cos((c.la * Math.PI) / 180));
  const v = n === 5 ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  return [c, ...v.map(([a, b]) => ({ la: c.la + a * dLa, lo: c.lo + b * dLo }))];
}
function zoomPara(radioKm) { return radioKm <= 1.5 ? 16 : radioKm <= 3 ? 15 : radioKm <= 7 ? 14 : radioKm <= 14 ? 13 : 12; }
const BLOQUEO = /tr[aá]fico inusual|unusual traffic|no eres un robot|not a robot|captcha|recaptcha/i;

async function verificar(p, o, etapa) {
  const url = await p.url();
  if (/consent\.google/.test(url)) throw new Error("Google pidió aceptar cookies (" + etapa + "). Ábrelo una vez con --ver y acepta, o ejecuta desde una red donde no lo pida.");
  if (/google\.com\/sorry/.test(url)) throw new Error("Google mostró una verificación de tráfico (" + etapa + "). Espera un rato y vuelve a ejecutar; no la salto.");
}

/* ---------- Programa principal ---------- */
function filaDe(x, f, pw, verificado) {
  const partes = x.det.split("·").map((s) => s.trim()), cat = partes[0] || "";
  const dir = (f.dir || "").replace(/,?\s*(San Miguel|Magdalena del Mar|Jesús María|Pueblo Libre|Lima|San Isidro|Callao|Breña|Lince)\b.*$/i, "").trim() || partes.slice(1).join(", ");
  return [x.n, x.r, x.c, cat, dir, f.tel || "", f.web ? limpiarUrl(f.web) : "", +x.la.toFixed(6), +x.lo.toFixed(6), x.cid, pw || null, verificado === undefined ? null : verificado];
}

// Valida y completa las opciones (la usa el servidor del buscador de la app)
const TIPOS_WEB = ["sin enlace", "solo red social", "solo reservas", "web propia"]; // lo que devuelve tipoWeb()
function completar(raw) {
  const o = { radio: 5, minResenas: 100, teselas: 5, limite: 0, pausa: 1800, conocidos: false, app: false, ver: false, ...raw };
  o.centro = String(o.centro || "").trim();
  if (!o.centro) throw new Error("Falta el centro de la búsqueda.");
  o.radio = parseFloat(o.radio); o.minResenas = parseInt(o.minResenas, 10) || 0; o.teselas = parseInt(o.teselas, 10); o.limite = parseInt(o.limite, 10) || 0; o.pausa = Math.max(1000, parseInt(o.pausa, 10) || 1800);
  if (!(o.radio > 0 && o.radio <= 25)) throw new Error("El radio debe estar entre 0 y 25 km.");
  if (![1, 5, 9].includes(o.teselas)) throw new Error("La cobertura debe ser 1, 5 o 9 zonas.");
  const lista = (v) => (typeof v === "string" ? v.split(/[,\n]/) : v || []).map((s) => String(s).trim()).filter(Boolean);
  // Rubros: cada grupo {k, consultas}; el tope (maxPorRubro) se aplica a cada grupo por separado.
  let grupos = Array.isArray(o.grupos) ? o.grupos.map((g) => ({ k: String(g.k || "otros"), consultas: lista(g.consultas) })).filter((g) => g.consultas.length) : [];
  if (!grupos.length) grupos = [{ k: "todo", consultas: lista(o.consultas) }];
  const c = [...new Set(grupos.flatMap((g) => g.consultas))].slice(0, 60);
  if (!c.length || !grupos[0].consultas.length) throw new Error("Elige al menos un rubro o escribe una búsqueda.");
  o.consultas = c; o.grupos = grupos;
  o.verificarWeb = raw.verificarWeb !== false;
  o.maxPorRubro = Math.max(0, parseInt(o.maxPorRubro, 10) || 0);
  const w = lista(o.web).map((s) => s.toLowerCase()).filter((s) => TIPOS_WEB.includes(s));
  if (o.web !== undefined && !w.length) throw new Error("Elige al menos un tipo de presencia web.");
  o.web = w.length ? w : TIPOS_WEB.slice();
  return o;
}

/* ---------- Verificación en Google: ¿el negocio tiene una web que Maps no muestra? ---------- */
// Se ejecuta dentro de la página de resultados de Google: devuelve los resultados orgánicos y el sitio oficial del panel, si hay.
function paginaBusqueda() {
  const items = [], vistos = new Set();
  // Google enlaza con /goto?url=… (redirección); la dirección real es la que muestra el <cite> bajo el título.
  document.querySelectorAll("#search a, #rso a").forEach((a) => {
    const h3 = a.querySelector("h3"); if (!h3) return;
    const cite = a.querySelector("cite"), ct = cite ? cite.textContent.trim() : "";
    let u = /^https?:\/\//.test(ct) ? ct.split(/\s›|\s…/)[0].trim() : (/^https?:/.test(a.href) && !/(^|\.)google\./.test(new URL(a.href).hostname) ? a.href : "");
    if (!u || vistos.has(u)) return;
    vistos.add(u);
    const cont = a.closest("div.MjjYud, div.g, div[data-hveid]") || a.parentElement;
    items.push({ u, t: h3.textContent.trim(), s: ((cont && cont.innerText) || "").slice(0, 500) });
  });
  // Botón «Sitio web» del panel del negocio (si Google lo muestra)
  const pan = [...document.querySelectorAll("a")].find((a) => /^(sitio web|website)$/i.test((a.innerText || "").trim()) && /^https?:/.test(a.href) && !/(^|\.)google\./.test(new URL(a.href).hostname));
  return { ok: !!document.querySelector("#search, #rso, #main"), hayResultados: items.length > 0, items: items.slice(0, 10), panel: pan ? pan.href : null, texto: (document.body.innerText || "").slice(0, 700) };
}

const normTxt = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const GENERICAS = new Set("barberia barberias barber barbershop barbero barberos shop salon salones spa peluqueria estetica studio estudio centro club de la el los las del y en for men mens by premium clasico clasica belleza unisex nails unas lima peru store sede".split(" "));
const DIRECTORIOS = [...Object.keys(REDES), ...AGREG, ...RESERVAS, "google.com", "tripadvisor.com", "tripadvisor.pe", "yelp.com", "paginasamarillas.com.pe", "foursquare.com", "waze.com", "wikipedia.org", "linkedin.com", "pinterest.com", "mercadolibre.com.pe", "olx.pe", "cybo.com", "infoisinfo.com.pe", "cylex.com.pe", "booking.com", "rappi.pe", "pedidosya.com.pe", "glovoapp.com", "twitter.com", "x.com", "threads.net", "bing.com", "yahoo.com", "duckduckgo.com", "apple.com", "yellowpages.com", "guialocal.pe", "dateas.com", "bestbarbershops.com", "fresha.com"];

// Palabras propias del nombre (sin «barbería», «salón», etc.)
function palabrasDeNombre(nombre) {
  const base = String(nombre).split(/\s[-–|·]\s|\(/)[0];
  return normTxt(base).split(" ").filter((w) => w.length > 1 && !GENERICAS.has(w));
}

// Decide si algún resultado de Google parece la web del negocio. Devuelve { u, c: "alta"|"media", m } o null.
function elegirWeb(x, d, r) {
  const palabras = palabrasDeNombre(x.n);
  if (!palabras.length) return null;
  const tel = String(d.tel || "").replace(/\D/g, "").slice(-8), calle = normTxt(String(d.dir || "").replace(/^(av|avenida|jr|jiron|calle|ca|psje|pasaje)\.?\s+/i, "")).split(" ").slice(0, 2).join(" ");
  const origen = (u) => { try { const x2 = new URL(u); return x2.origin + "/"; } catch (e) { return u; } };
  const hostDe = (u) => { try { return new URL(u).hostname.toLowerCase().replace(/^www\./, ""); } catch (e) { return ""; } };
  if (r.panel && !coincide(hostDe(r.panel), DIRECTORIOS)) return { u: origen(r.panel), c: "alta", m: "Sitio oficial que muestra Google" };
  let mejor = null;
  for (const it of r.items) {
    const host = hostDe(it.u); if (!host || coincide(host, DIRECTORIOS)) continue;
    const compacto = host.replace(/\.(com|net|org|pe|co|info|site|online|shop|store|app|lat|studio|biz)(\.[a-z]{2})?$/, "").replace(/[^a-z0-9]/g, "");
    const texto = normTxt(it.t + " " + it.s), digitos = (it.t + " " + it.s).replace(/\D/g, "");
    let puntos = 0, local = false; const motivos = [];
    if (palabras.every((w) => compacto.includes(w))) { puntos += 3; motivos.push("el dominio lleva el nombre"); }
    if (palabras.every((w) => texto.includes(w))) { puntos += 2; motivos.push("el título o texto lleva el nombre"); }
    if (tel.length >= 8 && digitos.includes(tel)) { puntos += 3; motivos.push("aparece su teléfono"); local = true; }
    if (calle && calle.length > 3 && texto.includes(calle)) { puntos += 2; motivos.push("aparece su dirección"); local = true; }
    if (/\.pe$/.test(host) || /\b(lima|peru)\b/.test(texto)) { puntos += 1; local = true; motivos.push("es de Perú"); }
    // Sin ninguna señal de que sea el mismo negocio (Perú, teléfono o dirección) se descarta: puede ser un homónimo de otro país.
    if (puntos >= 4 && local && (!mejor || puntos > mejor.puntos)) mejor = { puntos, u: origen(it.u), c: puntos >= 6 ? "alta" : "media", m: motivos.join(", ") };
  }
  return mejor ? { u: mejor.u, c: mejor.c, m: mejor.m.charAt(0).toUpperCase() + mejor.m.slice(1) } : null;
}

async function ejecutar(o, hooks = {}) {
  const h = { log() {}, etapa() {}, fila() {}, parar: () => false, ...hooks };
  const cache = path.join(RAIZ, ".cache-mapas"); fs.mkdirSync(cache, { recursive: true });
  const archivoFichas = path.join(cache, "fichas.json");
  const fichas = fs.existsSync(archivoFichas) ? JSON.parse(fs.readFileSync(archivoFichas, "utf8")) : {};
  const guardarFichas = () => fs.writeFileSync(archivoFichas, JSON.stringify(fichas));
  const archivoVerif = path.join(cache, "verificacion-web.json");
  const verif = fs.existsSync(archivoVerif) ? JSON.parse(fs.readFileSync(archivoVerif, "utf8")) : {};
  let verifActiva = o.verificarWeb;
  const { pagina: p, cerrar } = await abrirNavegador(o);
  let centro = null, parado = false;
  const nombreCentro = o.centro;
  try {
    // 1) Centro
    const ll = o.centro.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (ll) { centro = { la: +ll[1], lo: +ll[2] }; }
    else {
      h.etapa("centro", 0, 1);
      await p.ir("https://www.google.com/maps/search/" + encodeURIComponent(o.centro) + "?hl=es"); await verificar(p, o, "centro");
      for (let i = 0; i < 40 && !centro; i++) {
        await dormir(500);
        const u = await p.url(), m = u.match(/!3d(-?[0-9.]+)!4d(-?[0-9.]+)/) || u.match(/@(-?[0-9.]+),(-?[0-9.]+),/);
        if (m && /\/maps\/place\//.test(u)) centro = { la: +m[1], lo: +m[2] };
      }
      if (!centro) throw new Error("No pude ubicar «" + o.centro + "». Prueba con una dirección más completa o con coordenadas (lat,lng).");
    }
    if (h.centro) h.centro({ nombre: nombreCentro, la: centro.la, lo: centro.lo, radioKm: o.radio });
    h.log("Centro: " + nombreCentro + " (" + centro.la.toFixed(5) + ", " + centro.lo.toFixed(5) + "), radio " + o.radio + " km");

    // 2) Búsquedas por rubro y zona
    const zonas = teselas(centro, o.radio, o.teselas), zoom = zoomPara(o.radio), encontrados = {};
    const total = o.consultas.length * zonas.length; let hecho = 0;
    const qgrupo = {}; o.grupos.forEach((g) => g.consultas.forEach((q) => { if (!(q in qgrupo)) qgrupo[q] = g.k; }));
    const urlBusqueda = (q, z) => "https://www.google.com/maps/search/" + encodeURIComponent(q) + "/@" + z.la.toFixed(6) + "," + z.lo.toFixed(6) + "," + zoom + "z?hl=es&entry=ttu";
    busquedas: for (const q of o.consultas) for (const z of zonas) {
      if (h.parar()) { parado = true; break busquedas; }
      hecho++; h.etapa("busquedas", hecho, total, q);
      const pre = "[" + hecho + "/" + total + "] «" + q + "» en " + z.la.toFixed(3) + "," + z.lo.toFixed(3) + " … ";
      await p.ir(urlBusqueda(q, z)); await verificar(p, o, "búsqueda");
      let r = await p.evaluar("(" + paginaLista + ")()");
      if (r.error || !r.items.length) { await dormir(4000); await p.ir(urlBusqueda(q, z)); await verificar(p, o, "búsqueda"); r = await p.evaluar("(" + paginaLista + ")()"); } // un reintento si vino vacía
      if (r.error) { if (BLOQUEO.test(r.texto || "")) throw new Error("Google mostró una verificación (" + q + "). Espera un rato y vuelve a intentar."); h.log(pre + "sin resultados"); }
      else {
        let nuevos = 0;
        r.items.forEach((it) => { if (it.cid && !encontrados[it.cid]) { encontrados[it.cid] = { ...it, g: qgrupo[q] }; nuevos++; } });
        h.log(pre + r.items.length + " locales, " + nuevos + " nuevos");
      }
      await dormir(o.pausa + azar(0, 900));
    }

    // 3) Filtrar por radio y reseñas, y excluir los conocidos
    const conocidos = new Set();
    if (!o.conocidos) {
      try { for (const x of JSON.parse(fs.readFileSync(path.join(RAIZ, "datos.json"), "utf8"))) { const m = String(x.m || "").match(/cid=(\d+)/); if (m) conocidos.add(m[1]); } } catch (e) {}
    }
    let cand = Object.values(encontrados).map((x) => ({ ...x, d: dkm(centro, x) }))
      .filter((x) => x.d <= o.radio * 1.01 && x.c >= o.minResenas && !conocidos.has(x.cid))
      .sort((a, b) => b.c - a.c);
    h.log("Encontrados: " + Object.keys(encontrados).length + "; en " + o.radio + " km con " + o.minResenas + "+ reseñas" + (o.conocidos ? "" : " y que no están en tu lista") + ": " + cand.length);

    // 4) Abrir las fichas, rubro por rubro (de más a menos reseñas), y quedarse con las que cumplen el filtro de web.
    // Con tope por rubro se deja de leer ese rubro cuando ya hay suficientes negocios que cumplen.
    const porGrupo = {}; cand.forEach((x) => { (porGrupo[x.g] = porGrupo[x.g] || []).push(x); });
    const tope = (n) => (o.maxPorRubro > 0 ? Math.min(n, o.maxPorRubro) : n);
    const aLeer = o.grupos.reduce((s, g) => s + tope((porGrupo[g.k] || []).length), 0);
    let i = 0, leidas = 0; const negocios = [];
    grupos: if (!parado) for (const g of o.grupos) {
      let n = 0;
      for (const x of porGrupo[g.k] || []) {
        if (o.maxPorRubro > 0 && n >= o.maxPorRubro) break;
        if (h.parar()) { parado = true; break grupos; }
        if (o.limite > 0 && leidas >= o.limite) break grupos;
        i++; leidas++; h.etapa("fichas", i, Math.max(aLeer, i), x.n);
        const pre = "[" + i + "/" + Math.max(aLeer, i) + "] " + x.n + " … ";
        let d = fichas[x.cid];
        const enCache = !!(d && d.ok);
        if (enCache) h.log(pre + "(ya leída)");
        else {
          await p.ir("https://www.google.com/maps?cid=" + x.cid + "&hl=es"); await verificar(p, o, "ficha");
          d = await p.evaluar("(" + paginaDetalle + ")()");
          if (!d.ok && BLOQUEO.test(d.texto || "")) { guardarFichas(); throw new Error("Google mostró una verificación en una ficha. Lo avanzado quedó guardado; vuelve a intentar más tarde."); }
          fichas[x.cid] = d; guardarFichas();
          h.log(pre + (d.ok ? tipoWeb(d.web) : "sin datos"));
        }
        if (d.ok && o.web.includes(tipoWeb(d.web))) {
          let pw = null, verificado = null; // verificado: true = se buscó en Google, false = no se pudo, null = no corresponde
          // Maps no muestra una web propia: se busca el nombre en Google por si existe una que Maps no enlaza.
          if (verifActiva && tipoWeb(d.web) !== "web propia") {
            const vc = verif[x.cid];
            if (vc && Date.now() - vc.t < 14 * 864e5) { pw = vc.pw; verificado = true; h.log("   verificación en Google: " + (pw ? "posible web " + pw.u + " (cache)" : "sin web (cache)")); }
            else {
              try {
                const nombre = String(x.n).split(/\s[-–|·]\s|\(/)[0].trim();
                const url = "https://www.google.com/search?q=" + encodeURIComponent('"' + nombre + '" Lima') + "&hl=es&gl=pe&num=10";
                await p.ir(url); await verificar(p, o, "verificación web");
                const r = await p.evaluar("(" + paginaBusqueda + ")()");
                if (BLOQUEO.test(r.texto || "")) throw new Error("Google mostró una verificación de tráfico (verificación web).");
                if (!r.hayResultados && !r.panel) h.log("   verificación en Google: la página no trajo resultados; no se pudo verificar", verificado = false);
                else { verificado = true; pw = elegirWeb(x, d, r); verif[x.cid] = { pw, t: Date.now() }; fs.writeFileSync(archivoVerif, JSON.stringify(verif)); h.log("   verificación en Google: " + (pw ? "POSIBLE WEB " + pw.u + " (coincidencia " + pw.c + ": " + pw.m + ")" : "no se encontró una web")); }
                await dormir(Math.max(o.pausa, 7000) + azar(0, 5000)); // Google Search es más sensible que Maps: ritmo lento a propósito
              } catch (e) { verifActiva = false; verificado = false; h.log("   " + e.message + " Se omite la verificación en Google para el resto; los negocios siguen guardándose."); }
            }
          }
          if (o.verificarWeb && tipoWeb(d.web) !== "web propia" && verificado === null) verificado = false;
          const fila = filaDe(x, d, pw, verificado); negocios.push(fila); n++; h.fila(fila);
        }
        else if (d.ok) h.log("   descartado por el filtro de web (" + tipoWeb(d.web) + ")");
        if (!enCache) await dormir(o.pausa + azar(0, 900));
      }
    }

    // 5) Resultados (solo las fichas leídas bien que cumplen el filtro)
    const slug = o.centro.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
    const salida = path.resolve(RAIZ, o.salida || "zona-" + slug + ".json");
    const datos = { centro: { nombre: nombreCentro, la: centro.la, lo: centro.lo, radioKm: o.radio },
      nota: "Recolectado de Google Maps el " + new Date().toISOString().slice(0, 10) + " (" + o.consultas.join(", ") + "); " + o.minResenas + "+ reseñas dentro de " + o.radio + " km; web: " + o.web.join(", ") + (o.maxPorRubro ? "; hasta " + o.maxPorRubro + " por rubro" : "") + (parado ? " (búsqueda detenida antes de terminar)" : "") + ". Filas: [nombre, puntaje, reseñas, categoría, dirección, teléfono, enlace web de Google, latitud, longitud, cid].",
      negocios };
    fs.writeFileSync(salida, JSON.stringify(datos, null, 1));
    const cuenta = { "sin enlace": 0, "solo red social": 0, "solo reservas": 0, "web propia": 0 };
    negocios.forEach((n) => { cuenta[tipoWeb(n[6])]++; });
    h.log((parado ? "Detenido: " : "Listo: ") + negocios.length + " negocios → " + path.relative(RAIZ, salida));
    h.log(Object.entries(cuenta).map(([k, v]) => k + ": " + v).join(" · "));
    if (o.verificarWeb) h.log("posible web encontrada en Google: " + negocios.filter((n) => n[10]).length + " de " + negocios.length);

    if (o.app) {
      const idx = path.join(RAIZ, "index.html"); let html = fs.readFileSync(idx, "utf8");
      const ini = html.indexOf("var ZONA = ");
      if (ini < 0) h.log("index.html no tiene la variable ZONA; no se actualizó la app.");
      else {
        const lineaFin = html.indexOf("\n", ini);
        html = html.slice(0, ini) + "var ZONA = " + JSON.stringify({ centro: datos.centro, negocios }) + ";" + html.slice(lineaFin);
        fs.writeFileSync(idx, html); h.log("Explorar actualizado en index.html con estos resultados.");
      }
    }
    return { datos, salida, cuenta, parado };
  } finally { await cerrar(); }
}

module.exports = { ejecutar, completar, RUBROS, tipoWeb, buscarNavegador, elegirWeb, palabrasDeNombre };

if (require.main === module) {
  const o = leerArgs();
  let parar = false;
  process.on("SIGINT", () => { if (parar) process.exit(130); parar = true; console.log("\nDeteniendo y guardando lo avanzado… (Ctrl+C otra vez para salir ya)"); });
  ejecutar(o, { log: (t) => console.log(t), parar: () => parar }).catch((e) => { console.error("\nError: " + e.message); process.exit(1); });
}
