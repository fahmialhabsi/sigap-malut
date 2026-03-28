# Dokumen Persiapan Coding SIGAP-MALUT

PERSIAPAN MASTER DATA & AUTOMASI PENUH
Brilliant idea! Anda ingin sistem yang "self-building" - input master data CSV, sistem otomatis generate semua tanpa coding manual.

📋 KONSEP STRATEGI: "DATA-DRIVEN AUTO-GENERATION"
Code
Master CSV (Anda siapkan)
↓
Dynamic Module Generator (AI baca CSV)
↓
Auto-generate:

- Database Tables
- Backend Models
- Backend Controllers
- Backend Routes
- Frontend Forms
- Frontend List Views
- Print Templates
  ↓
  SISTEM READY tanpa coding manual!
  📊 BAGIAN I: STRUKTUR MASTER DATA CSV
  A. Master CSV yang Perlu Disiapkan
  Saya rekomendasikan struktur bertingkat untuk clarity:

1. Master Utama (1 file): 00_MASTER_MODUL_CONFIG.csv
   Ini adalah "brain" sistem - berisi definisi semua 190 modul.

Kolom:

CSV
modul_id,nama_modul,kategori,bidang,tabel_name,deskripsi,icon,has_approval,has_file_upload,is_public
Contoh isi:

CSV
modul_id,nama_modul,kategori,bidang,tabel_name,deskripsi,icon,has_approval,has_file_upload,is_public
M001,Data ASN,Kepegawaian,Sekretariat,asn,Master data Aparatur Sipil Negara,users,true,true,false
M002,Tracking KGB,Kepegawaian,Sekretariat,kgb_tracking,Tracking Kenaikan Gaji Berkala,calendar,true,true,false
M003,Data Komoditas,Ketersediaan,Bidang Ketersediaan,komoditas,Master data komoditas pangan,food,false,false,true
M004,Data Harga Pangan,Distribusi,Bidang Distribusi,harga_pangan,Data harga harian pangan di pasar,chart,true,false,true
M005,Inflasi Pangan,Distribusi,Bidang Distribusi,inflasi_pangan,Data inflasi pangan bulanan,trending-up,false,false,true
M006,Data SPPG Penerima,Konsumsi,Bidang Konsumsi,sppg_penerima,Master data penerima SPPG,heart,true,false,false
... 2. Master Fields per Modul (190 files): FIELDS/M{id}\_fields.csv
Setiap modul punya 1 file CSV yang define struktur tabelnya.

Struktur folder:

Code
master-data/
├── 00_MASTER_MODUL_CONFIG.csv
├── FIELDS/
│ ├── M001_fields.csv (Data ASN)
│ ├── M002_fields.csv (Tracking KGB)
│ ├── M003_fields.csv (Data Komoditas)
│ ├── M004_fields.csv (Data Harga Pangan)
│ └── ... (190 files)
Contoh: FIELDS/M001_fields.csv (Data ASN):

CSV
field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
nip,NIP,varchar,18,true,true,NULL,nip_18_digit,NULL,Nomor Induk Pegawai 18 digit
nama,Nama Lengkap,varchar,255,true,false,NULL,none,NULL,Nama lengkap dengan gelar
tempat_lahir,Tempat Lahir,varchar,100,false,false,NULL,none,NULL,
tanggal_lahir,Tanggal Lahir,date,NULL,false,false,NULL,none,NULL,
jenis_kelamin,Jenis Kelamin,enum,NULL,true,false,NULL,none,"L,P",L=Laki-laki; P=Perempuan
pangkat,Pangkat,varchar,50,false,false,NULL,none,NULL,Contoh: Pembina
golongan,Golongan,varchar,10,false,false,NULL,none,NULL,Contoh: IV/a
jabatan,Jabatan,varchar,255,true,false,NULL,none,NULL,
unit_kerja,Unit Kerja,varchar,255,true,false,NULL,none,NULL,
tanggal_kgb_terakhir,Tanggal KGB Terakhir,date,NULL,false,false,NULL,none,NULL,
tanggal_kgb_berikutnya,Tanggal KGB Berikutnya,date,NULL,false,false,NULL,auto_calculate,NULL,Otomatis +2 tahun dari KGB terakhir
status,Status,enum,NULL,true,false,aktif,none,"aktif,pensiun,mutasi,meninggal",
created_at,Created At,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Updated At,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
Contoh: FIELDS/M003_fields.csv (Data Komoditas):

