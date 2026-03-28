# PROMPT SPESIFIKASI — DASHBOARD FUNGSIONAL KEUANGAN (PPK)
## SIGAP MALUT · Sistem Informasi Terintegrasi Dinas Pangan Provinsi Maluku Utara

---

## 1. IDENTITAS ROLE

| Atribut | Nilai |
|---------|-------|
| Role Code | `fungsional_analis_keuangan` |
| Role Level | 4 |
| Unit | Sekretariat — Sub Fungsi Keuangan |
| Jabatan | Analis Keuangan / Pejabat Pembuat Komitmen (PPK) |
| e-Pelara Role | PERTAMA / MUDA |
| Melapor Ke | Sekretaris Dinas |
| Membawahi (koordinasi) | Bendahara Pengeluaran, Bendahara Gaji, Bendahara Barang |
| Fungsi PPK | Verifikasi SPP → penerbitan SPM → koordinasi pencairan |

---

## 2. POSISI DAN FUNGSI PPK

Fungsional Keuangan berperan sebagai **PPK (Pejabat Pembuat Komitmen)** yang menjadi jembatan antara tiga Bendahara dan Sekretaris. Semua alur keuangan wajib melewati PPK sebelum naik ke Sekretaris.

### Fungsi Utama:
1. **Verifikasi SPP** — cek keabsahan Surat Permintaan Pembayaran dari Bendahara
2. **Penerbitan SPM** — Surat Perintah Membayar setelah SPP diverifikasi
3. **Koordinasi 3 Bendahara** — Pengeluaran, Gaji, Barang
4. **Monitoring Realisasi Anggaran** — pantau penyerapan per kegiatan/rekening
5. **Laporan Keuangan** — LRA, Neraca, Laporan Arus Kas

---

## 3. ALUR KERJA KEUANGAN (PPK FLOW)

```
[Bendahara Pengeluaran]
  → Input transaksi → Buat SPP (Surat Permintaan Pembayaran)
  → Submit SPP ke PPK → POST /spj/spp/:id/submit-ke-ppk

[Fungsional Keuangan (PPK)]
  → Terima SPP → verifikasi:
      □ Kode rekening sesuai DPA
      □ Nilai tidak melebihi pagu
      □ Dokumen pendukung lengkap (kwitansi, faktur, BAST)
      □ SPJ periode sebelumnya sudah clear
  → Jika OK → Terbitkan SPM → POST /spj/spm/create
  → Jika tidak OK → Kembalikan ke Bendahara + catatan

[SPM → SP2D]
  → SPM diteruskan ke Bendahara Umum Daerah (BUD) / BPKAD
  → Terbit SP2D → dana cair ke rekening Bendahara
  → PPK catat SP2D → update status realisasi anggaran

[Bendahara Gaji]
  → Input data gaji bulanan (dari SEK-HUM + BKN data)
  → Submit daftar gaji ke PPK untuk verifikasi
  → PPK cek kesesuaian data → approve → proses pembayaran gaji

[Bendahara Barang]
  → Input penerimaan/pengeluaran barang
  → Submit BAST (Berita Acara Serah Terima) ke PPK
  → PPK verifikasi → approve
```

---

## 4. INFORMASI DAN DATA WAJIB

### 4.1 KPI Fungsional Keuangan (PPK)

| Indikator | Sumber | Threshold |
|-----------|--------|-----------|
| Realisasi Anggaran (%) | SEK-KEU | < 70% di Q3 = Warning |
| SPP Pending Verifikasi | SPJ/SPP table | > 3 = Warning |
| SPM Belum Diterbitkan | SPM table | > 2 = Warning |
| Pagu Terpakai (%) per rekening | SEK-KEU + DPA | > 90% = Warning (hampir habis) |
| SPJ Saldo Kas Bendahara | Bendahara Pengeluaran | > Rp 500jt = Review |
| Laporan Keuangan Tepat Waktu | SEK-LKT | < 100% = Kritis |
| Gaji Sudah Diproses | Bendahara Gaji | Tanggal gajian = mandatory |
| Barang Masuk Belum Diverifikasi | Bendahara Barang | > 5 = Warning |

### 4.2 Modul yang Dikelola

