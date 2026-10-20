# Barberías, spas y salones: San Miguel, Magdalena del Mar y Jesús María

Estado al 20 de octubre de 2026.

## Objetivo
Listar negocios de belleza con más de 100 reseñas en Google Maps y ver cuáles no tienen página web, para ofrecerles una. Los más fuertes como prospectos son los de estado `none` (sin enlace en su ficha).

## Qué hay hecho
- 17 comercios sin web propia (1 sin enlace y 16 solo con red social o reservas). El 20 de octubre de 2026 se descartaron los 9 que tenían web propia.
- Página con tarjetas ordenables por reseñas o puntaje, y filtros por zona, tipo y estado de web.
- Botón **Quitar** por comercio, con aviso **Deshacer** y panel **Quitadas** para restaurar. Se guarda en `localStorage` con la clave `barberias-quitadas`.
- Mapa esquemático en SVG (puntos a escala sobre cuadrícula de 1 km), con selección de punto y enlace a Google Maps.
- Miniatura con iniciales en cada tarjeta.

## Cómo se obtuvieron los datos
Búsqueda en Google Places por zona y tipo. Para el estado de web se usó el campo de sitio web de cada ficha. Un negocio puede tener web sin haberla enlazado, así que conviene confirmar buscándolo en Google antes de contactarlo.

## Resultados clave (sin enlace en su ficha)
| Comercio | Zona | Tipo | Reseñas | Teléfono |
|---|---|---|---|---|
| Barbería Emmanuel | San Miguel | Barbería | 247 | +51 900 505 503 |
| La Barbería | San Miguel | Barbería | 243 | +51 960 706 851 |
| Vanlé Salón San Miguel | San Miguel | Salón | 368 | +51 970 964 522 |
| Yao Ling Spa | Magdalena del Mar | Spa | 228 | +51 1 2632227 |
| Salón de Belleza Arturo | San Miguel | Salón | 151 | +51 972 086 964 |
| Barone Barbería Premium | Magdalena del Mar | Barbería | 133 | +51 1 5044437 |
| Emy's Salon | Jesús María | Salón | 104 | +51 1 3308233 |

## Límites conocidos de esta versión
- **Mapa:** los mapas de Google incrustados y los mosaicos de otros servidores no cargan dentro de un artefacto de Claude, por eso el mapa es esquemático y sin calles.
- **Logos:** no se pudieron descargar las fotos de Google desde el entorno en la nube, así que las miniaturas son iniciales.
- Montalvo Salon & Spa es una cadena de salón y spa; se dejó en la lista y se puede quitar.

## Pendientes sugeridos para Code
1. Descargar el logo o la foto principal de cada ficha (desde la computadora de Kleiber sí hay red) y guardarlos en `img/`, luego mostrarlos en las tarjetas.
2. Cambiar el mapa esquemático por un mapa real con Leaflet y mosaicos de OpenStreetMap, ahora que la página corre fuera del artefacto.
3. Confirmar en Google que los comercios `none` realmente no tienen web.
4. Ampliar zonas (Pueblo Libre, Lince, Breña, Surco) con el mismo criterio de 100 reseñas.
5. Añadir columna de seguimiento por comercio: contactado, respuesta, nota.
6. Preparar un mensaje de contacto corto en español para cada tipo de negocio.
