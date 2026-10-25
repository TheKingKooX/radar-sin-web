(function () {
  "use strict";
  var B = window.__BRAND__ || { name: "Highcuts Barber Shop", wa: "51980864616", dias: 6, horario: {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function safe(fn, name) { try { fn(); } catch (e) { if (window.console) console.warn("[" + name + "]", e); } }

  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  // Hora actual en Lima (UTC-5, sin horario de verano), sin depender de la zona del equipo
  function lima() { var n = new Date(); return new Date(n.getTime() + n.getTimezoneOffset() * 60000 - 5 * 3600000); }
  var aMin = function (h) { return +h.slice(0, 2) * 60 + +h.slice(3, 5); };

  function initNav() {
    var nav = $("#nav"), burger = $("#burger"), links = $("#links");
    if (nav) { var on = function () { nav.classList.toggle("solid", window.scrollY > 24); }; on(); window.addEventListener("scroll", on, { passive: true }); }
    if (!burger || !links) return;
    var cerrar = function () { links.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); };
    burger.addEventListener("click", function () {
      var abre = !links.classList.contains("open");
      links.classList.toggle("open", abre); burger.setAttribute("aria-expanded", abre ? "true" : "false");
    });
    links.addEventListener("click", function (e) { if (e.target.closest("a")) cerrar(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrar(); });
  }

  // Aparición al desplazar: umbral bajo y red de seguridad
  function initReveals() {
    var els = $$(".rv");
    if (!els.length) return;
    els.forEach(function (el, i) { el.style.setProperty("--dl", (i % 3) * 0.08 + "s"); });
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

  // Firma de la página: un foco de luz sigue al cursor y revela la foto a color.
  // Sin mouse (celular), el foco recorre la foto solo.
  function initFoco() {
    var hero = $(".hero");
    if (!hero) return;
    var x = 0.7, y = 0.4, tx = 0.7, ty = 0.4, activo = false;
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; activo = true;
    }, { passive: true });
    hero.addEventListener("pointerleave", function () { activo = false; });
    function frame(t) {
      requestAnimationFrame(frame);
      if (document.hidden) return;
      if (!activo) { tx = 0.62 + 0.18 * Math.sin(t / 2600); ty = 0.38 + 0.16 * Math.cos(t / 3300); }
      x += (tx - x) * 0.07; y += (ty - y) * 0.07;
      hero.style.setProperty("--mx", (x * 100).toFixed(1) + "%"); hero.style.setProperty("--my", (y * 100).toFixed(1) + "%");
    }
    requestAnimationFrame(frame);
  }

  // Fondo: campo de agujas que apuntan al cursor (como el degradado de un fade).
  // Cerca del cursor se alargan y se encienden en naranja; sin mouse, un punto virtual pasea solo.
  function initFondo() {
    var cv = $("#fondo");
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = 1, paso = 44;
    var px = -1, py = -1, vx = 0.5, vy = 0.4, activo = false, scroll = 0;
    function medir() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paso = W < 700 ? 34 : 44;
    }
    medir(); window.addEventListener("resize", medir);
    window.addEventListener("pointermove", function (e) { px = e.clientX; py = e.clientY; activo = true; }, { passive: true });
    document.addEventListener("pointerleave", function () { activo = false; });
    window.addEventListener("scroll", function () { scroll = window.pageYOffset; }, { passive: true });
    var sx = W * 0.6, sy = H * 0.4;
    function frame(t) {
      requestAnimationFrame(frame);
      if (document.hidden) return;
      var tx = activo ? px : W * (0.5 + 0.32 * Math.sin(t / 3400)), ty = activo ? py : H * (0.45 + 0.3 * Math.cos(t / 4300));
      sx += (tx - sx) * 0.08; sy += (ty - sy) * 0.08;
      ctx.clearRect(0, 0, W, H);
      var off = (scroll * 0.25) % paso, r = Math.min(W, H) * 0.42, lw = 1.5;
      ctx.lineCap = "round";
      for (var y = -off; y < H + paso; y += paso) {
        for (var x = paso / 2; x < W + paso; x += paso) {
          var dx = sx - x, dy = sy - y, d = Math.sqrt(dx * dx + dy * dy);
          var cerca = Math.max(0, 1 - d / r), ang = Math.atan2(dy, dx) + 0.4 * Math.sin(t / 2200 + x * 0.01 + y * 0.013) * (1 - cerca);
          var len = 4 + 18 * cerca * cerca + 2 * Math.sin(t / 1500 + x * 0.02);
          ctx.strokeStyle = cerca > 0.04 ? "rgba(255,106,19," + (0.15 + 0.7 * cerca).toFixed(2) + ")" : "rgba(253,253,253,.1)";
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.moveTo(x - Math.cos(ang) * len / 2, y - Math.sin(ang) * len / 2);
          ctx.lineTo(x + Math.cos(ang) * len / 2, y + Math.sin(ang) * len / 2);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }

  // Manifiesto: cada palabra se enciende según el desplazamiento
  function initManifiesto() {
    var p = $("#manif");
    if (!p) return;
    var palabras = p.textContent.trim().split(/\s+/);
    p.innerHTML = palabras.map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
    var ws = $$(".w", p);
    if (!window.gsap || !window.ScrollTrigger) return; // sin librería, el texto queda completo
    window.gsap.registerPlugin(window.ScrollTrigger);
    p.classList.add("on");
    window.ScrollTrigger.create({
      trigger: p, start: "top 82%", end: "bottom 45%", scrub: true,
      onUpdate: function (s) { var n = Math.round(s.progress * ws.length); ws.forEach(function (w, i) { w.classList.toggle("l", i < n); }); }
    });
    setTimeout(function () { if (!p.querySelector(".l") && p.getBoundingClientRect().top < 0) ws.forEach(function (w) { w.classList.add("l"); }); }, 8000);
  }

  // Acordeón de servicios: solo uno abierto a la vez
  function initAcordeon() {
    var hs = $$(".acc-h");
    function estado(h, abre) {
      h.setAttribute("aria-expanded", abre ? "true" : "false");
      var p = document.getElementById(h.getAttribute("aria-controls"));
      if (p) p.classList.toggle("open", abre);
    }
    hs.forEach(function (h) {
      h.addEventListener("click", function () {
        var abre = h.getAttribute("aria-expanded") !== "true";
        hs.forEach(function (o) { estado(o, false); });
        estado(h, abre);
      });
    });
  }

  // Carril de trabajos: botones, barra de avance y rueda en horizontal
  function initCarril() {
    var reel = $("#reel"), bar = $("#reelBar"), prev = $("#rPrev"), next = $("#rNext");
    if (!reel) return;
    var paso = function () { var c = reel.firstElementChild; return c ? c.getBoundingClientRect().width + 18 : 400; };
    function prog() { var max = reel.scrollWidth - reel.clientWidth; if (bar) bar.parentNode.style.setProperty("--rp", max > 0 ? (0.2 + 0.8 * reel.scrollLeft / max).toFixed(3) : 1); if (bar) bar.style.setProperty("--rp", max > 0 ? (0.2 + 0.8 * reel.scrollLeft / max).toFixed(3) : 1); }
    reel.addEventListener("scroll", prog, { passive: true }); prog();
    if (prev) prev.addEventListener("click", function () { reel.scrollBy({ left: -paso(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { reel.scrollBy({ left: paso(), behavior: "smooth" }); });
  }

  function initProgreso() {
    var prog = $("#prog");
    if (!prog) return;
    var on = function () { var h = document.documentElement.scrollHeight - window.innerHeight; prog.style.setProperty("--sp", h > 0 ? Math.min(1, window.scrollY / h) : 0); };
    on(); window.addEventListener("scroll", on, { passive: true });
  }

  // Abierto ahora + día de hoy resaltado en el horario (con el horario real)
  function initAbierto() {
    var el = $("#ahora"), l = lima(), d = l.getDay(), h = B.horario && B.horario[d];
    $$("#hrs tr").forEach(function (tr) { tr.classList.toggle("hoy", +tr.getAttribute("data-d") === d); });
    if (!el || !h) return;
    var m = l.getHours() * 60 + l.getMinutes(), abierto = m >= aMin(h[0]) && m < aMin(h[1]);
    el.hidden = false; el.classList.toggle("off", !abierto);
    el.textContent = abierto ? "Abierto hasta las " + h[1] : "Cerrado · abre " + (m < aMin(h[0]) ? "hoy" : "mañana") + " a las " + (m < aMin(h[0]) ? h[0] : (B.horario[(d + 1) % 7] || h)[0]);
  }

  // Reserva de ejemplo: día + hora + servicio → mensaje de WhatsApp ya escrito
  function initReserva() {
    var form = $("#book"), diasEl = $("#days"), slotsEl = $("#slots");
    if (!form || !diasEl || !slotsEl || diasEl.children.length) return;
    var svc = $("#svc"), btn = $("#bookBtn"), txt = $("#bookTxt"), left = $("#left");
    var base = lima(); base.setHours(0, 0, 0, 0);
    var dias = [], sel = { d: 0, h: null };
    for (var i = 0; i < (B.dias || 6); i++) { var f = new Date(base); f.setDate(base.getDate() + i); dias.push(f); }
    var horas = function (f) {
      var r = B.horario[f.getDay()], out = [];
      if (!r) return out;
      for (var m = aMin(r[0]); m + 45 <= aMin(r[1]); m += 60) out.push(("0" + Math.floor(m / 60)).slice(-2) + ":" + ("0" + (m % 60)).slice(-2));
      return out;
    };
    var llave = function (f, h) { var s = f.getMonth() + "-" + f.getDate() + "|" + h, x = 17; for (var k = 0; k < s.length; k++) x = (x * 31 + s.charCodeAt(k)) >>> 0; return x % 100; };
    var lleno = function (f, h) { return llave(f, h) < 32; };
    var pasada = function (f, h) { var n = lima(); return f.getTime() === base.getTime() && aMin(h) <= n.getHours() * 60 + n.getMinutes() + 30; };
    var etiqueta = function (f, i) { return i === 0 ? "Hoy" : i === 1 ? "Mañana" : DIAS[f.getDay()].slice(0, 3); };
    var largo = function (f) { return DIAS[f.getDay()] + " " + f.getDate() + " de " + MESES[f.getMonth()]; };

    function pintarDias() {
      diasEl.innerHTML = dias.map(function (f, i) {
        return '<button type="button" class="day" data-i="' + i + '" aria-pressed="' + (i === sel.d) + '">' + etiqueta(f, i) + "<b>" + f.getDate() + "</b>" + MESES[f.getMonth()].slice(0, 3) + "</button>";
      }).join("");
    }
    function pintarHoras() {
      var f = dias[sel.d], libres = 0;
      slotsEl.innerHTML = horas(f).map(function (h) {
        var off = lleno(f, h) || pasada(f, h); if (!off) libres++;
        return '<button type="button" class="slot" data-h="' + h + '"' + (off ? " disabled" : "") + ' aria-pressed="' + (sel.h === h) + '">' + h + "</button>";
      }).join("");
      left.textContent = libres ? libres + (libres === 1 ? " hora libre " : " horas libres ") + (sel.d === 0 ? "hoy" : "ese día") : "Sin horas ese día: prueba con otro";
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
    todo();
  }

  // Barra de reserva del celular: aparece al pasar la portada y se esconde sobre el formulario
  function initBarra() {
    var barra = $("#barra"), res = $("#reserva"), hero = $(".hero");
    if (!barra) return;
    function on() {
      var past = hero ? hero.getBoundingClientRect().bottom < 80 : window.scrollY > 500, r = res ? res.getBoundingClientRect() : null;
      var sobreForm = r && r.top < window.innerHeight * 0.7 && r.bottom > window.innerHeight * 0.2;
      barra.classList.toggle("off", !past || sobreForm);
    }
    on(); window.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on);
  }

  function boot() {
    safe(initNav, "initNav");
    safe(initReveals, "initReveals");
    safe(initCount, "initCount");
    safe(initFoco, "initFoco");
    safe(initFondo, "initFondo");
    safe(initManifiesto, "initManifiesto");
    safe(initAcordeon, "initAcordeon");
    safe(initCarril, "initCarril");
    safe(initProgreso, "initProgreso");
    safe(initAbierto, "initAbierto");
    safe(initReserva, "initReserva");
    safe(initBarra, "initBarra");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
