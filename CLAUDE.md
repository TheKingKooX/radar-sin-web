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
- Paleta: blanco o negro (según el sistema) y azul rey `#4169e1`. Fondo interactivo con resplandor que sigue al cursor.
- Tarjetas desplegables: cerradas solo logo y nombre; los logos están en `img/` (campo `lg`) y los servicios en `sv`.
- Sucursales: campo `su` (lista de textos) solo cuando hay evidencia; sin el campo la tarjeta dice "Sin sucursales encontradas".
- Identidad visual: campo `vi` ({c: colores hex, e: estilo, v: lema}) sacado del logo y del perfil público; sin `vi` la tarjeta lo indica.
- Demos en `demos/`: se generan con `node demos/generar.js [id]` desde `datos.json` y `demos/marcas/<id>.js`; el campo `demo` de cada negocio muestra el botón "Ver demo" en su tarjeta.
