(function () {
  "use strict";
  var B = window.__BRAND__ || { name: "Arturo Salón & Spa", wa: "51972086964", dias: 6, horario: {} };
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


  // Contacto: el mensaje de WhatsApp sale con el servicio elegido (el salón no publica horario)
  function initContacto() {
    var svc = $("#svc"), btn = $("#bookBtn");
    if (!svc || !btn) return;
    var on = function () {
      btn.href = "https://wa.me/" + B.wa + "?text=" + encodeURIComponent("Hola, quiero consultar por " + svc.value.toLowerCase() + " en " + B.name + ". ¿Qué horarios y precios tienen?");
    };
    svc.addEventListener("change", on);
    $$("[data-svc]").forEach(function (a) { a.addEventListener("click", function () { svc.value = a.getAttribute("data-svc"); on(); }); });
    on();
  }

  // Fondo dinámico: acero cepillado con un brillo que recorre la pantalla y se enciende donde está el cursor
  function initCromo() {
    var cv = $("#cromo"), ctx = cv && cv.getContext("2d");
    if (!ctx) return;
    var W, H, dpr, px = -999, py = -999, tx = -999, ty = -999, t0 = performance.now(), grano = null;
    function medir() {
      dpr = Math.min(window.devicePixelRatio || 1, 2); W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      grano = document.createElement("canvas"); grano.width = W; grano.height = H;
      var g = grano.getContext("2d");
      for (var y = 0; y < H; y += 2) { g.fillStyle = "rgba(" + (Math.random() < 0.5 ? "255,255,255" : "60,66,72") + "," + (0.03 + Math.random() * 0.05) + ")"; g.fillRect(0, y, W, 1); }
    }
    medir(); window.addEventListener("resize", medir);
    window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; if (px < 0) { px = tx; py = ty; } }, { passive: true });
    function pintar(now) {
      var t = (now - t0) / 1000;
      px += (tx - px) * 0.06; py += (ty - py) * 0.06;
      ctx.clearRect(0, 0, W, H);
      var g0 = ctx.createLinearGradient(0, 0, W, H);
      g0.addColorStop(0, "#eeeeed"); g0.addColorStop(0.5, "#dcdddf"); g0.addColorStop(1, "#e8e8e8");
      ctx.fillStyle = g0; ctx.fillRect(0, 0, W, H);
      ctx.drawImage(grano, 0, 0);
      // franja de brillo que viaja en diagonal
      var cx = ((t * 40) % (W + 600)) - 300, band = ctx.createLinearGradient(cx - 160, 0, cx + 160, H * 0.6);
      band.addColorStop(0, "rgba(255,255,255,0)"); band.addColorStop(0.5, "rgba(255,255,255,.55)"); band.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = band; ctx.fillRect(0, 0, W, H);
      if (px > 0) {
        var s = ctx.createRadialGradient(px, py, 0, px, py, 260);
        s.addColorStop(0, "rgba(255,255,255,.75)"); s.addColorStop(0.5, "rgba(255,255,255,.25)"); s.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = s; ctx.fillRect(px - 260, py - 260, 520, 520);
        var d = ctx.createRadialGradient(px, py, 40, px, py, 420);
        d.addColorStop(0, "rgba(77,82,88,0)"); d.addColorStop(1, "rgba(77,82,88,.10)");
        ctx.fillStyle = d; ctx.fillRect(0, 0, W, H);
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
    safe(initContacto, "initContacto");
    safe(initCromo, "initCromo");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
