(function () {
  "use strict";
  var B = window.__BRAND__ || { name: "Barbería Emmanuel", wa: "51900505503", dias: 6, horario: {} };
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
    if (!nav) return;
    var on = function () { nav.classList.toggle("solid", window.scrollY > 24); };
    on(); window.addEventListener("scroll", on, { passive: true });
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

  // Cifras que suben al aparecer (el HTML ya trae el valor final)
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
          var p = Math.min(1, (t - t0) / 1400), v = fin * (1 - Math.pow(1 - p, 3));
          el.textContent = p < 1 ? fmt(v, dec) : fmt(fin, dec);
          if (p < 1) requestAnimationFrame(paso);
        }
        requestAnimationFrame(paso);
      });
    }, { threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  }

  // Firma de la página: la carta. Al elegir un servicio cambia su foto y el botón de reserva
  function initCarta() {
    var items = $$("#menu .it"), imgs = $$("#vistaImg img"), btn = $("#vistaBtn"), txt = $("#vistaTxt"), svc = $("#svc");
    if (!items.length || !imgs.length) return;
    function ir(it) {
      var i = it.getAttribute("data-i"), n = it.getAttribute("data-n");
      items.forEach(function (x) { x.classList.toggle("on", x === it); });
      imgs.forEach(function (im) {
        if (im.getAttribute("data-i") === i) { im.loading = "eager"; im.classList.add("on"); } else im.classList.remove("on");
      });
      if (btn) btn.href = "https://wa.me/" + B.wa + "?text=" + encodeURIComponent("Hola, quiero reservar " + n + " en " + B.name + ".");
      if (txt) txt.textContent = "Reservar " + n.charAt(0).toLowerCase() + n.slice(1);
      if (svc) { svc.value = n; svc.dispatchEvent(new Event("change")); }
    }
    items.forEach(function (it) {
      it.addEventListener("mouseenter", function () { if (window.matchMedia("(hover:hover)").matches) ir(it); });
      it.addEventListener("focus", function () { ir(it); });
      it.addEventListener("click", function () { ir(it); });
    });
  }

  // Las dos fotos de la portada se desplazan un poco distinto al bajar
  function initParallax() {
    if (!window.gsap || !window.ScrollTrigger) return;
    window.gsap.registerPlugin(window.ScrollTrigger);
    [[".ph.p1", -40], [".ph.p2", 34]].forEach(function (c) {
      var el = $(c[0]); if (!el) return;
      window.gsap.to(el, { y: c[1], ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 } });
    });
  }

  // La línea dorada del recorrido se dibuja al desplazar
  function initRail() {
    var rail = $("#rail"), steps = $("#steps");
    if (!rail || !steps || !window.gsap || !window.ScrollTrigger) return;
    window.gsap.registerPlugin(window.ScrollTrigger);
    rail.style.setProperty("--p", 0);
    window.ScrollTrigger.create({
      trigger: steps, start: "top 70%", end: "bottom 60%", scrub: 0.5,
      onUpdate: function (s) { rail.style.setProperty("--p", s.progress); }
    });
    setTimeout(function () { if (rail.style.getPropertyValue("--p") === "0") rail.style.setProperty("--p", 1); }, 8000);
  }

  // Abierto ahora + día de hoy resaltado en el horario (con el horario real)
  function initAbierto() {
    var el = $("#ahora"), l = lima(), d = l.getDay(), h = B.horario && B.horario[d];
    $$("#hrs tr").forEach(function (tr) { tr.classList.toggle("hoy", +tr.getAttribute("data-d") === d); });
    if (!el || !h) return;
    var m = l.getHours() * 60 + l.getMinutes(), abierto = m >= aMin(h[0]) && m < aMin(h[1]);
    el.hidden = false; el.classList.toggle("off", !abierto);
    el.textContent = abierto ? "Abierto ahora · hasta las " + h[1] : "Cerrado · abre " + (m < aMin(h[0]) ? "hoy" : "mañana") + " a las " + (m < aMin(h[0]) ? h[0] : (B.horario[(d + 1) % 7] || h)[0]);
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
    var llave = function (f, h) { var s = f.getMonth() + "-" + f.getDate() + "|" + h, x = 11; for (var k = 0; k < s.length; k++) x = (x * 31 + s.charCodeAt(k)) >>> 0; return x % 100; };
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
      left.innerHTML = libres ? "Quedan <b>" + libres + " horas libres</b> " + (sel.d === 0 ? "hoy" : "ese día") + "." : "Sin horas ese día: prueba con otro.";
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

  // Fondo interactivo: hilos de seda dorada que ondulan solos y se curvan hacia el cursor
  function initFondo() {
    var bg = $("#bg"), cv = $("#bgc");
    if (!bg || !cv || !cv.getContext) return;
    var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var calmo = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var m = { x: window.innerWidth * 0.6, y: window.innerHeight * 0.4, tx: window.innerWidth * 0.6, ty: window.innerHeight * 0.4, on: false };
    var N = window.innerWidth < 700 ? 9 : 15;
    function medir() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    medir();
    window.addEventListener("resize", medir);
    window.addEventListener("pointermove", function (e) { m.tx = e.clientX; m.ty = e.clientY; m.on = true; }, { passive: true });
    var paso = W < 700 ? 18 : 12, vel = calmo ? 0.3 : 1;
    function frame(t) {
      requestAnimationFrame(frame);
      if (document.hidden) return;
      t *= vel;
      if (!m.on) { m.tx = W * (0.5 + 0.25 * Math.sin(t / 5200)); m.ty = H * (0.45 + 0.2 * Math.cos(t / 6400)); }
      m.x += (m.tx - m.x) * 0.06; m.y += (m.ty - m.y) * 0.06;
      bg.style.setProperty("--mx", m.x + "px"); bg.style.setProperty("--my", m.y + "px");
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";
      for (var i = 0; i < N; i++) {
        var base = H * (i + 1) / (N + 1), ph = i * 0.55, amp = 16 + (i % 4) * 7;
        ctx.beginPath();
        for (var x = -paso; x <= W + paso; x += paso) {
          var y = base + Math.sin(x * 0.0036 + t * 0.00042 + ph) * amp + Math.sin(x * 0.0085 - t * 0.0006 + ph * 1.7) * amp * 0.45;
          var dx = x - m.x, dy = y - m.y, f = Math.exp(-(dx * dx + dy * dy) / 52000);
          y += (m.y - y) * f * 0.3;
          if (x === -paso) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        var d0 = Math.abs(base - m.y) / H, glow = Math.max(0, 1 - d0 * 3.2);
        ctx.strokeStyle = "rgba(226,200,130," + (0.06 + glow * 0.2).toFixed(3) + ")";
        ctx.lineWidth = 1 + glow * 0.9;
        ctx.stroke();
      }
    }
    requestAnimationFrame(frame);
  }

  // Barra de progreso y movimiento de las fotos al desplazar
  function initScroll() {
    var prog = $("#prog");
    if (prog) {
      var on = function () { var h = document.documentElement.scrollHeight - window.innerHeight; prog.style.setProperty("--sp", h > 0 ? Math.min(1, window.scrollY / h) : 0); };
      on(); window.addEventListener("scroll", on, { passive: true });
    }
    if (!window.gsap || !window.ScrollTrigger) return;
    window.gsap.registerPlugin(window.ScrollTrigger);
    $$(".mosaic img").forEach(function (im, i) {
      window.gsap.fromTo(im, { yPercent: -7 }, { yPercent: 7, ease: "none", scrollTrigger: { trigger: im.parentNode, start: "top bottom", end: "bottom top", scrub: 0.8 } });
    });
    var v = $("#vistaImg");
    if (v) window.gsap.fromTo(v, { rotate: -1.2 }, { rotate: 0, ease: "none", scrollTrigger: { trigger: v, start: "top 90%", end: "top 40%", scrub: 0.6 } });
  }

  function boot() {
    safe(initFondo, "initFondo");
    safe(initScroll, "initScroll");
    safe(initNav, "initNav");
    safe(initReveals, "initReveals");
    safe(initCount, "initCount");
    safe(initCarta, "initCarta");
    safe(initParallax, "initParallax");
    safe(initRail, "initRail");
    safe(initAbierto, "initAbierto");
    safe(initReserva, "initReserva");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
