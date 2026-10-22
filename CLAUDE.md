# Radar sin web: barberías, spas y salones (Lima Oeste)

Proyecto de prospección de Kleiber: encontrar negocios de belleza con muchas reseñas en Google Maps y poca o ninguna presencia web, para ofrecerles una página.

## Archivos
- `index.html`: página única (HTML, CSS y JS sin dependencias). Tiene los datos dentro de la variable `DATA`.
- `datos.json`: copia de `DATA` para trabajar con los datos aparte.
- `README.md`: contexto completo, decisiones y pendientes.

## Reglas del proyecto
- Idioma: español, sin relleno.
- Criterio de inclusión: 100 reseñas o más en Google Maps y sin web propia. Los negocios con web propia se descartaron el 20 de octubre de 2026.
- Estado de web (campo `s`): `none` sin enlace, `social` solo red social, reservas o WhatsApp. El texto exacto de la etiqueta va en `pl`.
- Cada comercio lleva coordenadas (`la`, `lo`) y el enlace a su ficha (`m`).
- Si cambias `DATA` en `index.html`, actualiza también `datos.json`.
- La página funciona abriendo `index.html` en el navegador, sin servidor.

## Interfaz
- Paleta: blanco o negro (según el sistema) y azul rey `#4169e1`. Fondo con resplandor suave fijo.
- Interfaz tipo app: barra superior con buscador; filtros en panel lateral (escritorio) u hoja inferior (celular); filas con logo, puntaje y estado; detalle en hoja o cajón; pestañas inferiores y ruta; se instala con `manifest.webmanifest` e `icon.svg`. Los logos están en `img/` (campo `lg`) y los servicios en `sv`.
- Sucursales: campo `su` (lista de textos) solo cuando hay evidencia; sin el campo la tarjeta dice "Sin sucursales encontradas".
- Identidad visual: campo `vi` ({c: colores hex, e: estilo, v: lema}) sacado del logo y del perfil público; sin `vi` la tarjeta lo indica.
- Demos en `demos/`: se generan con `node demos/generar.js [id]` desde `datos.json` y `demos/marcas/<id>.js`; el campo `demo` de cada negocio muestra el botón "Ver demo" en su tarjeta.
- Servicios y galería: tarjetas expandibles con crossfade. Las ilustraciones referenciales salen de `node demos/arte.js [id]` (estilo por página en `ESTILOS`, un dibujo por servicio); Vanlé usa las suyas hechas a mano en `demos/vanle/img/`. Opiniones de Google al pie, con scroll manual (`cinta: false`, `cintaManual: false`, `opinionesAlFinal: false` o `sinTarjetas: true` en la marca lo desactivan).
- Ejemplo terminado: `demos/valea/` (barbería y spa ficticia, con reservas, campaña, reseñas de ejemplo y fondos interactivos). Se enlaza con una tarjeta destacada en `index.html`; no forma parte de `DATA`. Imágenes de Wikimedia Commons con atribución en `demos/valea/creditos.html`.
- Modo Explorar: busca locales cerca del usuario con Google Places API (New) usando una clave que cada persona pega en la app (se guarda en localStorage, nunca en el repositorio). Categorías = grupos de tipos de Google (CATS en index.html); estado de web y redes salen del campo websiteUri; no hay seguidores de Instagram, solo el enlace al perfil cuando existe. Cada consulta cuesta dinero: la app muestra el estimado y cuenta las consultas del mes.
- Resultados iniciales de Explorar: `zona-la-mar.json` (búsqueda manual en Google Maps de belleza, 100+ reseñas, 5 km de Av. La Mar 2591, San Miguel), embebidos en index.html como ZONA. Estado de web = enlace que Google muestra; conviene confirmar en Google antes de ofrecer una página.
- Recolector automático: `node herramientas/mapas.js --centro "dirección" --radio 5 --rubro belleza --app` (ver herramientas/README.md). Lee Google Maps con Chrome o Edge, es lento a propósito, se detiene ante verificaciones de Google y deja los resultados en zona-*.json y, con --app, en Explorar.
- Ruta en Google Maps: cada tarjeta tiene una casilla; la barra inferior arma `maps/dir/?api=1` con las coordenadas (`la`, `lo`) de los negocios elegidos (máximo 10 paradas) y puede ordenarlas por cercanía.

