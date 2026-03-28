# PROMPT SPESIFIKASI — DASHBOARD PELAKSANA
## SIGAP MALUT · Sistem Informasi Terintegrasi Dinas Pangan Provinsi Maluku Utara

---

## 1. IDENTITAS ROLE

| Atribut | Nilai |
|---------|-------|
| Role Code | `pelaksana` |
| Role Level | 3 |
| Unit | Sekretariat — berbagai sub bagian |
| Jabatan | Pelaksana / Staf Administrasi |
| e-Pelara Role | PELAKSANA |
| Melapor Ke | Kasubag Umum & Kepegawaian (administrasi) ATAU Fungsional (teknis) |
| Fungsi | Input data harian, membuat surat, mengarsip dokumen, menyelesaikan tugas |

---

## 2. POSISI DAN FUNGSI

Pelaksana adalah **garis terdepan operasional** sekretariat. Mereka yang menginput data, membuat surat, mengarsip dokumen, dan menyelesaikan tugas harian yang kemudian diverifikasi oleh Kasubag/Fungsional sebelum naik ke Sekretaris.

### Dua Tipe Pelaksana:

#### Pelaksana di bawah Sekretaris (Langsung)
- Tugas umum: surat-menyurat, arsip, administrasi dinas
- Mendapat tugas dari: Sekretaris atau Kasubag Umum & Kepegawaian
- Laporan ke: Kasubag Umum & Kepegawaian

#### Pelaksana di bawah Kasubag Umum & Kepegawaian
- Tugas spesifik: kepegawaian, perlengkapan, rumah tangga
- Mendapat tugas dari: Kasubag Umum & Kepegawaian
- Laporan ke: Kasubag Umum & Kepegawaian

---

## 3. ALUR KERJA PELAKSANA

```
[Terima Tugas]
  → Kasubag/Fungsional buat perintah/tugas → ke Pelaksana
  → Pelaksana terima notif → buka dashboard
  → Tab "Tugas Saya" → lihat detail tugas
  → Klik "Mulai Kerjakan" → status: dalam_proses

[Input Data / Buat Dokumen]
  → Pelaksana input data sesuai modul (SEK-ADM, SEK-HUM, dll)
  → Save → status: draft
  → Lampirkan file pendukung jika ada
  → Klik "Submit untuk Review" → status: in_review
  → Notif ke Kasubag untuk verifikasi

[Jika Dokumen Dikembalikan]
  → Notif dari Kasubag: "Dokumen dikembalikan — ada catatan"
  → Buka notif → lihat catatan perbaikan
  → Edit dokumen → submit ulang

[Selesaikan Tugas]
  → Setelah dokumen diverifikasi → tugas otomatis mark selesai
  → ATAU Pelaksana klik "Selesai" dengan lampiran bukti

[Buat Surat Keluar]
  → Tab "Surat Keluar"
  → Buat draft surat → pilih template → isi konten
  → Lampirkan file pendukung
  → Submit ke Kasubag → Kasubag verif → Sekretaris TTD
```

---

## 4. INFORMASI DAN DATA WAJIB

### 4.1 KPI Pelaksana

| Indikator | Keterangan |
|-----------|------------|
| Tugas Aktif | Jumlah tugas belum selesai |
| Tugas Selesai Hari Ini | Capaian harian |
| Tugas Overdue | Lewat deadline |
| Dokumen Draft Belum Submit | Perlu segera disubmit |
| Dokumen Dikembalikan | Perlu perbaikan |
| Surat Keluar Draft | Surat belum disubmit ke Kasubag |
| Notifikasi Belum Dibaca | Jumlah notif baru |
| Absensi Hari Ini | Status: hadir/terlambat/izin |

### 4.2 Modul yang Dikerjakan Pelaksana

Tergantung unit, Pelaksana dapat mengakses:

| Modul | Akses Pelaksana |
|-------|-----------------|
| SEK-ADM | Input surat masuk, buat surat keluar draft |
| SEK-HUM | Input data absensi, update data pegawai |
| SEK-KBJ | Input berkas KGB pegawai |
| SEK-KEP | Input data SKP |
| SEK-LDS | Distribusi dokumen |
| SEK-LUP | Pengajuan barang/perlengkapan |
| SEK-RMH | Pemeliharaan/rumah tangga |
| SEK-AST | Input penerimaan/pengeluaran barang (support Bend. Barang) |

