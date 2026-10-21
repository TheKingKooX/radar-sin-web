#!/usr/bin/env node
// Servidor local de Radar sin web: sirve la app y deja que la pestaña Explorar ejecute el buscador (mapas.js).
// Solo escucha en tu propio equipo (127.0.0.1). Uso: node herramientas/servidor.js [--puerto 8787] [--no-abrir]
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const buscador = require("./mapas.js");

const RAIZ = path.join(__dirname, "..");
const args = process.argv.slice(2);
const pedido = args.indexOf("--puerto") > -1 ? parseInt(args[args.indexOf("--puerto") + 1], 10) : 8787;
const NO_ABRIR = args.includes("--no-abrir");
let PUERTO = pedido;

const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8", ".woff2": "font/woff2" };
const BLOQUEADOS = /(^|\/)(\.|herramientas\/|node_modules\/|docs\/)/;

/* ---------- Estado del trabajo en curso (uno a la vez) ---------- */
const job = { corriendo: false, parar: false, etapa: null, log: [], filas: [], centro: null, resultado: null, error: null, inicio: 0 };
const clientes = new Set();
function emitir(tipo, datos) {
  const msg = "event: " + tipo + "\ndata: " + JSON.stringify(datos) + "\n\n";
  for (const r of clientes) { try { r.write(msg); } catch (e) { clientes.delete(r); } }
}
function snapshot() { return { corriendo: job.corriendo, etapa: job.etapa, log: job.log.slice(-300), filas: job.filas, centro: job.centro, resultado: job.resultado, error: job.error }; }

async function iniciar(opciones) {
  Object.assign(job, { corriendo: true, parar: false, etapa: { nombre: "inicio", i: 0, n: 1 }, log: [], filas: [], centro: null, resultado: null, error: null, inicio: Date.now() });
  emitir("estado", snapshot());
  try {
    const res = await buscador.ejecutar(opciones, {
      log: (t) => { job.log.push(t); if (job.log.length > 2000) job.log.shift(); emitir("log", t); },
      etapa: (nombre, i, n, detalle) => { job.etapa = { nombre, i, n, detalle }; emitir("etapa", job.etapa); },
      centro: (c) => { job.centro = c; emitir("centro", c); },
      fila: (f) => { job.filas.push(f); emitir("fila", f); },
      parar: () => job.parar
    });
    job.resultado = { archivo: path.relative(RAIZ, res.salida), cuenta: res.cuenta, parado: res.parado, total: res.datos.negocios.length };
  } catch (e) {
    job.error = e.message; job.log.push("Error: " + e.message);
  } finally {
    job.corriendo = false; job.etapa = null;
    emitir("fin", { resultado: job.resultado, error: job.error });
  }
}

/* ---------- Seguridad: solo la propia app, en este equipo ---------- */
function origenPermitido(req) {
  const host = (req.headers.host || "").toLowerCase();
  if (host !== "localhost:" + PUERTO && host !== "127.0.0.1:" + PUERTO) return false;
  const origen = req.headers.origin;
  return !origen || origen === "http://" + host;
}
function json(res, codigo, obj) { res.writeHead(codigo, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }); res.end(JSON.stringify(obj)); }
function leerCuerpo(req) {
  return new Promise((ok, mal) => {
    let t = ""; req.on("data", (c) => { t += c; if (t.length > 40000) { mal(new Error("Cuerpo demasiado grande")); req.destroy(); } });
    req.on("end", () => { try { ok(t ? JSON.parse(t) : {}); } catch (e) { mal(new Error("JSON inválido")); } });
  });
}

const servidor = http.createServer(async (req, res) => {
  try {
    if (!origenPermitido(req)) { res.writeHead(403); return res.end("Acceso no permitido"); }
    const url = new URL(req.url, "http://localhost");
    const ruta = decodeURIComponent(url.pathname);

    if (ruta.startsWith("/api/")) {
      if (req.method === "POST" && req.headers["x-radar"] !== "1") return json(res, 400, { error: "Falta la cabecera de la app." });
      if (ruta === "/api/estado" && req.method === "GET") {
        return json(res, 200, { ok: true, corriendo: job.corriendo, navegador: !!buscador.buscarNavegador(), rubros: buscador.RUBROS });
      }
      if (ruta === "/api/buscar" && req.method === "POST") {
        if (job.corriendo) return json(res, 409, { error: "Ya hay una búsqueda en curso." });
        let o; try { o = buscador.completar({ ...(await leerCuerpo(req)), app: false, salida: undefined, navegador: undefined }); } catch (e) { return json(res, 400, { error: e.message }); }
        if (!buscador.buscarNavegador()) return json(res, 500, { error: "No encontré Chrome ni Edge en este equipo." });
        iniciar(o);
        return json(res, 202, { ok: true });
      }
      if (ruta === "/api/parar" && req.method === "POST") { job.parar = true; return json(res, 200, { ok: true }); }
      if (ruta === "/api/eventos" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive" });
        res.write("event: estado\ndata: " + JSON.stringify(snapshot()) + "\n\n");
        clientes.add(res);
        const latido = setInterval(() => { try { res.write(": latido\n\n"); } catch (e) {} }, 20000);
        req.on("close", () => { clearInterval(latido); clientes.delete(res); });
        return;
      }
      return json(res, 404, { error: "No existe" });
    }

    // Archivos de la app
    let rel = ruta === "/" ? "index.html" : ruta.replace(/^\/+/, "");
    if (BLOQUEADOS.test(rel) || rel.includes("..")) { res.writeHead(404); return res.end("No encontrado"); }
    const archivo = path.join(RAIZ, rel);
    if (!archivo.startsWith(RAIZ) || !fs.existsSync(archivo) || !fs.statSync(archivo).isFile()) { res.writeHead(404); return res.end("No encontrado"); }
    res.writeHead(200, { "Content-Type": TIPOS[path.extname(archivo).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-cache" });
    fs.createReadStream(archivo).pipe(res);
  } catch (e) { try { json(res, 500, { error: e.message }); } catch (e2) {} }
});

function abrir(url) {
  const [cmd, a] = process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  try { spawn(cmd, a, { stdio: "ignore", detached: true }).unref(); } catch (e) {}
}

function escuchar(p, intentos) {
  PUERTO = p;
  servidor.once("error", (e) => { if (e.code === "EADDRINUSE" && intentos > 0) escuchar(p + 1, intentos - 1); else { console.error("No pude abrir el servidor: " + e.message); process.exit(1); } });
  servidor.listen(p, "127.0.0.1", () => {
    const url = "http://localhost:" + p + "/";
    console.log("Radar sin web está en " + url + "\nDéjame abierto mientras uses el buscador de la pestaña Explorar. Para cerrar: Ctrl+C.");
    if (!NO_ABRIR) abrir(url);
  });
}
escuchar(PUERTO, 10);

process.on("SIGINT", () => {
  if (job.corriendo && !job.parar) { job.parar = true; console.log("\nDeteniendo la búsqueda y guardando lo avanzado… (Ctrl+C otra vez para salir ya)"); return; }
  process.exit(0);
});
