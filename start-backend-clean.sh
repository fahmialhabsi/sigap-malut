#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BAT_PATH="$SCRIPT_DIR/start-backend-clean.bat"

if [[ ! -f "$BAT_PATH" ]]; then
  echo "[ERROR] File tidak ditemukan: $BAT_PATH" >&2
  exit 1
fi

cd "$SCRIPT_DIR"

# Jalankan wrapper batch lewat cmd.exe agar perilaku konsisten di Git Bash.
cmd.exe //c start-backend-clean.bat
