# Audit Berbasis Data Folder `../master-data`

## Ruang lingkup & bukti
Audit ini berbasis pembacaan langsung terhadap artefak berikut:
- `../master-data/00_MASTER_MODUL_CONFIG.csv`
- `../master-data/00_MASTER_MODUL_UI_SEKRETARIAT.csv`
- `../master-data/01_LAYANAN_MENPANRB_SEKRETARIAT.csv`
- `../master-data/02_MAPPING_UI_LAYANAN.csv`
- `../master-data/03_MASTER_MODUL_UI_BIDANG_KETERSEDIAAN.csv`
- `../master-data/04_LAYANAN_MENPANRB_BIDANG_KETERSEDIAAN.csv`
- `../master-data/05_MAPPING_UI_LAYANAN_BIDANG_KETERSEDIAAN.csv`
- `../master-data/06_MASTER_MODUL_UI_BIDANG_DISTRIBUSI.csv`
- `../master-data/07_LAYANAN_MENPANRB_BIDANG_DISTRIBUSI.csv`
- `../master-data/08_MAPPING_UI_LAYANAN_BIDANG_DISTRIBUSI.csv`
- `../master-data/09_MASTER_MODUL_UI_BIDANG_KONSUMSI.csv`
- `../master-data/10_LAYANAN_MENPANRB_BIDANG_KONSUMSI.csv`
- `../master-data/11_MAPPING_UI_LAYANAN_BIDANG_KONSUMSI.csv`
- `../master-data/12_MASTER_MODUL_UI_UPTD.csv`
- `../master-data/13_LAYANAN_MENPANRB_UPTD.csv`
- `../master-data/14_MAPPING_UI_LAYANAN_UPTD.csv`
- `../master-data/modules-sekretariat.json`
- `../master-data/00_COMPLIANCE_AUDIT_TRAIL.csv`
- `../master-data/FIELDS/FIELDS_M032.csv`
- `../master-data/FIELDS_SEKRETARIAT/SEK-ADM_fields.csv`
- `../master-data/FIELDS_UPTD/UPT-ADM_fields.csv`

## 1. Peta modul master data

### A. Jenis artefak yang ada
Folder `../master-data` bukan sekadar output flat file tunggal; isinya membentuk paket master data modular dengan empat lapisan utama:

1. **Konfigurasi modul global**
   - `../master-data/00_MASTER_MODUL_CONFIG.csv`
   - Berisi katalog modul level sistem dengan atribut: `modul_id`, `nama_modul`, `kategori`, `bidang`, `tabel_name`, `icon`, flag approval/upload/public, `menu_order`, `is_active`.

2. **Definisi modul UI per domain/bidang**
   - `../master-data/00_MASTER_MODUL_UI_SEKRETARIAT.csv`
   - `../master-data/03_MASTER_MODUL_UI_BIDANG_KETERSEDIAAN.csv`
   - `../master-data/06_MASTER_MODUL_UI_BIDANG_DISTRIBUSI.csv`
   - `../master-data/09_MASTER_MODUL_UI_BIDANG_KONSUMSI.csv`
   - `../master-data/12_MASTER_MODUL_UI_UPTD.csv`
   - Ini tampak sebagai layer agregasi/menu UI, bukan tabel transaksional.

3. **Daftar layanan MENPANRB per domain**
   - `../master-data/01_LAYANAN_MENPANRB_SEKRETARIAT.csv`
   - `../master-data/04_LAYANAN_MENPANRB_BIDANG_KETERSEDIAAN.csv`
   - `../master-data/07_LAYANAN_MENPANRB_BIDANG_DISTRIBUSI.csv`
   - `../master-data/10_LAYANAN_MENPANRB_BIDANG_KONSUMSI.csv`
   - `../master-data/13_LAYANAN_MENPANRB_UPTD.csv`
   - Ini adalah layer referensi layanan operasional; tiap record punya `layanan_id`, `layanan_code`, `modul_ui_id`, sensitivitas, penanggung jawab, pelaksana.

