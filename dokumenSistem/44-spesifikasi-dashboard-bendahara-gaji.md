# PROMPT SPESIFIKASI — DASHBOARD BENDAHARA GAJI
## SIGAP MALUT · Sistem Informasi Terintegrasi Dinas Pangan Provinsi Maluku Utara

---

## 1. IDENTITAS ROLE

| Atribut | Nilai |
|---------|-------|
| Role Code | `bendahara_gaji` |
| Role Level | 3 |
| Unit | Sekretariat — Sub Bagian Keuangan |
| Jabatan | Bendahara Gaji / Bendahara Pengeluaran Pembantu (Gaji) |
| e-Pelara Role | PERTAMA |
| Melapor Ke | Fungsional Keuangan (PPK) / Sekretaris |
| Fungsi | Penatausahaan gaji ASN, tunjangan, potongan, dan laporan gaji |

---

## 2. POSISI DAN FUNGSI

Bendahara Gaji bertanggung jawab atas **penghitungan, penerbitan, dan pelaporan gaji seluruh ASN** di Dinas Pangan. Proses gaji melibatkan data dari SEK-HUM (kepegawaian) dan koordinasi dengan PPK sebelum pembayaran.

### Fungsi Utama:
1. **Penghitungan Gaji** — gaji pokok + tunjangan berdasarkan SK, golongan, jabatan
2. **Potongan Gaji** — PPh 21, iuran BPJS, iuran pensiun, koperasi, cicilan
3. **Daftar Gaji** — buat daftar gaji per bulan untuk semua pegawai
4. **SPP-LS Gaji** — pengajuan pembayaran gaji ke PPK
5. **Slip Gaji** — cetak/kirim slip gaji ke pegawai
6. **Laporan Gaji** — rekapitulasi bulanan + tahunan ke BKD dan kantor pajak

---

## 3. ALUR KERJA GAJI

```
[Awal Bulan — Persiapan Gaji]
  H-5 bulan gajian:
  → Cek perubahan data pegawai:
      - Kenaikan pangkat/berkala (SK terbaru dari SEK-KBJ)
      - Penambahan pegawai baru
      - Pegawai cuti/mutasi/pensiun
      - Perubahan tunjangan jabatan
  → Ambil data dari SEK-HUM (unit kepegawaian)
  → Update daftar gaji di sistem

[Buat Daftar Gaji]
  → Input data terbaru ke sistem
  → Sistem hitung otomatis: gaji pokok + tunjangan - potongan
  → Preview → cek kebenaran
  → Generate daftar gaji PDF + Excel

[Submit ke PPK (SPP-LS Gaji)]
  → Buat SPP-LS Gaji → lampirkan:
      - Daftar gaji bulanan
      - SK terakhir pegawai yang berubah
      - Rekap potongan BPJS, pajak
  → Submit ke PPK
  → PPK verifikasi → SPM-LS Gaji diterbitkan
  → SP2D → BPKAD mentransfer ke rekening masing-masing pegawai

[Setelah Pembayaran]
  → Konfirmasi pembayaran masuk (via mutasi rekening / konfirmasi BUD)
  → Generate slip gaji per pegawai
  → Kirim slip gaji via sistem (notifikasi ke email/in_app pegawai)
  → Update buku kas gaji
  → Buat LPJ Gaji bulanan → submit ke PPK
```

---

## 4. INFORMASI DAN DATA WAJIB

### 4.1 KPI Bendahara Gaji

| Indikator | Keterangan |
|-----------|------------|
| Total Pegawai Aktif | Jumlah ASN yang digaji bulan ini |
| Total Anggaran Gaji | Pagu gaji tahun ini |
| Realisasi Gaji (%) | Terserap vs pagu |
| Gaji Bulan Ini — Status | Draft / SPP submitted / SPM terbit / Dibayarkan |
| Pegawai Belum Terima Slip | Jumlah (target = 0) |
| Potongan BPJS Total | Rekap jumlah potongan bulan ini |
| PPh 21 Terutang | Jumlah pajak dipotong bulan ini |
| Perubahan Data Belum Diproses | Pegawai dengan SK baru belum diupdate |

### 4.2 Komponen Gaji

