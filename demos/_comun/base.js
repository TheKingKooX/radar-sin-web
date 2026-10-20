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

/* Reseñas: llegan una a una, como mensajes nuevos (indicador de escritura y aviso "Nueva reseña"). */
(function () {
  var feed = document.querySelector(".feed");
  if (!feed) return;
  var revs = [].slice.call(feed.querySelectorAll(".rev"));
  if (!revs.length || !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  revs.forEach(function (r) { r.classList.add("pend"); });
  function typing() { var t = document.createElement("li"); t.className = "typing"; t.setAttribute("aria-hidden", "true"); t.innerHTML = '<span class="av2">·</span><span class="dots"><i></i><i></i><i></i></span>'; feed.appendChild(t); return t; }
  function siguiente(i) {
    if (i >= revs.length) return;
    var t = typing();
    setTimeout(function () {
      t.remove();
      var r = revs[i]; r.classList.remove("pend"); r.classList.add("entra", "nueva");
      setTimeout(function () { r.classList.remove("nueva"); }, 3200);
      setTimeout(function () { siguiente(i + 1); }, 900);
    }, 1100);
  }
  new IntersectionObserver(function (es, io) { if (es[0].isIntersecting) { io.disconnect(); siguiente(0); } }, { threshold: .3 }).observe(feed);
})();