4. **Mapping modul UI ↔ layanan**
   - `../master-data/02_MAPPING_UI_LAYANAN.csv`
   - `../master-data/05_MAPPING_UI_LAYANAN_BIDANG_KETERSEDIAAN.csv`
   - `../master-data/08_MAPPING_UI_LAYANAN_BIDANG_DISTRIBUSI.csv`
   - `../master-data/11_MAPPING_UI_LAYANAN_BIDANG_KONSUMSI.csv`
   - `../master-data/14_MAPPING_UI_LAYANAN_UPTD.csv`
   - File ini menyimpan relasi dalam bentuk string comma-separated `layanan_ids` plus `total_layanan`.

5. **Skema field per modul**
   - Folder umum `../master-data/FIELDS/`
   - Folder domain-spesifik:
     - `../master-data/FIELDS_SEKRETARIAT/`
     - `../master-data/FIELDS_BIDANG_KETERSEDIAAN/`
     - `../master-data/FIELDS_BIDANG_DISTRIBUSI/`
     - `../master-data/FIELDS_BIDANG_KONSUMSI/`
     - `../master-data/FIELDS_UPTD/`
   - Contoh:
     - `../master-data/FIELDS/FIELDS_M032.csv`
     - `../master-data/FIELDS_SEKRETARIAT/SEK-ADM_fields.csv`
     - `../master-data/FIELDS_UPTD/UPT-ADM_fields.csv`

6. **Output/serialisasi JSON**
   - `../master-data/modules-sekretariat.json`
   - Ini tampak sebagai hasil ekspor/derivatif dari CSV, bukan source of truth utama, karena field subset-nya mengikuti struktur `00_MASTER_MODUL_CONFIG.csv` tetapi hanya untuk Sekretariat.

7. **Artefak audit kepatuhan**
   - `../master-data/00_COMPLIANCE_AUDIT_TRAIL.csv`
   - Ini bukan master data bisnis murni, melainkan output audit/traceability yang menghubungkan requirement dokumen ke file implementasi backend.

### B. Struktur identitas dan namespace
Ada beberapa namespace ID yang cukup jelas:
- `SAxx`: Super Admin, contoh `SA01`–`SA10` di `00_MASTER_MODUL_CONFIG.csv`
- `Mxxx`: modul bisnis umum, contoh `M001`–`M084`
- `WF01`: workflow management global
- `SEK-*`: modul UI Sekretariat
- `BKT-*`: modul UI Bidang Ketersediaan
- `BDS-*`: modul UI Bidang Distribusi
- `BKS-*`: modul UI Bidang Konsumsi
- `UPT-*`: modul UI UPTD
- `LYxxx`: layanan operasional

Secara desain, ini menunjukkan pemisahan yang cukup matang antara:
- katalog modul backend/logis,
- grouping menu UI,
- layanan bisnis,
- dan skema field.

## 2. Kualitas desain dan konsistensi data

### A. Kekuatan desain
1. **Konvensi penamaan cukup sistematis**
   - Prefix ID konsisten per domain: `SEK-`, `BKT-`, `BDS-`, `BKS-`, `UPT-`, `LY`.
   - File berurutan numerik `00`–`14` memudahkan membaca dependency antar master file.

2. **Model data bertingkat cukup jelas**
   - Modul sistem global di `00_MASTER_MODUL_CONFIG.csv`
   - Modul UI per bidang pada file `00/03/06/09/12`
   - Layanan rinci pada file `01/04/07/10/13`
   - Mapping eksplisit pada file `02/05/08/11/14`

3. **Metadata UI dan workflow sudah dipikirkan**
   - Ada `icon`, `has_approval`, `has_file_upload`, `is_public`, `menu_order`, `is_active`.
   - Ini menunjukkan master data dipakai bukan hanya referensi label, tetapi untuk menggerakkan UI/behavior sistem.

