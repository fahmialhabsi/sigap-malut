# Backend Notes

## Update Schema (SQLite)

Jika sudah ada database SQLite lama, perubahan enum (misalnya jenis_naskah dan status) perlu menerapkan ulang schema.

Opsi cepat untuk environment dev:

1. Hentikan server.
2. Hapus file database SQLite lama (mis. `database.sqlite`).
3. Jalankan ulang proses init/seed agar schema baru terbentuk.

Jika ingin menjaga data lama, buat migrasi manual dengan membuat tabel baru, copy data, lalu rename tabel.
