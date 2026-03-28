# PROMPT SPESIFIKASI — DASHBOARD FUNGSIONAL PERENCANAAN
## SIGAP MALUT · Sistem Informasi Terintegrasi Dinas Pangan Provinsi Maluku Utara

---

## 1. IDENTITAS ROLE

| Atribut | Nilai |
|---------|-------|
| Role Code | `fungsional_perencana` |
| Role Level | 4 |
| Unit | Sekretariat — Sub Fungsi Perencanaan |
| Jabatan | Analis Perencanaan / Jabatan Fungsional Perencana |
| e-Pelara Role | PERTAMA / MUDA (tergantung jenjang) |
| Melapor Ke | Kasubag Umum & Kepegawaian / Sekretaris |
| Fungsi Utama | Analisa program, penyusunan Renstra/Renja, monitoring realisasi program |

---

## 2. POSISI DAN FUNGSI

Fungsional Perencanaan adalah **analis program** yang mengolah data mentah dari Pelaksana menjadi laporan terstruktur untuk diverifikasi Kasubag dan disetujui Sekretaris. Tidak hanya merekap data, tetapi juga memberikan analisis dan rekomendasi.

### Fungsi Utama:
1. **Penyusunan Dokumen Perencanaan** — Renstra, Renja, RKA, DPA
2. **Monitoring Realisasi Program** — pantau progress vs target
3. **Analisis Data** — olah data dari Pelaksana, buat grafik, tren
4. **Koordinasi Lintas Bidang** — kumpulkan data dari semua bidang untuk laporan konsolidasi

---

## 3. ALUR KERJA FUNGSIONAL PERENCANAAN

```
[Input dari Pelaksana / Bidang]
  → Data kegiatan masuk dari pelaksana semua bidang
  → Fungsional Perencana olah data:
      - Rekapitulasi realisasi vs target
      - Analisis capaian indikator program
      - Identifikasi deviasi dan hambatan
  → Susun dokumen: Laporan Bulanan | Laporan Triwulan | LKPJ | LAKIP
  → Submit ke Kasubag untuk verifikasi administrasi
  → Kasubag → Sekretaris → KaDin (sesuai jenis dokumen)

[Penyusunan Renstra/Renja]
  → Kumpulkan usulan dari Kabid Ketersediaan, Distribusi, Konsumsi
  → Kompilasi anggaran + target kegiatan
  → Susun draft Renstra/Renja → submit ke Sekretaris
  → Sekretaris → KaDin approval → final

[Monitoring Mingguan]
  → Cek progress semua program aktif
  → Flag program yang deviasi > 10% dari target
  → Buat alert untuk Sekretaris/KaDin
```

---

## 4. INFORMASI DAN DATA WAJIB

### 4.1 KPI Fungsional Perencanaan

| Indikator | Sumber | Threshold |
|-----------|--------|-----------|
| Realisasi Program (%) | Semua bidang | < 75% di Q3 = Warning |
| Laporan Tersubmit Tepat Waktu | SEK-REN | < 90% = Warning |
| Deviasi Program > 10% | Monitoring | > 2 program = Alert |
| Dokumen Draft Pending Submit | SEK-REN | > 3 = Warning |
| Data dari Bidang Belum Masuk | Koordinasi | > 1 bidang = Alert |
| Kegiatan Selesai Tepat Waktu | SEK-LKS | < 85% = Warning |

### 4.2 Modul yang Dikelola

| Modul | Fungsi |
|-------|--------|
| SEK-REN | Perencanaan Program & Anggaran |
| SEK-LKS | Laporan Kegiatan Sekretariat |
| SEK-LKT | Laporan Keuangan Triwulan (koordinasi) |
| SEK-KEP | Data SKP untuk analisis kinerja |

### 4.3 Dokumen yang Diproduksi