### 4.3 Tabs Dashboard Pelaksana

1. **Ringkasan** — KPI tiles, tugas hari ini, notifikasi terbaru
2. **Tugas Saya** — list tugas aktif + selesai + overdue; detail per tugas
3. **Surat & Dokumen** — surat masuk yang perlu diproses + buat surat keluar
4. **Modul Kerja** — shortcut ke modul yang dikerjakan Pelaksana
5. **Notifikasi** — semua notifikasi (tugas, feedback, broadcast)

---

## 5. ERD — TABEL PELAKSANA

```sql
-- Pelaksana menggunakan tabel Tasks yang sudah ada
-- Tabel tasks sudah memiliki:
-- id, judul, deskripsi, status, assignee_id, due_date, unit_kerja, dll
-- (ditambahkan dari spesifikasi Gubernur via ALTER TABLE tasks)

-- Dokumen yang dibuat Pelaksana → masing-masing tabel modul (surat_masuk, surat_keluar, dll)
-- Semuanya sudah ada dalam migrasi 20260322-create-*

-- Notifikasi sudah ada di tabel notifications

-- Tidak perlu tabel baru khusus untuk Pelaksana
-- Pelaksana adalah consumer dari sistem yang sudah ada
```

---

## 6. API DESIGN — PELAKSANA

```yaml
# Tugas
GET    /api/tasks?assignee_id=:userId              — Tugas yang di-assign ke pelaksana ini
PUT    /api/tasks/:id/mulai                        — Mark mulai kerjakan
PUT    /api/tasks/:id/selesai                      — Mark selesai + upload bukti
PUT    /api/tasks/:id/update                       — Update progress + catatan

# Surat Masuk (proses)
GET    /api/surat/masuk?assigned_to=:userId        — Surat yang didisposisikan ke pelaksana
PUT    /api/surat/masuk/:id/proses                 — Mark sudah diproses / catat tindakan

# Surat Keluar (buat draft)
POST   /api/surat/keluar/create                    — Buat draft surat keluar
PUT    /api/surat/keluar/:id                       — Edit draft
POST   /api/surat/keluar/:id/submit                — Submit ke Kasubag
GET    /api/surat/keluar?created_by=:userId        — Surat keluar buatan pelaksana ini

# Notifikasi
GET    /api/notifications?user_id=:userId          — Semua notif pelaksana
PUT    /api/notifications/:id/read                 — Mark sudah dibaca
GET    /api/notifications/unread-count             — Jumlah notif belum baca

# Dashboard Pelaksana
GET    /api/dashboard/pelaksana/summary            — KPI harian pelaksana
GET    /api/dashboard/pelaksana/tugas-aktif        — Tugas belum selesai + deadline
GET    /api/dashboard/pelaksana/absensi-today      — Status absensi hari ini
```

---

## 7. STRUKTUR FOLDER REACT + EXPRESS

```
frontend/src/
├── pages/dashboard/
│   └── pelaksana-sekretariat.jsx                  # Main Dashboard Pelaksana Sekretariat
├── components/pelaksana/
│   ├── TugasPelaksanaPanel.jsx                    # List tugas + aksi mulai/selesai
│   ├── SuratMasukProsesPanel.jsx                  # Surat yang perlu diproses
│   ├── SuratKeluarDraftPanel.jsx                  # Buat + edit + submit surat keluar
│   ├── ModulShortcutPanel.jsx                     # Quick access ke modul SEK
│   └── NotifikasiPanel.jsx                        # Panel notifikasi lengkap

backend/
├── controllers/
│   └── dashboardPelaksanaController.js             # KPI, tugas aktif, absensi
```

---

## 8. WORKFLOW LOGIKA PELAKSANA

