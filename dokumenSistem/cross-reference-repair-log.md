# Cross-Reference Repair Log — DOKUMENSISTEM SIGAP-MALUT

**Tanggal:** 5–6 April 2026  
**Branch:** `docs/structural-fix-dokumensistem`

---

## Ringkasan

Total **17 referensi rusak** diperbaiki di 4 file berbeda. Semua referensi diverifikasi terlebih dahulu keberadaannya di file sumber sebelum diperbaiki.

---

## File: `16-audit-gap-resmi-prioritas-revisi.md`

**Jumlah referensi diperbaiki: 11**

| Referensi Lama | Referensi Baru | Lokasi di File | Alasan |
|---------------|---------------|----------------|--------|
| `01-kondisi-dinas-pangan.md` | `01-profil-dan-kondisi-dinas-pangan.md` | Seksi 2 "Dasar Temuan" | File diubah nama ke `profil-dan-kondisi-dinas-pangan` saat pembuatan `feat/next-change` |
| `12-IT-Governance-SPBE-SPIP-Alignment.md` | `12-tata-kelola-it-spbe-spip.md` | Seksi 2 "Dasar Temuan" | File diganti dengan versi lebih lengkap berbahasa Indonesia |
| `13-System-Architecture-Document.md` | `13-arsitektur-sistem.md` | Seksi 2 "Dasar Temuan" | File diganti dengan versi kanonik berbahasa Indonesia |
| `14-Role-Service-Requirements-Matrix.md` | `14b-matriks-kebutuhan-layanan-per-role.md` | Seksi 2 "Dasar Temuan" | File diubah nama ke versi Indonesia dan dinomori ulang ke `14b` |
| `15-e-pelara-integration-guide-for-sigap-malut.md` | `15-panduan-integrasi-e-pelara-ke-sigap.md` | Seksi 2 "Dasar Temuan" | Nama file diubah ke format kebab-case Indonesia |
| `17-Keamanan-Informasi-Lengkap.md` | `17-keamanan-informasi-operasional.md` | Seksi 6 "Rencana Revisi" | Nama file diubah saat reorganisasi; sufiks `Lengkap` → `operasional` |
| `18-Deployment-Production-Guide.md` | `18-panduan-deployment-production.md` | Seksi 6 "Rencana Revisi" | Format nama diubah ke kebab-case Indonesia |
| `19-Operations-Runbook.md` | `19-runbook-operasional-dan-sop.md` | Seksi 6 "Rencana Revisi" | Format nama diubah ke kebab-case Indonesia |
| `20-Testing-Strategy.md` | `20-strategi-testing-dan-quality-gate.md` | Seksi 6 "Rencana Revisi" | Format nama diubah ke kebab-case Indonesia |
| `21-Compliance-Matrix-SPBE-SPIP.md` | `21-matriks-kepatuhan-spbe-spip.md` | Seksi 6 "Rencana Revisi" | Format nama diubah ke kebab-case Indonesia |
| `01-kondisi-dinas-pangan.md` (inline) | `` `01-profil-dan-kondisi-dinas-pangan.md` `` | Seksi 4 inline | Sama seperti pertama — referensi inline yang terlewat |

---

## File: `55-terminology-canonical.md`

**Jumlah referensi diperbaiki: 3**

| Referensi Lama | Referensi Baru | Konteks | Alasan |
|---------------|---------------|---------|--------|
| `40-govtech-hardening-matrix.md` | `58-govtech-hardening-matrix.md` | Seksi "Dokumen terkait" | File ini direnumber dari 40 → 58 saat reorganisasi dokumen (konfirmasi: file 58 ada, 40 sudah diisi oleh alur-koordinasi-horizontal) |
| `41-matriks-uat-jalur-kerja.md` | `57-matriks-uat-jalur-kerja.md` | Seksi "Dokumen terkait" | File ini direnumber dari 41 → 57 saat reorganisasi dokumen (konfirmasi: file 57 ada, 41 sudah diisi oleh pedoman-mekanisme-spj) |
| `database-migration-deployment.md` | `60-database-migration-deployment.md` | Seksi "Dokumen terkait" | Versi lama tidak bernomor; versi kanonik bernomor 60 sudah ada |

**Tambahan konten (bukan referensi rusak):**
- Tabel role code diperluas dari 12 → 23 entries berdasarkan `09-matriks-role-akses-modul.md` dan `33-keputusan-arsitektur-final-dashboard-dan-desain-sistem.md`
- Tambah kolom "Key DB (canonical)" untuk sinkronisasi antara `role.code` frontend dan `roles.code` DB
- Tambah 2 referensi dokumen baru: `09-matriks-role-akses-modul.md` dan `33-keputusan-arsitektur-final-dashboard-dan-desain-sistem.md`

---

## File: `39-status-koordinasi-horizontal.md`

**Jumlah referensi diperbaiki: 1**

| Referensi Lama | Referensi Baru | Konteks | Alasan |
|---------------|---------------|---------|--------|
| `horizontal-coordination-qa-uat.md` | `63-horizontal-coordination-qa-uat.md` | Footer dokumen | File ini direnumber dari tanpa nomor → 63 saat reorganisasi dokumen |

---

## File: `57-matriks-uat-jalur-kerja.md`

**Jumlah referensi diperbaiki / konten diperbarui: 1**

| Baris Lama | Baris Baru | Konteks | Alasan |
|-----------|-----------|---------|--------|
| `⛔ BELUM ADA \| BL-001: endpoint dan UI belum dibuat` | `PASS (BL-001 FIXED) \| Endpoint ... diimplementasi ...` | A-08 Sekretaris setujui verified | BL-001 telah ditutup pada fase pilot-hardening (lihat `pilot-hardening-report.md`). Status UAT tidak diperbarui saat kode di-merge. |

---

## Referensi yang Belum Diperbaiki (untuk iterasi lanjutan)

File-file berikut mungkin masih mengandung referensi ke nama lama, namun di luar cakupan iterasi ini:

| File | Referensi Mencurigakan | Status |
|------|----------------------|--------|
| `36-laporan-komprehensif-arsitektur-...md` | Mungkin masih referensikan nama file lama 10–13 | Perlu audit lanjutan |
| `30-laporan-verifikasi-pipeline-development.md` | Mungkin referensikan `07-Data-Dictionary`, `08-Workflow-Specification` | Perlu audit lanjutan |
| `56-matriks-traceability-fitur-dokumen.md` | Mungkin referensikan `14-Role-Service-Requirements-Matrix` | Perlu audit lanjutan |
| Semua file seri 25–38 | Mungkin referensikan nama file awal (07–13 versi Inggris) | Perlu audit lanjutan |
