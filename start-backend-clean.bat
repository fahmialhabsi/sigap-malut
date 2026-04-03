@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FOUND_ANY=0"
set "PORT_STILL_USED="

echo ============================================================
echo SIGAP Malut Backend Clean Start
echo ============================================================
echo.

if not exist "%BACKEND_DIR%\package.json" (
  echo [ERROR] Folder backend tidak ditemukan di:
  echo         %BACKEND_DIR%
  echo.
  pause
  exit /b 1
)

echo [1/3] Mengecek port 5000...
for /f %%P in ('powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique"') do (
  if not defined SEEN_%%P (
    set "SEEN_%%P=1"
    if "!FOUND_ANY!"=="0" (
      echo Port 5000 sedang dipakai. Menutup proses lama...
    )
    set "FOUND_ANY=1"
    set "TASK_NAME="
    for /f "tokens=1 delims=," %%A in ('tasklist /FI "PID eq %%P" /FO CSV /NH') do (
      set "TASK_NAME=%%~A"
    )
    if defined TASK_NAME (
      echo   - PID %%P ^(!TASK_NAME!^)
    ) else (
      echo   - PID %%P
    )
    taskkill /PID %%P /F >nul 2>&1
    if errorlevel 1 (
      echo     Gagal menghentikan PID %%P.
    ) else (
      echo     PID %%P berhasil dihentikan.
    )
  )
)

if "%FOUND_ANY%"=="0" (
  echo Port 5000 sedang kosong.
) else (
  echo Menunggu port 5000 benar-benar lepas...
  powershell -NoProfile -Command "Start-Sleep -Seconds 2" >nul
)

for /f %%P in ('powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess"') do (
  set "PORT_STILL_USED=%%P"
)

if defined PORT_STILL_USED (
  echo.
  echo [ERROR] Port 5000 masih dipakai oleh PID !PORT_STILL_USED!.
  echo Tutup proses tersebut secara manual, lalu jalankan lagi skrip ini.
  echo.
  pause
  exit /b 1
)

echo.
echo [2/3] Masuk ke folder backend...
pushd "%BACKEND_DIR%" >nul
if errorlevel 1 (
  echo [ERROR] Gagal masuk ke folder backend:
  echo         %BACKEND_DIR%
  echo.
  pause
  exit /b 1
)

echo [3/3] Menjalankan npm run dev...
echo.
if not defined SEQUELIZE_LOGGING (
  set "SEQUELIZE_LOGGING=false"
)
echo SQL startup log: ringkas ^(set SEQUELIZE_LOGGING=true untuk verbose^)
echo.
call npm run dev
set "EXIT_CODE=%ERRORLEVEL%"

echo.
echo Backend berhenti dengan kode exit %EXIT_CODE%.
echo.
pause
popd >nul
exit /b %EXIT_CODE%