4. **Ada embrio schema registry**
   - Berbagai file `FIELDS_*.csv` mendefinisikan field-level schema: nama, tipe, panjang, required, unique, default, validation, dropdown, help text.
   - Contoh `../master-data/FIELDS/FIELDS_M032.csv` dan `../master-data/FIELDS_SEKRETARIAT/SEK-ADM_fields.csv`.

### B. Inkonsistensi dan anomali nyata
1. **Nama file field tidak selalu selaras dengan kode modul**
   - `../master-data/FIELDS/FIELDS_M032.csv` berisi field KPI seperti `kpi_code`, `kpi_name`, `target_value`.
   - Namun di `../master-data/00_MASTER_MODUL_CONFIG.csv`, `M032` adalah `Data Komoditas Pangan` dengan `tabel_name=komoditas`.
   - Ini mismatch kuat antara ID file schema dan definisi modul. Risiko: schema salah ditempel ke modul yang salah.

2. **Duplikasi/overlap folder field**
   - Ada file UPTD di dua lokasi:
     - `../master-data/FIELDS/FIELDS_UPT-ADM.csv`
     - `../master-data/FIELDS_UPTD/UPT-ADM_fields.csv`
   - Struktur ganda seperti ini mengaburkan source of truth.
   - Bahkan `UPT-ADM_fields.csv` yang dibaca hanya berisi 2 field tambahan (`unit_kerja`, `akses_terbatas`), sehingga terlihat seperti partial override, tetapi tidak ada metadata yang menjelaskan apakah ini patch, extension, atau schema final.

3. **Ketidaksesuaian total_layanan**
   - `../master-data/03_MASTER_MODUL_UI_BIDANG_KETERSEDIAAN.csv` menyatakan `BKT-MEV` punya `total_layanan=6`.
   - `../master-data/05_MAPPING_UI_LAYANAN_BIDANG_KETERSEDIAAN.csv` untuk `BKT-MEV` hanya memuat `LY072`–`LY076` = 5 ID, tetapi `total_layanan` tetap 6.
   - `../master-data/04_LAYANAN_MENPANRB_BIDANG_KETERSEDIAAN.csv` juga hanya menunjukkan 5 layanan untuk `BKT-MEV`.
   - Jadi ada inkonsistensi hitung internal.

4. **Ketidaksesuaian total_layanan di UPTD**
   - `../master-data/12_MASTER_MODUL_UI_UPTD.csv` menyatakan:
     - `UPT-ADM` = 9
     - `UPT-AST` = 6
     - `UPT-MTU` = 17
   - Namun `../master-data/14_MAPPING_UI_LAYANAN_UPTD.csv` menunjukkan:
     - `UPT-ADM` berisi 10 layanan
     - `UPT-AST` berisi 5 layanan
     - `UPT-MTU` berisi 16 layanan
   - Ini bukti konkret bahwa beberapa angka agregat tidak sinkron dengan detail.

5. **JSON derivatif tidak lengkap lintas sistem**
   - `../master-data/modules-sekretariat.json` hanya memuat subset Sekretariat dan tidak memuat `tabel_name` atau `deskripsi`, padahal tersedia di `00_MASTER_MODUL_CONFIG.csv`.
   - Jika JSON dipakai frontend, ada potensi kehilangan informasi dan divergensi antara CSV dan JSON.

6. **Nilai enum/distribusi teks tidak distandardisasi ketat**
   - Pada `SEK-ADM_fields.csv`, `dropdown_options` memakai kutip bertumpuk seperti `"""Sekretariat,UPTD,..."""`.
   - Format ini rawan parsing berbeda antar library CSV.

