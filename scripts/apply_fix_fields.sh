#!/usr/bin/env bash
set -euo pipefail

echo "== Backup existing files (to ./backup_fields_$(date +%s)) =="
backup_dir="./backup_fields_$(date +%s)"
mkdir -p "$backup_dir"
cp -v master-data/FIELDS/FIELDS_M001.csv "$backup_dir/" || true
cp -v master-data/FIELDS/FIELDS_M007.csv "$backup_dir/" || true
cp -v master-data/FIELDS/FIELDS_M009.csv "$backup_dir/" || true
echo "Backup done -> $backup_dir"

echo "== Overwriting files =="
cat > master-data/FIELDS/FIELDS_M001.csv <<'CSV'
field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
nip,NIP,varchar,18,true,true,NULL,nip_18_digit,NULL,Nomor Induk Pegawai 18 digit
nama_lengkap,Nama Lengkap,varchar,255,true,false,NULL,none,NULL,Nama lengkap (dengan gelar)
gelar,Gelar Depan / Belakang,varchar,100,false,false,NULL,none,NULL,Gelar akademik/profesional
tempat_lahir,Tempat Lahir,varchar,100,false,false,NULL,none,NULL,
tanggal_lahir,Tanggal Lahir,date,NULL,false,false,NULL,none,NULL,Format YYYY-MM-DD
jenis_kelamin,Jenis Kelamin,enum,NULL,false,false,NULL,none,"Laki-Laki,Perempuan",Jenis kelamin
agama,Agama,enum,NULL,false,false,NULL,none,"Islam,Kristen,Katolik,Hindu,Budha,Kepercayaan,Lainnya",Agama
email,Email,varchar,255,false,false,NULL,email,NULL,Alamat email ASN
phone,Telepon,varchar,32,false,false,NULL,phone,NULL,Nomor telepon/HP
alamat,Alamat,text,NULL,false,false,NULL,none,NULL,Alamat domisili
unit_kerja,Unit Kerja,enum,NULL,true,false,NULL,none,"Sekretariat,UPTD,Bidang Ketersediaan,Bidang Distribusi,Bidang Konsumsi",Unit kerja
jabatan,Jabatan,varchar,255,false,false,NULL,none,NULL,Jabatan / posisi
pangkat,Pangkat,varchar,100,false,false,NULL,none,NULL,Pangkat terakhir
golongan,Golongan,varchar,10,false,false,NULL,none,NULL,Golongan ruang
tanggal_pengangkatan,Tanggal Pengangkatan,date,NULL,false,false,NULL,none,NULL,
tanggal_kgb_berikutnya,Tanggal KGB Berikutnya,date,NULL,false,false,NULL,none,NULL,Tanggal kenaikan gaji berikutnya
status,Status,enum,NULL,true,false,aktif,none,"aktif,nonaktif,pensiun",Status ASN
is_active,Status Aktif,boolean,NULL,true,false,1,none,NULL,Flag aktif
is_sensitive,Tingkat Sensitivitas,enum,NULL,true,false,Biasa,none,"Biasa,Sensitif",Klasifikasi data
created_by,Dibuat Oleh,int,11,true,false,NULL,none,NULL,User ID
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
CSV

