const fs=require("fs");
let m=fs.readFileSync("marcas/vanle.js","utf8");
const a=m.indexOf("/* Logo del encabezado");const b=m.indexOf("@keyframes latido");const end=m.indexOf("\n",b);
if(a<0||b<0)throw 1;
const nuevo=`/* Logo del encabezado: cuando la persona está quieta y la página está arriba, el logo respira con un halo granate, dos ondas se expanden desde el aro y un destello recorre el borde (3,6 s en bucle). No depende de "reducir movimiento": es un detalle decorativo que la persona apaga al moverse. */
.top .marca { position: relative; display: inline-block; line-height: 0; border-radius: 50%; }
.top .marca::before, .top .marca::after { content: ""; position: absolute; inset: 0; border-radius: 50%; border: 3px solid #872b39; opacity: 0; pointer-events: none; }
.marca svg .barrido { fill: none; stroke: #f6c4ca; stroke-width: 11; stroke-linecap: round; stroke-dasharray: .22 .78; stroke-dashoffset: 0; opacity: 0; transform: rotate(-90deg); transform-origin: 100px 100px; transition: opacity .35s ease; }
html.quieto .top .marca svg { animation: respira 3.6s ease-in-out infinite; }
html.quieto .top .marca::before { animation: onda 3.6s cubic-bezier(.23, 1, .32, 1) infinite; }
html.quieto .top .marca::after { animation: onda 3.6s 1.8s cubic-bezier(.23, 1, .32, 1) infinite; }
html.quieto .marca svg .barrido { opacity: 1; animation: barrido 3.6s cubic-bezier(.45, 0, .25, 1) infinite; }
html.quieto .marca svg path { animation: latido 3.6s ease-in-out infinite; }
@keyframes respira { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(135, 43, 57, 0)); } 50% { transform: scale(1.14); filter: drop-shadow(0 0 7px rgba(135, 43, 57, .6)); } }
@keyframes onda { 0% { transform: scale(1); opacity: .85; } 80%, 100% { transform: scale(2.3); opacity: 0; } }
@keyframes barrido { to { stroke-dashoffset: -1; } }
@keyframes latido { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }`;
m=m.slice(0,a)+nuevo+m.slice(end);
fs.writeFileSync("marcas/vanle.js",m);require("./marcas/vanle.js");
