# PROMPT SPESIFIKASI — DASHBOARD KASUBAG UMUM & KEPEGAWAIAN
## SIGAP MALUT · Sistem Informasi Terintegrasi Dinas Pangan Provinsi Maluku Utara

---

## 1. IDENTITAS ROLE

| Atribut | Nilai |
|---------|-------|
| Role Code | `kasubag_umum_kepegawaian` |
| Role Level | 5 (setara kepala_bidang) |
| Unit | Sub Bagian Umum dan Kepegawaian — Sekretariat |
| Jabatan | Kepala Sub Bagian Umum dan Kepegawaian |
| e-Pelara Role | MUDA |
| Melapor Ke | Sekretaris Dinas |
| Membawahi | Pelaksana Sub Bagian Umum & Kepegawaian |

---

## 2. POSISI DAN FUNGSI

Kasubag Umum & Kepegawaian adalah **verifikator administrasi** di sekretariat. Menerima hasil kerja dari Pelaksana/Fungsional, memverifikasi kelengkapan dan kebenaran dokumen, lalu meneruskan ke Sekretaris untuk approval akhir.

### Fungsi Utama:
1. **Administrasi Umum** — surat masuk/keluar, kearsipan, rumah tangga
2. **Kepegawaian** — absensi, KGB, SKP, cuti, mutasi, pensiun
3. **Verifikasi Administrasi** — cek kelengkapan dokumen sebelum naik ke Sekretaris
4. **Pengawasan Pelaksana** — membagi tugas ke Pelaksana, pantau penyelesaian

---

## 3. ALUR PERINTAH (CHAIN OF COMMAND)

### 3.1 Sekretaris → Kasubag (Menerima Perintah)

```
SEKRETARIS buat perintah → ke_role: kasubag_umum_kepegawaian
  → Kasubag terima notif → buka panel "Perintah Masuk"
  → Klik "Terima" → proses atau delegasikan ke Pelaksana
  → Update progress → laporkan ke Sekretaris
```

### 3.2 Kasubag → Pelaksana (Membagi Tugas)

```
KASUBAG buat perintah/tugas → ke_role: pelaksana
  → Pelaksana terima, kerjakan, kirim laporan
  → Kasubag verifikasi hasil → setujui/kembalikan
  → Jika OK → forward ke Sekretaris untuk approval akhir
```

### 3.3 Alur Verifikasi Dokumen

```
[Pelaksana input dokumen kepegawaian / administrasi]
  → Status: draft → in_review
  → Kasubag buka panel "Perlu Verifikasi"
  → Review kelengkapan dokumen
  → Jika lengkap → Kasubag mark "Terverifikasi" → kirim ke Sekretaris
  → Jika tidak lengkap → kembalikan ke Pelaksana + catatan
```

---

## 4. INFORMASI DAN DATA WAJIB

### 4.1 KPI Kasubag Umum & Kepegawaian

| Indikator | Sumber | Threshold |
|-----------|--------|-----------|
| Surat Masuk Belum Diproses | SEK-ADM | > 5 = Warning |
| Dokumen Belum Diverifikasi | Semua modul SEK | > 3 = Warning |
| Pegawai Hadir (%) | SEK-HUM | < 95% = Warning |
| KGB Pending Proses | SEK-KBJ | > 2 = Warning |
| SKP Belum Lengkap | SEK-KEP | > 0 di bulan berjalan |
| Tugas Pelaksana Pending | Tasks outbound | > 5 = Alert |
| Cuti Belum Diproses | SEK-HUM | > 1 = Warning |
| Laporan Tepat Waktu (%) | SEK-LKS | < 85% = Warning |

### 4.2 Modul yang Dikelola

