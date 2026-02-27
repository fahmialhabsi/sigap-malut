Backend skeleton: generators, services, middleware, utils.

Next steps:

- Populate Sequelize models per `config/serviceRegistry.json`.
- Wire `authController` into routes and register middleware in `server.js`.
- Persist audit logs to `audit_log` table and implement approval_log.

# Backend Notes

## Update Schema (SQLite)

Jika sudah ada database SQLite lama, perubahan enum (misalnya jenis_naskah dan status) perlu menerapkan ulang schema.

Opsi cepat untuk environment dev:

1. Hentikan server.
2. Hapus file database SQLite lama (mis. `database.sqlite`).
3. Jalankan ulang proses init/seed agar schema baru terbentuk.

## Seeder (opsi cepat untuk dev)

Jika `npm run seed` (default) gagal karena perbedaan environment, gunakan skrip seeder langsung yang telah diuji:

```bash
# Jalankan seeder master/module langsung (tidak menjalankan user seeder)
npm --prefix backend run seed:master-direct
```

Skrip ini memanggil `backend/scripts/runMasterSeederDirect.mjs` dan akan mengisi tabel master dan contoh modul SA01–SA10. Gunakan ini untuk setup lokal cepat.

Jika ingin menjaga data lama, buat migrasi manual dengan membuat tabel baru, copy data, lalu rename tabel.

Jika Anda ingin memastikan schema terbaru diterapkan sebelum seeder, jalankan perintah berikut (migrasi lalu seeder):

```bash
# Jalankan migrasi lalu seeder master yang teruji
npm --prefix backend run seed:master-direct
```
 
## Post-seed verification (quick)

Setelah menjalankan `seed:master-direct` di environment development lokal, sebaiknya periksa bahwa tabel SA09 dan SA10 berisi setidaknya satu baris sample. Contoh pengecekan cepat:

```bash
# dari root repo
npm --prefix backend run seed:master-direct
node backend/scripts/checkSA09SA10.mjs
```

Jika sukses, output akan menunjukkan:

- `compliance_tracking count: 1`
- `ai_config count: 1`

Gunakan langkah ini setelah seeder untuk verifikasi cepat bahwa SA09/SA10 telah diterapkan.
