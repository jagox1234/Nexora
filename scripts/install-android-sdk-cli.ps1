<#
  install-android-sdk-cli.ps1
  Descarga e instala (modo CLI) el Android SDK (commandline-tools) + platform-tools + una plataforma + imagen del emulador.
  Requisitos: PowerShell 5+, curl disponible (Invoke-WebRequest) y 7zip o expand-archive.

  Uso (por defecto instala en %LOCALAPPDATA%\Android\Sdk):
    powershell -ExecutionPolicy Bypass -File .\scripts\install-android-sdk-cli.ps1

  Parámetros:
    -SdkRoot   Ruta destino SDK
    -ApiLevel  Nivel API (default 34)
    -CreateAVD Crea un AVD Pixel_6_API{ApiLevel}

  Tras ejecutar: abre nueva terminal y prueba adb --version
#>
param(
  [string]$SdkRoot = "$env:LOCALAPPDATA\Android\Sdk",
  [int]$ApiLevel = 34,
  [switch]$CreateAVD
)

function Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Ok($m){ Write-Host "[ OK ] $m" -ForegroundColor Green }
function Warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Err($m){ Write-Host "[ERR ] $m" -ForegroundColor Red }

$ErrorActionPreference = 'Stop'

# 1. Descarga commandline-tools si no existe
$clToolsDir = Join-Path $SdkRoot 'cmdline-tools'
$latestDir = Join-Path $clToolsDir 'latest'
if(!(Test-Path $latestDir)){
  Info "Descargando commandline-tools..."
  $zipUrl = 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip'
  $tmpZip = Join-Path $env:TEMP 'cmdline-tools.zip'
  Invoke-WebRequest -Uri $zipUrl -OutFile $tmpZip
  New-Item -ItemType Directory -Force -Path $clToolsDir | Out-Null
  Expand-Archive -Path $tmpZip -DestinationPath $clToolsDir -Force
  if(Test-Path (Join-Path $clToolsDir 'cmdline-tools')){
    Move-Item (Join-Path $clToolsDir 'cmdline-tools') $latestDir
  }
  Remove-Item $tmpZip -Force
  Ok "Commandline tools instalados."
}else{
  Info "commandline-tools ya presente."
}

# 2. Variables de entorno (sesión)
$env:ANDROID_HOME = $SdkRoot
$env:ANDROID_SDK_ROOT = $SdkRoot
$platformTools = Join-Path $SdkRoot 'platform-tools'
$emulatorDir = Join-Path $SdkRoot 'emulator'
$env:PATH = "$platformTools;$emulatorDir;$env:PATH"
Ok "Variables configuradas para esta sesión."

# 3. sdkmanager
$sdkManager = Join-Path $latestDir 'bin/sdkmanager.bat'
if(!(Test-Path $sdkManager)){ Err "sdkmanager no encontrado"; exit 1 }

# 4. Instalar paquetes básicos
$packages = @(
  'platform-tools',
  'emulator',
  "platforms;android-$ApiLevel",
  "system-images;android-$ApiLevel;google_apis;x86_64"
)

Info "Instalando paquetes: $($packages -join ', ')"
& $sdkManager $packages | Out-Null

Info "Aceptando licencias..."
& $sdkManager --licenses | Out-Null
Ok "Paquetes instalados."

# 5. Crear AVD opcional
if($CreateAVD){
  $avdName = "Pixel_6_API$ApiLevel"
  $avdManager = Join-Path $latestDir 'bin/avdmanager.bat'
  if(Test-Path $avdManager){
    if(-not (Test-Path (Join-Path $env:USERPROFILE ".android\avd\$avdName.avd"))){
      Info "Creando AVD $avdName"
  Write-Output no | & $avdManager create avd -n $avdName -k "system-images;android-$ApiLevel;google_apis;x86_64" -d pixel_6
      Ok "AVD creado. Ejecuta: emulator -avd $avdName"
    } else { Warn "AVD ya existe: $avdName" }
  } else { Warn "avdmanager no encontrado" }
}

Ok "Instalación CLI finalizada. Abre nueva terminal o ejecuta: adb --version"