| Komponen | Sumber |
|----------|--------|
| Gaji Pokok | SK Golongan + Tabel Gaji PP |
| Tunjangan Suami/Istri | Data keluarga SEK-HUM |
| Tunjangan Anak | Data keluarga SEK-HUM |
| Tunjangan Jabatan | SK Jabatan struktural/fungsional |
| Tunjangan Beras | Jumlah jiwa × rate |
| Tunjangan Umum | Golongan (untuk non-jabatan) |
| Potongan PPh 21 | Hitung otomatis per PTKP |
| Potongan BPJS Kesehatan | 1% gaji pokok + tunjangan keluarga |
| Potongan BPJS Ketenagakerjaan | 3% (JHT: 2% + JP: 1%) |
| Potongan Tapera | 0.5% dari gaji (berlaku) |
| Potongan Koperasi | Input manual per pegawai |
| Gaji Bersih | Bruto - Semua Potongan |

### 4.3 Tabs Dashboard Bendahara Gaji

1. **Ringkasan** — KPI gaji, status gaji bulan ini, alert perubahan data
2. **Daftar Gaji** — tabel per pegawai, edit komponen, preview total
3. **SPP Gaji** — buat SPP-LS Gaji, tracking status PPK
4. **Slip Gaji** — generate + distribusi slip gaji per pegawai
5. **Laporan** — rekapitulasi bulanan + tahunan + laporan pajak

---

## 5. ERD — TABEL GAJI

```sql
-- Tabel Komponen Gaji per Pegawai per Bulan
CREATE TABLE IF NOT EXISTS daftar_gaji (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periode         VARCHAR(7) NOT NULL,    -- 2026-03
  user_id         INTEGER NOT NULL,
  nip             VARCHAR(20),
  nama            VARCHAR(100),
  golongan        VARCHAR(5),
  jabatan         VARCHAR(100),
  gaji_pokok      NUMERIC(12,2) DEFAULT 0,
  tunj_suami_istri NUMERIC(12,2) DEFAULT 0,
  tunj_anak       NUMERIC(12,2) DEFAULT 0,
  tunj_jabatan    NUMERIC(12,2) DEFAULT 0,
  tunj_beras      NUMERIC(12,2) DEFAULT 0,
  tunj_umum       NUMERIC(12,2) DEFAULT 0,
  tunj_lainnya    NUMERIC(12,2) DEFAULT 0,
  gaji_bruto      NUMERIC(12,2) DEFAULT 0,  -- computed
  pot_pph21       NUMERIC(12,2) DEFAULT 0,
  pot_bpjs_kes    NUMERIC(12,2) DEFAULT 0,
  pot_bpjs_tk     NUMERIC(12,2) DEFAULT 0,
  pot_tapera      NUMERIC(12,2) DEFAULT 0,
  pot_koperasi    NUMERIC(12,2) DEFAULT 0,
  pot_lainnya     NUMERIC(12,2) DEFAULT 0,
  gaji_bersih     NUMERIC(12,2) DEFAULT 0,  -- computed
  no_rekening     VARCHAR(30),
  nama_bank       VARCHAR(50),
  slip_sent_at    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(periode, user_id)
);

-- Rekap Gaji Bulanan (header)
CREATE TABLE IF NOT EXISTS rekap_gaji (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periode         VARCHAR(7) NOT NULL UNIQUE,
  total_pegawai   INTEGER,
  total_bruto     NUMERIC(15,2),
  total_potongan  NUMERIC(15,2),
  total_bersih    NUMERIC(15,2),
  status          VARCHAR(20) DEFAULT 'draft',
  -- draft|spp_submitted|spm_terbit|dibayarkan
  spj_id          UUID,
  dibayarkan_at   TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

---

## 6. API DESIGN — BENDAHARA GAJI

```yaml
# Daftar Gaji
GET    /api/gaji/daftar?periode=2026-03              — Daftar gaji semua pegawai bulan ini
POST   /api/gaji/daftar/generate                     — Generate daftar gaji dari data kepegawaian
PUT    /api/gaji/daftar/:user_id                     — Edit komponen gaji individu
GET    /api/gaji/rekap/:periode                      — Rekap total bulan ini
POST   /api/gaji/rekap/:periode/finalisasi           — Finalisasi sebelum submit SPP

# SPP Gaji
POST   /api/spj/create                               — Buat SPP-LS Gaji (jenis: ls_gaji)
POST   /api/spj/:id/submit-ke-ppk
GET    /api/spj?jenis=ls_gaji&bendahara_id=:id

# Slip Gaji
POST   /api/gaji/slip/generate-all/:periode          — Generate slip semua pegawai
GET    /api/gaji/slip/:user_id/:periode              — Slip gaji individual
POST   /api/gaji/slip/kirim-all/:periode             — Kirim slip ke semua pegawai (notif)

