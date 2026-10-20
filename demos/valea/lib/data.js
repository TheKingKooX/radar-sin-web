/* Datos de ejemplo de Valea. Cambia aquí el WhatsApp, la campaña y los horarios; el resto del sitio los lee. */
(function () {
  "use strict";
  window.__VALEA__ = {
    // Número de WhatsApp en formato internacional, sin "+" ni espacios (ejemplo: Perú 51 + 9 dígitos).
    whatsapp: "51900000000",
    telefono: "+51 900 000 000",
    direccion: "Av. La Marina 1234, San Miguel, Lima",
    // Fin de la campaña (hora local del visitante).
    campanaFin: "2026-11-30T23:59:59",
    // Horario por día (lun a dom). Formato 24 h.
    horario: {
      lun: ["09:00", "21:00"], mar: ["09:00", "21:00"], mie: ["09:00", "21:00"], jue: ["09:00", "21:00"],
      vie: ["09:00", "21:00"], sab: ["09:00", "21:00"], dom: ["10:00", "19:00"]
    },
    // En la disponibilidad de ejemplo, 1 de cada N horas aparece ocupada.
    ocupadaCadaN: 5,
    // Horas mínimas de anticipación para reservar el mismo día.
    anticipacionHoras: 2
  };
})();