- **RKA** — Rencana Kerja dan Anggaran (tahunan)
- **DPA** — Dokumen Pelaksanaan Anggaran
- **Renja** — Rencana Kerja (tahunan)
- **Renstra** — Rencana Strategis (5 tahunan)
- **Laporan Bulanan** — realisasi fisik dan keuangan
- **Laporan Triwulan** — konsolidasi per 3 bulan
- **LKPJ** — Laporan Keterangan Pertanggungjawaban
- **LAKIP** — Laporan Kinerja Instansi Pemerintah

### 4.4 Tabs Dashboard Fungsional Perencanaan

1. **Ringkasan** — KPI program, progress terkini, notifikasi
2. **Analisis Program** — grafik realisasi per bidang, deviasi, tren
3. **Dokumen** — daftar dokumen draft/in_review/selesai
4. **Koordinasi Bidang** — status data masuk dari masing-masing bidang
5. **Laporan Berkala** — submit laporan bulanan/triwulan/tahunan

---

## 5. ERD — TABEL PENDUKUNG

```sql
-- Tabel Program Kegiatan (untuk monitoring)
CREATE TABLE IF NOT EXISTS program_kegiatan (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_kegiatan   VARCHAR(30) UNIQUE,
  nama_kegiatan   VARCHAR(255) NOT NULL,
  bidang          VARCHAR(50) NOT NULL,  -- sekretariat|ketersediaan|distribusi|konsumsi|uptd
  anggaran_pagu   NUMERIC(15,2) DEFAULT 0,
  anggaran_realisasi NUMERIC(15,2) DEFAULT 0,
  target_fisik    NUMERIC(10,2) DEFAULT 0,  -- %
  realisasi_fisik NUMERIC(10,2) DEFAULT 0, -- %
  tahun_anggaran  INTEGER NOT NULL,
  status          VARCHAR(20) DEFAULT 'aktif',
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Tabel Dokumen Perencanaan
CREATE TABLE IF NOT EXISTS dokumen_perencanaan (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jenis_dokumen   VARCHAR(30) NOT NULL, -- renstra|renja|rka|dpa|lap_bulanan|lap_triwulan|lkpj|lakip
  judul           VARCHAR(255) NOT NULL,
  periode         VARCHAR(20),           -- 2026 | 2026-Q1 | 2026-01
  status          VARCHAR(20) DEFAULT 'draft', -- draft|in_review|disetujui|published
  dibuat_oleh     INTEGER NOT NULL,
  diverifikasi_oleh INTEGER,
  disetujui_oleh  INTEGER,
  file_url        VARCHAR(500),
  catatan         TEXT,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

---

## 6. API DESIGN — FUNGSIONAL PERENCANAAN

```yaml
# Program Kegiatan
GET    /api/program-kegiatan                            — List semua program aktif
GET    /api/program-kegiatan/:id                        — Detail + history realisasi
PUT    /api/program-kegiatan/:id/update-realisasi       — Update realisasi fisik/keuangan
GET    /api/program-kegiatan/deviasi                    — Program dengan deviasi > threshold

# Dokumen Perencanaan
GET    /api/dokumen-perencanaan                         — List dokumen
POST   /api/dokumen-perencanaan                         — Buat dokumen baru
PUT    /api/dokumen-perencanaan/:id                     — Edit draft
POST   /api/dokumen-perencanaan/:id/submit              — Submit ke Kasubag untuk review
GET    /api/dokumen-perencanaan/:id/history             — Riwayat revisi

# Dashboard Fungsional Perencanaan
GET    /api/dashboard/fungsional-perencana/summary      — KPI overview
GET    /api/dashboard/fungsional-perencana/program-chart — Data chart realisasi per bidang
GET    /api/dashboard/fungsional-perencana/koordinasi   — Status data dari bidang
GET    /api/dashboard/fungsional-perencana/dokumen-pending — Dokumen draft belum submit
```

---

## 7. STRUKTUR FOLDER REACT + EXPRESS

```
frontend/src/
├── pages/dashboard/
│   └── fungsional-perencanaan.jsx               # Main Dashboard (SUDAH ADA — perlu update)
├── components/fungsional-perencanaan/
│   ├── ProgramDeviasiPanel.jsx                  # Program deviasi dari target
│   ├── DokumenPerencanaanPanel.jsx              # CRUD dokumen perencanaan
│   ├── KoordinasiBidangPanel.jsx                # Status data dari bidang
│   └── RealisasiChartPanel.jsx                  # Chart realisasi per bidang

