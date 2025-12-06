@echo off
chcp 65001 >nul
title Sistema de Asistencia Casino

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║       SISTEMA DE ASISTENCIA CASINO - INICIANDO               ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║  Por favor espere mientras se inicia el sistema...           ║
echo ║  NO CIERRE ESTA VENTANA mientras usa el sistema              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/4] Iniciando servidor backend...
cd /d "%~dp0backend"
start /min "BACKEND_CASINO" cmd /c "call venv\Scripts\activate.bat && python run.py"
cd /d "%~dp0"

echo [2/4] Esperando que el backend este listo...
timeout /t 4 /nobreak >nul

echo [3/4] Iniciando interfaz web...
cd /d "%~dp0frontend"
start /min "FRONTEND_CASINO" cmd /c "npm run dev"
cd /d "%~dp0"

echo [4/4] Esperando que todo este listo...
timeout /t 6 /nobreak >nul

echo.
echo   Abriendo navegador...
start "" "http://localhost:5173"

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                 SISTEMA LISTO PARA USAR                      ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║                                                              ║
echo ║   El navegador se abrio con el sistema.                      ║
echo ║   Puede minimizar esta ventana.                              ║
echo ║                                                              ║
echo ║   IMPORTANTE: Para cerrar el sistema correctamente,          ║
echo ║   presione cualquier tecla en esta ventana.                  ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

pause >nul

echo.
echo Cerrando sistema...

:: Cerrar proceso en puerto 8000 (backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Cerrar proceso en puerto 5173 (frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Cerrar las ventanas cmd por título
taskkill /FI "WINDOWTITLE eq BACKEND_CASINO" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq FRONTEND_CASINO" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Administrador:  BACKEND_CASINO" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Administrador:  FRONTEND_CASINO" /F >nul 2>&1

echo Sistema cerrado correctamente.
timeout /t 2 >nul
