// scripts/generate_fields_M001_M009.js
// Usage: node scripts/generate_fields_M001_M009.js
import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, "master-data", "FIELDS");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const files = {
  "FIELDS_M001.csv": `field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
nip,NIP,varchar,18,true,true,NULL,nip_18_digit,NULL,Nomor Induk Pegawai 18 digit
nama_lengkap,Nama Lengkap,varchar,255,true,false,NULL,none,NULL,Nama lengkap (dengan gelar)
gelar,Gelar Depan / Belakang,varchar,100,false,false,NULL,none,NULL,Gelar akademik/profesional
tempat_lahir,Tempat Lahir,varchar,100,false,false,NULL,none,NULL,
tanggal_lahir,Tanggal Lahir,date,NULL,false,false,NULL,none,NULL,Format YYYY-MM-DD
jenis_kelamin,Jenis Kelamin,enum,NULL,false,false,NULL,none,"Laki-Laki,Perempuan",Jenis kelamin
agama,Agama,enum,NULL,false,false,NULL,none,"Islam,Kristen,Katolik,Hindu,Budha,Kepercayaan,Lainnya",Agama
alamat,Alamat,text,NULL,false,false,NULL,none,NULL,Alamat domisili
unit_kerja,Unit Kerja,enum,NULL,true,false,NULL,none,"Sekretariat,UPTD,Bidang Ketersediaan,Bidang Distribusi,Bidang Konsumsi",Unit kerja
jabatan,Jabatan,varchar,255,false,false,NULL,none,NULL,Jabatan / posisi
pangkat,Pangkat,varchar,100,false,false,NULL,none,NULL,Pangkat terakhir
golongan,Golongan,varchar,10,false,false,NULL,none,NULL,Golongan ruang
tanggal_pengangkatan,Tanggal Pengangkatan,date,NULL,false,false,NULL,none,NULL,
tanggal_kgb_berikutnya,Tanggal KGB Berikutnya,date,NULL,false,false,NULL,none,NULL,Tanggal kenaikan gaji berikutnya
status,Status,enum,NULL,true,false,aktif,none,"aktif,nonaktif,pensiun",Status ASN
is_active,Status Aktif,boolean,NULL,true,false,1,none,NULL,Flag aktif
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
`,
  "FIELDS_M002.csv": `field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
asn_id,ASN ID,int,11,true,false,NULL,none,NULL,FK ke tabel asn
nip,NIP,varchar,18,true,false,NULL,nip_18_digit,NULL,Denormalized NIP
nama_asn,Nama ASN,varchar,255,false,false,NULL,none,NULL,Denormalized nama
tanggal_jatuh_tempo,Tanggal Jatuh Tempo,date,NULL,true,false,NULL,none,NULL,Tanggal KGB
days_until_due,Days Until Due,int,11,false,false,NULL,none,NULL,Kalau perlu pre-compute
status,Status,enum,NULL,true,false,pending,none,"pending,notified,completed,overdue",Status tracking
penanggung_jawab,Penanggung Jawab,varchar,255,false,false,NULL,none,NULL,PIC
catatan,Catatan,text,NULL,false,false,NULL,none,NULL,Catatan administrasi
reminder_sent,Reminder Terkirim,boolean,NULL,false,false,0,none,NULL,Flag notifikasi
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
`,
  "FIELDS_M003.csv": `field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
asn_id,ASN ID,int,11,true,false,NULL,none,NULL,FK ke tabel asn
nip,NIP,varchar,18,true,false,NULL,nip_18_digit,NULL,Denormalized NIP
nama_asn,Nama ASN,varchar,255,false,false,NULL,none,NULL,Denormalized nama
jenis_kenaikan,Jenis Kenaikan,enum,NULL,true,false,NULL,none,"reguler,promosi,penghargaan",Jenis kenaikan
tanggal_usulan,Tanggal Usulan,date,NULL,false,false,NULL,none,NULL,Tanggal usulan
tanggal_efektif,Tanggal Efektif,date,NULL,false,false,NULL,none,NULL,Tanggal berlaku pangkat
nomor_sk,Nomor SK,varchar,100,false,true,NULL,none,NULL,Nomor SK pangkat
status,Status,enum,NULL,true,false,pending,none,"pending,approved,rejected",Status proses
catatan,Catatan,text,NULL,false,false,NULL,none,NULL,
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
`,
  "FIELDS_M004.csv": `field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
asn_id,ASN ID,int,11,true,false,NULL,none,NULL,FK ke tabel asn
nip,NIP,varchar,18,true,false,NULL,nip_18_digit,NULL,Denormalized NIP
nama_asn,Nama ASN,varchar,255,false,false,NULL,none,NULL,Denormalized nama
jenis_penghargaan,Jenis Penghargaan,varchar,255,true,false,NULL,none,NULL,Contoh: Penghargaan 10 tahun
tanggal_penghargaan,Tanggal Penghargaan,date,NULL,true,false,NULL,none,NULL,
nomor_sk,Nomor SK,varchar,100,false,false,NULL,none,NULL,SK penghargaan
penanggung_jawab,Penanggung Jawab,varchar,255,false,false,NULL,none,NULL,
keterangan,Keterangan,text,NULL,false,false,NULL,none,NULL,
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
`,
  "FIELDS_M005.csv": `field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
asn_id,ASN ID,int,11,true,false,NULL,none,NULL,FK ke tabel asn
nip,NIP,varchar,18,true,false,NULL,nip_18_digit,NULL,
nama_asn,Nama ASN,varchar,255,false,false,NULL,none,NULL,
jenis_cuti,Jenis Cuti,enum,NULL,true,false,NULL,none,"Tahunan,Sakit,Besar,Melahirkan,Alasan Penting,Luar Tanggungan Negara",Jenis cuti
tanggal_mulai,Tanggal Mulai,date,NULL,true,false,NULL,none,NULL,
tanggal_selesai,Tanggal Selesai,date,NULL,true,false,NULL,none,NULL,
lama_hari,Lama Cuti,int,11,false,false,NULL,none,NULL,Jumlah hari
alasan,Alasan,text,NULL,false,false,NULL,none,NULL,
status,Status,enum,NULL,true,false,pending,none,"pending,approved,rejected,cancelled",Status
pengganti,NIP Pengganti,varchar,18,false,false,NULL,nip_18_digit,NULL,NIP pengganti sementara (opsional)
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
`,
  "FIELDS_M006.csv": `field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
asn_id,ASN ID,int,11,true,false,NULL,none,NULL,FK ke tabel asn
nip,NIP,varchar,18,true,false,NULL,nip_18_digit,NULL,
nama_asn,Nama ASN,varchar,255,false,false,NULL,none,NULL,
nomor_sppd,Nomor SPPD,varchar,100,false,false,NULL,none,NULL,
nomor_st,Nomor ST,varchar,100,false,false,NULL,none,NULL,
tujuan,Tujuan,varchar,255,false,false,NULL,none,NULL,
keperluan,Keperluan,text,NULL,false,false,NULL,none,NULL,
tanggal_berangkat,Tanggal Berangkat,date,NULL,true,false,NULL,none,NULL,
tanggal_kembali,Tanggal Kembali,date,NULL,true,false,NULL,none,NULL,
lama_hari,Lama Hari,int,11,false,false,NULL,none,NULL,
biaya_transport,Transport(decimal),decimal,"15,2",false,false,NULL,none,NULL,
biaya_penginapan,Penginapan(decimal),decimal,"15,2",false,false,NULL,none,NULL,
uang_harian,Uang Harian(decimal),decimal,"15,2",false,false,NULL,none,NULL,
status,Status,enum,NULL,true,false,pending,none,"pending,approved,completed",Status perjalanan
file_sppd,File SPPD,varchar,255,false,false,NULL,none,NULL,Path file upload
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
`,
  "FIELDS_M007.csv": `field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
asn_id,ASN ID,int,11,false,false,NULL,none,NULL,FK ke tabel asn (peserta)
nip,NIP,varchar,18,false,false,NULL,nip_18_digit,NULL,
nama_asn,Nama ASN,varchar,255,false,false,NULL,none,NULL,
nama_diklat,Nama Diklat,varchar,255,true,false,NULL,none,NULL,
penyelenggara,Penyelenggara,varchar,255,false,false,NULL,none,NULL,
lokasi,Lokasi,varchar,255,false,false,NULL,none,NULL,
tanggal_mulai,Tanggal Mulai,date,NULL,true,false,NULL,none,NULL,
tanggal_selesai,Tanggal Selesai,date,NULL,false,false,NULL,none,NULL,
durasi_hari,Durasi Hari,int,11,false,false,NULL,none,NULL,
sertifikat,Sertifikat,varchar,255,false,false,NULL,none,NULL,Path file sertifikat
status,Status,enum,NULL,true,false,registered,none,"registered,attended,completed,cancelled",Status peserta
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
`,
  "FIELDS_M008.csv": `field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
asn_id,ASN ID,int,11,true,false,NULL,none,NULL,FK ke tabel asn
nip,NIP,varchar,18,true,false,NULL,nip_18_digit,NULL,
nama_asn,Nama ASN,varchar,255,false,false,NULL,none,NULL,
tahun,Tahun,int,4,true,false,NULL,none,NULL,
periode,Periode,varchar,50,false,false,NULL,none,NULL,
nilai_skp,Nilai SKP,decimal,"5,2",false,false,NULL,none,NULL,
predikat,Predikat,enum,NULL,false,false,NULL,none,"Sangat Baik,Baik,Cukup,Kurang,Buruk",Predikat kinerja
keterangan,Keterangan,text,NULL,false,false,NULL,none,NULL,
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
`,
  "FIELDS_M009.csv": `field_name,field_label,field_type,field_length,is_required,is_unique,default_value,validation,dropdown_options,help_text
id,ID,auto_increment,11,true,true,NULL,none,NULL,Primary Key
nip,NIP,varchar,18,true,true,NULL,nip_18_digit,NULL,Nomor Induk Pegawai
nama_lengkap,Nama Lengkap,varchar,255,true,false,NULL,none,NULL
tempat_lahir,Tempat Lahir,varchar,100,false,false,NULL,none,NULL
tanggal_lahir,Tanggal Lahir,date,NULL,false,false,NULL,none,NULL
jenis_kelamin,Jenis Kelamin,enum,NULL,false,false,NULL,none,"Laki-Laki,Perempuan",Jenis kelamin
agama,Agama,enum,NULL,false,false,NULL,none,"Islam,Kristen,Katolik,Hindu,Budha,Kepercayaan",Agama
pendidikan_terakhir,Pendidikan Terakhir,varchar,255,false,false,NULL,none,NULL
unit_kerja,Unit Kerja,varchar,255,false,false,NULL,none,NULL
jabatan,Jabatan,varchar,255,false,false,NULL,none,NULL
pangkat,Pangkat,varchar,100,false,false,NULL,none,NULL
golongan,Golongan,varchar,10,false,false,NULL,none,NULL
tanggal_pengangkatan,Tanggal Pengangkatan,date,NULL,false,false,NULL,none,NULL
tanggal_pensiun,Tanggal Pensiun,date,NULL,false,false,NULL,none,NULL
status_kepegawaian,Status Kepegawaian,enum,NULL,false,false,aktif,none,"aktif,nonaktif,pensiun",Status
file_dokumen,File Dokumen,json,NULL,false,false,NULL,none,NULL,Paths to supporting docs
created_at,Dibuat Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
updated_at,Diperbarui Pada,timestamp,NULL,true,false,CURRENT_TIMESTAMP,none,NULL,
`,
};

for (const [fname, content] of Object.entries(files)) {
  const p = path.join(outDir, fname);
  fs.writeFileSync(p, content, "utf8");
  console.log("Wrote", p);
}

console.log("All files written to", outDir);
