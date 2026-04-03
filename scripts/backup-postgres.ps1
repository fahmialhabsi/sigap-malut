# Dump PostgreSQL menggunakan variabel DB_* yang sama dengan backend (lihat backend/config/database.js).
# Jalankan dari root repo setelah memuat .env, contoh:
#   Get-Content .env | ForEach-Object { if ($_ -match '^\s*([^#=]+)=(.*)$') { Set-Item -Path "env:$($matches[1].Trim())" -Value $matches[2].Trim() } }
#   .\scripts\backup-postgres.ps1
#
# Atau set manual: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, opsional PGPASSWORD.

$ErrorActionPreference = "Stop"

if (-not $env:DB_NAME -or -not $env:DB_USER) {
  Write-Error "DB_NAME dan DB_USER harus diset (sama seperti konfigurasi aplikasi)."
}

if ($env:DB_PASSWORD -and -not $env:PGPASSWORD) {
  $env:PGPASSWORD = $env:DB_PASSWORD
}

$port = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$dbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }

$root = Split-Path -Parent $PSScriptRoot
$outDir = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { Join-Path $root "backups" }
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$safeName = ($env:DB_NAME -replace '[^\w\-]', '_')
$outFile = Join-Path $outDir "pg_${safeName}_${ts}.sql"

$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDump) {
  Write-Error "pg_dump tidak ditemukan di PATH. Instal PostgreSQL client tools."
}

& pg_dump -h $dbHost -p $port -U $env:DB_USER -d $env:DB_NAME --no-owner -f $outFile
Write-Host "Backup disimpan: $outFile"
