(function () {
  "use strict";
  /* Valea · Barbería & Spa. JavaScript clásico (IIFE, sin módulos). Cada init va envuelto en safe(). */

  var D = window.__VALEA__ || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;     // solo para efectos intrusivos
  var finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var DIAS = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
  var DIAS_N = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  function safe(fn, name) { try { fn(); } catch (e) { if (window.console) console.warn("[valea] " + name, e); } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pad(n) { return String(n).padStart(2, "0"); }
  function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function fechaDe(v) { var p = v.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function mins(hm) { var p = hm.split(":"); return +p[0] * 60 + +p[1]; }
  function lindo(m) { var h = Math.floor(m / 60), mm = m % 60, s = h >= 12 ? "p. m." : "a. m."; h = h % 12 || 12; return h + ":" + pad(mm) + " " + s; }
  function toast(msg) {
    var t = $("#toast"); if (!t) return; t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove("is-on"); }, 2200);
  }
  function waUrl(texto) { return "https://wa.me/" + (D.whatsapp || "") + (texto ? "?text=" + encodeURIComponent(texto) : ""); }

  /* ---------- Pantalla de carga (con doble seguridad: CSS + JS) ---------- */
  function initSplash() {
    var s = $("[data-splash]"); if (!s) return;
    var hide = function () { s.classList.add("is-out"); setTimeout(function () { s.style.display = "none"; }, 1300); };
    if (document.readyState === "complete") setTimeout(hide, 1500); else addEventListener("load", function () { setTimeout(hide, 1200); });
    setTimeout(hide, 4000);
  }

  /* ---------- Navegación, menú móvil, progreso ---------- */
  function initNav() {
    var nav = $("#nav"), burger = $(".burger"), menu = $("#menu"), bar = $(".progress i"), esp = false;
    function onScroll() {
      esp = false;
      nav.classList.toggle("is-solid", scrollY > 40);
      var max = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, scrollY / max) : 0).toFixed(4) + ")";
    }
    addEventListener("scroll", function () { if (!esp) { esp = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
    function setMenu(open) {
      menu.classList.toggle("is-open", open); menu.setAttribute("aria-hidden", open ? "false" : "true");
      burger.setAttribute("aria-expanded", open ? "true" : "false"); document.body.style.overflow = open ? "hidden" : "";
    }
    burger.addEventListener("click", function () { setMenu(!menu.classList.contains("is-open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    var strip = $("[data-close-strip]");
    if (strip) strip.addEventListener("click", function () { $("#demoStrip").classList.add("is-hidden"); });
  }

  /* ---------- Brillo que sigue al cursor (solo con ratón) ---------- */
  function initGlow() {
    var g = $(".glow"); if (!g) return;
    if (!finePointer) { g.style.display = "none"; return; }
    var x = -999, y = -999, tx = x, ty = y;
    addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; if (x === -999) { x = tx; y = ty; } }, { passive: true });
    (function loop() { x += (tx - x) * 0.12; y += (ty - y) * 0.12; g.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)"; requestAnimationFrame(loop); })();
  }

  /* ---------- Titulares: se parten en palabras conservando <br> y <em> ---------- */
  function splitWords(el) {
    var i = 0;
    var wrap = function (t) {
      return t.split(/(\s+)/).map(function (w) {
        if (!w) return "";
        if (/^\s+$/.test(w)) return w;
        return '<span class="w" aria-hidden="true"><i style="--i:' + (i++) + '">' + esc(w) + "</i></span>";
      }).join("");
    };
    // La puntuación que sigue a un <em> se pega a su última palabra para que no baje sola a otra línea.
    var nodos = Array.prototype.slice.call(el.childNodes), pegar = {};
    nodos.forEach(function (n, k) {
      var s = nodos[k + 1];
      if (n.nodeType === 1 && s && s.nodeType === 3) { var m = s.textContent.match(/^[.,;:!?…]+/); if (m) { pegar[k] = m[0]; s.textContent = s.textContent.slice(m[0].length); } }
    });
    el.innerHTML = nodos.map(function (n, k) {
      if (n.nodeType === 3) return wrap(n.textContent);
      if (n.nodeName === "BR") return "<br>";
      if (n.nodeType === 1) { var t = n.tagName.toLowerCase(); return "<" + t + ">" + wrap(n.textContent + (pegar[k] || "")) + "</" + t + ">"; }
      return "";
    }).join("");
    el.classList.add("split");
  }
  function initSplit() { $$("[data-split]").forEach(function (el) { if (!el.classList.contains("split")) splitWords(el); }); }

  /* ---------- Aparición al hacer scroll (umbral bajo + seguridad a los 6 s) ---------- */
  function initReveal() {
    var els = $$(".reveal, .reveal-clip, [data-split]");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.05, rootMargin: "0px 0px -4% 0px" });
    els.forEach(function (e) { io.observe(e); });
    setTimeout(function () {
      els.forEach(function (e) { if (!e.classList.contains("is-in") && e.getBoundingClientRect().top < innerHeight) e.classList.add("is-in"); });
    }, 6000);
  }

  /* ---------- Fondo de ondas interactivo (canvas 2D) ---------- */
  function initWaves() {
    var c = $("#waves"); if (!c || !c.getContext) return;
    var ctx = c.getContext("2d"), W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2);
    var m = { x: 0, y: 0, tx: 0, ty: 0, on: false }, ripples = [], visible = true, t0 = performance.now(), speed = reduced ? 0.35 : 1;
    var layers = [
      { o: 0.60, a: 0.055, f: 1.3, s: 0.00035, p: 0.0, c: "rgba(70,194,174,.10)", line: "rgba(234,243,241,.16)" },
      { o: 0.67, a: 0.065, f: 1.8, s: -0.00045, p: 1.7, c: "rgba(70,194,174,.13)", line: "rgba(70,194,174,.28)" },
      { o: 0.74, a: 0.050, f: 2.4, s: 0.00060, p: 3.1, c: "rgba(18,89,91,.55)", line: "rgba(222,156,114,.22)" },
      { o: 0.82, a: 0.045, f: 1.6, s: -0.00050, p: 0.6, c: "rgba(222,156,114,.09)", line: "" },
      { o: 0.90, a: 0.040, f: 2.9, s: 0.00070, p: 4.2, c: "rgba(7,42,43,.88)", line: "" }
    ];
    function size() {
      var r = c.getBoundingClientRect(); W = r.width; H = r.height;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!m.on) { m.tx = W * 0.7; m.ty = H * 0.55; m.x = m.tx; m.y = m.ty; }
    }
    function altura(L, x, t, now) {
      var y = H * L.o + Math.sin(x / W * Math.PI * 2 * L.f + t * L.s * speed + L.p) * L.a * H;
      if (m.on) {
        var dx = x - m.x, k = Math.max(0, 1 - Math.abs(m.y - H * L.o) / (H * 0.55));
        y -= Math.exp(-(dx * dx) / (2 * 170 * 170)) * 50 * k;
      }
      for (var i = 0; i < ripples.length; i++) {
        var r = ripples[i], age = now - r.t, dist = Math.abs(x - r.x), front = age * 0.42, d = dist - front;
        y += Math.sin(d / 24) * 30 * Math.exp(-age / 1500) * Math.exp(-(d * d) / (2 * 110 * 110));
      }
      return y;
    }
    function frame(now) {
      requestAnimationFrame(frame);
      if (!visible || document.hidden || !W) return;
      var t = now - t0;
      ripples = ripples.filter(function (r) { return now - r.t < 4200; });
      m.x += (m.tx - m.x) * 0.08; m.y += (m.ty - m.y) * 0.08;
      ctx.clearRect(0, 0, W, H);
      layers.forEach(function (L) {
        ctx.beginPath(); ctx.moveTo(0, H);
        for (var x = 0; x <= W + 8; x += 8) ctx.lineTo(x, altura(L, x, t, now));
        ctx.lineTo(W + 8, H); ctx.closePath(); ctx.fillStyle = L.c; ctx.fill();
        if (L.line) {
          ctx.beginPath();
          for (var x2 = 0; x2 <= W + 8; x2 += 8) { var y = altura(L, x2, t, now); if (x2 === 0) ctx.moveTo(x2, y); else ctx.lineTo(x2, y); }
          ctx.strokeStyle = L.line; ctx.lineWidth = 1.2; ctx.stroke();
        }
      });
    }
    var hero = c.parentElement;
    function pos(e) { var r = c.getBoundingClientRect(); m.tx = e.clientX - r.left; m.ty = e.clientY - r.top; m.on = true; }
    hero.addEventListener("pointermove", pos, { passive: true });
    hero.addEventListener("pointerleave", function () { m.on = false; });
    hero.addEventListener("pointerdown", function (e) { pos(e); ripples.push({ x: m.tx, t: performance.now() }); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(c);
    var rt; addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 150); });
    size(); requestAnimationFrame(frame);
    setTimeout(function () { ripples.push({ x: W * 0.62, t: performance.now() }); }, 2600);   // invita a interactuar
  }

  /* ---------- Parallax (GSAP) y línea de progreso del ritual ---------- */
  function initParallax() {
    if (reduced || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var st = function (trigger, start, end) { return { trigger: trigger, start: start, end: end, scrub: 0.6 }; };
    gsap.to(".hero-art .arch", { yPercent: -8, ease: "none", scrollTrigger: st(".hero", "top top", "bottom top") });
    gsap.to(".hero-art .blob", { yPercent: -24, ease: "none", scrollTrigger: st(".hero", "top top", "bottom top") });
    gsap.to(".hero-title", { yPercent: -10, ease: "none", scrollTrigger: st(".hero", "top top", "bottom top") });
    gsap.fromTo(".photo-col .arch img", { scale: 1.18, yPercent: 6 }, { scale: 1, yPercent: -4, ease: "none", scrollTrigger: st(".photo-col", "top bottom", "bottom top") });
    gsap.fromTo(".camp-bg img", { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: st(".campaign", "top bottom", "bottom top") });
  }
  function initSteps() {
    var s = $("#steps"); if (!s) return; var esp = false;
    function upd() {
      esp = false; var r = s.getBoundingClientRect(), p = (innerHeight * 0.65 - r.top) / (r.height * 0.9);
      s.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
    }
    addEventListener("scroll", function () { if (!esp) { esp = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener("resize", upd); upd();
  }

  /* ---------- Botones magnéticos y malla de la campaña ---------- */
  function initMagnetic() {
    if (!finePointer) return;
    $$(".magnetic").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) * 0.22, dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
        b.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }
  function initMesh() {
    var s = $(".campaign"); if (!s) return; var esp = false, px = 74, py = 30;
    s.addEventListener("pointermove", function (e) {
      var r = s.getBoundingClientRect(); px = (e.clientX - r.left) / r.width * 100; py = (e.clientY - r.top) / r.height * 100;
      if (!esp) { esp = true; requestAnimationFrame(function () { s.style.setProperty("--mx", px.toFixed(1) + "%"); s.style.setProperty("--my", py.toFixed(1) + "%"); esp = false; }); }
    }, { passive: true });
  }

  /* ---------- Servicios con pestañas ---------- */
  function initTabs() {
    var tabs = $$(".tab"), ind = $(".tab-ind"); if (!tabs.length) return;
    function place() {
      var a = $(".tab.is-active"); if (!a || !ind) return;
      ind.style.width = a.offsetWidth + "px"; ind.style.transform = "translateX(" + (a.offsetLeft - 6) + "px)";
    }
    function select(t) {
      tabs.forEach(function (x) {
        var on = x === t; x.classList.toggle("is-active", on); x.setAttribute("aria-selected", on ? "true" : "false"); x.tabIndex = on ? 0 : -1;
        var p = document.getElementById(x.getAttribute("aria-controls")); if (p) { p.hidden = !on; p.classList.toggle("is-active", on); }
      });
      place();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!n) return;
        var nx = tabs[(i + n + tabs.length) % tabs.length]; select(nx); nx.focus();
      });
    });
    place(); addEventListener("resize", place); if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  }

  /* ---------- Campaña: cuenta regresiva y cupón ---------- */
  function initCountdown() {
    var box = $("#countdown"); if (!box) return;
    var end = new Date(D.campanaFin || "2026-11-30T23:59:59").getTime();
    function tick() {
      var left = end - Date.now();
      if (left <= 0) { box.className = "countdown is-over"; box.innerHTML = "<p>Esta campaña terminó. ¡Pronto habrá una nueva!</p>"; return true; }
      var d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24, m = Math.floor(left / 6e4) % 60, s = Math.floor(left / 1e3) % 60;
      var set = function (k, v) { var el = $('[data-cd="' + k + '"]', box); if (el) el.textContent = pad(v); };
      set("d", d); set("h", h); set("m", m); set("s", s); return false;
    }
    if (tick()) return; var id = setInterval(function () { if (tick()) clearInterval(id); }, 1000);
  }
  function initCopy() {
    $$("[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () {
        var txt = b.getAttribute("data-copy"), label = $("span", b), old = label ? label.textContent : "";
        var done = function () { if (label) label.textContent = "¡Copiado!"; toast("Código " + txt + " copiado"); setTimeout(function () { if (label) label.textContent = old; }, 1800); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done);
        else { var t = document.createElement("textarea"); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (e) {} t.remove(); done(); }
      });
    });
  }

  /* ---------- WhatsApp, horario y "abierto ahora" ---------- */
  function initContacto() {
    $$("[data-wa]").forEach(function (a) { a.href = waUrl("Hola Valea, quisiera más información."); a.target = "_blank"; a.rel = "noopener"; });
    var hrs = D.horario || {};
    var tb = $("#hours tbody");
    if (tb && !tb.children.length) {
      var hoy = DIAS[new Date().getDay()];
      [1, 2, 3, 4, 5, 6, 0].forEach(function (n) {
        var k = DIAS[n], r = hrs[k];
        tb.insertAdjacentHTML("beforeend", '<tr class="' + (k === hoy ? "is-today" : "") + '"><td>' + DIAS_N[n].charAt(0).toUpperCase() + DIAS_N[n].slice(1) + "</td><td>" + (r ? lindo(mins(r[0])) + " – " + lindo(mins(r[1])) : "Cerrado") + "</td></tr>");
      });
    }
    var box = $("#openNow"), txt = box && $("[data-open-text]", box), dot = box && $(".dot", box);
    if (!txt) return;
    var now = new Date(), nm = now.getHours() * 60 + now.getMinutes(), r = hrs[DIAS[now.getDay()]];
    if (r && nm >= mins(r[0]) && nm < mins(r[1])) { txt.textContent = "Abierto ahora · cierra a las " + lindo(mins(r[1])); return; }
    dot.classList.add("is-closed");
    if (r && nm < mins(r[0])) { txt.textContent = "Cerrado · abre hoy a las " + lindo(mins(r[0])); return; }
    for (var i = 1; i <= 7; i++) {
      var d = (now.getDay() + i) % 7, rr = hrs[DIAS[d]];
      if (rr) { txt.textContent = "Cerrado · abre " + (i === 1 ? "mañana" : "el " + DIAS_N[d]) + " a las " + lindo(mins(rr[0])); return; }
    }
  }

  /* ---------- Reservas ---------- */
  function initReserva() {
    var f = $("#reserva"); if (!f) return;
    var selS = $("#r-servicio"), selE = $("#r-esp"), fecha = $("#r-fecha"), slots = $("#r-slots"), err = $("#r-err"), btn = $("#r-submit"), ok = $("#r-ok"), book = $(".book");
    var hrs = D.horario || {}, sel = { hora: "" };
    var hoy = new Date(), tope = new Date(); tope.setDate(tope.getDate() + 60);
    fecha.min = ymd(hoy); fecha.max = ymd(tope);
    function opt() { return selS.options[selS.selectedIndex]; }
    function dur() { return +opt().getAttribute("data-min") || 45; }
    function precio() { return +opt().getAttribute("data-precio") || 0; }
    function ocupada(dia, hm) { var n = D.ocupadaCadaN || 5, h = 0, s = dia + hm; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973; return h % n === 0; }
    function sum(k, v) { var el = $('[data-sum="' + k + '"]'); if (el) el.textContent = v; }
    function resumen() {
      sum("servicio", opt().value || opt().textContent); sum("dur", dur() + " min"); sum("total", "S/ " + precio());
      if (fecha.value) { var d = fechaDe(fecha.value); sum("dia", DIAS_N[d.getDay()] + " " + d.getDate() + " de " + MESES[d.getMonth()]); } else sum("dia", "—");
      sum("hora", sel.hora ? lindo(mins(sel.hora)) : "—");
    }
    function pintarSlots() {
      sel.hora = ""; slots.innerHTML = "";
      if (!fecha.value) { slots.innerHTML = '<p class="slots-empty">Elige un día para ver los horarios.</p>'; resumen(); return; }
      var d = fechaDe(fecha.value), r = hrs[DIAS[d.getDay()]];
      if (!r) { slots.innerHTML = '<p class="slots-empty">Ese día estamos cerrados. Prueba con otro.</p>'; resumen(); return; }
      var ahora = new Date(), esHoy = ymd(d) === ymd(ahora), tmin = esHoy ? ahora.getHours() * 60 + ahora.getMinutes() + (D.anticipacionHoras || 2) * 60 : 0, n = 0, html = "";
      for (var t = mins(r[0]); t + dur() <= mins(r[1]); t += 30) {
        if (t < tmin) continue;
        var hm = pad(Math.floor(t / 60)) + ":" + pad(t % 60), bus = ocupada(fecha.value, hm);
        html += '<button type="button" class="slot" role="radio" aria-checked="false" data-t="' + hm + '"' + (bus ? " disabled" : "") + ">" + lindo(t) + "</button>"; n++;
      }
      slots.innerHTML = n ? html : '<p class="slots-empty">Ya no quedan horarios para hoy. Prueba con otro día.</p>';
      resumen();
    }
    slots.addEventListener("click", function (e) {
      var b = e.target.closest(".slot"); if (!b || b.disabled) return;
      $$(".slot", slots).forEach(function (x) { x.setAttribute("aria-checked", x === b ? "true" : "false"); });
      sel.hora = b.getAttribute("data-t"); resumen();
    });
    slots.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var all = $$(".slot:not(:disabled)", slots), i = all.indexOf(document.activeElement); if (i < 0) return;
      e.preventDefault(); all[(i + (e.key === "ArrowRight" ? 1 : -1) + all.length) % all.length].focus();
    });
    selS.addEventListener("change", function () { pintarSlots(); });
    fecha.addEventListener("change", pintarSlots);

    // Los botones "Reservar" de los servicios y de la campaña rellenan el formulario.
    $$("[data-servicio]").forEach(function (el) {
      el.addEventListener("click", function () {
        var nombre = el.getAttribute("data-servicio");
        for (var i = 0; i < selS.options.length; i++) if (selS.options[i].value === nombre) selS.selectedIndex = i;
        var nota = el.getAttribute("data-nota"); if (nota) $("#r-notas").value = nota;
        pintarSlots();
        if (el.tagName === "BUTTON") {
          $("#reservar").scrollIntoView({ behavior: "smooth", block: "start" });
          setTimeout(function () { fecha.focus({ preventScroll: true }); }, 700);
        }
      });
    });

    function malo(el, on) { if (el) el.classList.toggle("is-bad", !!on); }
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var nombre = $("#r-nombre").value.trim(), tel = $("#r-tel").value.replace(/\D/g, ""), msg = "", foco = null;
      [fecha, $("#r-nombre"), $("#r-tel")].forEach(function (x) { malo(x, false); });
      if (!fecha.value) { msg = "Elige el día de tu cita."; malo(fecha, 1); foco = fecha; }
      else if (!sel.hora) { msg = "Elige una hora disponible."; foco = $(".slot:not(:disabled)", slots); }
      else if (nombre.length < 2) { msg = "Escribe tu nombre."; malo($("#r-nombre"), 1); foco = $("#r-nombre"); }
      else if (!/^9\d{8}$/.test(tel)) { msg = "Escribe un celular de 9 dígitos que empiece con 9."; malo($("#r-tel"), 1); foco = $("#r-tel"); }
      err.textContent = msg; if (msg) { if (foco) foco.focus(); return; }
      btn.classList.add("is-loading"); btn.disabled = true;
      setTimeout(function () { btn.classList.remove("is-loading"); btn.disabled = false; exito(nombre, tel); }, 1200);
    });

    function exito(nombre, tel) {
      var d = fechaDe(fecha.value), cuando = DIAS_N[d.getDay()] + " " + d.getDate() + " de " + MESES[d.getMonth()] + " a las " + lindo(mins(sel.hora));
      var notas = $("#r-notas").value.trim(), esp = selE.value;
      var texto = "Hola Valea, quiero reservar: " + selS.value + ", " + cuando + " · Especialista: " + esp + " · A nombre de " + nombre + " (" + tel + ")" + (notas ? " · Notas: " + notas : "") + " · ¿Hay disponibilidad?";
      $("[data-ok-wa]", ok).href = waUrl(texto);
      $("[data-ok-text]", ok).textContent = selS.value + " · " + cuando + " — confirma con el equipo por WhatsApp para dejarla agendada.";
      book.hidden = true; ok.hidden = false; ok.classList.add("is-on"); ok.scrollIntoView({ behavior: "smooth", block: "center" }); ok.focus({ preventScroll: true });
      confeti(ok);
      ok._ics = { nombre: nombre, inicio: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, mins(sel.hora)), min: dur(), servicio: selS.value };
    }
    function confeti(box) {
      if (reduced) return;
      var col = ["#46C2AE", "#DE9C72", "#A85E37", "#12595B", "#EFE4D3"];
      for (var i = 0; i < 36; i++) {
        var c = document.createElement("i"); c.className = "confetti";
        c.style.left = (Math.random() * 100).toFixed(1) + "%"; c.style.background = col[i % col.length];
        c.style.animationDelay = (Math.random() * 0.5).toFixed(2) + "s"; c.style.setProperty("--r", (Math.random() * 720 - 360).toFixed(0) + "deg");
        box.appendChild(c); setTimeout(function (el) { el.remove(); }, 3200, c);
      }
    }
    $("[data-ok-new]", ok).addEventListener("click", function () {
      ok.hidden = true; ok.classList.remove("is-on"); book.hidden = false; f.reset(); fecha.min = ymd(new Date());
      sel.hora = ""; pintarSlots(); $("#reservar").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    $("[data-ok-ics]", ok).addEventListener("click", function () {
      var i = ok._ics; if (!i) return;
      var fin = new Date(i.inicio.getTime() + i.min * 6e4);
      var fmt = function (x) { return x.getFullYear() + pad(x.getMonth() + 1) + pad(x.getDate()) + "T" + pad(x.getHours()) + pad(x.getMinutes()) + "00"; };
      var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Valea//Reserva//ES", "BEGIN:VEVENT", "UID:" + Date.now() + "@valea",
        "DTSTAMP:" + fmt(new Date()), "DTSTART:" + fmt(i.inicio), "DTEND:" + fmt(fin), "SUMMARY:Valea · " + i.servicio,
        "LOCATION:" + (D.direccion || "Valea, San Miguel, Lima"), "DESCRIPTION:Reserva a nombre de " + i.nombre + ". Pendiente de confirmar por WhatsApp.", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "reserva-valea.ics";
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    });
    ["change", "input"].forEach(function (ev) { f.addEventListener(ev, function () { if (ev === "change") resumen(); }); });
    resumen();
  }

  /* ---------- Reseñas: llegan una a una, como mensajes ---------- */
  function initFeed() {
    var feed = $("#feed"); if (!feed || !("IntersectionObserver" in window)) return;
    var revs = $$(".rev", feed); if (!revs.length) return;
    revs.forEach(function (r) { r.classList.add("pend"); });
    function typing() { var t = document.createElement("li"); t.className = "typing"; t.setAttribute("aria-hidden", "true"); t.innerHTML = '<span class="av2">·</span><span class="dots"><i></i><i></i><i></i></span>'; feed.appendChild(t); return t; }
    function next(i) {
      if (i >= revs.length) return;
      var t = typing();
      setTimeout(function () { t.remove(); revs[i].classList.remove("pend"); revs[i].classList.add("entra"); setTimeout(function () { next(i + 1); }, 700); }, 1100);
    }
    new IntersectionObserver(function (es, io) { if (es[0].isIntersecting) { io.disconnect(); next(0); } }, { threshold: 0.05, rootMargin: "0px 0px -18% 0px" }).observe(feed);
    setTimeout(function () { revs.forEach(function (r) { r.classList.remove("pend"); }); $$(".typing", feed).forEach(function (t) { t.remove(); }); }, 12000);   // seguridad
  }

  /* ---------- Galería con vista ampliada ---------- */
  function initLightbox() {
    var lb = $("#lightbox"); if (!lb) return;
    var img = $("img", lb), close = $(".lb-close", lb), last = null;
    function open(b) { last = b; img.src = b.getAttribute("data-full"); img.alt = b.getAttribute("data-alt") || ""; lb.hidden = false; close.focus(); document.body.style.overflow = "hidden"; }
    function shut() { lb.hidden = true; document.body.style.overflow = ""; if (last) last.focus(); }
    $$(".g").forEach(function (b) { b.addEventListener("click", function () { open(b); }); });
    close.addEventListener("click", shut);
    lb.addEventListener("click", function (e) { if (e.target === lb) shut(); });
    addEventListener("keydown", function (e) { if (e.key === "Escape" && !lb.hidden) shut(); });
  }

  function initYear() { $$("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); }); }

  function boot() {
    safe(initSplash, "splash"); safe(initNav, "nav"); safe(initGlow, "glow"); safe(initSplit, "split"); safe(initReveal, "reveal");
    safe(initWaves, "waves"); safe(initParallax, "parallax"); safe(initSteps, "steps"); safe(initMagnetic, "magnetic"); safe(initMesh, "mesh");
    safe(initTabs, "tabs"); safe(initCountdown, "countdown"); safe(initCopy, "copy"); safe(initContacto, "contacto");
    safe(initReserva, "reserva"); safe(initFeed, "feed"); safe(initLightbox, "lightbox"); safe(initYear, "year");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
