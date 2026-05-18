# Rename Reconciliation Report — SIGAP-MALUT

**Tanggal:** 2026-04-05  
**Branch:** `audit/pilot-hardening-release`  
**Commit rekonsiliasi:** `1296fbf`

Git mendeteksi sebagian besar rename secara otomatis (similarity 70–100%).

---

## Pasangan Rename (File Lama → File Baru)

### TRUE RENAME (100% identik, hanya nomor berubah)

| File Lama (Deleted) | File Baru | Similarity | Status |
|---------------------|-----------|------------|--------|
| `status-koordinasi-horizontal.md` | `39-status-koordinasi-horizontal.md` | 100% | ✅ TRUE RENAME |
| `alur-koordinasi-horizontal.md` | `40-alur-koordinasi-horizontal.md` | 100% | ✅ TRUE RENAME |
| `alur-koordinasi-bidang-distribusi.md` | `50.1-alur-koordinasi-bidang-distribusi.md` | 100% | ✅ TRUE RENAME |
| `40-govtech-hardening-matrix.md` | `58-govtech-hardening-matrix.md` | 100% | ✅ TRUE RENAME |
| `database-migration-deployment.md` | `60-database-migration-deployment.md` | 100% | ✅ TRUE RENAME |
| `dashboard-role-coordination-widgets.md` | `61-dashboard-role-coordination-widgets.md` | 100% | ✅ TRUE RENAME |
| `enum-schema-postgres-notes.md` | `62-enum-schema-postgres-notes.md` | 100% | ✅ TRUE RENAME |
| `horizontal-coordination-qa-uat.md` | `63-horizontal-coordination-qa-uat.md` | 100% | ✅ TRUE RENAME |
| `laporan-modul.md` | `64-laporan-modul.md` | 100% | ✅ TRUE RENAME |
| `NOTES_AUTH_ENDPOINT.md` | `65-NOTES_AUTH_ENDPOINT.md` | 100% | ✅ TRUE RENAME |
| `README-backend.md` | `66-README-backend.md` | 100% | ✅ TRUE RENAME |
| `README-workflows-api.md` | `67-README-workflows-api.md` | 100% | ✅ TRUE RENAME |
| `README.md` | `68-README.md` | 73% | ✅ RENAME + CONTENT UPDATE |

### LEGACY DELETE WITH REPLACEMENT (pengganti sudah committed sebelumnya)

| File Lama (Deleted) | Pengganti (Sudah Committed) | Status |
|---------------------|----------------------------|--------|
| `41-matriks-uat-jalur-kerja.md` | `57-matriks-uat-jalur-kerja.md` (ada di HEAD) | ✅ LEGACY DELETE |
| `42-terminology-canonical.md` | `55-terminology-canonical.md` (ada di HEAD) | ✅ LEGACY DELETE |

---

## File Baru Canonical (Tidak Ada Padanan Lama)

### Kelompok Organisasi/Alur Kerja (baru, tanpa pengganti file lama):

| File | Jenis | Status |
|------|-------|--------|
| `41-pedoman-mekanisme-spj-mandiri-dan-delegasi.md` | Pedoman | ✅ BRAND NEW |
| `42-alur_spj_delegasi_pembuatan_dokumen.svg` | Diagram SVG | ✅ BRAND NEW |
| `43-struktur_sekretariat_v2.svg` | Diagram SVG | ✅ BRAND NEW |
| `44-alur_kerja_sekretariat_v3.svg` | Diagram SVG | ✅ BRAND NEW |
| `45-pedoman-alur-kerja-struktur-organisasi-sekretariat.md` | Pedoman | ✅ BRAND NEW |
| `46-struktur_final_bidang_ketersediaan.svg` | Diagram SVG | ✅ BRAND NEW |
| `47-alur_kerja_bidang_ketersediaan_final.svg` | Diagram SVG | ✅ BRAND NEW |
| `48-pedoman-alur-kerja-bidang-ketersediaan-dan-kerawanan-pangan.md` | Pedoman | ✅ BRAND NEW |
| `49-struktur_bidang_distribusi_cadangan.svg` | Diagram SVG | ✅ BRAND NEW |
| `50-pedoman-alur-kerja-bidang-distribusi-dan-cadangan-pangan.md` | Pedoman | ✅ BRAND NEW |
| `51-struktur_bidang_konsumsi_keamanan.svg` | Diagram SVG | ✅ BRAND NEW |
| `52-pedoman-alur-kerja-bidang-konsumsi-dan-keamanan-pangan.md` | Pedoman | ✅ BRAND NEW |
| `53-struktur_final_uptd_balai_pmkp.svg` | Diagram SVG | ✅ BRAND NEW |
| `54-pedoman-alur-kerja-uptd-balai-pmkp_1.md` | Pedoman | ✅ BRAND NEW |
| `59-CATATAN-SIMULASI-API.md` | Catatan | ✅ BRAND NEW |

---

## Warning

**Tidak ada DELETE WITHOUT SAFE REPLACEMENT** yang ditemukan. Semua deletion valid:
- 13 file memiliki pasangan rename
- 2 file memiliki pengganti yang sudah committed sebelumnya di HEAD

---

## Implikasi ke Merge

- Git mendeteksi rename otomatis → diff PR akan tampil bersih sebagai rename, bukan delete+add
- Reviewer dapat lihat bahwa konten dipreservasi (similarity 73–100%)
- Tidak ada kehilangan data dokumen
- Urutan penomoran dokumen kini konsisten (39 → 68)