backend/
├── models/
│   ├── ProgramKegiatan.js                       # Model Sequelize
│   └── DokumenPerencanaan.js                    # Model Sequelize
├── controllers/
│   └── dashboardFungsionalPerencanaController.js
├── routes/
│   ├── programKegiatan.js                       # CRUD program kegiatan
│   └── dokumenPerencanaan.js                    # CRUD dokumen
```

---

## 8. WORKFLOW LOGIKA FUNGSIONAL PERENCANAAN

```
[Monitoring Mingguan Otomatis]
  → Setiap Senin 08:00, sistem generate summary realisasi vs target
  → Fungsional Perencana menerima email digest
  → Buka dashboard → lihat program dengan flag deviasi
  → Klik program → lihat detail + history
  → Buat catatan analisis → simpan ke dokumen

[Submit Laporan Bulanan]
  → Awal bulan berikutnya (H+5), kumpulkan data dari semua bidang
  → Cek di panel "Koordinasi Bidang" — data bidang mana yang belum masuk
  → Kirim reminder ke bidang yang belum input
  → Setelah semua data masuk → olah → buat draft Laporan Bulanan
  → POST /dokumen-perencanaan (jenis: lap_bulanan)
  → POST /dokumen-perencanaan/:id/submit → notif ke Kasubag

[Penyusunan RKA]
  → Terima arahan dari Sekretaris untuk penyusunan RKA tahun berikutnya
  → Kumpulkan usulan kegiatan + anggaran dari semua Kabid
  → Kompilasi, rekap, sesuaikan pagu
  → Buat draft RKA → submit bertahap ke Sekretaris → KaDin
```

---

## 9. UI DESIGN

**Warna scheme:** Biru Tua + Kuning Amber — `primary: "#1B4F8A"`, `accent: "#F59E0B"` (planning = kuning)

**Header:** sticky, gradient biru, nama Fungsional Perencana, badge dokumen pending submit, bell notif

**Tabs:**
1. `ringkasan` — 6 KPI tiles, mini bar chart realisasi, top 3 dokumen pending
2. `program` — tabel program kegiatan + filter bidang/status, deviasi highlight merah
3. `dokumen` — card list dokumen per status (draft/review/selesai) + tombol buat baru
4. `koordinasi` — grid 5 bidang + status data masuk (hijau/merah/kuning)
5. `laporan` — kalender laporan berkala + status submit per periode

**Design pattern:** Mengikuti `fungsional-ketersediaan.jsx` — design tokens T, tabs, KPI tiles, recharts LineChart + BarChart, static fallback + live API overlay, WCAG 2.1 AA

**Footer:** "SIGAP-MALUT © 2026 · Fungsional Perencanaan · Sub Bagian Perencanaan"

---

## 10. CATATAN PROFESIONAL

- **Koordinasi Lintas Bidang:** Fungsional Perencana berhak kirim reminder ke Kabid jika data belum masuk
- **Standar Dokumen Pemerintah:** Format laporan harus sesuai Permendagri/Permenpan yang berlaku
- **Versioning Dokumen:** Setiap revisi disimpan — tidak menimpa versi sebelumnya
- **SLA Submit:** Laporan bulanan harus disubmit max tanggal 5 bulan berikutnya
- **SLA Review:** Setelah submit, Kasubag harus verifikasi max 2×24 jam
- **Integrasi Anggaran:** Data realisasi keuangan diambil dari modul SEK-KEU secara realtime
