PANDUAN LENGKAP: CARA MEMBUAT MASTER DATA CSV
FOKUS: MODUL KHUSUS SUPER ADMIN (SEKRETARIS)
📚 BAGIAN I: PEMAHAMAN KONSEP
A. Apa itu Super Admin?
Super Admin = Sekretaris Dinas Pangan

Peran khusus:

✅ Hub/Gateway semua koordinasi
✅ Pemegang semua data organisasi
✅ Dynamic Module Generator (buat modul baru tanpa coding)
✅ Dashboard 50 KPI
✅ Template Management (Tata Naskah)
✅ User Management
✅ System Configuration
✅ Audit Trail Viewer
B. Modul Khusus Super Admin (Yang Harus Kita Buat)
Berdasarkan diskusi kita sebelumnya, modul khusus Super Admin:

No Modul ID Nama Modul Tujuan
1 SA01 Dashboard KPI 50 Indikator Monitor real-time semua aspek organisasi
2 SA02 Dynamic Module Generator Buat modul baru tanpa coding
3 SA03 Template Tata Naskah Dinas Manage template surat resmi
4 SA04 Repositori Peraturan Database peraturan perundangan
5 SA05 User Management Kelola user & permissions
6 SA06 Audit Trail Log semua aktivitas sistem
7 SA07 System Configuration Settings aplikasi
8 SA08 Backup & Restore Backup database
9 SA09 Dashboard Compliance Monitor alur koordinasi & bypass
10 SA10 AI Configuration Settings AI Chatbot & analisis

BAGIAN II: TUTORIAL STEP-BY-STEP
STEP 1: Buat File Master Config
File: 00_MASTER_MODUL_CONFIG.csv
Buka Excel/Google Sheets, buat tabel dengan kolom:

Column Tipe Data Keterangan Wajib?
modul_id Text ID unik modul (contoh: SA01, M001) ✅
nama_modul Text Nama modul yang tampil di menu ✅
kategori Text Kelompok modul (Dashboard, Kepegawaian, dll) ✅
bidang Text Unit kerja pemilik (Sekretariat, Bidang X) ✅
tabel_name Text Nama tabel database (lowercase, underscore) ✅
deskripsi Text Penjelasan singkat modul ✅
icon Text Nama icon (dari Heroicons) ❌
has_approval Boolean Apakah butuh approval workflow? (true/false) ✅
has_file_upload Boolean Apakah bisa upload file? (true/false) ✅
is_public Boolean Apakah data bisa diakses publik? (true/false) ✅
menu_order Number Urutan di menu (1, 2, 3, ...) ❌
is_active Boolean Aktif atau tidak? (true/false) ✅
Contoh Pengisian untuk 10 Modul Super Admin:
CSV
modul_id,nama_modul,kategori,bidang,tabel_name,deskripsi,icon,has_approval,has_file_upload,is_public,menu_order,is_active
SA01,Dashboard KPI 50 Indikator,Super Admin,Sekretariat,kpi_tracking,Monitoring 50 indikator keberhasilan sistem secara real-time,chart-bar,false,false,false,1,true
SA02,Dynamic Module Generator,Super Admin,Sekretariat,dynamic_modules,Tool untuk membuat modul baru tanpa coding,puzzle-piece,true,false,false,2,true
SA03,Template Tata Naskah Dinas,Super Admin,Sekretariat,tata_naskah_templates,Manajemen template surat resmi (SK SE ST SU ND dll),document-text,true,true,false,3,true
SA04,Repositori Peraturan,Super Admin,Sekretariat,peraturan,Database peraturan perundang-undangan (UU PP Pergub dll),book-open,false,true,true,4,true
SA05,User Management,Super Admin,Sekretariat,users,Kelola user akun dan hak akses sistem,users,false,false,false,5,true
SA06,Audit Trail,Super Admin,Sekretariat,audit_log,Log tracking semua aktivitas user di sistem,clipboard-document-list,false,false,false,6,true
SA07,System Configuration,Super Admin,Sekretariat,system_config,Pengaturan konfigurasi aplikasi (email notif dll),cog-6-tooth,false,false,false,7,true
SA08,Backup & Restore,Super Admin,Sekretariat,backups,Backup dan restore database sistem,cloud-arrow-down,false,true,false,8,true
SA09,Dashboard Compliance,Super Admin,Sekretariat,compliance_tracking,Monitor alur koordinasi dan deteksi bypass,shield-check,false,false,false,9,true
SA10,AI Configuration,Super Admin,Sekretariat,ai_config,Konfigurasi AI Chatbot dan analisis,sparkles,false,false,false,10,true
Save sebagai: 00_MASTER_MODUL_CONFIG.csv

