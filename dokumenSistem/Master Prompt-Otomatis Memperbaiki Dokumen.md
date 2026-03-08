MODE: BLUEPRINT STRENGTHENING ENGINE
BAHASA: INDONESIA FORMAL
TINGKAT: STRUCTURAL DOCUMENT RECONSTRUCTION
TARGET:

- MENINGKATKAN LEVEL BLUEPRINT MINIMAL KE "TEKNIS IMPLEMENTABLE"
- MENUTUP GAP REGULATORY (SPBE, SPIP, ARSITEKTUR TERINTEGRASI)
- MENAMBAHKAN DOKUMEN TEKNIS YANG BELUM ADA

ZERO ASSUMPTION POLICY
EVIDENCE-BASED ONLY
NO GENERIC TEXT
NO NARRATIVE FILLER

==================================================
INPUT WAJIB
==================================================

1. Hasil evaluasi dari:
   - BLUEPRINT WEAKNESS DETECTOR
   - REGULATORY ALIGNMENT CHECK

2. Dokumen sumber:
   - 01-kondisi-dinas-pangan.md
   - 02-dokumentasi-sistem.md
   - 03-dashboard-uiux.md
   - 04-Dokumen Integrasi Sistem & Mapping Modul SIGAP-MALUT.md

Jika hasil evaluasi tidak tersedia →
TULIS:
"PROSES DIHENTIKAN – HASIL EVALUASI BELUM ADA"

==================================================
TAHAP 1 – GAP EXTRACTION
==================================================

Identifikasi seluruh gap berikut:

A. Gap Struktur Blueprint

- Modul belum eksplisit
- Role mapping tidak lengkap
- Workflow tidak terdokumentasi
- Data structure tidak jelas
- Dashboard tanpa definisi data source
- Integrasi tanpa mapping teknis

B. Gap Regulasi

- SPBE domain tidak terdokumentasi
- SPIP elemen tidak terdokumentasi
- Tata kelola TI tidak ada
- Manajemen risiko tidak ada
- Keamanan informasi tidak dijelaskan
- Arsitektur sistem tidak terdokumentasi berlapis

Hasilkan daftar gap terstruktur.

==================================================
TAHAP 2 – DOKUMEN YANG WAJIB DITAMBAHKAN (JIKA BELUM ADA)
==================================================

Jika diperlukan, buat dokumen baru berikut:

1. 05-Data-Dictionary.md
   - Entitas
   - Field
   - Tipe data
   - Relasi
   - Mandatory/Optional

2. 06-Workflow-Specification.md
   - Alur per modul
   - Status flow
   - Role per tahap
   - Trigger event

3. 07-Role-Module-Matrix.md
   - Tabel role vs module vs permission

4. 08-ERD-Logical-Model.md
   - Relasi antar entitas
   - Primary key
   - Foreign key

5. 09-KPI-Definition-Sheet.md
   - Nama indikator
   - Sumber data
   - Formula
   - Role yang melihat

6. 10-IT-Governance-SPBE-SPIP-Alignment.md
   - Mapping dokumen terhadap:
     - Perpres 95/2018 (SPBE)
     - PermenPANRB Evaluasi SPBE
     - SPIP
   - Domain yang dipenuhi
   - Domain yang belum dipenuhi

7. 11-System-Architecture-Document.md
   - Layered architecture
   - Integration layer
   - Data layer
   - Access control
   - Logging & monitoring

==================================================
TAHAP 3 – PERBAIKAN DOKUMEN EXISTING
==================================================

Jika ditemukan kelemahan:

WAJIB:

- Rewrite bagian yang lemah
- Tambahkan bab teknis
- Tambahkan tabel spesifikasi
- Tambahkan mapping eksplisit
- Tambahkan referensi regulatif

Setiap perubahan harus:

- Disebutkan nama file
- Ditulis ulang secara lengkap
- Tidak hanya ringkasan

==================================================
TAHAP 4 – REGULATORY HARDENING
==================================================

Tambahkan bagian eksplisit yang mencakup:

A. SPBE

- Arsitektur SPBE internal
- Integrasi layanan
- Manajemen data
- Keamanan informasi
- Tata kelola

