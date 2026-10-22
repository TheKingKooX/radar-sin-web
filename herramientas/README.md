# Recolector de negocios de Google Maps

Automatiza lo que hicimos a mano: buscar por rubro en varias zonas alrededor de un punto, quedarse con los negocios que tienen
muchas reseñas, abrir cada ficha para leer web, teléfono y dirección, y dejar todo en un archivo y en la pestaña **Explorar** de la app.

No tiene dependencias: solo necesita **Node 22 o más** y **Chrome o Edge** instalados.

## Desde la pestaña Explorar (recomendado)

Haz doble clic en **Iniciar Radar.bat** (o `node herramientas/servidor.js`). Se abre la app en `http://localhost:8787` y la pestaña **Explorar** muestra el buscador: centro, radio, rubros, búsquedas editables, reseñas mínimas, cobertura y velocidad. Con **Iniciar búsqueda** ves el avance en vivo y los negocios van apareciendo en la lista; **Detener** guarda lo avanzado. No usa la API de Google ni claves. El servidor solo escucha en tu equipo (127.0.0.1). Abierta como archivo o desde GitHub Pages, Explorar muestra los resultados guardados pero no puede buscar.

## Uso rápido (línea de comandos)

```bash
node herramientas/mapas.js --centro "Av. La Mar 2591, San Miguel" --radio 5 --rubro belleza --min-resenas 100 --app
```

- `--centro` dirección o `lat,lng`.
- `--radio` en km (hasta 25).
- `--distritos "San Miguel,Pueblo Libre"` busca por distritos en vez de un círculo (cada uno desde su centro, con su propio radio). Solo guarda negocios cuya dirección sea de esos distritos. No hace falta `--centro`. Distritos: San Miguel, Magdalena del Mar, Pueblo Libre, Jesús María, Lince, Breña, Cercado de Lima, La Victoria, Rímac, San Isidro, Miraflores, Surquillo, Barranco, San Borja, Santiago de Surco, San Luis, Chorrillos, San Martín de Porres, Los Olivos, Callao, Bellavista, La Perla, La Punta.
- `--rubro` grupo de búsquedas: `belleza`, `comida`, `salud`, `fitness`, `tiendas`, `hogar`, `auto`, `profesional`, `educacion`, `mascotas`, `turismo`, `ocio` o `todos`. Se pueden juntar con comas (`belleza,comida`).
- `--consultas "ferretería,taller mecánico"` para buscar otras cosas en vez de un rubro.
- `--min-resenas` reseñas mínimas (por defecto 100).
- `--teselas 1|5|9` en cuántas zonas se repite cada búsqueda dentro del círculo. 5 es un buen equilibrio; 9 encuentra más y tarda más.
- `--app` deja los resultados cargados en Explorar (`index.html`). Sin esto solo se escribe el archivo `zona-<centro>.json`.
- `--web "sin enlace,solo red social"` guarda solo negocios con esa presencia web (opciones: sin enlace, solo red social, solo reservas, web propia; por defecto todas).
- `--max-por-rubro 10` deja de abrir fichas de un rubro al reunir 10 negocios que cumplen el filtro (0 = sin tope).
- `--sin-verificar` desactiva la verificación en Google (ver abajo).
- `--limite 5` abre solo 5 fichas, para probar.
- `--ver` muestra la ventana del navegador (por defecto se abre fuera de pantalla).
- `--incluir-conocidos` también trae los que ya están en `datos.json`.

Ejemplos:

```bash
node herramientas/mapas.js --centro "Av. Brasil 1200, Jesús María" --radio 3 --rubro comida,tiendas --app
node herramientas/mapas.js --centro "-12.1219,-77.0297" --radio 2 --consultas "gimnasio,yoga"
```

## Qué hace, paso a paso

1. Abre Chrome o Edge y ubica el centro en Google Maps.
2. Para cada búsqueda y cada zona, desplaza la lista hasta el final y anota nombre, puntaje, reseñas, categoría y coordenadas.
3. Filtra por radio y reseñas, y quita los negocios que ya tienes en `datos.json`.
4. Abre la ficha de cada negocio que queda y lee el enlace web, el teléfono y la dirección.
5. Clasifica la web: **sin enlace**, **solo red social** (incluye Linktree y similares), **solo reservas** o **web propia**.
6. Guarda el archivo y, con `--app`, actualiza Explorar.

## Verificación en Google

Maps a veces no muestra la web de un negocio que sí la tiene. Por cada negocio que cumple el filtro y no tiene web propia en Maps, el buscador busca su nombre en Google y revisa los resultados y el botón «Sitio web» del panel. Si encuentra una página que parece suya (el dominio o el título lleva el nombre y hay señales de que es de Perú, su teléfono o su dirección), la guarda como **posible web** con su dirección, el nivel de coincidencia (alta o media) y el motivo. Se descartan redes sociales, directorios y plataformas de reservas. Siempre conviene confirmarla a mano.

Google Search es más sensible que Maps: se hace una búsqueda por negocio, con pausas de 7 a 12 segundos. Si Google pide verificación, el programa no la salta: omite la verificación del resto, sigue guardando los negocios y los marca como «Sin verificar». Los resultados verificados se guardan 14 días en `.cache-mapas/verificacion-web.json`.

## Cuánto tarda

Cada búsqueda por zona toma cerca de un minuto y cada ficha unos 10 segundos. «Belleza» con 5 zonas son 30 búsquedas y unas
60 fichas: alrededor de 40 minutos. Se puede cortar con Ctrl+C: lo ya leído queda en `.cache-mapas/` y no se repite al volver a ejecutar.

## Límites y advertencias

- **Es lectura automática de la página de Google Maps, no la API oficial.** Los términos de Google no permiten extraer datos de Maps de forma automática. Úsalo con volumen bajo, para tu propia prospección, y entiende que Google puede cambiar la página o bloquear el acceso en cualquier momento.
- Va despacio a propósito (pausas entre páginas). Si Google muestra una verificación o el aviso de «tráfico inusual», el programa **se detiene y guarda lo avanzado**; no intenta saltarla. Espera un rato y vuelve a ejecutar.
- La lista de Google tiene un tope por búsqueda; los resultados pueden no ser todos los negocios de la zona.
- «Sin enlace» significa que Google no muestra web, no que el negocio no tenga una. Conviene buscarlo en Google antes de ofrecerle una página.
- Si Google cambia su diseño, los selectores de `mapas.js` (`paginaLista` y `paginaDetalle`) son lo único que hay que ajustar.
- Si no encuentra el navegador, usa `--navegador "ruta/chrome.exe"` o la variable de entorno `NAVEGADOR`.
- Con la ventana oculta o sin ventana Google entrega una lista sin el número de reseñas; por eso el programa abre un navegador real fuera de pantalla.