STEP 2: Buat Fields Definition untuk Setiap Modul
Sekarang kita define struktur database per modul.

Buat folder: FIELDS/
Di dalam folder ini, kita buat 1 file CSV per modul.

CONTOH LENGKAP 1: SA01 - Dashboard KPI
File: FIELDS/SA01_fields.csv

Kolom yang harus ada:

Column Keterangan Wajib?
field_name Nama kolom database (lowercase_underscore) ✅
field_label Label yang tampil di form (Indonesia) ✅
field_type Tipe data (auto_increment, varchar, int, date, enum, boolean, text, timestamp, decimal, json) ✅
field_length Panjang max (untuk varchar/int) atau NULL ✅
is_required Wajib diisi? (true/false) ✅
is_unique Harus unik? (true/false) ✅
default_value Nilai default (atau NULL) ❌
validation Aturan validasi (nip_18_digit, email, phone, url, none) ❌
dropdown_options Opsi untuk enum (pisahkan dengan koma) ❌
help_text Teks bantuan untuk user ❌
Isi file:

CSV
field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
kpi_code,Kode KPI,varchar,10,true,true,NULL,uppercase,"C.1 sampai C.50",Contoh: C.1 atau C.25
kpi_name,Nama KPI,varchar,255,true,false,NULL,none,NULL,Nama indikator keberhasilan
kategori,Kategori,enum,NULL,true,false,NULL,none,"efisiensi_operasional,akuntabilitas,kepuasan_stakeholder,dampak_strategis,kepegawaian,keuangan,data_pelaporan,inflasi,sppg",Kategori KPI
target_value,Target,decimal,"10,2",true,false,NULL,none,NULL,Target yang ingin dicapai (angka atau persen)
target_unit,Satuan Target,enum,NULL,true,false,persen,none,"persen,hari,jumlah,rupiah",Satuan dari target
current_value,Nilai Saat Ini,decimal,"10,2",false,false,0,none,NULL,Nilai pencapaian saat ini
status,Status,enum,NULL,true,false,pending,none,"on_target,warning,critical,achieved",Status pencapaian
periode,Periode,date,NULL,true,false,NULL,none,NULL,Bulan periode pengukuran (format: YYYY-MM-01)
penanggung_jawab,Penanggung Jawab,varchar,255,false,false,NULL,none,NULL,Unit/orang yang bertanggung jawab
cara_pengukuran,Cara Pengukuran,text,NULL,false,false,NULL,none,NULL,Metode pengukuran KPI
is_active,Status Aktif,boolean,NULL,true,false,1,none,NULL,Apakah KPI masih digunakan
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
Save sebagai: FIELDS/SA01_fields.csv

CONTOH LENGKAP 2: SA02 - Dynamic Module Generator
File: FIELDS/SA02_fields.csv

CSV
field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
module_id,Module ID,varchar,20,true,true,NULL,uppercase,NULL,ID unik modul yang dibuat (contoh: TEMP001)
module_name,Nama Modul,varchar,255,true,false,NULL,none,NULL,Nama modul yang ditampilkan di menu
table_name,Nama Tabel,varchar,100,true,true,NULL,lowercase_underscore,NULL,Nama tabel di database
description,Deskripsi,text,NULL,false,false,NULL,none,NULL,Penjelasan fungsi modul
icon,Icon,varchar,50,false,false,document,none,NULL,Nama icon Heroicons
category,Kategori,varchar,100,false,false,Lainnya,none,NULL,Kategori modul
fields_definition,Definisi Fields,json,NULL,true,false,NULL,none,NULL,JSON struktur fields (dari wizard)
permissions,Permissions,json,NULL,true,false,NULL,none,NULL,JSON permission matrix
print_template,Template Print,enum,NULL,false,false,simple_table,none,"simple_table,official_report,custom",Template untuk print/export
status,Status,enum,NULL,true,false,draft,none,"draft,generating,active,error",Status pembuatan modul
generated_at,Tanggal Generate,timestamp,NULL,false,false,NULL,none,NULL,Kapan modul di-generate
created_by,Dibuat Oleh,int,11,true,false,NULL,none,NULL,User ID Super Admin yang buat (FK ke users.id)
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
Save sebagai: FIELDS/SA02_fields.csv

