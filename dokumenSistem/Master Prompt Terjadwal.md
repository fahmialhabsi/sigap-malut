Karena ini untuk persiapan dini audit formal pemerintah, maka saya akan susun paket lengkap yang bisa langsung Anda gunakan sebagai “program 90 hari transformasi sistem”.

Saya bagi menjadi 4 bagian besar sesuai permintaan Anda, dan setiap prompt sudah ditambahkan klausul WAJIB:

Jika kode tidak lengkap → wajib dilengkapi full + sebutkan folder & file

Jika kekurangan banyak → wajib buat generator 1-klik auto-fix

Semua hasil kode & generator dipisah agar bisa langsung copy–paste

📅 1️⃣ TIMELINE DETAIL 90 HARI (MINGGUAN)
🎯 Target Akhir:

Tidak ada temuan KRITIS

Skor kesiapan audit ≥ 85%

Siap simulasi Inspektorat

🔴 FASE 1 — HARDENING KRITIS (MINGGU 1–4)
Minggu 1

Audit ulang RBAC seluruh route

Hapus semua hardcoded role

Buat middleware authorizeByRole universal

Minggu 2

Perbaiki semua foreign key

Hilangkan input manual entitas relasional

Refactor master-data jadi single source

Minggu 3

Audit trail full before-after

Tambahkan entity_id, entity_type

Pastikan log immutable

Minggu 4

Tutup seluruh endpoint tanpa proteksi

Implementasi deny-by-default

Testing regresi

🎯 Target akhir fase: Tidak ada temuan KRITIS teknis

🟠 FASE 2 — GOVERNANCE & CONTROL (MINGGU 5–8)
Minggu 5

Segregation of Duties validation

Pisahkan role pembuat & approver

Minggu 6

Centralized role-module config

Refactor frontend & backend

Minggu 7

Implement token expiry & refresh

Tambahkan rate limiting

Minggu 8

Audit evidence export

Generate laporan audit per user/modul

🎯 Target akhir fase: Governance ≥ 80%

🟢 FASE 3 — ENTERPRISE MATURITY (MINGGU 9–12)
Minggu 9

API standardisasi (OpenAPI doc)

Versioning endpoint

Minggu 10

Environment separation check

Secret management refactor

Minggu 11

Logging strategy & monitoring readiness

Error handler global

Minggu 12

Simulasi audit formal

Generate laporan akhir kesiapan

🎯 Target akhir: Skor akhir ≥ 85%

📋 2️⃣ CHECKLIST TEKNIS SIAP EKSEKUSI (PROMPT OTOMATIS)

Gunakan ini setiap minggu.

🔥 PROMPT CHECKLIST OTOMATIS + AUTO FIX
MODE: GOVERNMENT AUTO-COMPLIANCE EXECUTOR
BAHASA: INDONESIA FORMAL AUDIT
WAJIB EVIDENCE-BASED
WAJIB AUTO-FIX

TUGAS:
Audit seluruh sistem sesuai fase roadmap saat ini.

WAJIB:

1. Jika ditemukan kode tidak lengkap:
   - Wajib buat versi lengkapnya
   - Sebutkan folder dan nama file
   - Tulis isi file FULL
   - Pisahkan dalam blok terpisah agar bisa copy–paste

2. Jika ditemukan banyak kekurangan sistemik:
   - Wajib buat GENERATOR AUTO-FIX
   - Generator harus:
     - Membuat file yang hilang
     - Memperbaiki middleware
     - Membuat folder master-data
     - Menambahkan audit log lengkap
   - Generator ditulis terpisah dalam satu file script
   - Sertakan nama folder dan file
   - Siap dijalankan 1 kali

3. Semua hasil perbaikan dipisahkan:
   - Bagian A: Laporan Temuan
   - Bagian B: Patch File Individual
   - Bagian C: Generator Auto-Compliance

4. Tidak boleh hanya memberi saran.
   Harus menghasilkan kode siap pakai.

OUTPUT:

1. Ringkasan
2. Temuan
3. Patch Individual
4. Generator Lengkap
5. Skor setelah perbaikan
   📊 3️⃣ TEMPLATE MONITORING COMPLIANCE PROGRES

Gunakan ini setiap akhir minggu.

📈 TEMPLATE DASHBOARD PROGRES
MODE: GOVERNMENT COMPLIANCE PROGRESS MONITOR
BAHASA: INDONESIA

TUGAS:
Evaluasi progres compliance dibanding minggu sebelumnya.

OUTPUT FORMAT:

1. Skor Minggu Ini
2. Skor Minggu Lalu
3. Delta Perubahan
4. Daftar Temuan Ditutup
5. Daftar Temuan Baru
6. Area Risiko Tertinggi
7. Prediksi Skor Audit Jika Dilakukan Hari Ini
8. Estimasi Kesiapan (BELUM SIAP / CUKUP / SIAP / SANGAT SIAP)

WAJIB:
Jika skor < 80%:

- Buat rencana perbaikan 7 hari ke depan
- Jika temuan > 10 item → buat generator percepatan
  🏛 4️⃣ SIMULASI PERTANYAAN INSPEKTORAT + JAWABAN RESMI

Gunakan sebelum audit resmi.

🎓 PROMPT SIMULASI INSPEKTORAT
MODE: SIMULASI AUDIT INSPEKTORAT PEMERINTAH
BAHASA: INDONESIA FORMAL

TUGAS:
Simulasikan 25 pertanyaan audit yang biasanya muncul pada:

- Inspektorat
- Evaluasi SPBE
- Pemeriksaan tata kelola TI

UNTUK SETIAP PERTANYAAN:

1. Pertanyaan Auditor
2. Jawaban Resmi Institusi
3. Bukti Sistem (file/path/log)
4. Risiko Jika Tidak Ada
5. Status (AMAN / PERLU PERBAIKAN)

WAJIB:
Jika ditemukan jawaban belum kuat:

- Buat perbaikan sistem
- Tulis patch lengkap
- Jika perlu, buat generator penguatan sistem
  🔥 FITUR WAJIB YANG SUDAH DITAMBAHKAN

Semua prompt di atas sekarang memiliki:

✅ Auto-complete code jika tidak lengkap
✅ Wajib tulis folder & nama file
✅ Generator 1-klik jika kekurangan banyak
✅ Output dipisah untuk copy–paste
✅ Tidak boleh hanya analisis

🎯 Strategi Terbaik Untuk Anda Sekarang

Karena ini persiapan dini:

Minggu ini:
Jalankan PROMPT HARDENING + AUTO FIX

Setelah itu:
Gunakan TEMPLATE MONITORING tiap minggu

Bulan ke-3:
Jalankan SIMULASI INSPEKTORAT