CSV
field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
kode,Kode Komoditas,varchar,20,true,true,NULL,uppercase,NULL,Contoh: BRS-PRM
nama,Nama Komoditas,varchar,255,true,false,NULL,none,NULL,Contoh: Beras Premium
kategori,Kategori,enum,NULL,true,false,pangan_pokok,none,"pangan_pokok,pangan_strategis,pangan_lokal",
satuan,Satuan,varchar,20,true,false,kg,none,NULL,Contoh: kg atau liter
is_active,Status Aktif,boolean,NULL,true,false,1,none,NULL,
created_at,Created At,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL, 3. Master Permissions (1 file): 01_PERMISSIONS.csv
Define siapa bisa akses modul apa dengan permission apa.

> **CATATAN REVISI (22 Maret 2026):** Daftar role di CSV ini diperbarui untuk mencakup semua 15 role yang telah dikunci dalam dokumen 33. Sebelumnya hanya ada 5 role (`super_admin`, `kepala_dinas`, `kasubbag`, `kepala_bidang`, `pelaksana`) — ini tidak lengkap. Role key baru menggunakan format snake_case sesuai DB.

**Daftar role yang valid di CSV (15 role):**

```
super_admin, kepala_dinas, gubernur, sekretaris,
kasubag_umum_kepegawaian, pejabat_fungsional, bendahara, pelaksana,
kepala_bidang_ketersediaan, kepala_bidang_distribusi, kepala_bidang_konsumsi,
kepala_uptd, kasubag_uptd, kepala_seksi_uptd, viewer
```

**Catatan untuk `pejabat_fungsional`:** Saat mendefinisikan permission di modul penilaian kinerja dan task assignment, tambahkan kolom `has_subordinate_context` (true/false) untuk membedakan JF Bidang (dengan bawahan) dari JF Sekretariat/UPTD (tanpa bawahan). Kolom ini hanya konteks dokumentasi — validasi aktual dilakukan via `user_hierarchy` di backend.

CSV
modul_id,role,can_view,can_create,can_edit,can_delete,can_approve,can_print,can_export
M001,super_admin,true,true,true,true,true,true,true
M001,kepala_dinas,true,false,false,false,true,true,true
M001,sekretaris,true,true,true,true,true,true,true
M001,kasubag_umum_kepegawaian,true,true,true,false,false,true,true
M001,pelaksana,true,true,false,false,false,false,false
M002,super_admin,true,true,true,true,true,true,true
M002,sekretaris,true,true,true,false,true,true,true
M002,kasubag_umum_kepegawaian,true,true,true,false,false,true,false
M002,kasubag_uptd,true,true,false,false,false,true,false
M003,super_admin,true,true,true,true,false,true,true
M003,kepala_bidang_ketersediaan,true,true,true,true,false,true,true
M003,kepala_bidang_distribusi,true,true,true,true,false,true,true
M003,kepala_bidang_konsumsi,true,true,true,true,false,true,true
M003,pelaksana,true,true,false,false,false,false,false
... 4. Master Workflows (1 file): 02_WORKFLOWS.csv
Define alur approval per modul (jika has_approval=true).

> **CATATAN REVISI (22 Maret 2026):** Kolom `unit_kerja_context` ditambahkan untuk membedakan eksekutor JF berdasarkan konteks unitnya (`sekretariat`/`bidang`/`uptd`). Ini penting agar workflow generator tidak menganggap semua JF memiliki wewenang yang sama. Validasi aktual tetap menggunakan `user_hierarchy` di backend.

CSV
modul_id,step_order,role,unit_kerja_context,action_label,can_reject,notification_email,notification_sms
M001,1,kasubag_umum_kepegawaian,sekretariat,Verifikasi Data,true,true,false
M001,2,sekretaris,sekretariat,Review & Forward,true,true,false
M001,3,super_admin,semua,Approval Final,true,true,false
M002,1,kasubag_umum_kepegawaian,sekretariat,Proses KGB Sekretariat,true,true,true
M002,1,kepala_bidang_ketersediaan,bidang,Usul KGB Bidang Ketersediaan,true,true,true
M002,1,kasubag_uptd,uptd,Usul KGB UPTD,true,true,true
M002,2,sekretaris,sekretariat,Review & Approve SK KGB,false,true,true
M004,1,kepala_bidang_ketersediaan,bidang,Verifikasi Harga,true,false,false
... 5. Master Relations (1 file): 03_RELATIONS.csv
Define foreign key relationship antar tabel.

