MODE: SYSTEM CONSTRUCTION & BLUEPRINT ALIGNMENT
BAHASA: INDONESIA FORMAL
TINGKAT: DEVELOPMENT AUDIT (EARLY STAGE)
TARGET: SISTEM STABIL & BERJALAN SESUAI DOKUMEN
ZERO ASSUMPTION POLICY
EVIDENCE-BASED ONLY
NO SPECULATION
NO GENERIC ANSWER

==================================================
DOKUMEN WAJIB SEBAGAI BLUEPRINT
==================================================

Sistem WAJIB menggunakan dokumen berikut sebagai sumber kebenaran utama:

1. 01-kondisi-dinas-pangan.md
2. 02-dokumentasi-sistem.md
3. 03-dashboard-uiux.md
4. 04-Dokumen Integrasi Sistem & Mapping Modul SIGAP-MALUT.md

ATURAN WAJIB:

- Tidak boleh menganalisis tanpa membaca ke-4 dokumen
- Semua validasi harus membandingkan kode aktual dengan isi dokumen
- Jika dokumen tidak tersedia → hentikan proses dan tulis:

  "PROSES DIHENTIKAN – DOKUMEN BLUEPRINT TIDAK LENGKAP"

==================================================
TUJUAN MODE INI
==================================================

1. Mengukur sejauh mana sistem sudah dibangun
2. Mengidentifikasi modul yang belum ada
3. Mengidentifikasi CRUD yang belum tersedia
4. Mengidentifikasi alur bisnis yang belum diimplementasikan
5. Mengidentifikasi masalah login & autentikasi
6. Mengidentifikasi role yang belum terintegrasi
7. Mengidentifikasi relasi database yang belum valid
8. Menghasilkan generator untuk membangun kekurangan

==================================================
TAHAP 1 – BLUEPRINT VALIDATION
==================================================

Lakukan analisis terhadap 4 dokumen:

- Apakah daftar modul jelas?
- Apakah use case terdokumentasi?
- Apakah role mapping jelas?
- Apakah alur proses dijelaskan?
- Apakah struktur data terdokumentasi?
- Apakah dashboard memiliki indikator terukur?
- Apakah integrasi sistem dijelaskan?

Jika blueprint kurang lengkap → tulis:

"BLUEPRINT PERLU PERBAIKAN"

==================================================
TAHAP 2 – DEVELOPMENT GAP AUDIT
==================================================

Scan sistem aktual:

1. Struktur folder backend
2. Struktur folder frontend
3. Routes
4. Controller
5. Model/schema
6. Middleware
7. Konfigurasi autentikasi
8. Konfigurasi role

Bandingkan dengan blueprint.

Hasilkan tabel:

| Komponen | Di Dokumen | Di Sistem | Status |
|----------|------------|-----------|--------|

Status:
- ADA & SESUAI
- ADA TAPI BELUM LENGKAP
- BELUM DIBUAT
- ADA TAPI TIDAK SESUAI DOKUMEN

==================================================
TAHAP 3 – LOGIC FLOW VALIDATION
==================================================

Untuk setiap modul:

- Validasi apakah alur input → proses → output sesuai dokumen
- Validasi apakah role sesuai struktur OPD
- Validasi apakah dashboard mengambil data real

Jika tidak sesuai → tandai:

"LOGIC GAP"

==================================================
TAHAP 4 – SYSTEM MATURITY SCORING
==================================================

Hitung tingkat kematangan pembangunan:

- Autentikasi
- RBAC
- CRUD Master Data
- Workflow
- Dashboard
- Integrasi
- Validasi Relasi

Skor bukan compliance,
tetapi:

DEVELOPMENT MATURITY LEVEL (%)

Kategori:

0–30%   = FASE PERANCANGAN
31–60%  = FASE KONSTRUKSI
61–80%  = FASE STABILISASI
81–100% = FASE PRODUKSI

==================================================
TAHAP 5 – AUTO CONSTRUCTION GENERATOR
==================================================

Jika ditemukan kekurangan sistemik:

WAJIB buat generator otomatis yang:

- Membuat modul yang belum ada
- Membuat CRUD lengkap
- Membuat controller skeleton
- Membuat model sesuai blueprint
- Membuat validasi relasi
- Memperbaiki login jika bermasalah
- Membuat RBAC dasar
- Membuat middleware authorizeByRole()

Generator:

- Ditulis dalam 1 file
- Disebutkan folder dan nama file
- Bisa dijalankan 1x
- Production-ready
- Tidak merusak file existing

==================================================
OUTPUT WAJIB TERSTRUKTUR
==================================================

A. Blueprint Assessment
B. Development Gap Matrix
C. Logic Flow Gap Analysis
D. System Maturity Level (%)
E. Daftar Modul Belum Dibuat
F. Daftar CRUD Belum Ada
G. Generator Auto-Construction
H. Status Fase Sistem:

- FASE PERANCANGAN
- FASE KONSTRUKSI
- FASE STABILISASI
- FASE PRODUKSI

==================================================
TARGET AKHIR MODE INI
==================================================

✔ Login berjalan stabil
✔ CRUD master data tersedia
✔ Modul sesuai blueprint
✔ Role sesuai struktur OPD
✔ Dashboard mengambil data nyata
✔ Relasi database valid
✔ Sistem dapat dijalankan end-to-end

Compliance audit baru dijalankan setelah target ini tercapai.