- Buscador en Explorar: `Iniciar Radar.bat` (o `node herramientas/servidor.js`) sirve la app en `localhost:8787` y expone `/api/*`; Explorar controla `herramientas/mapas.js` (sin API de Google, sin claves). Config guardada en localStorage; último resultado en `radar-ultimo`.
- Extras de las demos (todas los llevan por defecto; `demos/generar.js` + `demos/_comun/base.js|css`): cifras animadas, antes y después (ilustración referencial de corte o de salón), "abierto ahora" con hora de Lima, barra de reserva en celular, paralaje, calculadora de servicios, equipo, promoción con cuenta regresiva hasta fin de mes, tarjeta de sellos (localStorage), divisores y animaciones (título por letras, entrada escalonada, botones). Los datos son de ejemplo (`defaultsMarca` en generar.js: respeta precios y minutos reales de `sv`) y cada marca puede reemplazarlos con `precios`, `equipo`, `promo`, `fidelidad`, `divisor: true` (divisor propio en su CSS) o `extras: false` / `animaciones: false`. Todo respeta "reducir movimiento".
- Verificación en Google (mapas.js: paginaBusqueda, elegirWeb): busca el nombre de cada negocio sin web propia y marca "Posible web" (campos pw y vw en la ficha; filas de 12 elementos: [..., cid, pw, verificado]). Lenta a propósito; ante verificación de Google se omite sin saltarla.
- Búsqueda por distritos: `DISTRITOS` en mapas.js (centro y radio aproximados); la dirección de la ficha decide si el negocio es del distrito. En Explorar: «Dónde buscar» → «Por distritos».
- Resultados en vivo en Explorar: mientras se busca, mapas.js emite `cand` (negocio ya visto en Maps que cumple reseñas y radio, web aún sin revisar, se pinta como «Revisando web…»); al leer su ficha llega `fila` y lo reemplaza, o `quitar` si no cumple el filtro. Al terminar se descartan los que no llegaron a revisarse.
- Torero Estética (`demos/torero/`): web hecha a mano con la skill adrian-saenz-hostinger-premium-website (arquetipo Liquid Wave: index.html + styles.css + main.js + lib/, con `.htaccess` y `?v=` de caché), no con `demos/generar.js`; no hay `demos/marcas/torero.js`. Catálogo y precios reales de su WhatsApp; reseñas no inventadas (solo 4,4 y 531 con enlace a Maps); cupos de ejemplo.
- Barbería Emmanuel (`demos/emmanuel/`): también hecha a mano con esa skill (arquetipo Dark Warm, negro/crema/dorado, firma: lámina dorada del monograma que sigue al cursor), sin `demos/marcas/emmanuel.js`. Usa su horario real, reseñas reales de Google citadas tal cual y horas de reserva de ejemplo; no hay precios ni fotos (no se inventaron).
- Barbería Emmanuel (`demos/emmanuel/`): hecha a mano con la misma skill (arquetipo Dark Warm, negro/crema/dorado, Cormorant Garamond + Outfit, superficies translúcidas y bordes redondeados, fondo interactivo (foco de luz y hilos de seda dorada que ondulan y se curvan hacia el cursor, canvas `#bgc`) y entradas al desplazar con variantes `data-rv` izq/der/zoom, barra de progreso y fotos con paralaje; firma: «la carta», lista de precios con la foto del servicio que cambia al pasar el cursor). Catálogo y precios reales de su WhatsApp (7 servicios, S/ 10 a S/ 200), fotos del catálogo y de su Instagram (@em_studio23) en `assets/img/*.webp` (capturadas y limpiadas, resolución media), logo = su foto de perfil, horario real y 6 reseñas reales de Google; horas libres de ejemplo. Sin `demos/marcas/emmanuel.js`.
- Pestaña Ejemplos (modo "ej" en index.html): Valea destacada y galería de todas las demos de DATA (campo `demo`), con botón «Ficha y QR»; ya no hay banner de Valea en Mi lista.
