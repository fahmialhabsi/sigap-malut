# Master Data Modul Layanan Dinas Pangan Provinsi Maluku Utara

## A. Struktur Klasifikasi Layanan

| Bidang      | Nama Layanan                    | Kategori    | Aktif |
| ----------- | ------------------------------- | ----------- | ----- |
| Sekretariat | Registrasi Pegawai              | Internal    | Ya    |
| Kepegawaian | Pengajuan Cuti                  | Internal    | Ya    |
| Keuangan    | Pengajuan SPJ                   | Keuangan    | Ya    |
| Distribusi  | Monitoring Distribusi Komoditas | Operasional | Ya    |
| UPTD        | Uji Laboratorium                | External    | Ya    |

## B. Spesifikasi Entitas Layanan

| Field                   | Tipe Data    | Mandatory | Deskripsi                   |
| ----------------------- | ------------ | --------- | --------------------------- |
| id_layanan              | UUID         | Y         | Primary Key                 |
| kode_layanan            | VARCHAR(12)  | Y         | Unik per layanan            |
| nama_layanan            | VARCHAR(120) | Y         |                             |
| bidang_penanggung_jawab | ENUM         | Y         | FK ke master bidang         |
| deskripsi               | TEXT         | N         |                             |
| jenis_output            | ENUM         | Y         | {Dokumen, SK, Data, Barang} |
| SLA                     | INT (Hari)   | Y         | Standar SLA                 |
| aktif                   | BOOLEAN      | Y         |                             |
| created_at              | TIMESTAMP    | Y         | Otomatis                    |
| updated_at              | TIMESTAMP    | Y         | Otomatis                    |

## C. Lifecycle Layanan

Draft → Diajukan → Diverifikasi → Disetujui → Selesai → Arsip

## D. Role Mapping

| Layanan               | Role Input | Role Verifikasi | Role Finalisasi |
| --------------------- | ---------- | --------------- | --------------- |
| Pengajuan Cuti        | Pegawai    | Atasan          | Admin           |
| Pengajuan SPJ         | Bendahara  | KaBag           | Kepala Dinas    |
| Monitoring Distribusi | Petugas    | Admin           | Kepala Bidang   |

## E. Relasi Sistem

- `id_layanan` FK di tabel SPJ, tabel cuti, tabel distribusi
- Relasi ke master user (id_pengguna), ke dokumen, dashboard, webhook eksternal, integrasi SSO/SPBE

## F. KPI Per Layanan

| Layanan        | Jumlah Permohonan | Rata2 Waktu | % Penyelesaian | SLA |
| -------------- | ----------------- | ----------- | -------------- | --- |
| Pengajuan Cuti | 93                | 3.2 hari    | 98%            | 2   |
| Pengajuan SPJ  | 150               | 7.7 hari    | 88%            | 5   |