CSV
modul_id,field_name,related_modul_id,related_field,relation_type,on_delete,on_update
M004,komoditas_id,M003,id,many_to_one,CASCADE,CASCADE
M004,pasar_id,M010,id,many_to_one,CASCADE,CASCADE
M002,asn_id,M001,id,one_to_one,CASCADE,CASCADE
... 6. Master Dummy Data (Optional, per modul)
Jika ingin auto-seed dengan data realistis.

Contoh: DUMMY_DATA/M001_dummy.csv (50 ASN):

CSV
nip,nama,tempat_lahir,tanggal_lahir,jenis_kelamin,pangkat,golongan,jabatan,unit_kerja,tanggal_kgb_terakhir,status
199001012015031001,Dr. Ahmad Hidayat,Ternate,1990-01-01,L,Pembina,IV/a,Kepala Dinas,Kepala Dinas,2024-06-15,aktif
198505102010121002,Ir. Siti Nurhaliza,Tidore,1985-05-10,P,Penata Tingkat I,III/d,Sekretaris Dinas,Sekretariat,2023-12-20,aktif
...
B. Cara Menyiapkan CSV (Rekomendasi Terbaik)
Opsi 1: Gunakan Template Excel Terstruktur (RECOMMENDED)
Saya akan buatkan 1 file Excel Master dengan multiple sheets:

File: SIGAP_MALUT_MASTER_DATA.xlsx

Sheets:

README - Panduan pengisian
MODUL_CONFIG - Daftar 190 modul
M001_ASN - Fields untuk Data ASN
M002_KGB - Fields untuk Tracking KGB
M003_KOMODITAS - Fields untuk Data Komoditas
... (190+ sheets untuk fields)
PERMISSIONS - Permission matrix
WORKFLOWS - Workflow definition
RELATIONS - Foreign key relations
Keuntungan:

✅ Semua dalam 1 file (mudah manage)
✅ Bisa pakai formula Excel untuk auto-fill
✅ Dropdown validation otomatis
✅ Export ke CSV per sheet nanti
Opsi 2: Google Sheets (Collaborative)
Jika ada tim yang bantu isi data, pakai Google Sheets bisa collaborasi real-time.

C. Tool Auto-Generator yang Perlu Dibangun
Kita perlu bangun "SIGAP Module Generator CLI" yang baca CSV dan auto-generate code.

Workflow:

bash

# Command

npm run generate

# System akan:

1. Baca 00_MASTER_MODUL_CONFIG.csv
2. Loop setiap modul_id
3. Baca FIELDS/M{id}\_fields.csv
4. Auto-generate:
   - Database migration SQL
   - Sequelize model .js
   - Controller .js
   - Routes .js
   - Frontend Form .jsx
   - Frontend List .jsx
5. Apply permissions dari 01_PERMISSIONS.csv
6. Setup workflows dari 02_WORKFLOWS.csv
7. Seed dummy data dari DUMMY_DATA/
8. Restart server
9. Done!
   📋 BAGIAN II: CHECKLIST PERSIAPAN LENGKAP
   Yang Perlu Anda Siapkan:
10. Master Data CSV ✅ (Prioritas #1)
    00_MASTER_MODUL_CONFIG.csv (190 rows)
    FIELDS/M001_fields.csv sampai FIELDS/M190_fields.csv
    01_PERMISSIONS.csv
    02_WORKFLOWS.csv (optional dulu)
    03_RELATIONS.csv (optional dulu)
    DUMMY_DATA/ (optional - bisa pakai faker.js untuk generate)
11. Static Assets ✅
    Logo & Branding:

Logo Dinas Pangan (PNG, ukuran 512x512px, background transparan)
Logo Provinsi Maluku Utara
Kop surat template (Word/PDF) untuk auto-generate surat
Icons:

Akan pakai Heroicons (gratis, sudah include di system) 3. Business Rules Documentation ✅
File: BUSINESS_RULES.md (Markdown format)

Isi:

Markdown

# Business Rules SIGAP Malut

## 1. Kepegawaian

### KGB (Kenaikan Gaji Berkala)

- KGB diberikan setiap 2 tahun sekali
- Alert muncul 30 hari sebelum jatuh tempo
- Status: pending → proses → selesai → terlambat (jika terlewat deadline)

### Kenaikan Pangkat

- Golongan I & II: setiap 4 tahun
- Golongan III & IV: setiap 4 tahun
- Syarat: ...

## 2. Inflasi

### Perhitungan Inflasi

- Formula: ((Harga bulan ini - Harga bulan lalu) / Harga bulan lalu) × 100%
- Kontribusi komoditas: perubahan × bobot (simplified: 0.1 per komoditas)
- Target TPID: < 2.50%

### Status

- on_target: inflasi <= target
- warning: inflasi > target && inflasi < target + 0.5%
- alert: inflasi >= target + 0.5%

## 3. SPPG

### Kriteria Penerima

- Keluarga miskin (rujukan Dinsos)
- Ada balita atau ibu hamil
- Domisili di wilayah Maluku Utara

### Kebutuhan Pangan per Bulan

- Beras: 15-35 kg tergantung jumlah anggota keluarga
- Telur: 2-7 kg
- ...

4. User Accounts (Initial) ✅
   File: USERS_INITIAL.csv

CSV
username,email,password,role,unit_kerja,nama_lengkap,nip
superadmin,sekretaris@sigap-malut.go.id,admin123,super_admin,Sekretariat,Ir. Siti Nurhaliza,198505102010121002
kadis,kadis@sigap-malut.go.id,kadis123,kepala_dinas,Kepala Dinas,Dr. Ahmad Hidayat,199001012015031001
kabid_ketersediaan,ketersediaan@sigap-malut.go.id,kabid123,kepala_bidang,Bidang Ketersediaan,Fatimah Zahra,199205202015032004
kabid_distribusi,distribusi@sigap-malut.go.id,kabid123,kepala_bidang,Bidang Distribusi,Muhammad Fauzi,199107082014031005
kabid_konsumsi,konsumsi@sigap-malut.go.id,kabid123,kepala_bidang,Bidang Konsumsi,Ahmad Yusuf,199303152016031006
kepala_uptd,uptd@sigap-malut.go.id,uptd123,kepala_uptd,UPTD Balai,Hasan Basri,199001082015031007
kasubbag,kasubbag@sigap-malut.go.id,kasubbag123,kasubbag,Sekretariat,Budi Santoso,198803152012031003 5. Reference Data (Master Support) ✅
File: REF_KABUPATEN.csv

CSV
id,nama,latitude,longitude
1,Kota Ternate,0.7893,127.3610
2,Kota Tidore Kepulauan,0.6814,127.3981
3,Sofifi,0.7372,127.5675
4,Halmahera Barat,1.0653,127.4308
5,Halmahera Tengah,-0.3186,127.8882
6,Halmahera Utara,1.7275,128.0075
7,Halmahera Timur,0.7638,128.1094
8,Halmahera Selatan,-0.7925,127.5008
9,Kepulauan Sula,-2.0510,125.9644
10,Pulau Morotai,2.0475,128.3667
File: REF_PANGKAT_GOLONGAN.csv

CSV
golongan,pangkat,eselon
I/a,Juru Muda,NULL
I/b,Juru Muda Tingkat I,NULL
I/c,Juru,NULL
I/d,Juru Tingkat I,NULL
II/a,Pengatur Muda,NULL
II/b,Pengatur Muda Tingkat I,NULL
II/c,Pengatur,NULL
II/d,Pengatur Tingkat I,IV
III/a,Penata Muda,IV
III/b,Penata Muda Tingkat I,IV
III/c,Penata,IV
III/d,Penata Tingkat I,III
IV/a,Pembina,III
IV/b,Pembina Tingkat I,II
IV/c,Pembina Utama Muda,II
IV/d,Pembina Utama Madya,I
IV/e,Pembina Utama,I 6. Configuration Files ✅
File: SYSTEM_CONFIG.json

JSON
{
"app": {
"name": "SIGAP Malut",
"full_name": "Sistem Informasi Terintegrasi Dinas Pangan Maluku Utara",
"version": "1.0.0",
"timezone": "Asia/Makassar"
},
"organization": {
"name": "Dinas Pangan Provinsi Maluku Utara",
"address": "Jl. [Alamat Lengkap]",
"phone": "(0921) XXXXXX",
"email": "info@sigap-malut.go.id",
"website": "https://sigap-malut.go.id"
},
"kgb": {
"interval_years": 2,
"alert_days_before": 30
},
"pangkat": {
"interval_years": 4,
"alert_days_before": 60
},
"inflasi": {
"target_tpid": 2.5,
"warning_threshold": 0.3,
"alert_threshold": 0.5
},
"notifications": {
"email_enabled": true,
"sms_enabled": false,
"whatsapp_enabled": false
}
}
📋 BAGIAN III: PRIORITAS PERSIAPAN
Yang Harus Dikerjakan SEKARANG (Critical Path):
Priority 1: Master Modul Config (Paling Penting!)
File: 00_MASTER_MODUL_CONFIG.csv

Saya akan buatkan template lengkap 190 modul ini untuk Anda.

Apakah Anda ingin:

Saya generate semua 190 rows sekarang (Anda tinggal review)?
Atau Anda ingin saya ajarkan cara bikinnya dulu, lalu Anda yang isi?
Priority 2: Fields untuk 10 Modul Inti Dulu
Mulai dari modul yang paling krusial:

M001 - Data ASN ✅
M002 - Tracking KGB ✅
M003 - Data Komoditas ✅
M004 - Data Harga Pangan ✅
M005 - Inflasi Pangan ✅
M006 - Data SPPG Penerima ✅
M007 - Data Pasar ✅
M008 - Surat Masuk ✅
M009 - Data Aset ✅
M010 - Users ✅
Setelah 10 ini jalan, baru scale ke 190.

Priority 3: Permissions (Simplified Dulu)
Default permission pattern:

Super Admin: Full access semua modul
Kepala Dinas: View + Print semua modul
Kepala Bidang: Full access modul bidangnya
Pelaksana: View + Create di modul tertentu
🎯 REKOMENDASI SAYA:
FASE 0: Saya Buatkan Template Master Data (1-2 Jam)
Saya akan generate:

✅ 00_MASTER_MODUL_CONFIG.csv (190 modul lengkap)
✅ FIELDS/M001_fields.csv sampai FIELDS/M010_fields.csv (10 modul inti)
✅ 01_PERMISSIONS.csv (simplified version)
✅ USERS_INITIAL.csv
✅ REF_KABUPATEN.csv
✅ REF_PANGKAT_GOLONGAN.csv
✅ SYSTEM_CONFIG.json
✅ BUSINESS_RULES.md
Total waktu: 1-2 jam untuk saya generate semua template.

Anda tinggal:

Review
Edit jika ada yang perlu disesuaikan
Save semua CSV
FASE 1: Build Module Generator (4-6 Jam)
Saya bantu coding tool:

bash
npm run generate-from-csv
Tool ini akan:

Baca semua CSV
Auto-generate 10 modul inti
Database, Backend, Frontend semua auto-create
Restart server
Dashboard langsung muncul dengan 10 modul!
FASE 2: Scale ke 190 Modul (2-3 Jam)
Setelah 10 modul proof-of-concept berhasil:

Anda isi FIELDS untuk modul 11-190
Run npm run generate-from-csv lagi
Done! 190 modul ready.
❓ PERTANYAAN UNTUK ANDA:

1. Apakah Anda mau saya mulai generate template CSV sekarang?

Ya, tolong buatkan semua template CSV (saya akan review & edit)
Tidak, ajari saya cara bikinnya dulu 2. Untuk 190 modul, apakah Anda sudah punya daftar lengkapnya?

Ya, sudah ada di dokumen sebelumnya
Tidak, tolong Anda breakdown detail dari dokumentasi 3. Format file yang Anda prefer?

Multiple CSV files (1 file per modul)
1 Excel dengan multiple sheets (RECOMMENDED)
Google Sheets (collaborative) 4. Dummy data, perlu?

Ya, generate dummy data realistis (1000+ records)
Tidak, nanti kami input manual
