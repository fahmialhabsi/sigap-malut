# Pengecualian untuk Auth Endpoints

Catatan: Endpoint identitas dan otentikasi (/api/auth/\* — mis. /login, /profile, /refresh) dikecualikan dari pemeriksaan module-level authorization yang diatur melalui master-data. Alasan:

- Endpoint ini adalah bagian infrastruktur identitas; akses harus bergantung pada token (authentication) — bukan pada konfigurasi modul bisnis.
- Untuk menghindari cache yang menyebabkan klien melihat data lama, response /api/auth/profile menambahkan header Cache-Control: no-store, no-cache, must-revalidate.

Perubahan ini didokumentasikan agar tidak terjadi ketidaksinkronan antara implementasi dan dokumenSistem.
