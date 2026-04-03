# 19 - Operations Runbook SIGAP-MALUT

Versi: 2026-03-20
Status: SOP operasional harian dan insiden

## 1. Tujuan

Memberikan prosedur operasional standar agar layanan SIGAP-MALUT stabil, terpantau, dan dapat dipulihkan saat gangguan.

## 2. Peran Operasional

- On-call engineer
- Backend lead
- Frontend lead
- DBA
- QA
- Incident commander

## 3. Monitoring Harian

Periksa minimal:

1. Kesehatan service backend/frontend.
2. Koneksi database.
3. Error rate endpoint prioritas.
4. Latensi endpoint penting.
5. Queue/job backlog.
6. Kapasitas CPU/memory/disk.

## 4. Alert dan Eskalasi

Severity:

- Sev-1: layanan inti down.
- Sev-2: fungsi utama degradasi.
- Sev-3: gangguan terbatas.

SLA respons:

- Sev-1: <= 15 menit
- Sev-2: <= 30 menit
- Sev-3: <= 4 jam

## 5. Backup dan Recovery

Kebijakan minimum:

- Backup harian database.
- Backup mingguan full snapshot.
- Uji restore berkala.

Target:

- RTO: <= 4 jam
- RPO: <= 24 jam

## 6. SOP Gangguan Umum

### API timeout

1. Cek health service.
2. Cek koneksi DB dan load.
3. Cek dependency eksternal.
4. Aktifkan fallback jika tersedia.

### Data mismatch lintas modul

1. Hentikan job sinkronisasi bermasalah.
2. Jalankan validasi integritas.
3. Koreksi data dengan prosedur terkontrol.
4. Catat incident report.

### Integrasi e-Pelara gagal

1. Cek konektivitas endpoint integrasi.
2. Cek auth token dan secret.
3. Cek contract mismatch payload.
4. Aktifkan mode degradable read jika tersedia.

## 7. Operasional Mingguan

- Review error trend.
- Review kapasitas.
- Review temuan audit log.
- Review backlog bug prioritas.
- Review SLA compliance.

## 8. Operasional Bulanan

- Drill disaster recovery.
- Uji restore backup penuh.
- Patch dependency kritis.
- Review hak akses admin.

## 9. Artifact Wajib Operasional

- Incident log
- Postmortem/RCA
- Backup report
- Availability report
- SLA report
- Security event report

## 10. Checklist Runbook

- [ ] On-call roster aktif.
- [ ] Dashboard monitoring aktif.
- [ ] Alert route tervalidasi.
- [ ] Backup tervalidasi.
- [ ] DR drill dijadwalkan.

## 11. Referensi teknis (Tahap 2 — health, log, backup)

### 11.1 Health API

- `GET /health` — ringan untuk load balancer; isi singkat + statistik cache in-memory/Redis (tanpa ping DB).
- `GET /health?deep=1` — uji koneksi database (Postgres/SQLite) + kesehatan Redis jika dikonfigurasi. Respons **503** jika deep check gagal (DB down).
- `GET /metrics` — metrik Prometheus (request counter, dll.).
- `GET /api/test-db` — diagnostik koneksi DB + perkiraan jumlah tabel.

### 11.2 Logging terstruktur

- Winston menulis JSON ke `backend/logs/combined.log` dan error ke `backend/logs/error.log`.
- Setiap respons HTTP (kecuali `/health` dan `/metrics`) mencatat event `http_request` dengan `requestId`, `method`, `path`, `status`, `durationMs`, serta `userId`/`role` jika user terautentikasi.
- Header `X-Request-Id` disetel pada respons (atau gunakan header masukan klien jika ada).
- **Env:** `LOG_LEVEL` (default `info`) — mis. `debug`, `warn`, `error`.

### 11.3 Cache / Redis (deep health)

- **Env:** `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB` — selaras dengan `backend/services/cacheService.js`.
- Jika Redis tidak dipakai, aplikasi fallback ke cache in-memory; deep health tetap mencerminkan status tersebut.

### 11.4 Backup Postgres

Skrip di root repo (variabel `DB_*` sama dengan `backend/config/database.js`):

- **Linux/macOS:** `scripts/backup-postgres.sh` — output gzip ke folder `backups/` di root (`BACKUP_DIR` opsional). Muat `.env` sebelum menjalankan, contoh: `set -a && source .env && set +a && ./scripts/backup-postgres.sh`
- **Windows (PowerShell):** `scripts/backup-postgres.ps1` — output SQL tidak dikompresi; pastikan `pg_dump` ada di PATH. Set env `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (atau `PGPASSWORD`).

Folder `backups/` di-ignore Git agar dump tidak ter-commit.

### 11.5 Uji restore (drill singkat)

1. Siapkan instance Postgres kosong atau database uji.
2. Untuk file `.sql.gz` (skrip shell): `gunzip -c backups/pg_<nama>_<timestamp>.sql.gz | psql -h <host> -U <user> -d <db_target>`
3. Untuk file `.sql` (PowerShell): `psql -h <host> -U <user> -d <db_target> -f <path>`
4. Verifikasi: jalankan migrasi jika perlu, lalu `GET /health?deep=1` dan smoke test login.

**Catatan:** restore ke DB produksi hanya dengan prosedur change control dan snapshot pra-restore.
