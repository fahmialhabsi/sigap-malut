# ROLE_GOVERNANCE

Tujuan

- Menetapkan daftar role canonical yang dipakai oleh seluruh sistem (backend, frontend, master-data, serviceRegistry) dan kebijakan perubahan role.

Canonical roles (contoh)

- super_admin
- kepala_dinas
- sekretaris
- kepala_bidang
- kepala_uptd
- kasubbag
- fungsional
- pelaksana
- bendahara
- guest

Aturan dan kebijakan

1. Semua layanan, CSV, model, UI harus merujuk ke role canonical di atas.
2. Jika nama role di frontend/serviceRegistry berbeda, wajib didefinisikan mapping di `docs/templates/role-mapping.json`.
3. Perubahan nama role (rename) berisiko dan hanya boleh dilakukan lewat proses approval (lihat `docs/policies/APPROVAL_MATRIX.md`).
4. Role baru hanya dapat ditambahkan setelah ada entry di `ROLE_GOVERNANCE` dan acceptance tests.

How generator uses this file

- Jika role-mapping.json tersedia dan disetujui, generator akan:
  - menormalisasi serviceRegistry.json & frontend constants (jika mode apply diaktifkan)
  - membuat migration script untuk memperbarui `users.role` (dengan backup + approval)
