(function () {
  "use strict";
  var B = window.__BRAND__ || { wa: "51933970617", name: "Torero Estética San Miguel", horas: ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"], dias: 6 };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function safe(fn, name) { try { fn(); } catch (e) { if (window.console) console.warn("[" + name + "]", e); } }

  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  // Barra superior: transparente arriba, con fondo al desplazar; menú del celular
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

  // Aparición al desplazar: umbral bajo y red de seguridad a los 6 s
  function initReveals() {
    var els = $$(".rv");
    if (!els.length) return;
    var mostrar = function (el) { el.classList.add("in"); };
    if (!("IntersectionObserver" in window)) { els.forEach(mostrar); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { mostrar(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () { els.forEach(function (el) { if (!el.classList.contains("in") && el.getBoundingClientRect().top < window.innerHeight) mostrar(el); }); }, 6000);
    setTimeout(function () { els.forEach(mostrar); }, 9000);
  }

  // Catálogo por tipo de servicio
  function initTabs() {
    var tabs = $$(".tab");
    if (!tabs.length) return;
    function ir(t, foco) {
      tabs.forEach(function (x) {
        var sel = x === t;
        x.setAttribute("aria-selected", sel ? "true" : "false"); x.tabIndex = sel ? 0 : -1;
        var p = document.getElementById(x.getAttribute("aria-controls")); if (p) p.hidden = !sel;
      });
      if (foco) t.focus();
      $$(".card", document.getElementById(t.getAttribute("aria-controls"))).forEach(function (c) { c.classList.add("in"); });
    }
    tabs.forEach(function (t, i) {
      t.tabIndex = t.getAttribute("aria-selected") === "true" ? 0 : -1;
      t.addEventListener("click", function () { ir(t); });
      t.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (d) { e.preventDefault(); ir(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
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

  // Portada: las tarjetas flotantes se desplazan un poco más lento que la página
  function initParallax() {
    if (!window.gsap || !window.ScrollTrigger) return;
    window.gsap.registerPlugin(window.ScrollTrigger);
    [[".fcard.f1", -50], [".fcard.f2", 40], [".fcard.f3", -28]].forEach(function (c) {
      var el = $(c[0]); if (!el) return;
      window.gsap.to(el, { y: c[1], ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 } });
    });
  }

  // Cupos de ejemplo: día + hora + servicio → mensaje de WhatsApp ya escrito
  function initCupos() {
    var form = $("#book"), diasEl = $("#days"), slotsEl = $("#slots");
    if (!form || !diasEl || !slotsEl || diasEl.children.length) return;
    var svc = $("#svc"), btn = $("#bookBtn"), txt = $("#bookTxt"), left = $("#left");
    var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    var dias = [], sel = { d: 0, h: null };
    for (var i = 0; i < (B.dias || 6); i++) { var f = new Date(hoy); f.setDate(hoy.getDate() + i); dias.push(f); }
    var llave = function (f, h) { var s = f.getFullYear() + "-" + f.getMonth() + "-" + f.getDate() + "|" + h, x = 7; for (var k = 0; k < s.length; k++) x = (x * 31 + s.charCodeAt(k)) >>> 0; return x % 100; };
    var lleno = function (f, h) { return llave(f, h) < 30; };
    var pasada = function (f, h) { var n = new Date(); return f.getTime() === hoy.getTime() && (+h.slice(0, 2)) * 60 <= n.getHours() * 60 + n.getMinutes() + 60; };
    var etiqueta = function (f, i) { return i === 0 ? "Hoy" : i === 1 ? "Mañana" : DIAS[f.getDay()].slice(0, 3); };
    var largo = function (f) { return DIAS[f.getDay()] + " " + f.getDate() + " de " + MESES[f.getMonth()]; };

    function pintarDias() {
      diasEl.innerHTML = dias.map(function (f, i) {
        return '<button type="button" class="day" data-i="' + i + '" aria-pressed="' + (i === sel.d) + '">' + etiqueta(f, i) + "<b>" + f.getDate() + "</b>" + MESES[f.getMonth()].slice(0, 3) + "</button>";
      }).join("");
    }
    function pintarHoras() {
      var f = dias[sel.d], libres = 0;
      slotsEl.innerHTML = B.horas.map(function (h) {
        var off = lleno(f, h) || pasada(f, h); if (!off) libres++;
        return '<button type="button" class="slot" data-h="' + h + '"' + (off ? " disabled" : "") + ' aria-pressed="' + (sel.h === h) + '">' + h + "</button>";
      }).join("");
      left.innerHTML = libres ? "Quedan <b>" + libres + " cupos</b> " + (sel.d === 0 ? "hoy" : "ese día") + "." : "Sin cupos ese día: prueba con otro.";
    }
    function enlace() {
      var f = dias[sel.d], s = svc.value;
      var m = sel.h ? "Hola, quiero asegurar un cupo en " + B.name + ": " + s + ", " + largo(f) + " a las " + sel.h + ". ¿Está disponible?" : "Hola, quiero asegurar un cupo en " + B.name + " para: " + s + ". ¿Qué horarios tienen?";
      btn.href = "https://wa.me/" + B.wa + "?text=" + encodeURIComponent(m);
      txt.textContent = sel.h ? "Reservar " + etiqueta(f, sel.d).toLowerCase() + " " + f.getDate() + " · " + sel.h : "Asegura tu cupo por WhatsApp";
    }
    function todo() { pintarDias(); pintarHoras(); enlace(); }
    diasEl.addEventListener("click", function (e) { var b = e.target.closest(".day"); if (!b) return; sel.d = +b.getAttribute("data-i"); sel.h = null; todo(); });
    slotsEl.addEventListener("click", function (e) { var b = e.target.closest(".slot"); if (!b || b.disabled) return; sel.h = b.getAttribute("data-h"); pintarHoras(); enlace(); });
    svc.addEventListener("change", enlace);
    todo();
  }

  function boot() {
    document.documentElement.classList.add("js");
    safe(initNav, "initNav");
    safe(initReveals, "initReveals");
    safe(initTabs, "initTabs");
    safe(initCount, "initCount");
    safe(initParallax, "initParallax");
    safe(initCupos, "initCupos");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