### C. Apakah ini generator, schema, mapping, atau output?
Berdasarkan bukti, folder `../master-data` berisi kombinasi:
- **schema registry**: folder `FIELDS*`
- **mapping layer**: file `02/05/08/11/14`
- **reference/master output**: file `00/01/03/04/06/07/09/10/12/13`
- **serialized export**: `modules-sekretariat.json`
- **audit output**: `00_COMPLIANCE_AUDIT_TRAIL.csv`

Yang **tidak terlihat** dari bukti ini:
- script generator,
- seed importer,
- validator executable,
- version manifest,
- checksum,
- changelog.
Jadi folder ini lebih terlihat sebagai **artefak master data statis** daripada pipeline generator yang lengkap.

## 3. Risiko integritas data dan validasi

### A. Risiko relasional
1. **Relasi disimpan sebagai string comma-separated**
   - Di semua file mapping seperti `../master-data/02_MAPPING_UI_LAYANAN.csv`, kolom `layanan_ids` berisi string daftar ID.
   - Ini tidak ternormalisasi dan menyulitkan:
     - validasi foreign key,
     - diff perubahan,
     - query otomatis,
     - deteksi duplikasi ID.

2. **Tidak ada bukti foreign key formal**
   - `layanan_id` direferensikan oleh schema seperti `../master-data/FIELDS_SEKRETARIAT/SEK-ADM_fields.csv` melalui help text `FK ke layanan_menpanrb (LY001-LY006)`.
   - Namun tidak ada file constraint formal atau manifest relasi yang menjamin `layanan_id` valid di semua domain.

3. **Schema parsial berisiko tertimpa atau tergabung salah**
   - `../master-data/FIELDS_UPTD/UPT-ADM_fields.csv` tampak sebagai potongan field tambahan, bukan schema penuh.
   - Jika loader menganggap setiap file `*_fields.csv` adalah schema final, modul UPT-ADM akan kehilangan seluruh field inti.
   - Jika loader melakukan merge, tidak ada deklarasi urutan merge.

### B. Risiko validasi tipe data
1. **Field validation masih deklaratif minim**
   - Banyak nilai `validation=none`.
   - Contoh `../master-data/FIELDS/FIELDS_M032.csv` memakai validasi `uppercase` hanya untuk `kpi_code`; selebihnya sangat longgar.
   - Belum terlihat regex, min/max numeric, enum canonical validator, referential validator, atau date boundary.

2. **Representasi default dan NULL campur aduk**
   - Banyak field menggunakan string `NULL`, `CURRENT_TIMESTAMP`, `0`, `1`.
   - Tanpa parser schema yang tegas, nilai-nilai itu bisa terbaca sebagai string literal, bukan null/boolean/expression.

3. **Boolean diserialisasi sebagai campuran**
   - Di CSV modul digunakan `true/false`.
   - Di field schema default boolean dipakai `0/1`.
   - Perbedaan ini meningkatkan risiko coercion bug saat import lintas tool.

### C. Risiko governance dan drift
1. **Tidak ada versi dataset**
   - Tidak ada kolom `version`, `effective_date`, `updated_by`, atau `source_system` pada master file utama.
   - Sulit menjamin sinkronisasi antar SIGAP-MALUT, frontend, dan EPelara.

2. **Tidak ada bukti audit perubahan untuk master inti**
   - Ada `00_COMPLIANCE_AUDIT_TRAIL.csv`, tetapi itu audit requirement dokumen ke backend, bukan audit perubahan data master.
   - Jadi perubahan master data sendiri belum terlihat terlacak secara operasional.

3. **Potensi mismatch menu vs modul backend**
   - `modules-sekretariat.json` hanya subset modul tertentu; jika frontend memakai JSON sementara backend memakai CSV/DB lain, drift sangat mungkin terjadi.

## 4. Relasi ke backend SIGAP-MALUT

Ada bukti langsung bahwa master-data dikaitkan ke backend/dokumen backend:
- `../master-data/00_COMPLIANCE_AUDIT_TRAIL.csv` mereferensikan file backend seperti:
  - `backend/controllers/modulController.js`
  - `backend/models/validator.js`
