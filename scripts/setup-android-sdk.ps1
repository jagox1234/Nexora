<#
  setup-android-sdk.ps1
  Configura variables de entorno para el SDK de Android en Windows.

  Uso básico (sesión actual):
    powershell -ExecutionPolicy Bypass -File .\scripts\setup-android-sdk.ps1

  Persistir (usuario):
    powershell -ExecutionPolicy Bypass -File .\scripts\setup-android-sdk.ps1 -Persist

  Parámetros:
    -SdkPath  Ruta del SDK (por defecto %LOCALAPPDATA%\Android\Sdk)
    -Persist  Guarda ANDROID_HOME / ANDROID_SDK_ROOT y PATH (platform-tools + emulator) a nivel de usuario

  Después: abre un nuevo terminal y ejecuta: adb --version
#>
param(
  [string]$SdkPath = "$env:LOCALAPPDATA\Android\Sdk",
  [switch]$Persist,
  [switch]$AcceptLicenses
)

function Write-Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Write-Ok($m){ Write-Host "[ OK ] $m" -ForegroundColor Green }
function Write-Err($m){ Write-Host "[ERR ] $m" -ForegroundColor Red }

Write-Info "Ruta objetivo del SDK: $SdkPath"
if(!(Test-Path $SdkPath)){
  Write-Warn "No existe la ruta. Instala Android Studio o el Commandline Tools primero."
  Write-Warn "Descarga: https://developer.android.com/studio"
  Write-Warn "Si acabas de instalar, abre Android Studio una vez para que cree el SDK."
  return
}

$platformTools = Join-Path $SdkPath 'platform-tools'
$emulatorTools  = Join-Path $SdkPath 'emulator'

$env:ANDROID_HOME = $SdkPath
$env:ANDROID_SDK_ROOT = $SdkPath
# Actualiza PATH en la sesión
$addPaths = @($platformTools,$emulatorTools) | Where-Object { Test-Path $_ }
foreach($p in $addPaths){
  if(-not ($env:PATH -split ';' | Where-Object { $_ -ieq $p })){ $env:PATH = "$env:PATH;$p" }
}

Write-Ok "Variables de entorno de la sesión configuradas."
Write-Info "ANDROID_HOME=$env:ANDROID_HOME"
Write-Info "ANDROID_SDK_ROOT=$env:ANDROID_SDK_ROOT"

if($Persist){
  Write-Info "Persistiendo variables a nivel de Usuario..."
  [Environment]::SetEnvironmentVariable('ANDROID_HOME',$SdkPath,'User')
  [Environment]::SetEnvironmentVariable('ANDROID_SDK_ROOT',$SdkPath,'User')
  # PATH persistente
  $userPath = [Environment]::GetEnvironmentVariable('Path','User')
  foreach($p in $addPaths){
    if(-not ($userPath -split ';' | Where-Object { $_ -ieq $p })){
      $userPath = "$userPath;$p"
    }
  }
  [Environment]::SetEnvironmentVariable('Path',$userPath,'User')
  Write-Ok "Persistencia completada (abre nueva terminal)."
}

# Comprobar adb
if(Test-Path (Join-Path $platformTools 'adb.exe')){
  Write-Info "Versión de adb:" ; & (Join-Path $platformTools 'adb.exe') --version
}else{
  Write-Warn "platform-tools no encontrado. Abre Android Studio > SDK Manager y marca 'Android SDK Platform-Tools'."
}

# Aceptar licencias opcional
if($AcceptLicenses){
  $cliTools = Join-Path $SdkPath 'cmdline-tools'
  $latest = Get-ChildItem $cliTools -Directory | Sort-Object Name -Descending | Select-Object -First 1
  if($latest){
    $sdkMgr = Join-Path $latest.FullName 'bin\sdkmanager.bat'
    if(Test-Path $sdkMgr){
      Write-Info "Ejecutando aceptación de licencias..."
      & $sdkMgr --licenses
    } else { Write-Warn "sdkmanager.bat no encontrado en $($latest.FullName)" }
  } else {
    Write-Warn "cmdline-tools no encontrados; instala desde Android Studio (SDK Manager > SDK Tools)."
  }
}

Write-Ok "Script finalizado. Si quieres generar APK: 'npx expo run:android' (primera vez compila nativo)."
