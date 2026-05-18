# Catatan simulasi API (otomatis)

- Waktu: 2026-04-04T03:17:26.804Z
- Base URL: http://127.0.0.1:5000/api
- **Bukan pengujian tombol UI** — hanya endpoint REST. Tombol di React perlu dicek manual di browser.
- **Aktor** dipilih dari DB: email seed @example.com dipakai jika ada; kalau tidak, pengguna aktif pertama per peran (urutan `id`).
- Seed default **tidak** memuat Kepala Dinas; skrip memakai **kadis.sim@example.com** (dibuat otomatis jika belum ada).
- DB campuran (email lain selain seed): gunakan **SIM_RESET_DEMO_PASSWORD=1** agar login pakai `SIM_DEMO_PASSWORD` (default Password123), atau isi password yang benar di `SIM_DEMO_PASSWORD`.

## 0. Koneksi & user demo

- Aktor: Gubernur=`gubernur@example.com` · Sekretaris=`sekretaris@dinpangan.go.id` · Kasubag=`kasubag.uk@example.com` · Pelaksana=`pelaksana.a@example.com`
(DB) Password diset ulang ke SIM_DEMO_PASSWORD untuk 5 alamat email (SIM_RESET_DEMO_PASSWORD=1).
(DB) User demo Kepala Dinas sudah ada: id=460
- ✅ Login HTTP untuk keempat peran (token OK)

## 1. Gubernur — instruksi

- ✅ **POST /gubernur/instruksi (draf)** — HTTP 200 — OK
  - id instruksi: **8**
- ✅ **PUT /gubernur/instruksi/:id/status (diterbitkan)** — HTTP 200 — OK

## 2. Kepala Dinas — inbox Gubernur

- ✅ **GET /kadin/inbox-gubernur** — HTTP 200 — OK
  - jumlah item: 2
- ✅ **POST /kadin/inbox-gubernur/:id/konfirmasi (baca)** — HTTP 200 — OK

## 3. Kepala Dinas — perintah ke Sekretaris (Task)

- ✅ **POST /kadin/perintah** — HTTP 200 — OK
  - task id: **27**

## 4. Sekretaris — delegasi ke Kasubag (tanpa /accept)

- ✅ **POST /tasks/:id/assign → Kasubag** — HTTP 200 — OK

## 5. Kasubag — terima & assign Pelaksana

- ✅ **POST /tasks/:id/accept (Kasubag)** — HTTP 200 — OK
- ✅ **POST /tasks/:id/assign → Pelaksana** — HTTP 200 — OK

## 6. Pelaksana — accept, start, submit

- ✅ **POST /tasks/:id/accept (Pelaksana)** — HTTP 200 — OK
- ✅ **POST /tasks/:id/start** — HTTP 200 — OK
- ✅ **POST /tasks/:id/submit** — HTTP 200 — OK

## 7. Diskusi tugas (TaskDiscussion)

- ✅ **GET /tasks/discussion-list (Sekretaris)** — HTTP 200 — OK
- ✅ **GET /tasks/discussion-history (Sekretaris)** — HTTP 200 — OK
- ✅ **POST /tasks/discussion** — HTTP 201 — OK

## 8. Dashboard Sekretaris (perbaikan terbaru)

- ✅ **GET /sekretaris/dashboard/summary** — HTTP 200 — OK
- ✅ **GET /sekretaris/dashboard/kgb-alert/count** — HTTP 200 — OK

## Kesimpulan

- Alur **API** yang terhubung: login multi-peran → instruksi → inbox kadis → perintah → task assign/accept/submit → diskusi.
- **UI**: setiap tombol di dashboard harus dicocokkan dengan endpoint di atas; error jaringan 502 ke e-Pelara terpisah dari alur tugas.

## Cermin langkah UI (manual)

1. Login sebagai Gubernur → buat instruksi (draf) → terbitkan.
2. Login Kepala Dinas (kadis.sim atau akun `kepala_dinas` Anda) → buka inbox Gubernur → konfirmasi baca.
3. Buat perintah ke Sekretaris (assign ke user Sekretaris yang sama dengan API).
4. Login Sekretaris → **Delegasikan (assign)** ke Kasubag — **jangan** klik Terima setelah delegasi (biarkan status tugas `assigned` untuk Kasubag).
5. Login Kasubag → Terima → Assign ke Pelaksana.
6. Login Pelaksana → Terima → Mulai kerja → Submit.
7. Sekretaris: panel diskusi / riwayat komunikasi tugas (mirror GET/POST discussion).
8. Dashboard Sekretaris: ringkasan & hitungan alert KGB.
- Tombol spesifik React tidak diuji oleh skrip ini; cocokkan dengan daftar endpoint di bagian atas catatan.

_File: dokumenSistem/CATATAN-SIMULASI-API.md — dihasilkan oleh `node backend/scripts/simulasi-alur-api.mjs`._