- File ini juga menyebut butir arsitektur seperti:
  - `Data Layer: PostgreSQL, Sequelize, Master Data CSV/JSON`
  - `Integrasi master data: lookup, referensi id, tidak ada input manual`

Dari bukti ini, relasinya adalah:
1. **Dokumentatif/audit linkage ada**
   - Master data diposisikan sebagai bagian dari data layer sistem.
2. **Namun belum ada bukti teknis loader/importer**
   - Dalam ruang lingkup file yang dibaca, tidak ada script backend yang membaca CSV/JSON ini secara langsung.
3. **Karena itu kesiapan integrasi ke backend masih parsial**
   - Ada indikasi arsitektural, tetapi belum ada bukti implementasi konsumsi master data di runtime.

## 5. Peluang standardisasi untuk integrasi dengan EPelara

### A. Jadikan satu canonical source of truth
Prioritaskan satu sumber resmi:
- CSV canonical atau JSON canonical, jangan dua-duanya setara.
- Jika CSV tetap dipakai sebagai source, maka `modules-sekretariat.json` harus dihasilkan otomatis dan diberi metadata asal.

### B. Normalisasi mapping
Ganti format mapping dari:
- satu baris `modul_ui_id + layanan_ids comma-separated`
menjadi:
- satu baris per relasi, misalnya `modul_ui_id, layanan_id`.
Ini akan memudahkan:
- foreign key check,
- sinkronisasi lintas sistem,
- dedup,
- API ingestion ke EPelara.

### C. Tambahkan metadata lintas sistem
Untuk setiap modul/layanan/field, tambahkan kolom standar:
- `source_system`
- `version`
- `effective_date`
- `updated_at`
- `updated_by`
- `integration_key`
- `external_code_epelara` bila kode target berbeda

### D. Rapikan schema registry
Bedakan secara eksplisit:
- **base schema**
- **extension schema**
- **override schema**
- **generated schema**
Karena saat ini `FIELDS/` dan `FIELDS_UPTD/` berpotensi tumpang tindih.

### E. Validasi mesin sebelum dipakai lintas sistem
Perlu validator otomatis minimal untuk:
- keunikan `modul_id`, `layanan_id`, `layanan_code`
- kesesuaian `total_layanan` dengan jumlah detail aktual
- referensi `modul_ui_id` yang valid
- kecocokan file field dengan `modul_id`
- enum dan boolean canonical
- deteksi file schema parsial

## 6. Ringkasan eksekutif temuan utama

### Poin positif
- Struktur master data kaya dan cukup matang secara konseptual.
- Sudah ada pemisahan antara modul, layanan, mapping, dan field schema.
- Konvensi prefix ID konsisten dan cukup siap dipakai untuk lookup lintas domain.
- Ada jejak keterkaitan arsitektural dengan backend melalui `00_COMPLIANCE_AUDIT_TRAIL.csv`.

### Temuan risiko tinggi
- Ada mismatch nyata antara kode modul dan file schema (`FIELDS_M032.csv` vs `M032` pada config).
- Ada beberapa `total_layanan` yang tidak sinkron dengan mapping/detail:
  - `BKT-MEV`
  - `UPT-ADM`
  - `UPT-AST`
  - `UPT-MTU`
- Ada duplikasi/ambiguity lokasi schema (`FIELDS/` vs `FIELDS_UPTD/`).
- Mapping comma-separated menyulitkan validasi integritas.
- Belum ada bukti versioning, governance perubahan, atau loader backend yang formal.

### Penilaian kesiapan lintas sistem
- **Kesiapan konseptual:** sedang–tinggi
- **Kesiapan integritas/operasional:** sedang–rendah
- **Kesiapan integrasi otomatis SIGAP-MALUT ↔ EPelara:** belum aman tanpa standardisasi tambahan, terutama pada source-of-truth, relasi ternormalisasi, dan validator konsistensi.