CONTOH LENGKAP 3: SA03 - Template Tata Naskah Dinas
File: FIELDS/SA03_fields.csv

CSV
field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
template_code,Kode Template,varchar,20,true,true,NULL,uppercase,NULL,Kode unik template (contoh: SK-001)
jenis_naskah,Jenis Naskah,enum,NULL,true,false,NULL,none,"SK,SE,ST,SU,ND,MEMO,BA,LAP,SP,SKET",Jenis surat/naskah dinas
nama_template,Nama Template,varchar,255,true,false,NULL,none,NULL,Nama template (contoh: SK Pembentukan Tim)
deskripsi,Deskripsi,text,NULL,false,false,NULL,none,NULL,Penjelasan kapan template digunakan
kop_surat,Kop Surat,text,NULL,true,false,NULL,none,NULL,HTML kop surat resmi
template_content,Isi Template,text,NULL,true,false,NULL,none,NULL,HTML template dengan placeholder {{variable}}
footer,Footer,text,NULL,false,false,NULL,none,NULL,Footer surat (tanda tangan dll)
penandatangan_default,Penandatangan Default,enum,NULL,true,false,kepala_dinas,none,"kepala_dinas,sekretaris,kepala_bidang",Siapa yang default tanda tangan
auto_numbering_format,Format Nomor Otomatis,varchar,100,true,false,NULL,none,NULL,Format: XXX/{{JENIS}}/DP-MALUT/{{BULAN_ROMAWI}}/{{TAHUN}}
placeholders,Placeholders,json,NULL,false,false,NULL,none,NULL,JSON daftar placeholder yang bisa digunakan
version,Versi,int,11,true,false,1,none,NULL,Versi template (untuk tracking perubahan)
is_active,Status Aktif,boolean,NULL,true,false,1,none,NULL,Template masih digunakan atau tidak
created_by,Dibuat Oleh,int,11,true,false,NULL,none,NULL,User ID (FK ke users.id)
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
Save sebagai: FIELDS/SA03_fields.csv

CONTOH LENGKAP 4: SA04 - Repositori Peraturan
File: FIELDS/SA04_fields.csv

CSV
field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
jenis_peraturan,Jenis Peraturan,enum,NULL,true,false,NULL,none,"UU,PP,Perpres,Permen,Pergub,Perkada,SK_Kadis,Pedoman,SOP,Lainnya",Jenis peraturan perundang-undangan
nomor_peraturan,Nomor Peraturan,varchar,100,true,false,NULL,none,NULL,Contoh: UU No. 18 Tahun 2012
tahun,Tahun,int,4,true,false,NULL,none,NULL,Tahun peraturan ditetapkan
judul,Judul/Tentang,text,NULL,true,false,NULL,none,NULL,Judul lengkap peraturan
ringkasan,Ringkasan,text,NULL,false,false,NULL,none,NULL,Ringkasan isi peraturan
file_path,File PDF,varchar,255,false,false,NULL,none,NULL,Path file PDF peraturan (upload)
file_size,Ukuran File,int,11,false,false,NULL,none,NULL,Ukuran file dalam KB
status,Status,enum,NULL,true,false,berlaku,none,"berlaku,dicabut,diubah",Status berlaku peraturan
tags,Tags,json,NULL,false,false,NULL,none,NULL,Tag/keyword untuk search (JSON array)
dicabut_oleh,Dicabut Oleh,varchar,255,false,false,NULL,none,NULL,Peraturan yang mencabut (jika status=dicabut)
mengubah,Mengubah,varchar,255,false,false,NULL,none,NULL,Peraturan yang diubah (jika ada)
diubah_oleh,Diubah Oleh,varchar,255,false,false,NULL,none,NULL,Peraturan yang mengubah (jika status=diubah)
download_count,Jumlah Download,int,11,true,false,0,none,NULL,Tracking popularitas
uploaded_by,Diupload Oleh,int,11,true,false,NULL,none,NULL,User ID (FK ke users.id)
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
Save sebagai: FIELDS/SA04_fields.csv

