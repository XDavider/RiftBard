@echo off
title RiftBard: Caretaker's Vault
cd /d "%~dp0"

echo ===================================================
echo   Iniciando aplicacion...
echo ===================================================

:: Liberar posibles procesos zombies en puertos 3001 y 5173
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr /r /c:":3001 .*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr /r /c:":5173 .*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Iniciar servicios (backend + frontend)
call npm run dev
if %errorlevel% neq 0 (
    echo.
    echo ========================================================
    echo Error al iniciar la aplicacion (Codigo de salida: %errorlevel%).
    echo Por favor revisa el mensaje de error anterior.
    echo ========================================================
    pause
)