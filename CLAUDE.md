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