CONTOH LENGKAP 5: SA05 - User Management
File: FIELDS/SA05_fields.csv

CSV
field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
username,Username,varchar,50,true,true,NULL,lowercase_alphanumeric,NULL,Username untuk login (huruf kecil tanpa spasi)
email,Email,varchar,100,true,true,NULL,email,NULL,Email resmi dinas
password,Password,varchar,255,true,false,NULL,none,NULL,Password terenkripsi (bcrypt)
role,Role,enum,NULL,true,false,pelaksana,none,"super_admin,kepala_dinas,kepala_bidang,kepala_uptd,kasubbag,pelaksana",Hak akses user
unit_kerja,Unit Kerja,varchar,255,true,false,NULL,none,NULL,Sekretariat / Bidang X / UPTD
nama_lengkap,Nama Lengkap,varchar,255,false,false,NULL,none,NULL,Nama lengkap user
nip,NIP,varchar,18,false,false,NULL,nip_18_digit,NULL,Nomor Induk Pegawai (jika ASN)
no_hp,No. HP,varchar,20,false,false,NULL,phone,NULL,Nomor HP untuk notifikasi
foto_profil,Foto Profil,varchar,255,false,false,NULL,none,NULL,Path file foto profil (upload)
status,Status,enum,NULL,true,false,aktif,none,"aktif,nonaktif,suspended",Status akun user
last_login,Login Terakhir,timestamp,NULL,false,false,NULL,none,NULL,Kapan terakhir login
login_count,Jumlah Login,int,11,true,false,0,none,NULL,Tracking aktivitas
created_by,Dibuat Oleh,int,11,false,false,NULL,none,NULL,User ID Super Admin yang buat akun (FK users.id)
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
deleted_at,Dihapus Pada,timestamp,NULL,false,false,NULL,none,NULL,Soft delete (NULL jika tidak dihapus)
Save sebagai: FIELDS/SA05_fields.csv

CONTOH LENGKAP 6: SA06 - Audit Trail
File: FIELDS/SA06_fields.csv

CSV
field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
user_id,User ID,int,11,false,false,NULL,none,NULL,ID user yang melakukan aksi (FK users.id atau NULL jika system)
username,Username,varchar,50,false,false,NULL,none,NULL,Username (denormalized untuk performa query)
role,Role,varchar,50,false,false,NULL,none,NULL,Role user saat aksi dilakukan
action,Aksi,varchar,50,true,false,NULL,none,NULL,"create, update, delete, login, logout, approve, reject, bypass, export, print"
module,Modul,varchar,100,true,false,NULL,none,NULL,Modul mana yang diakses (contoh: asn atau komoditas)
record_id,Record ID,int,11,false,false,NULL,none,NULL,ID record yang diakses/diubah (NULL jika action=login)
old_value,Nilai Lama,json,NULL,false,false,NULL,none,NULL,JSON data sebelum perubahan (untuk action=update)
new_value,Nilai Baru,json,NULL,false,false,NULL,none,NULL,JSON data setelah perubahan (untuk action=update/create)
ip_address,IP Address,varchar,45,false,false,NULL,none,NULL,IP address user (support IPv6)
user_agent,User Agent,text,NULL,false,false,NULL,none,NULL,Browser/device info
is_bypass,Bypass Koordinasi?,boolean,NULL,true,false,0,none,NULL,Apakah aksi ini bypass alur koordinasi?
description,Deskripsi,text,NULL,false,false,NULL,none,NULL,Deskripsi detail aksi (auto-generated)
created_at,Waktu Aksi,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,Kapan aksi dilakukan
Save sebagai: FIELDS/SA06_fields.csv

