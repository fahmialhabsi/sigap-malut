# Integration Generator (dry-run)

Instruksi singkat untuk menjalankan skrip dry-run yang memindai `backend/` mencari pola CommonJS dan menghasilkan laporan serta patch preview.

Cara menjalankan (PowerShell dari root repo):

```powershell
cd e:/sigap-malut
npm run integration:dry-run
```

Apa yang dibuat (dry-run):

- `.dse/backups/integration-dry-run/integration-dry-run-report.json` — ringkasan hasil scan
- `.dse/backups/integration-dry-run/patches/*.patch.txt` — patch preview per-file
- `.dse/backups/integration-dry-run/docker-compose.postgres.dry-run.yml` — draft docker-compose untuk Postgres

Catatan:

- Skrip ini hanya dry-run dan tidak mengubah file sumber.
- Setelah review, saya dapat buat mode `--apply` yang otomatis mengubah file dan membuat commit (perlu persetujuan).
