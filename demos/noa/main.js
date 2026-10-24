(function () {
  "use strict";
  var B = window.__BRAND__ || { name: "NOA Salón", wa: "51994602534", dias: 6, horario: {} };
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
    els.forEach(function (el, i) { el.style.setProperty("--dl", (i % 4) * 0.08 + "s"); });
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

  // Cursor en anillo (solo con mouse): crece sobre enlaces y botones
  function initCursor() {
    var ring = $("#ring");
    if (!ring || !window.matchMedia("(pointer:fine)").matches) return;
    var x = -100, y = -100, tx = -100, ty = -100;
    window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; ring.classList.add("on"); }, { passive: true });
    document.addEventListener("pointerover", function (e) { ring.classList.toggle("big", !!e.target.closest("a, button, select, .bc")); });
    document.addEventListener("mouseleave", function () { ring.classList.remove("on"); });
    (function frame() {
      requestAnimationFrame(frame);
      x += (tx - x) * 0.2; y += (ty - y) * 0.2;
      ring.style.setProperty("--rx", x + "px"); ring.style.setProperty("--ry", y + "px");
    })();
  }

  function initProgreso() {
    var prog = $("#prog");
    if (!prog) return;
    var on = function () { var h = document.documentElement.scrollHeight - window.innerHeight; prog.style.setProperty("--sp", h > 0 ? Math.min(1, window.scrollY / h) : 0); };
    on(); window.addEventListener("scroll", on, { passive: true });
  }

  // Las fotos se mueven un poco dentro de su marco al desplazar
  function initParallax() {
    if (!window.gsap || !window.ScrollTrigger || window.innerWidth < 900) return;
    window.gsap.registerPlugin(window.ScrollTrigger);
    var a = $(".arch img"), w = $(".wide img");
    if (a) window.gsap.to(a, { yPercent: 6, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 } });
    if (w) window.gsap.fromTo(w, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".wide", start: "top bottom", end: "bottom top", scrub: 0.6 } });
  }

  // Opiniones: cita que rota sola (se detiene al pasar el cursor)
  function initOpiniones() {
    var cont = $("#slides"), dots = $("#dots");
    if (!cont) return;
    var qs = $$("blockquote", cont), i = 0, timer = null, pausa = false;
    if (dots) dots.innerHTML = qs.map(function (q, k) { return '<button type="button" role="tab" aria-label="Opinión ' + (k + 1) + '" aria-selected="' + (k === 0) + '"></button>'; }).join("");
    var botones = dots ? $$("button", dots) : [];
    function ir(n) {
      i = (n + qs.length) % qs.length;
      qs.forEach(function (q, k) { q.classList.toggle("on", k === i); });
      botones.forEach(function (b, k) { b.setAttribute("aria-selected", k === i ? "true" : "false"); });
      cont.style.minHeight = Math.max.apply(null, qs.map(function (q) { return q.scrollHeight; })) + "px";
    }
    function auto() { clearInterval(timer); timer = setInterval(function () { if (!pausa && !document.hidden) ir(i + 1); }, 7000); }
    botones.forEach(function (b, k) { b.addEventListener("click", function () { ir(k); auto(); }); });
    var p = $("#rPrev"), n = $("#rNext");
    if (p) p.addEventListener("click", function () { ir(i - 1); auto(); });
    if (n) n.addEventListener("click", function () { ir(i + 1); auto(); });
    var rev = $(".rev");
    if (rev) { rev.addEventListener("mouseenter", function () { pausa = true; }); rev.addEventListener("mouseleave", function () { pausa = false; }); }
    window.addEventListener("resize", function () { ir(i); });
    ir(0); auto();
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

  // Reserva de ejemplo: día + hora + servicio + local → mensaje de WhatsApp ya escrito
  function initReserva() {
    var form = $("#book"), diasEl = $("#days"), slotsEl = $("#slots");
    if (!form || !diasEl || !slotsEl || diasEl.children.length) return;
    var svc = $("#svc"), loc = $("#loc"), btn = $("#bookBtn"), txt = $("#bookTxt"), left = $("#left");
    var base = lima(); base.setHours(0, 0, 0, 0);
    var dias = [], sel = { d: 0, h: null };
    for (var i = 0; i < (B.dias || 6); i++) { var f = new Date(base); f.setDate(base.getDate() + i); dias.push(f); }
    var horas = function (f) {
      var r = B.horario[f.getDay()], out = [];
      if (!r) return out;
      for (var m = aMin(r[0]); m + 45 <= aMin(r[1]); m += 60) out.push(("0" + Math.floor(m / 60)).slice(-2) + ":" + ("0" + (m % 60)).slice(-2));
      return out;
    };
    var llave = function (f, h) { var s = f.getMonth() + "-" + f.getDate() + "|" + h, x = 19; for (var k = 0; k < s.length; k++) x = (x * 31 + s.charCodeAt(k)) >>> 0; return x % 100; };
    var lleno = function (f, h) { return llave(f, h) < 34; };
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
      var f = dias[sel.d], s = svc.value, l = loc.value;
      var m = sel.h ? "Hola, quiero reservar en " + B.name + " (" + l + "): " + s + ", " + largo(f) + " a las " + sel.h + ". ¿Está disponible?" : "Hola, quiero reservar en " + B.name + " (" + l + "): " + s + ". ¿Qué horarios tienen?";
      btn.href = "https://wa.me/" + B.wa + "?text=" + encodeURIComponent(m);
      txt.textContent = sel.h ? "Reservar " + etiqueta(f, sel.d).toLowerCase() + " " + f.getDate() + " · " + sel.h : "Reservar por WhatsApp";
    }
    function todo() { pintarDias(); pintarHoras(); enlace(); }
    diasEl.addEventListener("click", function (e) { var b = e.target.closest(".day"); if (!b) return; sel.d = +b.getAttribute("data-i"); sel.h = null; todo(); });
    slotsEl.addEventListener("click", function (e) { var b = e.target.closest(".slot"); if (!b || b.disabled) return; sel.h = b.getAttribute("data-h"); pintarHoras(); enlace(); });
    svc.addEventListener("change", enlace); loc.addEventListener("change", enlace);
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
    safe(initCursor, "initCursor");
    safe(initProgreso, "initProgreso");
    safe(initParallax, "initParallax");
    safe(initOpiniones, "initOpiniones");
    safe(initAbierto, "initAbierto");
    safe(initReserva, "initReserva");
    safe(initBarra, "initBarra");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
