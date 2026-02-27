# 05-Data-Dictionary

| Entitas      | Field                   | Tipe Data | Relasi      | Mandatory/Optional |
| ------------ | ----------------------- | --------- | ----------- | ------------------ |
| layanan      | id_layanan              | UUID      | PK          | Mandatory          |
|              | kode_layanan            | String    |             | Mandatory          |
|              | nama_layanan            | String    |             | Mandatory          |
|              | bidang_penanggung_jawab | String    | FK: bidang  | Mandatory          |
|              | deskripsi               | Text      |             | Optional           |
|              | jenis_output            | String    |             | Mandatory          |
|              | SLA                     | Integer   |             | Mandatory          |
|              | aktif                   | Boolean   |             | Mandatory          |
|              | created_at              | Timestamp |             | Mandatory          |
|              | updated_at              | Timestamp |             | Mandatory          |
| user         | id_user                 | UUID      | PK          | Mandatory          |
|              | nama                    | String    |             | Mandatory          |
|              | role                    | String    | FK: role    | Mandatory          |
|              | bidang                  | String    | FK: bidang  | Mandatory          |
| approval_log | id                      | UUID      | PK          | Mandatory          |
|              | layanan_id              | UUID      | FK: layanan | Mandatory          |
|              | reviewer_id             | UUID      | FK: user    | Mandatory          |
|              | action                  | String    |             | Mandatory          |
|              | catatan                 | Text      |             | Optional           |
|              | timestamp               | Timestamp |             | Mandatory          |

---

### user

| Field        | Tipe Data | FK/Relasi  | Keterangan                     |
| ------------ | --------- | ---------- | ------------------------------ |
| id_user      | UUID      | PK         | Identitas unik user            |
| kode_user    | String    |            | Kode user (unik, opsional)     |
| username     | String    |            | Username login                 |
| email        | String    |            | Email user                     |
| password     | String    |            | Password hash (terenkripsi)    |
| role_id      | String    | FK: role   | Role/level user                |
| bidang_id    | String    | FK: bidang | Unit/bidang kerja user         |
| nama_lengkap | String    |            | Nama lengkap                   |
| nip          | String    |            | NIP (jika ASN, opsional)       |
| no_hp        | String    |            | Nomor HP                       |
| foto_profil  | String    |            | Path atau URL foto user        |
| status       | String    |            | Status: aktif/nonaktif/suspend |
| created_at   | Timestamp |            | Waktu pembuatan akun           |
| updated_at   | Timestamp |            | Terakhir diperbarui            |
| last_login   | Timestamp |            | Terakhir login                 |

---

### pegawai

| Field         | Tipe Data | FK/Relasi  | Keterangan                    |
| ------------- | --------- | ---------- | ----------------------------- |
| id_pegawai    | String    | PK         | ID unik pegawai               |
| nama_lengkap  | String    |            | Nama lengkap                  |
| nip           | String    |            | NIP ASN                       |
| jabatan       | String    |            | Jabatan (misal: Kasubbag)     |
| grade         | String    |            | Golongan/grade/pangkat        |
| role_id       | String    | FK: role   | Peran struktural/fungsional   |
| bidang_id     | String    | FK: bidang | Unit/bidang                   |
| status        | String    |            | Aktif / tidak aktif / pensiun |
| jenis_kelamin | String    |            | Misal: Laki-laki/Perempuan    |
| alamat        | String    |            | Alamat tinggal                |
| email         | String    |            | Email pegawai                 |
| no_hp         | String    |            | Nomor HP pegawai              |
| created_at    | Timestamp |            | Waktu input                   |
| updated_at    | Timestamp |            | Terakhir update data          |

---

### bidang

| Field       | Tipe Data | FK/Relasi | Keterangan                          |
| ----------- | --------- | --------- | ----------------------------------- |
| id_bidang   | String    | PK        | ID unik bidang/unit kerja           |
| kode_bidang | String    |           | Kode resmi bidang (misal: SEK, KEU) |
| nama_bidang | String    |           | Nama bidang/unit organisasi         |
| jenis       | String    |           | Struktural/Fungsional               |
| unit_eselon | String    |           | Eselon III/IV dsb                   |
| created_at  | Timestamp |           | Waktu pembuatan                     |

---

### role

| Field      | Tipe Data | FK/Relasi | Keterangan                                   |
| ---------- | --------- | --------- | -------------------------------------------- |
| id_role    | String    | PK        | ID role/akses (misal: SEK, KEP, BND, STF)    |
| kode_role  | String    |           | Kode role (bisa = id_role atau alias)        |
| nama_role  | String    |           | Nama peran/role resmi                        |
| permission | Text      |           | List permission (grant akses: CRUD, approve) |
| level      | Integer   |           | Level/hierarki role/approval (misal: 1–5)    |
| created_at | Timestamp |           | Waktu pembuatan role                         |

---
