@echo off
chcp 65001 >nul
title Cerrando Sistema de Asistencia...

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║         CERRANDO SISTEMA DE ASISTENCIA CASINO                ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo Cerrando procesos del sistema...

:: Cerrar procesos de Node (frontend)
taskkill /F /IM node.exe /T 2>nul
if %errorlevel%==0 (
    echo [OK] Frontend cerrado
) else (
    echo [--] Frontend ya estaba cerrado
)

:: Cerrar procesos de Python (backend)
taskkill /F /FI "WINDOWTITLE eq Backend - Sistema Asistencia*" 2>nul
taskkill /F /IM python.exe /T 2>nul
if %errorlevel%==0 (
    echo [OK] Backend cerrado
) else (
    echo [--] Backend ya estaba cerrado
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              SISTEMA CERRADO CORRECTAMENTE                   ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

timeout /t 3
