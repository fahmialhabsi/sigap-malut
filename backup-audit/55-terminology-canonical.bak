# Istilah kanonik — role, dashboard, dokumen

Tujuan: **satu sumber kebenaran** untuk label UI, `role.code`, dan dokumen.

## Role code (`roles.code`) ↔ label tampilan (`roles.name`)

| `role.code` | Label resmi (disarankan) |
|-------------|---------------------------|
| `bendahara_pengeluaran` | Bendahara Pengeluaran |
| `bendahara_gaji` | Bendahara Gaji |
| `bendahara_barang` | Bendahara Barang |
| `pelaksana_sekretariat` | Pelaksana Sekretariat |
| `kasubag_tu_uptd` | Kasubbag Tata Usaha UPTD |
| `kasi_mutu` | Kasi Mutu (UPTD) |
| `kasi_teknis` | Kasi Teknis (UPTD) |
| `fungsional_ketersediaan` | Fungsional Ketersediaan |

**Aturan:** `code` = snake_case Inggris/Indonesia campur (seperti di DB); `name` = judul manusia untuk UI.

## Dashboard path (`getDashboardPath.js`)

| Pola role | Path |
|-----------|------|
| `sekretaris` | `/dashboard/sekretaris` |
| `bendahara_*` / `bendahara` | `/dashboard/bendahara` |
| `kepala_bidang_ketersediaan` | `/dashboard/ketersediaan` |
| `pelaksana_sekretariat` | `/dashboard/kasubag` |

## Mode data (frontend)

| Variabel | Produksi | Dev/demo |
|----------|----------|----------|
| `VITE_DEMO_DATA` | `0` atau tidak di-set (tanpa demo eksplisit) | `1` untuk contoh berlabel |

Lihat `frontend/src/config/appMode.js`.

## Thread & enforcement

| Istilah | Arti |
|---------|------|
| `execution_thread_id` | UUID satu benang eksekusi |
| `THREAD_ENFORCEMENT_MODE` | `off` (default) — hanya laporan audit; `warn`/`strict` dapat diperluas bertahap |
| `npm run thread:audit` | Laporan orphan `NULL` thread |

## Dokumen terkait

- `40-govtech-hardening-matrix.md` — hardening & RBAC  
- `41-matriks-uat-jalur-kerja.md` — UAT  
- `database-migration-deployment.md` — migrasi CLI  
