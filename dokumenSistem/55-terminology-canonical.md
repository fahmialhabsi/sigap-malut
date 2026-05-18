# Istilah kanonik — role, dashboard, dokumen

Tujuan: **satu sumber kebenaran** untuk label UI, `role.code`, dan dokumen.

## Role code (`roles.code`) ↔ label tampilan (`roles.name`)

| `role.code` | Key DB (canonical) | Label resmi (disarankan) |
|-------------|-------------------|---------------------------|
| `super_admin` | `SUPER_ADMIN` | Super Admin |
| `gubernur` | `GUBERNUR` | Gubernur |
| `kepala_dinas` | `KEPALA_DINAS` | Kepala Dinas |
| `sekretaris` | `SEKRETARIS` | Sekretaris |
| `kasubag_umum_kepegawaian` | `KASUBAG_UMUM_KEPEGAWAIAN` | Kasubag Umum & Kepegawaian |
| `pejabat_fungsional` | `PEJABAT_FUNGSIONAL` | Pejabat Fungsional |
| `kepala_bidang_ketersediaan` | `KEPALA_BIDANG_KETERSEDIAAN` | Kepala Bidang Ketersediaan |
| `kepala_bidang_distribusi` | `KEPALA_BIDANG_DISTRIBUSI` | Kepala Bidang Distribusi |
| `kepala_bidang_konsumsi` | `KEPALA_BIDANG_KONSUMSI` | Kepala Bidang Konsumsi |
| `kepala_uptd` | `KEPALA_UPTD` | Kepala UPTD |
| `kasubag_uptd` | `KASUBAG_UPTD` | Kasubbag Tata Usaha UPTD |
| `kasubag_tu_uptd` | `KASUBAG_UPTD` | Kasubbag Tata Usaha UPTD (alias) |
| `kepala_seksi_uptd` | `KEPALA_SEKSI_UPTD` | Kepala Seksi UPTD |
| `kasi_mutu` | `KEPALA_SEKSI_UPTD` | Kasi Mutu (UPTD) |
| `kasi_teknis` | `KEPALA_SEKSI_UPTD` | Kasi Teknis (UPTD) |
| `bendahara` | `BENDAHARA` | Bendahara |
| `bendahara_pengeluaran` | `BENDAHARA` | Bendahara Pengeluaran |
| `bendahara_gaji` | `BENDAHARA` | Bendahara Gaji |
| `bendahara_barang` | `BENDAHARA` | Bendahara Barang |
| `pelaksana` | `PELAKSANA` | Pelaksana |
| `pelaksana_sekretariat` | `PELAKSANA` | Pelaksana Sekretariat |
| `fungsional_ketersediaan` | `PEJABAT_FUNGSIONAL` | Fungsional Ketersediaan |
| `viewer` | `VIEWER` | Viewer / Publik |

> **Aturan:** `code` = snake_case; `name` = judul manusia untuk UI.  
> **Catatan:** `PELAKSANA` adaptif berdasarkan `unit_kerja`; `PEJABAT_FUNGSIONAL` adaptif berdasarkan keberadaan bawahan di `user_hierarchy`.  
> Sumber lengkap: `09-matriks-role-akses-modul.md` dan `33-keputusan-arsitektur-final-dashboard-dan-desain-sistem.md`.

## Dashboard path (`getDashboardPath.js`)

| Pola role | Path | Catatan |
|-----------|------|---------|
| `sekretaris` | `/dashboard/sekretaris` | |
| `bendahara_*` / `bendahara` | `/dashboard/bendahara` | |
| `kepala_bidang_ketersediaan` | `/dashboard/ketersediaan` | |
| `pelaksana_sekretariat` | `/dashboard/kasubag` | `/dashboard/kasubag` adalah alias; jika ada dashboard kasubag terpisah gunakan path berbeda |
| `kasubag_umum_kepegawaian` | `/dashboard/kasubag` | Kasubag login ke path yang sama dengan pelaksana sekretariat — perlu dibedakan jika ada kebutuhan UI khusus |
| `gubernur` | `/dashboard/gubernur` | |
| `kepala_dinas` | `/dashboard/kepala-dinas` | |

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

- `58-govtech-hardening-matrix.md` — hardening & RBAC  
- `57-matriks-uat-jalur-kerja.md` — UAT  
- `60-database-migration-deployment.md` — migrasi CLI  
- `09-matriks-role-akses-modul.md` — matriks role-modul lengkap  
- `33-keputusan-arsitektur-final-dashboard-dan-desain-sistem.md` — arsitektur dashboard per role