cat > master-data/FIELDS/FIELDS_M007.csv <<'CSV'
field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
asn_id,ASN ID,int,11,false,false,NULL,none,NULL,FK ke tabel asn (peserta)
nip,NIP,varchar,18,false,false,NULL,nip_18_digit,NULL,Denormalized NIP
nama_asn,Nama ASN,varchar,255,false,false,NULL,none,NULL,Denormalized nama
nama_diklat,Nama Diklat,varchar,255,true,false,NULL,none,NULL,Nama diklat/pelatihan
penyelenggara,Penyelenggara,varchar,255,false,false,NULL,none,NULL,Organisasi penyelenggara
lokasi,Lokasi,varchar,255,false,false,NULL,none,NULL,Tempat pelaksanaan
tanggal_mulai,Tanggal Mulai,date,NULL,true,false,NULL,none,NULL,Format YYYY-MM-DD
tanggal_selesai,Tanggal Selesai,date,NULL,false,false,NULL,none,NULL,Format YYYY-MM-DD
durasi_hari,Durasi Hari,int,11,false,false,NULL,none,NULL,Lama pelatihan dalam hari
sertifikat,Sertifikat,varchar,255,false,false,NULL,none,NULL,Path/filename sertifikat
peserta_status,Status Peserta,enum,NULL,false,false,registered,none,"registered,attended,completed,cancelled",Status peserta
biaya,Biaya,decimal,"15,2",false,false,NULL,none,NULL,Total biaya (jika ada)
catatan,Catatan,text,NULL,false,false,NULL,none,NULL,Catatan tambahan
is_sensitive,Tingkat Sensitivitas,enum,NULL,true,false,Biasa,none,"Biasa,Sensitif",Klasifikasi data
created_by,Dibuat Oleh,int,11,true,false,NULL,none,NULL,User ID pembuat
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
CSV

cat > master-data/FIELDS/FIELDS_M009.csv <<'CSV'
field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
nip,NIP,varchar,18,true,true,NULL,nip_18_digit,NULL,Nomor Induk Pegawai
nama_lengkap,Nama Lengkap,varchar,255,true,false,NULL,none,NULL
tempat_lahir,Tempat Lahir,varchar,100,false,false,NULL,none,NULL
tanggal_lahir,Tanggal Lahir,date,NULL,false,false,NULL,none,NULL
jenis_kelamin,Jenis Kelamin,enum,NULL,false,false,NULL,none,"Laki-Laki,Perempuan",Jenis kelamin
agama,Agama,enum,NULL,false,false,NULL,none,"Islam,Kristen,Katolik,Hindu,Budha,Kepercayaan",Agama
email,Email,varchar,255,false,false,NULL,email,NULL,Alamat email ASN
phone,Telepon,varchar,32,false,false,NULL,phone,NULL,Nomor telepon/HP
pendidikan_terakhir,Pendidikan Terakhir,varchar,255,false,false,NULL,none,NULL
unit_kerja,Unit Kerja,varchar,255,false,false,NULL,none,NULL
jabatan,Jabatan,varchar,255,false,false,NULL,none,NULL
pangkat,Pangkat,varchar,100,false,false,NULL,none,NULL
golongan,Golongan,varchar,10,false,false,NULL,none,NULL
tanggal_pengangkatan,Tanggal Pengangkatan,date,NULL,false,false,NULL,none,NULL
tanggal_pensiun,Tanggal Pensiun,date,NULL,false,false,NULL,none,NULL
status_kepegawaian,Status Kepegawaian,enum,NULL,false,false,aktif,none,"aktif,nonaktif,pensiun",Status
alamat_ktp,Alamat KTP,text,NULL,false,false,NULL,none,NULL,Alamat resmi
file_dokumen,File Dokumen,json,NULL,false,false,NULL,none,NULL,Paths to supporting docs
is_sensitive,Tingkat Sensitivitas,enum,NULL,true,false,Biasa,none,"Biasa,Sensitif",Klasifikasi data
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
CSV

echo "== Files written. Preview heads =="
head -n 20 master-data/FIELDS/FIELDS_M001.csv
echo "-----"
head -n 20 master-data/FIELDS/FIELDS_M007.csv
echo "-----"
head -n 20 master-data/FIELDS/FIELDS_M009.csv

echo "== Stage & commit changes =="
git add master-data/FIELDS/FIELDS_M001.csv master-data/FIELDS/FIELDS_M007.csv master-data/FIELDS/FIELDS_M009.csv
read -p "Enter commit message (or press Enter to use default): " cm
cm=${cm:-"fix(fields): update FIELDS_M007 (diklat) and add contacts/sensitivity to M001/M009"}
git commit -m "$cm"

echo "== Done. Review with 'git show --name-only HEAD' then 'git push' when ready =="