# Laporan Gaji
GET    /api/gaji/laporan/bulanan?periode=2026-03     — Rekap per komponen
GET    /api/gaji/laporan/pph21?tahun=2026            — Rekap PPh 21 tahunan

# Dashboard
GET    /api/dashboard/bendahara-gaji/summary         — KPI gaji bulan ini
GET    /api/dashboard/bendahara-gaji/status-gaji     — Status gaji bulan berjalan
```

---

## 7. STRUKTUR FOLDER REACT + EXPRESS

```
frontend/src/
├── pages/dashboard/
│   └── bendahara-gaji.jsx                      # Main Dashboard
├── components/bendahara-gaji/
│   ├── DaftarGajiPanel.jsx                     # Tabel + edit komponen gaji
│   ├── SPPGajiPanel.jsx                        # Buat + tracking SPP gaji
│   ├── SlipGajiPanel.jsx                       # Generate + distribusi slip
│   └── LaporanGajiPanel.jsx                    # Rekap + laporan pajak

backend/
├── models/
│   ├── DaftarGaji.js
│   └── RekapGaji.js
├── controllers/
│   └── dashboardBendaharaGajiController.js
├── routes/
│   └── gaji.js                                 # CRUD gaji, slip, laporan
```

---

## 8. WORKFLOW LOGIKA BENDAHARA GAJI

```
[Generate Daftar Gaji Bulanan]
  H-5 bulan gajian:
  1. Klik "Generate Daftar Gaji Bulan Ini"
  2. Sistem tarik data dari SEK-HUM:
     - Golongan, jabatan, data keluarga aktif
     - Perubahan SK yang belum diproses (flag kuning)
  3. Hitung otomatis semua komponen
  4. Review → edit manual jika ada koreksi
  5. "Finalisasi" → tidak bisa diedit lagi tanpa alasan

[Distribusi Slip Gaji]
  Setelah SP2D konfirmasi:
  1. Klik "Generate Slip Semua Pegawai"
  2. Sistem buat PDF per pegawai
  3. Klik "Kirim Slip" → notif in_app + email ke semua pegawai
  4. Pegawai dapat notif "Slip Gaji Bulan [X] Tersedia"
  5. Pegawai buka dashboard → unduh slip

[Pengajuan SKP Berubah]
  Jika ada pegawai naik pangkat/berkala:
  → SEK-KBJ update SK → notif ke Bendahara Gaji
  → Bendahara Gaji update komponen gaji pegawai tsb
  → Berlaku mulai bulan berikutnya (atau bulan ini jika belum tutup buku)
```

---

## 9. UI DESIGN

**Warna scheme:** Hijau + Biru Steel — `primary: "#1B5E20"`, `secondary: "#1565C0"`

**Header:** sticky, gradient hijau, nama Bendahara Gaji, badge bulan gajian (status chip), bell notif

**Tabs:**
1. `ringkasan` — 8 KPI tiles, status gaji bulan ini (step indicator: draft→spp→spm→dibayarkan)
2. `daftar_gaji` — tabel pegawai + komponen gaji, edit inline, filter: bidang/unit
3. `spp_gaji` — form buat SPP + upload lampiran + tracking status PPK
4. `slip` — tabel pegawai + status slip (sudah kirim/belum), tombol kirim ulang
5. `laporan` — tabs nested: Bulanan | PPh 21 Tahunan | Rekap Per Rekening

**Footer:** "SIGAP-MALUT © 2026 · Bendahara Gaji · Sub Bagian Keuangan"

---

## 10. CATATAN PROFESIONAL

- **Ketepatan Waktu Gaji:** Target: gaji masuk rekening pegawai paling lambat tanggal 1 setiap bulan
- **Tabel Gaji:** Gaji pokok mengacu PP Gaji PNS terbaru — update otomatis dari master tabel
- **PTKP:** Perhitungan PPh 21 wajib menggunakan data PTKP pegawai (status K/TK dari SEK-HUM)
- **Konfidensialitas:** Data gaji adalah rahasia — hanya Bendahara Gaji, PPK, Sekretaris, dan pegawai bersangkutan yang bisa lihat
- **Audit Trail:** Setiap perubahan komponen gaji wajib dicatat (siapa, kapan, alasan)
- **Rekonsiliasi BKD:** Daftar gaji direkonsiliasi dengan BKD/BKPSDM setiap triwulan
