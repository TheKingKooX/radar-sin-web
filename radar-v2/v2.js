/* Radar sin web v2: fondo de radar con los negocios reales, cifras animadas y brillo que sigue al cursor en las tarjetas. */
(function () {
  "use strict";
  function safe(fn, n) { try { fn(); } catch (e) { if (window.console) console.warn("[" + n + "]", e); } }
  var $ = function (s) { return document.querySelector(s); };

  function initRadar() {
    var cv = $("#radar"); if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = 1, cx = 0, cy = 0, R = 0, mx = 0, my = 0, tx = 0, ty = 0;
    var pts = (window.DATA || []).filter(function (d) { return d.la != null && d.lo != null; });
    if (!pts.length) return;
    var la0 = 0, lo0 = 0; pts.forEach(function (d) { la0 += d.la; lo0 += d.lo; }); la0 /= pts.length; lo0 /= pts.length;
    var kx = Math.cos(la0 * Math.PI / 180), maxd = 0.0001;
    pts.forEach(function (d) { d.__x = (d.lo - lo0) * kx; d.__y = -(d.la - la0); maxd = Math.max(maxd, Math.hypot(d.__x, d.__y)); });
    function medir() {
      dpr = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var movil = W < 900; cx = movil ? W * 0.5 : W * 0.68; cy = movil ? H * 0.34 : H * 0.46; R = Math.min(W, H) * (movil ? 0.46 : 0.5);
    }
    medir(); addEventListener("resize", medir);
    addEventListener("pointermove", function (e) { tx = (e.clientX / W - 0.5) * 2; ty = (e.clientY / H - 0.5) * 2; }, { passive: true });
    var oscuro = matchMedia("(prefers-color-scheme: dark)"), TAU = Math.PI * 2;
    function frame(t) {
      requestAnimationFrame(frame); if (document.hidden) return;
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      var ox = cx - mx * 18, oy = cy - my * 18, a = oscuro.matches ? 1 : 0.7;
      var base = oscuro.matches ? "138,166,255" : "42,79,196";
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      for (var i = 1; i <= 4; i++) { ctx.strokeStyle = "rgba(" + base + "," + (0.1 * a) + ")"; ctx.beginPath(); ctx.arc(ox, oy, R * i / 4, 0, TAU); ctx.stroke(); }
      ctx.strokeStyle = "rgba(" + base + "," + (0.07 * a) + ")"; ctx.beginPath();
      ctx.moveTo(ox - R, oy); ctx.lineTo(ox + R, oy); ctx.moveTo(ox, oy - R); ctx.lineTo(ox, oy + R); ctx.stroke();
      var ang = (t / 5200) % TAU;
      if (ctx.createConicGradient) {
        var g = ctx.createConicGradient(ang - 1.1, ox, oy);
        g.addColorStop(0, "rgba(" + base + ",0)"); g.addColorStop(0.17, "rgba(" + base + "," + (0.2 * a) + ")"); g.addColorStop(0.175, "rgba(" + base + ",0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, R, 0, TAU); ctx.fill();
      }
      ctx.strokeStyle = "rgba(" + base + "," + (0.55 * a) + ")"; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.cos(ang) * R, oy + Math.sin(ang) * R); ctx.stroke();
      pts.forEach(function (d) {
        var px = ox + d.__x / maxd * R * 0.9, py = oy + d.__y / maxd * R * 0.9;
        var th = Math.atan2(py - oy, px - ox); if (th < 0) th += TAU;
        var v = Math.max(0, 1 - ((ang - th + TAU) % TAU) / 3.2), rr = 2.6 + 3.4 * v * v;
        ctx.fillStyle = "rgba(" + base + "," + ((0.28 + 0.72 * v) * a) + ")";
        ctx.beginPath(); ctx.arc(px, py, rr, 0, TAU); ctx.fill();
        if (v > 0.8) { ctx.strokeStyle = "rgba(" + base + "," + ((v - 0.8) * 2.5 * a) + ")"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(px, py, rr + 5 + (1 - v) * 60, 0, TAU); ctx.stroke(); }
      });
    }
    requestAnimationFrame(frame);
  }

  function initKpi() {
    var el = $("#kpi"); if (!el) return;
    var rows = (window.DATA || []).concat(window.GUARD || []);
    var rev = rows.reduce(function (s, d) { return s + (d.c || 0); }, 0);
    var sin = rows.filter(function (d) { return d.s === "social"; }).length;
    var demos = rows.filter(function (d) { return d.demo; }).length;
    var vals = [[rows.length, "Negocios"], [rev, "Reseñas en Google"], [sin, "Solo en redes o WhatsApp"], [demos, "Demos hechas"]];
    el.querySelector(".kpi-n").innerHTML = vals.map(function (v) { return '<div><b data-to="' + v[0] + '">' + v[0].toLocaleString("es-PE") + "</b><span>" + v[1] + "</span></div>"; }).join("");
    var t0 = performance.now();
    function paso(t) {
      var k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
      el.querySelectorAll("[data-to]").forEach(function (b) { b.textContent = Math.round(b.getAttribute("data-to") * e).toLocaleString("es-PE"); });
      if (k < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  function initBrillo() {
    document.addEventListener("pointermove", function (e) {
      var r = e.target.closest && e.target.closest(".row"); if (!r) return;
      var b = r.getBoundingClientRect(); r.style.setProperty("--px", (e.clientX - b.left) + "px"); r.style.setProperty("--py", (e.clientY - b.top) + "px");
    }, { passive: true });
  }

  function boot() { safe(initRadar, "initRadar"); safe(initKpi, "initKpi"); safe(initBrillo, "initBrillo"); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
