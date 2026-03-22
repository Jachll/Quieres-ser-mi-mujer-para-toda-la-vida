@echo off
setlocal
cd /d "%~dp0"

start "Servidor Romantico" cmd /k "node serve-local.js"
timeout /t 2 >nul
start "" "http://localhost:5500"

echo.
echo Sitio abierto en http://localhost:5500
echo Para verlo desde celular (misma red Wi-Fi), revisa tu IP con:
echo ipconfig
echo y abre: http://TU_IP:5500
echo.
echo Cierra la ventana "Servidor Romantico" para detener el servidor.
echo.
pause