CONTOH LENGKAP 7: SA07 - System Configuration
File: FIELDS/SA07_fields.csv

CSV
field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
config_key,Config Key,varchar,100,true,true,NULL,uppercase_underscore,NULL,Kunci konfigurasi (contoh: KGB_INTERVAL_YEARS)
config_value,Nilai,text,NULL,true,false,NULL,none,NULL,Nilai konfigurasi (bisa string/number/JSON)
config_type,Tipe Data,enum,NULL,true,false,string,none,"string,number,boolean,json",Tipe data nilai
category,Kategori,enum,NULL,true,false,general,none,"general,kepegawaian,inflasi,sppg,notification,ai,security",Kategori konfigurasi
label,Label,varchar,255,true,false,NULL,none,NULL,Label yang tampil di UI (Indonesia)
description,Deskripsi,text,NULL,false,false,NULL,none,NULL,Penjelasan fungsi konfigurasi
is_editable,Bisa Diedit?,boolean,NULL,true,false,1,none,NULL,Apakah Super Admin bisa edit via UI?
is_sensitive,Sensitif?,boolean,NULL,true,false,0,none,NULL,Apakah data sensitif (password API key dll)?
validation_rule,Aturan Validasi,varchar,255,false,false,NULL,none,NULL,Regex atau aturan validasi
default_value,Nilai Default,text,NULL,false,false,NULL,none,NULL,Nilai default jika reset
updated_by,Diperbarui Oleh,int,11,false,false,NULL,none,NULL,User ID yang terakhir edit (FK users.id)
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
Save sebagai: FIELDS/SA07_fields.csv

CONTOH LENGKAP 8: SA08 - Backup & Restore
File: FIELDS/SA08_fields.csv

CSV
field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
backup_type,Tipe Backup,enum,NULL,true,false,manual,none,"auto,manual,before_update",Otomatis atau manual trigger
backup_name,Nama Backup,varchar,255,true,false,NULL,none,NULL,Nama file backup (auto-generated atau custom)
file_path,Path File,varchar,255,true,false,NULL,none,NULL,Lokasi file backup di server
file_size,Ukuran File,bigint,20,true,false,NULL,none,NULL,Ukuran file dalam bytes
compression,Kompresi,enum,NULL,true,false,gzip,none,"none,gzip,zip",Metode kompresi file
database_name,Nama Database,varchar,100,true,false,NULL,none,NULL,Database yang di-backup
tables_included,Tabel yang Di-backup,json,NULL,false,false,NULL,none,NULL,JSON array nama tabel (NULL = semua tabel)
status,Status,enum,NULL,true,false,pending,none,"pending,in_progress,completed,failed",Status proses backup
error_message,Error Message,text,NULL,false,false,NULL,none,NULL,Pesan error jika status=failed
backup_duration,Durasi,int,11,false,false,NULL,none,NULL,Lama proses backup (detik)
is_encrypted,Terenkripsi?,boolean,NULL,true,false,0,none,NULL,Apakah file di-encrypt?
retention_days,Retensi (Hari),int,11,true,false,30,none,NULL,Berapa hari backup disimpan sebelum auto-delete
created_by,Dibuat Oleh,int,11,false,false,NULL,none,NULL,User ID (FK users.id atau NULL jika auto)
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
Save sebagai: FIELDS/SA08_fields.csv

CONTOH LENGKAP 9: SA09 - Dashboard Compliance
File: FIELDS/SA09_fields.csv

CSV
field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
periode,Periode,date,NULL,true,false,NULL,none,NULL,Bulan periode monitoring (format: YYYY-MM-01)
total_transactions,Total Transaksi,int,11,true,false,0,none,NULL,Jumlah total transaksi di sistem bulan ini
bypass_count,Jumlah Bypass,int,11,true,false,0,none,NULL,Jumlah kasus bypass koordinasi
bypass_percentage,Persentase Bypass,decimal,"5,2",true,false,0,none,NULL,Persentase bypass dari total transaksi
compliance_percentage,Persentase Compliance,decimal,"5,2",true,false,100,none,NULL,100% - bypass_percentage
target_compliance,Target Compliance,decimal,"5,2",true,false,100,none,NULL,Target yang ditetapkan (default 100%)
status,Status,enum,NULL,true,false,on_target,none,"on_target,warning,critical",Status compliance vs target
bypass_details,Detail Bypass,json,NULL,false,false,NULL,none,NULL,JSON array detail kasus bypass (user module timestamp)
top_violators,Top Violators,json,NULL,false,false,NULL,none,NULL,JSON user yang paling sering bypass
remedial_actions,Tindakan Perbaikan,text,NULL,false,false,NULL,none,NULL,Catatan tindakan yang sudah dilakukan
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
Save sebagai: FIELDS/SA09_fields.csv

