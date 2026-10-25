(function () {
  "use strict";
  var B = window.__BRAND__ || { name: "Lapynta Salón", wa: "51975880001", dias: 6, horario: {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function safe(fn, name) { try { fn(); } catch (e) { if (window.console) console.warn("[" + name + "]", e); } }

  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  // Hora actual en Lima (UTC-5, sin horario de verano), sin depender de la zona del equipo
  function lima() { var n = new Date(); return new Date(n.getTime() + n.getTimezoneOffset() * 60000 - 5 * 3600000); }
  var aMin = function (h) { return +h.slice(0, 2) * 60 + +h.slice(3, 5); };

  // Cabecera: se vuelve sólida al desplazar; menú del celular
  function initCabecera() {
    var nav = $("#nav"), burger = $("#burger"), menu = $("#menu");
    if (nav) { var on = function () { nav.classList.toggle("solid", window.scrollY > 40); }; on(); window.addEventListener("scroll", on, { passive: true }); }
    if (!burger || !menu) return;
    var cerrar = function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); };
    burger.addEventListener("click", function () {
      var abre = !menu.classList.contains("open");
      menu.classList.toggle("open", abre); burger.setAttribute("aria-expanded", abre ? "true" : "false");
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) cerrar(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrar(); });
  }

  // Aparición al desplazar: umbral bajo y red de seguridad
  function initReveals() {
    var els = $$(".rv");
    if (!els.length) return;
    els.forEach(function (el, i) { el.style.setProperty("--dl", (i % 3) * 0.09 + "s"); });
    var mostrar = function (el) { el.classList.add("in"); };
    if (!("IntersectionObserver" in window)) { els.forEach(mostrar); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { mostrar(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () { els.forEach(function (el) { if (!el.classList.contains("in") && el.getBoundingClientRect().top < window.innerHeight) mostrar(el); }); }, 6000);
    setTimeout(function () { els.forEach(mostrar); }, 9000);
  }

  function initCount() {
    var els = $$("[data-count]");
    if (!els.length || !("IntersectionObserver" in window)) return;
    var fmt = function (v, dec) { return v.toFixed(dec).replace(".", ","); };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, fin = parseFloat(el.getAttribute("data-count")), dec = +el.getAttribute("data-dec") || 0, t0 = null;
        function paso(t) {
          if (t0 === null) t0 = t;
          var p = Math.min(1, (t - t0) / 1300), v = fin * (1 - Math.pow(1 - p, 3));
          el.textContent = p < 1 ? fmt(v, dec) : fmt(fin, dec);
          if (p < 1) requestAnimationFrame(paso);
        }
        requestAnimationFrame(paso);
      });
    }, { threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  }

  function initProgreso() {
    var prog = $("#prog");
    if (!prog) return;
    var on = function () { var h = document.documentElement.scrollHeight - window.innerHeight; prog.style.setProperty("--sp", h > 0 ? Math.min(1, window.scrollY / h) : 0); };
    on(); window.addEventListener("scroll", on, { passive: true });
  }

  // Abierto ahora + día de hoy resaltado en el horario
  function initAbierto() {
    var el = $("#ahora"), l = lima(), d = l.getDay(), h = B.horario && B.horario[d];
    $$("#hrs tr").forEach(function (tr) { tr.classList.toggle("hoy", +tr.getAttribute("data-d") === d); });
    if (!el) return;
    var m = l.getHours() * 60 + l.getMinutes(), abierto = h && m >= aMin(h[0]) && m < aMin(h[1]);
    var sig = function () { for (var k = 1; k <= 7; k++) { var dd = (d + k) % 7; if (B.horario[dd]) return [k, dd]; } return null; };
    el.hidden = false; el.classList.toggle("off", !abierto);
    if (abierto) { el.textContent = "Abierto hasta las " + h[1]; return; }
    if (h && m < aMin(h[0])) { el.textContent = "Cerrado · abre hoy a las " + h[0]; return; }
    var s = sig();
    el.textContent = s ? "Cerrado · abre " + (s[0] === 1 ? "mañana" : "el " + DIAS[s[1]]) + " a las " + B.horario[s[1]][0] : "Cerrado";
  }

  // Reserva de ejemplo: día + hora + servicio → mensaje de WhatsApp ya escrito
  function initReserva() {
    var form = $("#book"), diasEl = $("#days"), slotsEl = $("#slots");
    if (!form || !diasEl || !slotsEl || diasEl.children.length) return;
    var svc = $("#svc"), btn = $("#bookBtn"), txt = $("#bookTxt"), left = $("#left");
    var base = lima(); base.setHours(0, 0, 0, 0);
    var dias = [], sel = { d: 0, h: null }, i = 0, f;
    while (dias.length < (B.dias || 6) && i < 14) { f = new Date(base); f.setDate(base.getDate() + i); i++; dias.push(f); }
    var horas = function (f) {
      var r = B.horario[f.getDay()], out = [];
      if (!r) return out;
      for (var m = aMin(r[0]); m + 60 <= aMin(r[1]); m += 60) out.push(("0" + Math.floor(m / 60)).slice(-2) + ":" + ("0" + (m % 60)).slice(-2));
      return out;
    };
    var llave = function (f, h) { var s = f.getMonth() + "-" + f.getDate() + "|" + h, x = 31; for (var k = 0; k < s.length; k++) x = (x * 31 + s.charCodeAt(k)) >>> 0; return x % 100; };
    var lleno = function (f, h) { return llave(f, h) < 38; };
    var pasada = function (f, h) { var n = lima(); return f.getTime() === base.getTime() && aMin(h) <= n.getHours() * 60 + n.getMinutes() + 30; };
    var etiqueta = function (f, k) { return f.getTime() === base.getTime() ? "Hoy" : k === 1 && dias[0].getTime() === base.getTime() ? "Mañana" : DIAS[f.getDay()].slice(0, 3); };
    var largo = function (f) { return DIAS[f.getDay()] + " " + f.getDate() + " de " + MESES[f.getMonth()]; };

    function pintarDias() {
      diasEl.innerHTML = dias.map(function (f, k) {
        return '<button type="button" class="day" data-i="' + k + '" aria-pressed="' + (k === sel.d) + '">' + etiqueta(f, k) + "<b>" + f.getDate() + "</b>" + MESES[f.getMonth()].slice(0, 3) + "</button>";
      }).join("");
    }
    function pintarHoras() {
      var f = dias[sel.d], libres = 0, hs = horas(f);
      slotsEl.innerHTML = hs.map(function (h) {
        var off = lleno(f, h) || pasada(f, h); if (!off) libres++;
        return '<button type="button" class="slot" data-h="' + h + '"' + (off ? " disabled" : "") + ' aria-pressed="' + (sel.h === h) + '">' + h + "</button>";
      }).join("");
      left.textContent = !hs.length ? "Cerrado ese día: elige otro" : libres ? libres + (libres === 1 ? " hora libre" : " horas libres") : "Sin horas ese día: prueba con otro";
    }
    function enlace() {
      var f = dias[sel.d], s = svc.value;
      var m = sel.h ? "Hola, quiero reservar en " + B.name + ": " + s + ", " + largo(f) + " a las " + sel.h + ". ¿Está disponible?" : "Hola, quiero reservar en " + B.name + ": " + s + ". ¿Qué horarios tienen?";
      btn.href = "https://wa.me/" + B.wa + "?text=" + encodeURIComponent(m);
      txt.textContent = sel.h ? "Reservar " + etiqueta(f, sel.d).toLowerCase() + " " + f.getDate() + " · " + sel.h : "Reservar por WhatsApp";
    }
    function todo() { pintarDias(); pintarHoras(); enlace(); }
    diasEl.addEventListener("click", function (e) { var b = e.target.closest(".day"); if (!b) return; sel.d = +b.getAttribute("data-i"); sel.h = null; todo(); });
    slotsEl.addEventListener("click", function (e) { var b = e.target.closest(".slot"); if (!b || b.disabled) return; sel.h = b.getAttribute("data-h"); pintarHoras(); enlace(); });
    svc.addEventListener("change", enlace);
    // «Consultar» en un servicio lo deja elegido en la reserva
    $$("[data-svc]").forEach(function (a) {
      a.addEventListener("click", function () { svc.value = a.getAttribute("data-svc"); enlace(); });
    });
    // Empieza en el primer día que aún tenga horas libres
    for (var q = 0; q < dias.length; q++) {
      if (horas(dias[q]).some(function (h) { return !lleno(dias[q], h) && !pasada(dias[q], h); })) { sel.d = q; break; }
    }
    todo();
  }

  // Barra de reserva del celular: aparece al pasar la portada y se esconde sobre el formulario
  function initBarra() {
    var barra = $("#barra"), res = $("#reserva"), hero = $("#inicio");
    if (!barra) return;
    function on() {
      var past = hero ? hero.getBoundingClientRect().bottom < 60 : window.scrollY > 500, r = res ? res.getBoundingClientRect() : null;
      var sobreForm = r && r.top < window.innerHeight * 0.7 && r.bottom > window.innerHeight * 0.2;
      barra.classList.toggle("off", !past || sobreForm);
    }
    on(); window.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on);
  }

  // Escena 3D de fondo: un rombo de metal (el de su logo) que gira con el scroll, rombos pequeños que flotan
  function initEscena() {
    var cv = $("#gl"), T = window.THREE;
    if (!cv || !T) return;
    var ren;
    try { ren = new T.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: "high-performance" }); }
    catch (e) { cv.style.display = "none"; return; }
    var movil = window.innerWidth < 900;
    ren.setPixelRatio(Math.min(window.devicePixelRatio || 1, movil ? 1.5 : 2));
    ren.outputColorSpace = T.SRGBColorSpace;
    ren.toneMapping = T.ACESFilmicToneMapping; ren.toneMappingExposure = 1;

    var sc = new T.Scene();
    sc.background = new T.Color(0x050505); sc.fog = new T.FogExp2(0x050505, 0.03);
    var cam = new T.PerspectiveCamera(40, 1, 0.1, 100); cam.position.set(0, 0, 8);

    // Entorno de estudio: paneles de luz blanca sobre negro, para que el metal tenga reflejos
    var env = new T.Scene(); env.background = new T.Color(0x060606);
    [[8, 3, 0, 6, 0, 7], [2, 8, -6, 0, 2, 5], [3, 6, 6, 1, -3, 4], [10, 2, 0, -5, 4, 2], [4, 4, 0, 0, -7, 3], [6, 6, 5, 3, 5, 3]].forEach(function (p) {
      var m = new T.Mesh(new T.PlaneGeometry(p[0], p[1]), new T.MeshBasicMaterial({ color: new T.Color(p[5], p[5], p[5]), side: T.DoubleSide }));
      m.position.set(p[2], p[3], p[4]); m.lookAt(0, 0, 0); env.add(m);
    });
    var pm = new T.PMREMGenerator(ren); sc.environment = pm.fromScene(env, 0.03).texture; pm.dispose();

    var mat = new T.MeshPhysicalMaterial({ color: 0x4a4b50, metalness: 0.95, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08, flatShading: true, envMapIntensity: 2.2 });
    var rombo = function (r, esc) { var g = new T.OctahedronGeometry(r, 0); var m = new T.Mesh(g, mat); m.scale.set(esc[0], esc[1], esc[2]); return m; };

    var gem = new T.Group();
    var core = rombo(1.7, [1, 1.28, 1]); gem.add(core);
    var aristas = new T.LineSegments(new T.EdgesGeometry(core.geometry), new T.LineBasicMaterial({ color: 0xe8e8e6, transparent: true, opacity: 0.5 }));
    aristas.scale.copy(core.scale).multiplyScalar(1.004); gem.add(aristas);
    var inner = new T.LineSegments(new T.EdgesGeometry(new T.OctahedronGeometry(1.05, 0)), new T.LineBasicMaterial({ color: 0xcfd3d8, transparent: true, opacity: 0.35 }));
    inner.scale.set(1, 1.28, 1); gem.add(inner);
    sc.add(gem);

    var flot = [], nflot = movil ? 3 : 6;
    for (var i = 0; i < nflot; i++) {
      var f = rombo(0.14 + Math.random() * 0.2, [1, 1.28, 1]);
      f.userData = { a: Math.random() * 6.28, r: 3 + Math.random() * 2.5, y: (Math.random() - 0.5) * 5, v: 0.12 + Math.random() * 0.2, z: -1 - Math.random() * 3 };
      sc.add(f); flot.push(f);
    }

    // 4 luces: clave blanca, relleno frío, contra plateada y un toque cálido bajo
    var ambient = new T.AmbientLight(0xffffff, 0.12); sc.add(ambient);
    [[0xffffff, 55, 4, 5, 5], [0xb9c6d6, 30, -5, 2, 3], [0xe8e8e6, 40, 0, -2, -5], [0xd9c7b0, 14, 2, -4, 4]].forEach(function (l) {
      var p = new T.PointLight(l[0], l[1], 30, 1.6); p.position.set(l[2], l[3], l[4]); sc.add(p);
    });

    // Fotogramas clave por progreso de scroll: lado del rombo, giro y escala (en celular queda centrado y atrás)
    var K = [
      { p: 0, gx: 2.3, gy: 0.1, gz: 0, s: 1, ry: 0.2 },
      { p: 0.2, gx: -2.7, gy: 0.2, gz: -1, s: 1.05, ry: 1.7 },
      { p: 0.42, gx: 2.8, gy: -0.2, gz: -2, s: 0.92, ry: 3.3 },
      { p: 0.62, gx: -2.5, gy: 0, gz: -1.5, s: 1, ry: 4.9 },
      { p: 0.82, gx: 2.5, gy: 0.3, gz: -2, s: 0.95, ry: 6.5 },
      { p: 1, gx: 0, gy: 0, gz: -3, s: 1.35, ry: 8 }
    ];
    var ease = function (t) { return t * t * (3 - 2 * t); };
    function clave(p) {
      var i = 0; while (i < K.length - 2 && p > K[i + 1].p) i++;
      var a = K[i], b = K[i + 1], t = ease(Math.max(0, Math.min(1, (p - a.p) / (b.p - a.p)))), o = {};
      ["gx", "gy", "gz", "s", "ry"].forEach(function (k) { o[k] = a[k] + (b[k] - a[k]) * t; });
      return o;
    }

    var W = 0, H = 0, prog = 0, objetivo = 0, mx = 0, my = 0, tmx = 0, tmy = 0, t0 = performance.now();
    function medir() {
      W = window.innerWidth; H = window.innerHeight; movil = W < 900;
      ren.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix();
    }
    medir(); window.addEventListener("resize", medir);
    var leer = function () { var h = document.documentElement.scrollHeight - window.innerHeight; objetivo = h > 0 ? Math.min(1, window.scrollY / h) : 0; };
    leer(); prog = objetivo; window.addEventListener("scroll", leer, { passive: true });
    window.addEventListener("pointermove", function (e) { tmx = e.clientX / W - 0.5; tmy = e.clientY / H - 0.5; }, { passive: true });

    function pintar(now) {
      var t = (now - t0) / 1000;
      prog += (objetivo - prog) * 0.05; mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
      var k = clave(prog), lado = movil ? 0.12 : 1;
      gem.position.set(k.gx * lado, k.gy + (movil ? 1.1 : 0) + Math.sin(t * 0.6) * 0.1, k.gz - (movil ? 3.2 : 0));
      gem.rotation.y = k.ry + t * 0.12 + mx * 0.6; gem.rotation.x = my * 0.35 + Math.sin(t * 0.3) * 0.05;
      gem.scale.setScalar(k.s * (movil ? 0.85 : 1));
      inner.rotation.y = -t * 0.35;
      flot.forEach(function (f, n) {
        var d = f.userData, a = d.a + t * d.v;
        f.position.set(Math.cos(a) * d.r, d.y + Math.sin(t * 0.5 + n) * 0.35, d.z + Math.sin(a) * 0.8);
        f.rotation.y = t * 0.4 + n; f.rotation.z = Math.sin(t * 0.3 + n) * 0.4;
      });
      ren.render(sc, cam);
      requestAnimationFrame(pintar);
    }
    requestAnimationFrame(pintar);
  }

  function boot() {
    safe(initCabecera, "initCabecera");
    safe(initReveals, "initReveals");
    safe(initCount, "initCount");
    safe(initProgreso, "initProgreso");
    safe(initAbierto, "initAbierto");
    safe(initReserva, "initReserva");
    safe(initBarra, "initBarra");
    safe(initEscena, "initEscena");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