```
[Mulai Hari — Cek Tugas]
  → Login → dashboard terbuka di tab "Ringkasan"
  → Lihat: X tugas aktif, Y overdue (merah), Z notif baru
  → Klik tab "Tugas Saya" → sort by deadline
  → Klik tugas teratas → detail: judul, instruksi, deadline, file lampiran
  → Klik "Mulai Kerjakan" → status: dalam_proses → atasan dapat notif

[Submit Dokumen untuk Review]
  → Kerjakan sesuai instruksi
  → Input data di modul terkait (misal: SEK-ADM untuk surat)
  → Lampirkan bukti/file
  → Klik "Submit untuk Review" → notif ke Kasubag
  → Status: in_review (tidak bisa edit lagi)
  → Tunggu feedback dari Kasubag

[Jika Dikembalikan]
  → Notif merah: "Tugas dikembalikan — lihat catatan"
  → Klik notif → buka detail tugas → lihat catatan Kasubag
  → Edit dan perbaiki
  → Submit ulang → notif ke Kasubag lagi

[Buat Surat Keluar]
  1. Tab "Surat & Dokumen" → klik "Buat Surat Keluar"
  2. Pilih template surat (permohonan/undangan/pemberitahuan/dll)
  3. Isi: perihal, tanggal, tujuan, isi surat
  4. Preview → Save Draft
  5. Upload lampiran jika ada
  6. Submit ke Kasubag → Kasubag verif → Sekretaris TTD
  7. Pelaksana dapat notif "Surat sudah ditandatangani — siap kirim"
```

---

## 9. UI DESIGN

**Warna scheme:** Biru Sedang + Abu-Abu Bersih — `primary: "#1565C0"`, `secondary: "#546E7A"`

**Header:** sticky, gradient biru sedang, nama Pelaksana, unit kerja, badge tugas overdue (merah), badge notif, absensi chip (hadir/terlambat)

**Desain Prinsip:** Sederhana dan fokus — Pelaksana butuh antarmuka yang langsung to-the-point, tidak perlu dashboard kompleks

**Tabs:**
1. `ringkasan` — 6 KPI tiles kecil, to-do list tugas hari ini (sorted by deadline), 5 notif terbaru
2. `tugas` — tabel tugas dengan warna status (hijau/kuning/merah), tombol aksi
3. `surat` — surat masuk yang perlu ditindak + tab surat keluar draft
4. `modul` — grid shortcut 8 modul yang dikerjakan pelaksana (icon besar)
5. `notifikasi` — full list notif + mark all read

**Mobile-Friendly:** Pelaksana sering kerja di lapangan — responsif adalah prioritas

**Footer:** "SIGAP-MALUT © 2026 · Dashboard Pelaksana · Sekretariat"

---

## 10. PERBEDAAN PELAKSANA DI BAWAH SEKRETARIS VS KASUBAG

| Aspek | Pelaksana → Sekretaris | Pelaksana → Kasubag |
|-------|----------------------|---------------------|
| Pemberi Tugas | Sekretaris atau Kasubag | Kasubag Umum & Kepegawaian |
| Jenis Tugas | Lebih umum/koordinatif | Lebih spesifik/kepegawaian |
| Laporan Ke | Kasubag (first check) | Kasubag Umum & Kepegawaian |
| Akses Modul | Semua SEK | SEK-ADM, SEK-HUM, SEK-KBJ, SEK-RMH |
| Dashboard File | `pelaksana-sekretariat.jsx` | `pelaksana-sekretariat.jsx` (same) |

**Catatan Implementasi:** Kedua tipe Pelaksana menggunakan dashboard yang sama (`pelaksana-sekretariat.jsx`). Perbedaan di level data: modul yang bisa diakses dikontrol oleh `roleModuleMapping.json` dan konfigurasi `unit_kerja` user.

---

## 11. CATATAN PROFESIONAL

- **No Approval Power:** Pelaksana tidak punya kewenangan approve dokumen — hanya bisa input dan submit
- **Deadline Awareness:** Sistem tampilkan countdown timer untuk tugas mendekati deadline
- **Dokumen Locked:** Dokumen yang sudah di-submit ke Kasubag tidak bisa diedit sendiri oleh Pelaksana
- **Activity Log:** Setiap aksi Pelaksana (mulai tugas, submit, upload) tercatat di audit_log
- **SLA Pelaksana:** Tugas harus dikerjakan max 1×24 jam setelah diterima (untuk tugas normal) atau segera (untuk tugas prioritas kritis)
- **Notifikasi Overdue:** Jika tugas lewat deadline, alert merah otomatis + notif ke Kasubag
