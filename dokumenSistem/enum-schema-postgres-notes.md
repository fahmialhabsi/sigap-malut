# ENUM PostgreSQL dan Sequelize

## Risiko `sequelize.sync()` di PostgreSQL

Model yang memakai `DataTypes.ENUM(...)` dapat memicu Sequelize menjalankan perintah seperti **`ALTER TYPE ... ADD VALUE IF NOT EXISTS`** saat sync/introspeksi, tergantung versi dan perbandingan model vs database.

Banyak model modul laporan di repo ini mendefinisikan ENUM panjang (mis. BDS/BKT/BKS). **Di production**, matikan sync (`DB_SYNC_ON_BOOT=0`) dan terapkan perubahan nilai ENUM melalui **migrasi SQL eksplisit** agar:

- perubahan tereview di PR,
- tidak ada kejutan saat boot,
- rollback dapat dirancang.

## Sumber kebenaran

- **Skema production:** migrasi di `backend/migrations/*.cjs` + revisi manual yang tercatat.
- **Model Sequelize:** mencerminkan kode aplikasi; jangan mengandalkan sync di prod untuk “menyelaraskan” ENUM baru.

## Rekomendasi praktis

1. Tambah nilai ENUM baru → buat migrasi `queryInterface.sequelize.query('ALTER TYPE ...')` atau setara.
2. Hindari mengubah daftar ENUM di model lalu mengandalkan `sync()` di server shared.
3. Set `DB_SYNC_ON_BOOT=0` di semua environment Postgres yang bukan eksperimen lokal tunggal.
