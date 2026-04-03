#!/usr/bin/env bash
# Dump PostgreSQL (variabel DB_* sama dengan backend/config/database.js).
# Contoh dari root repo:
#   set -a && source .env && set +a && ./scripts/backup-postgres.sh
#
# Opsional: BACKUP_DIR (default: ./backups di root repo)

set -euo pipefail

if [[ -z "${DB_NAME:-}" || -z "${DB_USER:-}" ]]; then
  echo "DB_NAME dan DB_USER harus diset." >&2
  exit 1
fi

export PGPASSWORD="${PGPASSWORD:-${DB_PASSWORD:-}}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="${BACKUP_DIR:-$ROOT/backups}"
mkdir -p "$OUT_DIR"

TS="$(date +%Y%m%d_%H%M%S)"
SAFE_NAME="$(echo "$DB_NAME" | tr -c 'A-Za-z0-9_-' '_')"
HOST="${DB_HOST:-localhost}"
PORT="${DB_PORT:-5432}"
OUT_FILE="$OUT_DIR/pg_${SAFE_NAME}_${TS}.sql.gz"

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump tidak ditemukan. Instal postgresql-client." >&2
  exit 1
fi

pg_dump -h "$HOST" -p "$PORT" -U "$DB_USER" -d "$DB_NAME" --no-owner --format=p | gzip -c > "$OUT_FILE"
echo "Backup disimpan: $OUT_FILE"