| Modul | Fungsi |
|-------|--------|
| SEK-ADM | Administrasi & kearsipan surat |
| SEK-HUM | Data pegawai, absensi, cuti |
| SEK-KBJ | Kenaikan berkala & jabatan |
| SEK-KEP | SKP, penilaian kinerja |
| SEK-LDS | Distribusi dokumen & layanan |
| SEK-LUP | Layanan umum & perlengkapan |
| SEK-RMH | Rumah tangga & fasilitas |
| SEK-AST | Pencatatan aset |

### 4.3 Tabs Dashboard Kasubag

1. **Ringkasan** — KPI tiles, aktivitas hari ini, tugas pending bawahan
2. **Perintah** — Masuk (dari Sekretaris) + Keluar (ke Pelaksana)
3. **Verifikasi** — daftar dokumen menunggu verifikasi Kasubag
4. **Administrasi** — surat masuk/keluar, kearsipan
5. **Kepegawaian** — absensi, KGB, SKP, cuti
6. **Laporan** — rekapitulasi modul per periode

---

## 5. ERD — TABEL PENDUKUNG

```sql
-- Absensi Pegawai (jika belum ada)
CREATE TABLE IF NOT EXISTS absensi (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     INTEGER NOT NULL,
  tanggal     DATE NOT NULL,
  jam_masuk   TIME,
  jam_keluar  TIME,
  status      VARCHAR(20) DEFAULT 'hadir',
  -- hadir|terlambat|izin|cuti|sakit|alpha
  keterangan  TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Pengajuan Cuti
CREATE TABLE IF NOT EXISTS pengajuan_cuti (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         INTEGER NOT NULL,
  jenis_cuti      VARCHAR(30) NOT NULL, -- tahunan|sakit|melahirkan|alasan_penting
  tanggal_mulai   DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  alasan          TEXT,
  status          VARCHAR(20) DEFAULT 'pending', -- pending|disetujui|ditolak
  disetujui_oleh  INTEGER,
  catatan_atasan  TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Link dokumen verifikasi ke Kasubag
ALTER TABLE surat_masuk ADD COLUMN IF NOT EXISTS
  verified_by_kasubag_at TIMESTAMP;
ALTER TABLE surat_masuk ADD COLUMN IF NOT EXISTS
  verified_by_kasubag_user_id INTEGER;
```

---

## 6. API DESIGN — KASUBAG UMUM & KEPEGAWAIAN

```yaml
# Perintah
GET    /api/perintah/masuk?ke_role=kasubag_umum_kepegawaian   — Perintah dari Sekretaris
PUT    /api/perintah/:id/terima
PUT    /api/perintah/:id/tindak-lanjut
POST   /api/perintah/:id/ajukan-ke-sekretaris
POST   /api/perintah                                           — Buat perintah ke Pelaksana

# Verifikasi Dokumen
GET    /api/dokumen/perlu-verifikasi?unit=sekretariat          — List dokumen belum diverif
PUT    /api/dokumen/:id/verifikasi                             — Mark terverifikasi
PUT    /api/dokumen/:id/kembalikan                             — Kembalikan ke Pelaksana

# Kepegawaian
GET    /api/kepegawaian/absensi?tanggal=today                  — Absensi hari ini
GET    /api/kepegawaian/kgb?status=pending                     — KGB pending proses
PUT    /api/kepegawaian/kgb/:id/proses                         — Proses KGB
GET    /api/kepegawaian/skp?status=belum_lengkap               — SKP belum lengkap
GET    /api/kepegawaian/cuti?status=pending                    — Pengajuan cuti pending
PUT    /api/kepegawaian/cuti/:id/setujui                       — Setujui cuti
PUT    /api/kepegawaian/cuti/:id/tolak                         — Tolak cuti + alasan

# Administrasi Surat
GET    /api/surat/masuk?status=belum_diproses&unit=sekretariat
PUT    /api/surat/masuk/:id/proses                             — Mark sudah diproses
GET    /api/surat/keluar?unit=sekretariat

# Dashboard Kasubag
GET    /api/dashboard/kasubag/summary                          — 8 KPI kasubag
GET    /api/dashboard/kasubag/kepegawaian                      — Status kepegawaian realtime
GET    /api/dashboard/kasubag/tugas-bawahan                    — Tasks pelaksana di bawahnya
```

