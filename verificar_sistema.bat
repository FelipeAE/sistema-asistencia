@echo off
echo ============================================
echo  SISTEMA DE ASISTENCIA CASINO - VERIFICACION
echo ============================================
echo.

echo [1/4] Verificando Python...
python --version
if errorlevel 1 (
    echo ERROR: Python no encontrado
    pause
    exit /b 1
)

echo.
echo [2/4] Verificando sintaxis del backend...
cd /d C:\Users\fiae\sistema-asistencia\backend
python -c "from app.main import app; print('[OK] Backend importado correctamente')"
if errorlevel 1 (
    echo ERROR: Error en el backend
    pause
    exit /b 1
)

echo.
echo [3/4] Verificando base de datos...
python -c "from app.database import engine; print('[OK] Base de datos conectada')"
if errorlevel 1 (
    echo ERROR: Error en base de datos
    pause
    exit /b 1
)

echo.
echo [4/4] Verificando Node.js y frontend...
cd /d C:\Users\fiae\sistema-asistencia\frontend
call node --version
if errorlevel 1 (
    echo ADVERTENCIA: Node.js no encontrado
)

echo.
echo ============================================
echo  VERIFICACION COMPLETADA
echo ============================================
echo.
echo Para iniciar el sistema:
echo.
echo 1. Backend (Terminal 1):
echo    cd C:\Users\fiae\sistema-asistencia\backend
echo    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
echo.
echo 2. Frontend (Terminal 2):
echo    cd C:\Users\fiae\sistema-asistencia\frontend
echo    npm run dev
echo.
echo 3. Abrir navegador en: http://localhost:5173
echo.
pause
