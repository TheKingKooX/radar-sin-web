(function () {
  "use strict";
  var B = window.__BRAND__ || { name: "Lapynta Barbería", wa: "51999119911", dias: 6, horario: {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function safe(fn, name) { try { fn(); } catch (e) { if (window.console) console.warn("[" + name + "]", e); } }

  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  // Hora actual en Lima (UTC-5, sin horario de verano), sin depender de la zona del equipo
  function lima() { var n = new Date(); return new Date(n.getTime() + n.getTimezoneOffset() * 60000 - 5 * 3600000); }
  var aMin = function (h) { return +h.slice(0, 2) * 60 + +h.slice(3, 5); };

  // Cabecera de periódico: se compacta al desplazar; menú del celular
  function initCabecera() {
    var mast = $("#mast"), burger = $("#burger"), menu = $("#menu");
    if (mast) { var on = function () { mast.classList.toggle("compact", window.scrollY > 120); }; on(); window.addEventListener("scroll", on, { passive: true }); }
    if (!burger || !menu) return;
    var cerrar = function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); };
    burger.addEventListener("click", function () {
      var abre = !menu.classList.contains("open");
      menu.classList.toggle("open", abre); burger.setAttribute("aria-expanded", abre ? "true" : "false");
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) cerrar(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrar(); });
  }

  // La fecha de hoy en la cabecera, como en un periódico
  function initFecha() {
    var el = $("#fecha");
    if (!el) return;
    var l = lima();
    el.textContent = "Magdalena del Mar, " + DIAS[l.getDay()] + " " + l.getDate() + " de " + MESES[l.getMonth()] + " de " + l.getFullYear();
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

  // Barra de lectura arriba, como en un artículo
  function initProgreso() {
    var prog = $("#prog");
    if (!prog) return;
    var on = function () { var h = document.documentElement.scrollHeight - window.innerHeight; prog.style.setProperty("--sp", h > 0 ? Math.min(1, window.scrollY / h) : 0); };
    on(); window.addEventListener("scroll", on, { passive: true });
  }

  // Las fotos se mueven un poco dentro de su marco
  function initParallax() {
    if (!window.gsap || !window.ScrollTrigger || window.innerWidth < 900) return;
    window.gsap.registerPlugin(window.ScrollTrigger);
    $$(".dos .im img").forEach(function (im) {
      window.gsap.fromTo(im, { yPercent: -4 }, { yPercent: 4, ease: "none", scrollTrigger: { trigger: im.parentNode, start: "top bottom", end: "bottom top", scrub: 0.6 } });
    });
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
    var llave = function (f, h) { var s = f.getMonth() + "-" + f.getDate() + "|" + h, x = 31; for (var k = 0; k < s.length; k++) x = (x * 31 + s.charCodeAt(k)) >>> 0; return x % 100; };
    var lleno = function (f, h) { return llave(f, h) < 38; };
    var pasada = function (f, h) { var n = lima(); return f.getTime() === base.getTime() && aMin(h) <= n.getHours() * 60 + n.getMinutes() + 30; };
    var etiqueta = function (f, i) { return i === 0 ? "Hoy" : i === 1 ? "Mañana" : DIAS[f.getDay()].slice(0, 3); };
    var largo = function (f) { return DIAS[f.getDay()] + " " + f.getDate() + " de " + MESES[f.getMonth()]; };

    function pintarDias() {
      diasEl.innerHTML = dias.map(function (f, i) {
        return '<button type="button" class="day" data-i="' + i + '" aria-pressed="' + (i === sel.d) + '">' + etiqueta(f, i) + "<b>" + f.getDate() + "</b>" + MESES[f.getMonth()].slice(0, 3) + "</button>";
      }).join("");
    }
    function pintarHoras() {
      var f = dias[sel.d], libres = 0, hs = horas(f);
      slotsEl.innerHTML = hs.map(function (h) {
        var off = lleno(f, h) || pasada(f, h); if (!off) libres++;
        return '<button type="button" class="slot" data-h="' + h + '"' + (off ? " disabled" : "") + ' aria-pressed="' + (sel.h === h) + '">' + h + "</button>";
      }).join("");
      left.textContent = !hs.length ? "Cerrado ese día: elige otro" : libres ? libres + (libres === 1 ? " hora libre " : " horas libres ") + (sel.d === 0 ? "hoy" : "ese día") : "Sin horas ese día: prueba con otro";
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
    var barra = $("#barra"), res = $("#reserva"), front = $(".front");
    if (!barra) return;
    function on() {
      var past = front ? front.getBoundingClientRect().bottom < 60 : window.scrollY > 500, r = res ? res.getBoundingClientRect() : null;
      var sobreForm = r && r.top < window.innerHeight * 0.7 && r.bottom > window.innerHeight * 0.2;
      barra.classList.toggle("off", !past || sobreForm);
    }
    on(); window.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on);
  }


  // Fondo dinámico: polvo y galones (el zigzag de su logo) que el viento arrastra; el cursor y el scroll los empujan
  function initFondo() {
    var cv = $("#fondo"), ctx = cv && cv.getContext("2d");
    if (!ctx) return;
    var W, H, dpr, mx = -999, my = -999, ps = [], sy = window.scrollY, vs = 0, t0 = performance.now();
    var COL = ["#a93935", "#324b4e", "#1f2a2c"];
    function nuevo(x) {
      var g = Math.random() < 0.3;
      return { x: x === undefined ? Math.random() * W : x, y: Math.random() * H, g: g, r: g ? 7 + Math.random() * 7 : 0.8 + Math.random() * 1.8,
        c: g ? COL[Math.random() < 0.5 ? 0 : 1] : COL[2], a: g ? 0.22 + Math.random() * 0.18 : 0.15 + Math.random() * 0.2,
        vx: 0.15 + Math.random() * 0.45, ph: Math.random() * 6.28, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.01, ox: 0, oy: 0 };
    }
    function medir() {
      dpr = Math.min(window.devicePixelRatio || 1, 2); W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, W * H / 14000)); ps = []; for (var i = 0; i < n; i++) ps.push(nuevo());
    }
    medir(); window.addEventListener("resize", medir);
    window.addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    function pintar(now) {
      var t = (now - t0) / 1000, d = window.scrollY - sy; sy = window.scrollY; vs += (d - vs) * 0.1;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i], dx = p.x + p.ox - mx, dy = p.y + p.oy - my, dd = Math.sqrt(dx * dx + dy * dy);
        if (dd < 130) { var f = (1 - dd / 130) * 2.2; p.ox += dx / (dd + 1) * f; p.oy += dy / (dd + 1) * f; }
        p.ox *= 0.96; p.oy *= 0.96;
        p.x += p.vx + Math.sin(t * 0.6 + p.ph) * 0.25; p.y += Math.cos(t * 0.5 + p.ph) * 0.2 - vs * 0.35; p.rot += p.vr;
        if (p.x > W + 20) p.x = -20; if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
        ctx.globalAlpha = p.a; ctx.fillStyle = p.c; ctx.strokeStyle = p.c;
        var x = p.x + p.ox, y = p.y + p.oy;
        if (p.g) {
          ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot); ctx.lineWidth = 2; ctx.lineJoin = "miter";
          ctx.beginPath(); ctx.moveTo(-p.r, p.r * 0.5); ctx.lineTo(0, -p.r * 0.5); ctx.lineTo(p.r, p.r * 0.5); ctx.stroke(); ctx.restore();
        } else { ctx.beginPath(); ctx.arc(x, y, p.r, 0, 6.283); ctx.fill(); }
      }
      requestAnimationFrame(pintar);
    }
    requestAnimationFrame(pintar);
  }

  function boot() {
    safe(initCabecera, "initCabecera");
    safe(initFecha, "initFecha");
    safe(initReveals, "initReveals");
    safe(initCount, "initCount");
    safe(initProgreso, "initProgreso");
    safe(initParallax, "initParallax");
    safe(initAbierto, "initAbierto");
    safe(initReserva, "initReserva");
    safe(initBarra, "initBarra");
    safe(initFondo, "initFondo");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