---

## 7. STRUKTUR FOLDER REACT + EXPRESS

```
frontend/src/
├── pages/dashboard/
│   └── kasubag-umum-kepegawaian.jsx          # Main Dashboard Kasubag
├── components/kasubag/
│   ├── PerintahKasubagPanel.jsx              # Masuk dari Sekretaris + keluar ke Pelaksana
│   ├── VerifikasiDokumenPanel.jsx            # Antrian dokumen perlu verifikasi
│   ├── AbsensiPanel.jsx                      # Tabel absensi pegawai hari ini
│   ├── KGBPanel.jsx                          # KGB pending proses
│   ├── SKPPanel.jsx                          # SKP status per pegawai
│   └── CutiPanel.jsx                         # Pengajuan cuti pending

backend/
├── controllers/
│   └── dashboardKasubagController.js         # KPI kasubag (extend existing)
```

---

## 8. WORKFLOW LOGIKA KASUBAG

```
[Verifikasi Dokumen dari Pelaksana]
  → Pelaksana submit dokumen → status: in_review
  → Sistem notif ke Kasubag
  → Kasubag buka panel "Perlu Verifikasi"
  → Cek kelengkapan (checklist):
    □ Nomor surat lengkap
    □ Tanda tangan Pelaksana
    □ Lampiran terlampir
    □ Data sesuai format
  → Jika lengkap: PUT /dokumen/:id/verifikasi → forward ke Sekretaris
  → Jika tidak lengkap: PUT /dokumen/:id/kembalikan + catatan checklist

[Proses KGB Pegawai]
  → Bagian kepegawaian/Pelaksana submit KGB
  → Kasubag cek kelengkapan berkas (SK, daftar gaji, DP3)
  → Verifikasi tanggal & masa kerja
  → Setujui → kirim ke Sekretaris untuk TTD → proses lebih lanjut ke BKD

[Pengelolaan Absensi]
  → Sistem auto-rekap absensi dari fingerprint/manual setiap hari
  → Kasubag review jika ada anomali (alpha > 3 hari, izin berulang)
  → Proses surat keterangan jika perlu
```

---

## 9. UI DESIGN

**Warna scheme:** Hijau Tua + Abu-Abu Profesional — `primary: "#2E7D32"`, `secondary: "#455A64"`

**Header:** sticky, gradient hijau tua, nama Kasubag, badge dokumen perlu verifikasi, badge KGB pending, bell notif

**Tabs:**
1. `ringkasan` — KPI tiles (8), tugas pending hari ini, 3 notif terbaru
2. `perintah` — Masuk (dari Sekretaris) | Keluar (ke Pelaksana)
3. `verifikasi` — tabel dokumen belum terverifikasi + checklist review
4. `administrasi` — surat masuk tabel + surat keluar tracking
5. `kepegawaian` — tabs nested: Absensi | KGB | SKP | Cuti

**Footer:** "SIGAP-MALUT © 2026 · Sub Bagian Umum dan Kepegawaian · Dashboard Kasubag"

---

## 10. CATATAN PROFESIONAL

- **Checklist Verifikasi:** Standar kelengkapan dokumen terdefinisi per jenis dokumen (surat/KGB/SKP/cuti)
- **SLA Verifikasi:** Kasubag harus memverifikasi dokumen max 1×24 jam sejak diterima
- **SLA KGB:** Proses KGB max 3 hari kerja setelah berkas lengkap
- **Hak Akses Kepegawaian:** Kasubag hanya bisa lihat data pegawai di unit Sekretariat — bukan bidang/UPTD
- **Audit Trail:** Setiap verifikasi/penolakan tercatat beserta catatan alasan
- **Notifikasi ke Pelaksana:** Jika dokumen dikembalikan, Pelaksana langsung dapat notif + catatan detail
