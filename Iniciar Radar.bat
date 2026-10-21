@echo off
cd /d "%~dp0"
title Radar sin web
echo Abriendo Radar sin web... deja esta ventana abierta mientras lo uses.
node herramientas\servidor.js
pause
