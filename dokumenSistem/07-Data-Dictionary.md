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