B. SPIP

- Identifikasi risiko sistem
- Kontrol internal
- Audit trail
- Monitoring

C. Standar Arsitektur Terintegrasi

- API standard
- Interoperabilitas
- Centralized RBAC
- Logging & observability

Jika belum ada → buat bab baru.

==================================================
OUTPUT WAJIB TERSTRUKTUR
==================================================

A. Ringkasan Gap
B. Daftar Dokumen yang Direvisi
C. Dokumen Baru yang Dibuat
D. Revisi Lengkap per File (Full Content)
E. Regulatory Alignment Summary
F. Blueprint Level Setelah Perbaikan:

- SEMI TEKNIS
- TEKNIS IMPLEMENTABLE
- GENERATOR-READY

==================================================
ATURAN KETAT
==================================================

- Tidak boleh membuat narasi umum.
- Semua isi harus dapat diterjemahkan menjadi implementasi sistem.
- Semua indikator harus terukur.
- Semua role harus eksplisit.
- Semua modul harus memiliki definisi data.
- Semua dashboard harus memiliki sumber data & formula.
- Semua integrasi harus memiliki mapping field.

==================================================
ENFORCEMENT KHUSUS – MASTER DATA LAYANAN
==================================================

MASTER DATA adalah fondasi sistem dan WAJIB menjadi basis seluruh modul.

Sistem WAJIB:

1. Mengidentifikasi seluruh jenis layanan dinas pangan.
2. Mengelompokkan layanan berdasarkan bidang/unit.
3. Menentukan atribut setiap layanan.
4. Menentukan lifecycle layanan.
5. Menentukan role yang memproses layanan.
6. Menentukan output layanan.
7. Menentukan indikator pengukuran layanan.

Jika dokumen belum memuat struktur ini →
WAJIB membuat dokumen baru:

05-Master-Data-Layanan.md

==================================================
STRUKTUR WAJIB 05-Master-Data-Modul-Layanan.md
==================================================

A. Struktur Klasifikasi Layanan

| Bidang | Nama Layanan | Kategori | Aktif/Nonaktif |
| ------ | ------------ | -------- | -------------- |

B. Spesifikasi Entitas Layanan

Field minimum:

- id_layanan
- kode_layanan
- nama_layanan
- bidang_penanggung_jawab
- deskripsi
- jenis_output
- SLA
- aktif
- created_at
- updated_at

C. Lifecycle Layanan

Contoh:
Draft → Diajukan → Diverifikasi → Disetujui → Selesai → Arsip

D. Role Mapping

| Layanan | Role Input | Role Verifikasi | Role Finalisasi |

E. Relasi Sistem

- Relasi ke user
- Relasi ke bidang
- Relasi ke dokumen
- Relasi ke dashboard
- Relasi ke integrasi eksternal

F. KPI Per Layanan

- Jumlah permohonan
- Waktu penyelesaian
- Tingkat penyelesaian
- SLA compliance

==================================================
WAJIB SINKRON DENGAN DOKUMEN LAIN
==================================================

Setelah master data dibuat atau diperbaiki:

1. Update 02-dokumentasi-sistem.md
   - Modul harus berbasis layanan.

2. Update 03-dashboard-uiux.md
   - Dashboard harus berbasis agregasi layanan.

3. Update 04-Dokumen Integrasi
   - Integrasi harus menyebutkan layanan mana yang terlibat.

4. Update 07-Role-Module-Matrix.md
   - Permission berbasis layanan.

==================================================
ATURAN KETAT MASTER DATA
==================================================

- Tidak boleh ada modul operasional tanpa referensi layanan.
- Tidak boleh ada dashboard tanpa sumber layanan.
- Tidak boleh ada role tanpa keterkaitan layanan.
- Tidak boleh ada integrasi tanpa mapping layanan.

Jika ditemukan modul tidak berbasis master data →
Tandai:
"STRUKTUR SISTEM TIDAK BERBASIS LAYANAN"
dan WAJIB perbaiki blueprint.

TARGET AKHIR:
Blueprint siap digunakan untuk membangun sistem tanpa ambiguitas dan tanpa improvisasi manual.
