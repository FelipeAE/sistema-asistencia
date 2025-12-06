@echo off
chcp 65001 >nul
title Creando Acceso Directo...

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║         CREANDO ACCESO DIRECTO EN ESCRITORIO                 ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

set "SOURCE=%~dp0IniciarSistema.bat"
set "DESKTOP=%USERPROFILE%\Desktop"
set "SHORTCUT=%DESKTOP%\Sistema Asistencia Casino.lnk"

:: Crear acceso directo usando PowerShell
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT%'); $s.TargetPath = '%SOURCE%'; $s.WorkingDirectory = '%~dp0'; $s.Description = 'Iniciar Sistema de Asistencia Casino'; $s.Save()"

if exist "%SHORTCUT%" (
    echo.
    echo ╔══════════════════════════════════════════════════════════════╗
    echo ║                     EXITO                                    ║
    echo ╠══════════════════════════════════════════════════════════════╣
    echo ║  Se creo el acceso directo en su escritorio:                 ║
    echo ║  "Sistema Asistencia Casino"                                 ║
    echo ║                                                              ║
    echo ║  Ahora puede hacer doble clic en el icono para              ║
    echo ║  iniciar el sistema.                                         ║
    echo ╚══════════════════════════════════════════════════════════════╝
) else (
    echo.
    echo [ERROR] No se pudo crear el acceso directo.
    echo Puede crear uno manualmente arrastrando "IniciarSistema.bat"
    echo al escritorio.
)

echo.
pause
