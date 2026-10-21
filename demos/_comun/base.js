/* Aparición al hacer scroll. Sin movimiento reducido, los elementos .rv entran al verse. */
(function () {
  var els = document.querySelectorAll(".rv");
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    els.forEach(function (e) { e.classList.add("in"); });
    return;
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: .15 });
  els.forEach(function (e) { io.observe(e); });
})();

/* Posición del cursor en --mx y --my, para los fondos interactivos. */
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var r = document.documentElement, x = 0, y = 0, esp = false;
  addEventListener("pointermove", function (e) {
    x = e.clientX; y = e.clientY;
    if (!esp) { esp = true; requestAnimationFrame(function () { r.style.setProperty("--mx", x + "px"); r.style.setProperty("--my", y + "px"); esp = false; }); }
  }, { passive: true });
})();

/* Solicitud de cita: arma un mensaje de WhatsApp con servicio, día, hora y nombre. */
(function () {
  var f = document.getElementById("cita");
  if (!f || !window.CITA) return;
  var C = window.CITA, DIAS = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"], NOM = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var d = f.elements.d, h = f.elements.h, err = f.querySelector(".err");
  function ymd(t) { return t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0"); }
  function fecha(v) { var p = v.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function min(hm) { var p = hm.split(":"); return +p[0] * 60 + +p[1]; }
  function lindo(m) { var hh = Math.floor(m / 60), mm = m % 60, s = hh >= 12 ? "p. m." : "a. m."; hh = hh % 12 || 12; return hh + ":" + String(mm).padStart(2, "0") + " " + s; }
  var hoy = new Date(), tope = new Date(); tope.setDate(tope.getDate() + 60);
  d.min = ymd(hoy); d.max = ymd(tope);
  function horas() {
    if (!C.h) { h.innerHTML = '<option value="">Elige una franja</option><option>Mañana</option><option>Tarde</option><option>Noche</option>'; return; }
    if (!d.value) { h.innerHTML = '<option value="">Primero elige el día</option>'; return; }
    var f0 = fecha(d.value), r = C.h[DIAS[f0.getDay()]], o = "";
    if (!r) { h.innerHTML = '<option value="">Cerrado ese día</option>'; return; }
    var ahora = new Date(), esHoy = ymd(f0) === ymd(ahora), tmin = esHoy ? ahora.getHours() * 60 + ahora.getMinutes() + C.ant * 60 : 0;
    for (var t = min(r[0]); t + 60 <= min(r[1]); t += 60) if (t >= tmin) o += '<option value="' + t + '">' + lindo(t) + "</option>";
    h.innerHTML = o ? '<option value="">Elige la hora</option>' + o : '<option value="">Sin horarios para hoy</option>';
  }
  horas();
  d.addEventListener("change", horas);
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var n = f.elements.n.value.trim(), s = f.elements.s.value;
    if (!d.value) { err.textContent = "Elige el día."; d.focus(); return; }
    if (!h.value) { err.textContent = C.h ? "Elige una hora disponible." : "Elige una franja."; h.focus(); return; }
    if (!n) { err.textContent = "Escribe tu nombre."; f.elements.n.focus(); return; }
    err.textContent = "";
    var f1 = fecha(d.value), cuando = NOM[f1.getDay()] + " " + f1.getDate() + "/" + (f1.getMonth() + 1) + (C.h ? " a las " + lindo(+h.value) : " en la " + h.value.toLowerCase());
    var msg = "Reserva web: " + s + ", " + cuando + " (a nombre de " + n + "). ¿Hay disponibilidad?";
    window.open(C.wa + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
  });
})();

/* Reseñas en bucle. Tocar una abre un panel que ofrece ir a la reseña exacta en Google. */
(function () {
  var feed = document.querySelector(".feed"), data = window.RESENAS;
  if (!feed || !data || !data.length) return;
  var VIS = Math.min(3, data.length), sig = VIS, pausado = false, enModal = false, encima = false, visible = true, timer = null, ultimo = null;
  var lento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var est = function (n) { return "★".repeat(n) + "☆".repeat(5 - n); };
  function tarjeta(k) {
    var r = data[k % data.length], li = document.createElement("li");
    li.className = "rev entra";
    li.innerHTML = '<span class="av2" aria-hidden="true">' + esc(r.a.charAt(0).toUpperCase()) + '</span><button type="button" class="bub" data-rv="' + (k % data.length) + '" aria-haspopup="dialog"><span class="rh"><b>' + esc(r.a) + '</b><span class="est" aria-label="' + r.e + ' de 5 estrellas">' + est(r.e) + '</span><span class="fe">' + esc(r.f) + '</span></span><span class="rtxt">' + esc(r.t) + '</span><span class="ver">Ver en Google ↗</span></button>';
    return li;
  }
  var cinta = feed.parentNode.classList.contains("cinta");
  var sync = function () { feed.classList.toggle("pausa", pausado || enModal); };
  feed.innerHTML = "";
  if (cinta) {
    // Modo cinta: todas las reseñas dos veces en una columna que sube sin parar; los bordes se desvanecen por CSS.
    var vp = document.createElement("div"); vp.className = "cinta-vp"; feed.parentNode.insertBefore(vp, feed); vp.appendChild(feed);
    feed.classList.add("en-cinta"); feed.style.setProperty("--dur", data.length * 7 + "s");
    for (var c = 0; c < 2 * data.length; c++) { var tc = tarjeta(c); tc.classList.remove("entra"); if (c >= data.length) tc.setAttribute("aria-hidden", "true"); feed.appendChild(tc); }
  } else for (var k = 0; k < VIS; k++) { var t0 = tarjeta(k); t0.classList.remove("entra"); feed.appendChild(t0); }

  function avanzar() {
    if (pausado || enModal || encima || !visible || document.hidden || data.length <= VIS) return;
    var ind = document.createElement("li"); ind.className = "typing"; ind.setAttribute("aria-hidden", "true");
    ind.innerHTML = '<span class="av2">·</span><span class="dots"><i></i><i></i><i></i></span>'; feed.appendChild(ind);
    setTimeout(function () {
      ind.remove(); var primero = feed.firstElementChild; feed.appendChild(tarjeta(sig++));
      if (primero) { if (lento) primero.remove(); else { primero.classList.add("sale"); setTimeout(function () { primero.remove(); }, 520); } }
    }, lento ? 200 : 1000);
  }
  if (!cinta) timer = setInterval(avanzar, lento ? 8000 : 5600);
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(feed);
  feed.addEventListener("mouseover", function () { encima = true; });
  feed.addEventListener("mouseout", function () { encima = false; });
  feed.addEventListener("focusin", function () { encima = true; });
  feed.addEventListener("focusout", function () { encima = false; });
  var ctl = document.querySelector(".feed-ctl");
  if (ctl) ctl.addEventListener("click", function () { pausado = !pausado; ctl.setAttribute("aria-pressed", pausado ? "true" : "false"); ctl.textContent = pausado ? "Reanudar" : "Pausar"; sync(); });

  var modal = document.createElement("div");
  modal.className = "rv-modal"; modal.hidden = true; modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true"); modal.setAttribute("aria-labelledby", "rvM-t");
  modal.innerHTML = '<div class="rv-card"><p class="rv-k">Reseña de Google</p><h3 id="rvM-t">¿Quieres ver esta reseña en Google?</h3><blockquote class="rv-q"></blockquote><p class="rv-by"></p><p class="rv-n">Te llevaremos a la reseña original en Google Maps. Se abre en una pestaña nueva.</p><div class="rv-act"><a class="btn rv-go" target="_blank" rel="noopener">Aceptar e ir a la reseña</a><button type="button" class="btn sec rv-no">Cancelar</button></div></div>';
  document.body.appendChild(modal);
  var go = modal.querySelector(".rv-go"), no = modal.querySelector(".rv-no");
  function abrir(k, btn) {
    var r = data[k]; ultimo = btn; modal.querySelector(".rv-q").textContent = r.t;
    modal.querySelector(".rv-by").textContent = "— " + r.a + " · " + est(r.e) + " · " + r.f;
    go.href = r.u; modal.hidden = false; enModal = true; sync(); document.body.style.overflow = "hidden"; go.focus();
  }
  function cerrar() { modal.hidden = true; enModal = false; sync(); document.body.style.overflow = ""; if (ultimo && document.contains(ultimo)) ultimo.focus(); }
  feed.addEventListener("click", function (e) { var b = e.target.closest("[data-rv]"); if (b) abrir(+b.getAttribute("data-rv"), b); });
  go.addEventListener("click", function () { setTimeout(cerrar, 150); });
  no.addEventListener("click", cerrar);
  modal.addEventListener("click", function (e) { if (e.target === modal) cerrar(); });
  addEventListener("keydown", function (e) {
    if (modal.hidden) return;
    if (e.key === "Escape") cerrar();
    if (e.key === "Tab") { var a = [go, no], j = a.indexOf(document.activeElement); e.preventDefault(); a[(j + (e.shiftKey ? -1 : 1) + a.length) % a.length].focus(); }
  });
})();
