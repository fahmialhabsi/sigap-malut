# Duplicate Resolution Log — DOKUMENSISTEM SIGAP-MALUT

**Tanggal:** 5–6 April 2026  
**Branch:** `docs/structural-fix-dokumensistem`

---

## Metode Verifikasi

Setiap pasangan duplikat diverifikasi menggunakan:
1. **Hash MD5** via `Get-FileHash -Algorithm MD5` — untuk mendeteksi identik byte-per-byte
2. **Perbandingan ukuran file** — indikator awal sebelum hash
3. **Pembacaan isi** — untuk file dengan ukuran mirip tetapi hash berbeda

---

## Pasangan yang Diproses

### Grup 1: IDENTICAL (MD5 Match) → DELETE DUPLICATE

| No | File Dihapus | File Dipertahankan | Alasan |
|----|-------------|-------------------|--------|
| 1 | `04-Dokumen Integrasi Sistem & Mapping Modul SIGAP-MALUT.md` (12.382 B) | `04-integrasi-sistem-dan-mapping-modul.md` (12.382 B) | Hash MD5 identik. File kebab-case Indonesia dipertahankan sebagai kanonik. |
| 2 | `07-Data-Dictionary.md` (2.002 B) | `07-kamus-data-field.md` (2.002 B) | Hash MD5 identik. File Indonesia dipertahankan. |
| 3 | `08-Workflow-Specification.md` (1.123 B) | `08-spesifikasi-workflow-bisnis.md` (1.123 B) | Hash MD5 identik. File Indonesia dipertahankan. |
| 4 | `11-KPI-Definition-Sheet.md` (699 B) | `11-definisi-kpi-indikator.md` (699 B) | Hash MD5 identik. File Indonesia dipertahankan. |
| 5 | `13-System-Architecture-Document.md` (919 B) | `13-arsitektur-sistem.md` (919 B) | Hash MD5 identik. File Indonesia dipertahankan. |
| 6 | `64-laporan-modul.md` (7.254 B) | `24-laporan-status-94-modul.md` (7.254 B) | Hash MD5 identik. 64 adalah duplikat renumber yang tidak perlu; 24 adalah posisi logis dalam rantai. |

---

### Grup 2: NEAR-IDENTICAL (Beda Heading Awal) → DELETE LAMA

| No | File Dihapus | File Dipertahankan | Alasan |
|----|-------------|-------------------|--------|
| 7 | `03-dashboard-uiux.md` (33.630 B) | `03-spesifikasi-uiux-dashboard.md` (33.666 B) | Hampir identik (selisih 36 byte). File dipertahankan memiliki heading kanonik `# 03 - Dashboard UI/UX SIGAP-MALUT`. File dihapus tidak punya heading dokumen yang benar. |
| 8 | `05-Dashboard-Template-Standar.md` (2.131 B) | `05-template-standar-dashboard.md` (2.178 B) | Hampir identik (selisih 47 byte = penambahan heading `# 05 - Dashboard Template Standar SIGAP-MALUT`). File dipertahankan memiliki heading kanonik. |

---

### Grup 3: OUTDATED STUB → DELETE

| No | File Dihapus | File Dipertahankan | Alasan |
|----|-------------|-------------------|--------|
| 9 | `09-Role-Module-Matrix.md` (697 B) | `09-matriks-role-akses-modul.md` (4.867 B) | File lama hanya memuat 5 role dalam tabel sederhana tanpa heading kanonik (`# 07-Role-Module-Matrix`). File baru memuat 16 role lengkap sesuai Dokumen 33. File lama adalah stub yang tertinggal sebelum revisi. |
| 10 | `10-ERD-Logical-Model.md` (384 B) | `10-erd-model-database.md` (7.857 B) | File lama adalah stub 384 byte. File baru adalah ERD lengkap 7.857 byte. Stub tidak memberi nilai tambah; dihapus sebagai versi lama yang tersupersede. |
| 11 | `12-IT-Governance-SPBE-SPIP-Alignment.md` (2.391 B) | `12-tata-kelola-it-spbe-spip.md` (16.142 B) | File lama memuat pemetaan SPBE/SPIP terbatas dengan referensi ke nama file lama (`11-System-Architecture-Document`, `05-Master-Data-Layanan`). File baru 6× lebih besar dan lebih lengkap. File lama adalah versi sebelum refactor. |

---

### Grup 4: RENAME (Konten Berbeda, Nomor Ganda) → KEEP BOTH

| No | File Lama | File Baru | Alasan |
|----|-----------|-----------|--------|
| 12 | `14-matriks-kebutuhan-layanan-per-role.md` (73.344 B) | `14b-matriks-kebutuhan-layanan-per-role.md` | Konten BERBEDA dari `14-alur-kerja-sekretariat-bidang-uptd.md`. File ini adalah matriks persyaratan layanan per role (companion), sedangkan `14` adalah panduan alur kerja. Keduanya penting dan saling melengkapi. Diberi suffix `b` untuk menunjukkan posisi companion tanpa mengganggu urutan 01–68. |

---

## Ringkasan Keputusan

| Status | Jumlah | Keterangan |
|--------|--------|------------|
| DELETE DUPLICATE (identik) | 6 | Hash MD5 sama |
| DELETE NEAR-IDENTICAL | 2 | Selisih hanya heading; versi dengan heading benar dipertahankan |
| DELETE OUTDATED STUB | 3 | File lama/stub yang tersupersede oleh versi lebih lengkap |
| RENAME | 1 | Nomor ganda dengan konten berbeda; suffix `b` ditambahkan |
| **Total diproses** | **12** | |

---

## Dampak Referensi

Semua referensi ke file yang dihapus telah diperbarui di:
- `16-audit-gap-resmi-prioritas-revisi.md` (10 referensi)
- `55-terminology-canonical.md` (3 referensi)
- `39-status-koordinasi-horizontal.md` (1 referensi)
- `14b-matriks-kebutuhan-layanan-per-role.md` (heading + companion note)
