@echo off
echo ============================================
echo  INICIANDO SISTEMA DE ASISTENCIA CASINO
echo ============================================
echo.

echo Iniciando Backend (FastAPI)...
start "Backend - FastAPI" cmd /k "cd /d C:\Users\fiae\sistema-asistencia\backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo Esperando 5 segundos para que inicie el backend...
timeout /t 5 /nobreak > nul

echo Iniciando Frontend (React + Vite)...
start "Frontend - React" cmd /k "cd /d C:\Users\fiae\sistema-asistencia\frontend && npm run dev"

echo.
echo ============================================
echo  SISTEMA INICIADO
echo ============================================
echo.
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend: http://localhost:5173
echo.
echo Credenciales Admin:
echo   Usuario: admin
echo   Password: admin
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause > nul

start http://localhost:5173