| Modul | Fungsi |
|-------|--------|
| SEK-KEU | Pengelolaan keuangan utama |
| SEK-LKT | Laporan keuangan triwulan |
| SPJ / SPP / SPM | Dokumen pertanggungjawaban keuangan |

### 4.3 Tabs Dashboard Fungsional Keuangan

1. **Ringkasan** — KPI keuangan, saldo kas, pagu anggaran, alert
2. **SPP / SPM** — inbox SPP dari Bendahara, verifikasi, terbitkan SPM
3. **Realisasi Anggaran** — grafik per rekening/kegiatan vs DPA
4. **Gaji** — status gaji bulanan, koordinasi Bendahara Gaji
5. **Barang** — status BAST dari Bendahara Barang
6. **Laporan Keuangan** — LRA, Neraca draft + submit ke Sekretaris

---

## 5. ERD — TABEL KEUANGAN

```sql
-- Tabel SPP (Surat Permintaan Pembayaran)
-- Sudah ada di migrasi 20260329-create-spj.cjs
-- Tambahan fields untuk alur PPK:

ALTER TABLE spj ADD COLUMN IF NOT EXISTS
  submitted_to_ppk_at TIMESTAMP;
ALTER TABLE spj ADD COLUMN IF NOT EXISTS
  ppk_verified_at TIMESTAMP;
ALTER TABLE spj ADD COLUMN IF NOT EXISTS
  ppk_user_id INTEGER;
ALTER TABLE spj ADD COLUMN IF NOT EXISTS
  ppk_catatan TEXT;
ALTER TABLE spj ADD COLUMN IF NOT EXISTS
  spm_nomor VARCHAR(50);
ALTER TABLE spj ADD COLUMN IF NOT EXISTS
  spm_tanggal DATE;
ALTER TABLE spj ADD COLUMN IF NOT EXISTS
  sp2d_nomor VARCHAR(50);
ALTER TABLE spj ADD COLUMN IF NOT EXISTS
  sp2d_tanggal DATE;
ALTER TABLE spj ADD COLUMN IF NOT EXISTS
  sp2d_nilai NUMERIC(15,2);

-- Tabel Rekening Anggaran (DPA detail)
CREATE TABLE IF NOT EXISTS rekening_anggaran (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_rekening   VARCHAR(30) UNIQUE,
  nama_rekening   VARCHAR(255),
  program_kegiatan_id UUID REFERENCES program_kegiatan(id),
  pagu            NUMERIC(15,2) DEFAULT 0,
  realisasi       NUMERIC(15,2) DEFAULT 0,
  tahun_anggaran  INTEGER,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

---

## 6. API DESIGN — FUNGSIONAL KEUANGAN (PPK)

```yaml
# SPP / SPM
GET    /api/spj?status=pending_ppk                       — SPP menunggu verifikasi PPK
PUT    /api/spj/:id/verifikasi-ppk                       — PPK verifikasi SPP
PUT    /api/spj/:id/kembalikan-ppk                       — PPK kembalikan ke Bendahara
POST   /api/spj/:id/terbitkan-spm                        — PPK terbitkan SPM
PUT    /api/spj/:id/input-sp2d                           — Input nomor/tanggal SP2D

# Rekening Anggaran
GET    /api/rekening-anggaran                            — List rekening + realisasi
GET    /api/rekening-anggaran/deviasi                    — Rekening mendekati habis pagu

# Laporan Keuangan
POST   /api/laporan-keuangan/create                      — Buat draft LRA/Neraca
PUT    /api/laporan-keuangan/:id/submit                  — Submit ke Sekretaris

# Dashboard Fungsional Keuangan
GET    /api/dashboard/fungsional-analis/summary          — 8 KPI keuangan
GET    /api/dashboard/fungsional-analis/realisasi-chart  — Data chart per rekening
GET    /api/dashboard/fungsional-analis/spp-pending      — SPP belum diverifikasi
GET    /api/dashboard/fungsional-analis/kas-saldo        — Saldo kas 3 bendahara
```

---

## 7. STRUKTUR FOLDER REACT + EXPRESS

```
frontend/src/
├── pages/dashboard/
│   └── fungsional-keuangan.jsx                 # Main Dashboard (SUDAH ADA — perlu update)
├── components/fungsional-keuangan/
│   ├── SPPVerifikasiPanel.jsx                  # Inbox SPP + checklist verifikasi
│   ├── SPMPanel.jsx                            # Terbitkan + track SPM
│   ├── RealisasiAnggaranChart.jsx              # Bar chart per rekening vs DPA
│   ├── GajiKoordinasiPanel.jsx                 # Status gaji bulanan
│   └── BastBarangPanel.jsx                     # Status BAST dari Bendahara Barang