CONTOH LENGKAP 10: SA10 - AI Configuration
File: FIELDS/SA10_fields.csv

CSV
field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
ai_service,Layanan AI,enum,NULL,true,false,openai,none,"openai,gemini,custom",Provider AI yang digunakan
api_key,API Key,varchar,255,false,false,NULL,none,NULL,API Key (encrypted di database)
api_endpoint,API Endpoint,varchar,255,false,false,NULL,url,NULL,Custom endpoint jika pakai self-hosted
model_name,Nama Model,varchar,100,true,false,gpt-4,none,NULL,Model yang digunakan (gpt-4 gemini-pro dll)
temperature,Temperature,decimal,"3,2",true,false,0.5,none,NULL,Kreativitas AI (0.0 - 1.0)
max_tokens,Max Tokens,int,11,true,false,1000,none,NULL,Panjang maksimal response AI
features_enabled,Fitur yang Aktif,json,NULL,true,false,NULL,none,NULL,JSON array: document_classification text_extraction narrative_generation chat
classification_accuracy,Akurasi Klasifikasi,decimal,"5,2",false,false,NULL,none,NULL,Akurasi AI (tracking untuk improvement)
total_requests,Total Request,bigint,20,true,false,0,none,NULL,Jumlah request ke AI API
total_cost,Total Biaya,decimal,"15,2",true,false,0,none,NULL,Total biaya penggunaan AI (USD)
monthly_budget,Budget Bulanan,decimal,"15,2",false,false,100,none,NULL,Budget maksimal per bulan (USD)
is_active,Status Aktif,boolean,NULL,true,false,1,none,NULL,AI aktif atau tidak
last_health_check,Health Check Terakhir,timestamp,NULL,false,false,NULL,none,NULL,Kapan terakhir cek koneksi ke AI
updated_by,Diperbarui Oleh,int,11,false,false,NULL,none,NULL,User ID (FK users.id)
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
Save sebagai: FIELDS/SA10_fields.csv

📋 BAGIAN III: CHECKLIST SETELAH BUAT 10 FILE
Setelah Anda buat 10 file CSV di atas, cek:

Folder FIELDS/ sudah dibuat
10 file CSV (SA01 sampai SA10) sudah ada di folder FIELDS/
Setiap file punya minimal kolom: field_name, field_label, field_type, is_required
Setiap file punya field id (auto_increment) sebagai primary key
Setiap file punya field created_at dan updated_at (timestamp)
🎯 TUGASNYA UNTUK ANDA:

1. Buat file 00_MASTER_MODUL_CONFIG.csv

Copy contoh yang saya berikan (10 rows untuk SA01-SA10)
Save di root folder (sejajar dengan folder FIELDS/) 2. Buat 10 file di folder FIELDS/

SA01_fields.csv sampai SA10_fields.csv
Copy persis dari contoh saya di atas 3. Screenshot struktur folder Anda

Saya mau lihat apakah struktur sudah benar
⏭️ SETELAH SELESAI:
Setelah Anda buat 10 file CSV tersebut, konfirmasi ke saya:

Ketik: "10 FILE CSV SUPER ADMIN SUDAH SELESAI"

Lalu saya akan:

✅ Ajari Anda cara buat CSV untuk modul Kepegawaian (M001-M010)
✅ Ajari Anda cara buat CSV untuk modul Bidang lainnya
✅ Berikan tool/script untuk validate CSV (cek error)
✅ Berikan tool/script untuk auto-generate code dari CSV
Silakan mulai buat 10 file CSV untuk Super Admin sekarang!
