(function () {
  "use strict";
  var B = window.__BRAND__ || { name: "Emy's Salón & Spa", wa: "51999188816", dias: 6, horario: {} };
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
    var pro = $("#pro"), svc = $("#svc"), btn = $("#bookBtn"), txt = $("#bookTxt"), left = $("#left");
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
      var f = dias[sel.d], s = svc.value, p = pro && pro.value && pro.value !== "Cualquiera" ? " con " + pro.value : "";
      var m = sel.h ? "Hola, quiero reservar en " + B.name + ": " + s + p + ", " + largo(f) + " a las " + sel.h + ". ¿Está disponible?" : "Hola, quiero reservar en " + B.name + ": " + s + p + ". ¿Qué horarios tienen?";
      btn.href = "https://wa.me/" + B.wa + "?text=" + encodeURIComponent(m);
      txt.textContent = sel.h ? "Reservar " + etiqueta(f, sel.d).toLowerCase() + " " + f.getDate() + " · " + sel.h : "Reservar por WhatsApp";
    }
    function todo() { pintarDias(); pintarHoras(); enlace(); }
    diasEl.addEventListener("click", function (e) { var b = e.target.closest(".day"); if (!b) return; sel.d = +b.getAttribute("data-i"); sel.h = null; todo(); });
    slotsEl.addEventListener("click", function (e) { var b = e.target.closest(".slot"); if (!b || b.disabled) return; sel.h = b.getAttribute("data-h"); pintarHoras(); enlace(); });
    svc.addEventListener("change", enlace); if (pro) pro.addEventListener("change", enlace);
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


  // Fondo dinámico: luces de espejo (bokeh) rojas y rosadas que suben despacio; el cursor las revienta en chispas
  function initBokeh() {
    var cv = $("#bokeh"), ctx = cv && cv.getContext("2d");
    if (!ctx) return;
    var W, H, dpr, mx = -999, my = -999, L = [], ch = [], sy = window.scrollY, vs = 0, COL = ["229,13,18", "255,120,130", "255,255,255", "255,170,160"];
    function nueva(abajo) {
      return { x: Math.random() * W, y: abajo ? H + 80 : Math.random() * H, r: 20 + Math.random() * 70, v: 0.12 + Math.random() * 0.35, c: COL[Math.floor(Math.random() * COL.length)], a: 0.1 + Math.random() * 0.16, ph: Math.random() * 6.28 };
    }
    function medir() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5); W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = W < 900 ? 14 : 26; L = []; for (var i = 0; i < n; i++) L.push(nueva(false));
    }
    medir(); window.addEventListener("resize", medir);
    window.addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    function pintar(now) {
      var t = now / 1000, d = window.scrollY - sy; sy = window.scrollY; vs += (d - vs) * 0.1;
      ctx.fillStyle = "#fff6f1"; ctx.fillRect(0, 0, W, H);
      var i, p;
      for (i = 0; i < L.length; i++) {
        p = L[i]; p.y -= p.v + vs * 0.3; p.x += Math.sin(t * 0.4 + p.ph) * 0.3;
        if (p.y < -p.r - 20) { L[i] = nueva(true); continue; } if (p.y > H + 120) p.y = -p.r;
        var dx = p.x - mx, dy = p.y - my;
        if (dx * dx + dy * dy < (p.r + 16) * (p.r + 16)) {
          for (var k = 0; k < 9; k++) ch.push({ x: p.x, y: p.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4 - 1, l: 1, c: p.c });
          L[i] = nueva(true); continue;
        }
        var g = ctx.createRadialGradient(p.x, p.y, p.r * 0.2, p.x, p.y, p.r);
        g.addColorStop(0, "rgba(" + p.c + "," + p.a * 0.5 + ")"); g.addColorStop(0.85, "rgba(" + p.c + "," + p.a + ")"); g.addColorStop(1, "rgba(" + p.c + ",0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      for (i = ch.length - 1; i >= 0; i--) {
        var c = ch[i]; c.x += c.vx; c.y += c.vy; c.vy += 0.05; c.l -= 0.025;
        if (c.l <= 0) { ch.splice(i, 1); continue; }
        ctx.fillStyle = "rgba(" + c.c + "," + (c.l * 0.7) + ")"; ctx.beginPath(); ctx.arc(c.x, c.y, 2.4 * c.l + 0.6, 0, 6.283); ctx.fill();
      }
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
    safe(initBokeh, "initBokeh");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