backend/
├── models/
│   └── RekeningAnggaran.js                     # Model Sequelize
├── controllers/
│   └── dashboardFungsionalKeuanganController.js
├── routes/
│   └── rekeningAnggaran.js                     # CRUD rekening anggaran
```

---

## 8. WORKFLOW LOGIKA PPK

```
[Verifikasi SPP — Tahap 1]
  → Bendahara submit SPP
  → PPK buka panel "SPP Masuk"
  → Klik detail → tampil checklist:
      □ Kode rekening sesuai DPA?
      □ Nilai tidak melebihi sisa pagu?
      □ Kwitansi/faktur terlampir?
      □ BAST terlampir (untuk pengadaan barang)?
      □ SPJ periode sebelumnya sudah dipertanggungjawabkan?
  → Semua ✓ → click "Verifikasi" → PUT /spj/:id/verifikasi-ppk
  → Ada yang ✗ → kembalikan + isi catatan per item

[Penerbitan SPM]
  → SPP sudah diverifikasi → muncul tombol "Terbitkan SPM"
  → Sistem generate nomor SPM otomatis: SPM/[tahun]/[nomor urut]
  → PPK review sekali lagi → konfirmasi → POST /spj/:id/terbitkan-spm
  → Status berubah: spm_diterbitkan
  → Sistem notif ke Bendahara dan Sekretaris

[Input SP2D]
  → Setelah SPM dikirim ke BPKAD → terbit SP2D
  → PPK input nomor + tanggal SP2D → PUT /spj/:id/input-sp2d
  → Sistem auto-update realisasi rekening_anggaran
  → Saldo kas Bendahara terupdate
```

---

## 9. UI DESIGN

**Warna scheme:** Biru Gelap + Hijau Sukses — `primary: "#1B4F8A"`, `secondary: "#1B5E20"` (keuangan = hijau tua serius)

**Header:** sticky, gradient biru gelap, nama PPK, badge SPP pending verifikasi, badge SPM belum diterbitkan, bell notif

**Tabs:**
1. `ringkasan` — 8 KPI tiles, mini doughnut realisasi anggaran, saldo kas 3 bendahara
2. `spp_spm` — tabel SPP masuk dengan status + aksi verifikasi/kembalikan
3. `realisasi` — grouped bar chart DPA vs realisasi per rekening/kegiatan
4. `gaji` — status gaji bulan berjalan + timeline pembayaran
5. `barang` — tabel BAST masuk dari Bendahara Barang
6. `laporan` — daftar laporan keuangan + tombol buat LRA/Neraca

**Design pattern:** `fungsional-ketersediaan.jsx` — T design tokens, tabs, KPI tiles, recharts

**Footer:** "SIGAP-MALUT © 2026 · Fungsional Keuangan (PPK) · Sub Bagian Keuangan"

---

## 10. CATATAN PROFESIONAL

- **PPK Mandate:** Berdasarkan Perpres 16/2018 tentang Pengadaan Barang/Jasa, PPK bertanggung jawab penuh atas keabsahan pengeluaran
- **4-Eyes Principle:** SPP dari Bendahara + verifikasi PPK + approval Sekretaris = 3 level check
- **Pagu Alert:** Jika pagu rekening tersisa < 10% → otomatis alert merah
- **Rekonsiliasi:** PPK wajib rekonsiliasi dengan BPKAD setiap akhir bulan
- **Nomor SPM Otomatis:** Format SPM/[KODE_SATKER]/[TAHUN]/[4DIGIT]
- **Audit Jejak:** Setiap verifikasi/penerbitan SPM tercatat dengan IP + timestamp di audit_log
- **SLA PPK:** Verifikasi SPP max 2 hari kerja setelah diterima
