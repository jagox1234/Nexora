@echo off
REM setup-android-sdk_RUN.bat
REM Doble click para configurar variables del SDK Android (persistente) y aceptar licencias opcional.
REM Puedes pasar flags extra:  _NO_LIC  para saltar licencias.

set SCRIPT_DIR=%~dp0
set PS_SCRIPT=%SCRIPT_DIR%setup-android-sdk.ps1

if not exist "%PS_SCRIPT%" (
  echo [ERR] No se encuentra setup-android-sdk.ps1 en %SCRIPT_DIR%
  pause
  exit /b 1
)

set ACCEPT=-AcceptLicenses
if /I "%1"=="_NO_LIC" set ACCEPT=

powershell -ExecutionPolicy Bypass -NoLogo -NoProfile -File "%PS_SCRIPT%" -Persist %ACCEPT%

if %errorlevel% neq 0 (
  echo.
  echo [WARN] El script devolvio un codigo %errorlevel%.
) else (
  echo.
  echo [OK] Terminado. Abre una NUEVA ventana de PowerShell:  adb --version
)

echo.
pause
