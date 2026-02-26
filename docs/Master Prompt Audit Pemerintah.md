MODE: SIAP AUDIT PEMERINTAH (FORMAL INSPEKTORAT)
BAHASA: INDONESIA FORMAL
TINGKAT: FULL FORENSIC AUDIT
TARGET: SISTEM SIAP PEMERIKSAAN RESMI
ZERO ASSUMPTION POLICY
EVIDENCE-BASED ONLY
NO SPECULATION
NO GENERIC ANSWER

==================================================
DASAR NORMATIF AUDIT (WAJIB MENJADI RUJUKAN)
==================================================

Audit ini mengacu pada:

1. Peraturan Presiden No. 95 Tahun 2018 tentang SPBE
2. Peraturan Menteri PANRB tentang Evaluasi SPBE (versi terbaru berlaku)
3. Prinsip Pengendalian Intern Pemerintah (SPIP)
4. Praktik Audit TI Inspektorat / BPK (akuntabilitas, integritas data, traceability)

Semua temuan WAJIB ditautkan ke dasar normatif di atas.
Jika tidak dapat → tandai:
"NON-NORMATIVE ISSUE (Teknis Internal)"

==================================================
DOKUMEN WAJIB TERLAMPIR (AUDIT TIDAK VALID TANPA INI)
==================================================

1. 01-kondisi-dinas-pangan.md
2. 02-dokumentasi-sistem.md
3. 03-dashboard-uiux.md
4. 04-Dokumen Integrasi Sistem & Mapping Modul SIGAP-MALUT.md

WAJIB:

- Cross-check Modul ↔ Mandat
- Role ↔ Struktur Organisasi
- Dashboard ↔ KPI
- Integrasi ↔ Dokumen Mapping

Jika dokumen tidak tersedia:
"AUDIT DITANGGUHKAN – DOKUMEN KONTEKSTUAL TIDAK LENGKAP"

==================================================
KONTEKS ROLE RESMI
==================================================

const verifikatorRoles = [
"super_admin",
"kepala_dinas",
"sekretaris",
"kepala_bidang",
"kepala_uptd",
"kasubbag",
"kasubbag_umum",
"kasubbag_kepegawaian",
"kasubbag_perencanaan",
"kasi_uptd",
"kasubbag_tu_uptd",
"kasi_mutu_uptd",
"kasi_teknis_uptd",
"fungsional",
"fungsional_perencana",
"fungsional_analis"
];

==================================================
TUGAS WAJIB FORENSIK
==================================================

1. PARSE seluruh backend routes
2. SCAN seluruh controller
3. SCAN seluruh model/schema
4. CEK seluruh hardcoded role
5. VALIDASI segregation of duties
6. VALIDASI middleware protection
7. VALIDASI foreign key actual schema
8. VALIDASI audit trail (before-after-IP-userAgent)
9. VALIDASI form input manual relasi
10. VALIDASI konsistensi integrasi master data

==================================================
FULL AUTO-SCANNER MODE (WAJIB JIKA SISTEM BESAR)
==================================================

Sistem WAJIB membuat:

1. Route Scanner
   - Scan semua file /routes
   - Deteksi endpoint tanpa protect()
   - Deteksi endpoint tanpa authorizeByRole()
   - Generate laporan JSON

2. Controller Scanner
   - Deteksi akses data tanpa validasi role
   - Deteksi query raw tanpa constraint

3. Hardcoded Role Scanner
   - Deteksi pola:
     if (role === "...")
     verifikatorRoles.includes()
   - Buat daftar file & baris

4. Foreign Key Scanner
   - Bandingkan model vs actual DB schema
   - Tandai FK yang tidak enforced

==================================================
FULL AUTO-REFACTOR MODE
==================================================

Jika ditemukan hardcoded role atau RBAC tidak terpusat:

WAJIB buat script:

- Menghapus seluruh hardcoded role
- Mengganti dengan authorizeByRole("module.permission")
- Menginject middleware global
- Membuat roleModuleMapping.json terpusat
- Membuat RBAC middleware universal production-ready

==================================================
FK MIGRATION GENERATOR MODE
==================================================

Jika FK tidak enforced:

WAJIB generate migration:

ALTER TABLE ...
ADD CONSTRAINT ...
FOREIGN KEY (...)
REFERENCES ...
ON DELETE RESTRICT
ON UPDATE CASCADE;

Migration harus:

- Terpisah file
- Production-ready
- Bisa langsung dijalankan

==================================================
COMPLIANCE SCORING ENGINE
==================================================

WAJIB menghitung skor berbasis bobot:

SPBE Governance (25%)
SPIP Internal Control (25%)
RBAC & Security (20%)
Data Integrity (FK) (15%)
Audit Trail (10%)
Integrasi & Dashboard (5%)

Tampilkan:

- Skor per domain
- Skor total %
- Formula perhitungan
- Rekomendasi kenaikan skor

==================================================
EVIDENCE MATRIX BUILDER
==================================================

WAJIB menghasilkan tabel:

| Modul | Mandat Dinas | Dokumen Ref | Status | Evidence File |

| Role | Modul Akses | Dasar Struktur OPD | Status |

| Dashboard KPI | Dokumen KPI | Status Sinkronisasi |

Tanpa Evidence Matrix → audit tidak defensible.

==================================================
FINAL CERTIFICATION MODE
==================================================

Jika seluruh syarat terpenuhi:

✔ Tidak ada hardcoded role
✔ Semua endpoint terlindungi
✔ Semua FK enforced
✔ Audit trail lengkap
✔ Dashboard selaras KPI
✔ Integrasi tervalidasi
✔ Scoring ≥ 85%

Maka keluarkan:

"STATUS: SIAP PEMERIKSAAN FORMAL INSPEKTORAT"

Jika < 85%:

"STATUS: BELUM SIAP – WAJIB PERBAIKAN"

==================================================
ATURAN WAJIB IMPLEMENTASI
==================================================

Jika kode tidak lengkap:

- WAJIB tulis FULL FILE
- Sebutkan folder + nama file
- Pisahkan per file
- Production-ready

Jika kekurangan sistemik:

- WAJIB buat 1 file generator auto-compliance
- Bisa dijalankan 1x
- Auto-fix seluruh kekurangan

==================================================
OUTPUT WAJIB TERSTRUKTUR
==================================================

A. Ringkasan Eksekutif
B. Pemetaan Dasar Normatif
C. Temuan Forensik Detail
D. Analisis Governance
E. Patch Individual (Full File)
F. Full Auto-Scanner Script
G. Full Auto-Refactor Script
H. FK Migration Generator
I. Compliance Scoring Engine Result
J. Evidence Matrix
K. Simulasi Pertanyaan Inspektorat
L. Status Akhir + Sertifikasi

==================================================
TARGET AKHIR
==================================================

✔ Sistem siap uji petik
✔ Sistem siap audit dokumen
✔ Sistem siap audit teknis
✔ Sistem siap simulasi Inspektorat
✔ Sistem defensible secara hukum & tata kelola
