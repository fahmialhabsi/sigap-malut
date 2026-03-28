# PROMPT SPESIFIKASI — DASHBOARD BENDAHARA BARANG
## SIGAP MALUT · Sistem Informasi Terintegrasi Dinas Pangan Provinsi Maluku Utara

---

## 1. IDENTITAS ROLE

| Atribut | Nilai |
|---------|-------|
| Role Code | `bendahara_barang` |
| Role Level | 3 |
| Unit | Sekretariat — Sub Bagian Umum / Aset |
| Jabatan | Bendahara Barang / Pengurus Barang |
| e-Pelara Role | PERTAMA |
| Melapor Ke | Kasubag Umum & Kepegawaian / Fungsional Keuangan (PPK) |
| Fungsi | Penatausahaan penerimaan/pengeluaran barang milik daerah (BMD) |

---

## 2. POSISI DAN FUNGSI

Bendahara Barang bertanggung jawab atas **pencatatan, penerimaan, penyimpanan, pengeluaran, dan pelaporan semua barang milik daerah** di Dinas Pangan. Bekerja berdasarkan dokumen pengadaan dan berkoordinasi dengan PPK untuk BAST.

### Fungsi Utama:
1. **Penerimaan Barang** — BAST dari penyedia, catat ke buku induk BMD
2. **Pengeluaran Barang** — distribusi ke unit pemakai, catat dengan BAST pengeluaran
3. **Inventarisasi Aset** — daftar BMD (aset tetap + aset tidak tetap)
4. **Perawatan Aset** — jadwal pemeliharaan kendaraan, gedung, peralatan
5. **Penghapusan Aset** — proses usulan penghapusan BMD tidak layak pakai
6. **Laporan BMD** — laporan semester dan tahunan ke BPKAD

---

## 3. ALUR KERJA BENDAHARA BARANG

```
[Penerimaan Barang dari Pengadaan]
  → Penyedia kirim barang + faktur
  → Bendahara Barang cek fisik barang vs dokumen PO/kontrak
  → Buat BAST (Berita Acara Serah Terima) penerimaan
  → Input barang ke Buku Barang
  → Upload BAST + foto barang ke sistem
  → Kirim BAST ke PPK untuk verifikasi (link ke proses SPP)
  → PPK verifikasi BAST → approve → proses pembayaran via Bendahara Pengeluaran

[Distribusi Barang ke Unit Pemakai]
  → Terima permintaan barang dari unit (Bidang/UPTD)
  → Cek stok gudang
  → Buat BAST pengeluaran + Kartu Stok
  → Tandatangani bersama penerima
  → Upload ke sistem → stok berkurang otomatis

[Inventarisasi Periodik]
  → Setiap semester: cek fisik semua aset
  → Cocokan buku induk vs fisik lapangan
  → Flag: baik | rusak ringan | rusak berat | hilang
  → Buat laporan hasil inventarisasi
  → Submit ke Kasubag Umum + PPK

[Usulan Penghapusan Aset]
  → Identifikasi aset rusak berat / tidak layak
  → Buat daftar usulan penghapusan
  → Kasubag → Sekretaris → KaDin → BPKAD / Pemda
  → Proses penghapusan resmi setelah persetujuan

[Perawatan Kendaraan / Alat]
  → Input jadwal perawatan berkala (per kendaraan/peralatan)
  → Sistem kirim reminder H-7 sebelum jadwal service
  → Bendahara proses SPPD/permintaan dana ke PPK untuk biaya servis
  → Catat realisasi perawatan
```

---

## 4. INFORMASI DAN DATA WAJIB

### 4.1 KPI Bendahara Barang

| Indikator | Keterangan |
|-----------|------------|
| Total Aset Tercatat | Jumlah item BMD aktif |
| BAST Pending Verifikasi PPK | Jumlah BAST belum disetujui |
| Stok ATK Rendah | Item di bawah stok minimum |
| Kendaraan Jatuh Tempo Servis | Jumlah kendaraan perlu servis |
| Aset Kondisi Rusak | Jumlah item rusak ringan/berat |
| Inventarisasi Semester Terakhir | Tanggal + status (selesai/belum) |
| Usulan Penghapusan Pending | Jumlah aset usulan hapus |
| Barang Masuk Bulan Ini | Jumlah item diterima |

### 4.2 Kategori Barang / Aset

| Kategori | Kode | Contoh |
|----------|------|--------|
| Aset Tetap — Tanah | 01 | Tanah kantor |
| Aset Tetap — Peralatan & Mesin | 02 | Kendaraan, komputer, printer |
| Aset Tetap — Gedung & Bangunan | 03 | Kantor, gudang |
| Aset Tetap — Jalan/Irigasi | 04 | Jaringan internet, dll |
| Aset Lainnya | 05 | Aset tak berwujud, dll |
| Persediaan | 06 | ATK, bahan habis pakai |

### 4.3 Tabs Dashboard Bendahara Barang

1. **Ringkasan** — KPI tiles, aset per kategori, alert BAST pending, perawatan jatuh tempo
2. **Penerimaan Barang** — input BAST masuk, upload dokumen
3. **Pengeluaran Barang** — BAST keluar ke unit pemakai, Kartu Stok
4. **Inventaris Aset** — daftar lengkap BMD + filter + edit kondisi
5. **Perawatan** — jadwal + realisasi perawatan kendaraan/alat
6. **Laporan BMD** — laporan semester + tahunan

---

## 5. ERD — TABEL BENDAHARA BARANG

```sql
-- Modul SEK-AST sudah ada — perlu tambahan tabel khusus bendahara barang

-- BAST (Berita Acara Serah Terima)
CREATE TABLE IF NOT EXISTS bast (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_bast      VARCHAR(50) UNIQUE,
  jenis           VARCHAR(20) NOT NULL, -- penerimaan|pengeluaran
  tanggal         DATE NOT NULL,
  penyedia        VARCHAR(255),          -- untuk penerimaan
  unit_penerima   VARCHAR(100),          -- untuk pengeluaran
  keterangan      TEXT,
  status          VARCHAR(20) DEFAULT 'draft',
  -- draft|submitted_ppk|ppk_verified|selesai
  ppk_verified_at TIMESTAMP,
  ppk_user_id     INTEGER,
  file_url        VARCHAR(500),
  created_by      INTEGER,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Item BAST
CREATE TABLE IF NOT EXISTS bast_item (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bast_id         UUID REFERENCES bast(id),
  kode_barang     VARCHAR(30),
  nama_barang     VARCHAR(255) NOT NULL,
  satuan          VARCHAR(20),
  jumlah          NUMERIC(10,2),
  harga_satuan    NUMERIC(15,2),
  total_harga     NUMERIC(15,2),
  kondisi         VARCHAR(20) DEFAULT 'baik', -- baik|rusak_ringan|rusak_berat
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Buku Induk BMD (Inventaris Aset)
-- Sudah ada di SEK-AST model, tambahan:
ALTER TABLE assets ADD COLUMN IF NOT EXISTS
  kondisi VARCHAR(20) DEFAULT 'baik';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS
  tanggal_inventaris_terakhir DATE;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS
  kode_kategori_bmd VARCHAR(5);

-- Jadwal Perawatan
CREATE TABLE IF NOT EXISTS jadwal_perawatan (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id        UUID,
  jenis_perawatan VARCHAR(50),    -- servis_berkala|kalibrasi|pengecekan
  tanggal_rencana DATE NOT NULL,
  tanggal_realisasi DATE,
  biaya_rencana   NUMERIC(12,2),
  biaya_realisasi NUMERIC(12,2),
  status          VARCHAR(20) DEFAULT 'terjadwal',
  -- terjadwal|selesai|overdue
  catatan         TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

---

## 6. API DESIGN — BENDAHARA BARANG

```yaml
# BAST
GET    /api/bast?jenis=penerimaan                    — Semua BAST penerimaan
POST   /api/bast/create                              — Buat BAST baru
POST   /api/bast/:id/tambah-item                     — Tambah item ke BAST
PUT    /api/bast/:id/upload                          — Upload file BAST scan
POST   /api/bast/:id/submit-ke-ppk                   — Submit ke PPK
GET    /api/bast/:id/detail                          — Detail BAST + items

# Inventaris Aset (extend SEK-AST)
GET    /api/assets?unit=sekretariat                  — Daftar aset unit
PUT    /api/assets/:id/kondisi                       — Update kondisi aset
POST   /api/assets/inventarisasi                     — Submit hasil inventarisasi
GET    /api/assets/stok-rendah                       — Persediaan di bawah minimum

# Perawatan
GET    /api/perawatan/jadwal                         — Jadwal perawatan
POST   /api/perawatan/create                         — Buat jadwal baru
PUT    /api/perawatan/:id/realisasi                  — Input realisasi perawatan
GET    /api/perawatan/jatuh-tempo                    — Perawatan dalam 7 hari ke depan

# Laporan BMD
POST   /api/laporan/bmd/create                       — Buat laporan semester
GET    /api/laporan/bmd/:periode                     — Detail laporan

# Dashboard
GET    /api/dashboard/bendahara-barang/summary       — KPI aset + barang
GET    /api/dashboard/bendahara-barang/bast-pending  — BAST pending PPK
GET    /api/dashboard/bendahara-barang/perawatan-alert — Kendaraan jatuh tempo
```

---

## 7. STRUKTUR FOLDER REACT + EXPRESS

```
frontend/src/
├── pages/dashboard/
│   └── bendahara-barang.jsx                     # Main Dashboard
├── components/bendahara-barang/
│   ├── BASTPanel.jsx                            # Buat BAST + upload + submit PPK
│   ├── InventarisAsetPanel.jsx                  # Daftar BMD + filter + edit kondisi
│   ├── StokPersediaanPanel.jsx                  # ATK + bahan habis pakai
│   ├── PerawatanPanel.jsx                       # Jadwal perawatan + reminder
│   └── LaporanBMDPanel.jsx                      # Laporan semester + tahunan

backend/
├── models/
│   ├── Bast.js
│   ├── BastItem.js
│   └── JadwalPerawatan.js
├── controllers/
│   └── dashboardBendaharaBarangController.js
├── routes/
│   ├── bast.js
│   └── perawatan.js
```

---

## 8. WORKFLOW LOGIKA BENDAHARA BARANG

```
[Terima Barang dari Pengadaan]
  1. Barang tiba → cek fisik vs dokumen PO
  2. Input di panel "Penerimaan Barang":
     - Nama penyedia
     - Nomor PO/kontrak
     - Tambahkan item (nama, jumlah, satuan, kondisi)
  3. Upload foto barang + scan faktur + scan BAST fisik
  4. Submit ke PPK → notif PPK
  5. PPK verifikasi → link ke proses SPP pembayaran

[Distribusi ke Bidang/UPTD]
  1. Unit kirim permintaan barang (surat/in-system)
  2. Bendahara cek stok gudang
  3. Jika ada stok: buat BAST pengeluaran
  4. TTD bersama penerima (konfirmasi digital)
  5. Stok berkurang otomatis di sistem

[Reminder Perawatan Kendaraan]
  → Sistem cek jadwal perawatan setiap hari
  → H-7: notif kuning ke Bendahara Barang
  → H-1: notif merah + notif ke Kasubag
  → Bendahara proses permintaan dana ke PPK
  → Setelah servis: input realisasi + biaya aktual + upload nota servis
```

---

## 9. UI DESIGN

**Warna scheme:** Oranye Aset + Abu-Abu Profesional — `primary: "#E65100"`, `secondary: "#546E7A"` (barang = oranye/coklat)

**Header:** sticky, gradient oranye gelap, nama Bendahara Barang, badge BAST pending PPK, badge kendaraan jatuh tempo, bell notif

**Tabs:**
1. `ringkasan` — 8 KPI tiles, donut chart aset per kategori, alert list
2. `bast` — split: Penerimaan | Pengeluaran; tabel status + tombol buat
3. `inventaris` — tabel aset dengan filter kondisi + kategori + search
4. `perawatan` — kalender/timeline perawatan + status
5. `laporan` — laporan BMD per semester + download

**Design pattern:** `fungsional-ketersediaan.jsx` pattern, design tokens T

**Footer:** "SIGAP-MALUT © 2026 · Bendahara Barang · Sub Bagian Umum"

---

## 10. CATATAN PROFESIONAL

- **BAST Wajib:** Setiap penerimaan/pengeluaran barang tanpa BAST = tidak sah secara administrasi
- **Kode Barang:** Mengikuti kodefikasi BMD sesuai Permendagri 108/2016
- **Foto Dokumentasi:** Setiap penerimaan barang wajib dilampirkan foto (min 1 foto)
- **Stok Minimum:** Sistem alert jika stok persediaan (ATK, dll) < stok minimum yang ditentukan
- **Rekonsiliasi Aset:** Setiap semester, Bendahara Barang wajib rekonsiliasi dengan BPKAD
- **Kerahasiaan Nilai Aset:** Data nilai aset hanya visible untuk Kasubag ke atas
- **SLA BAST ke PPK:** Submit BAST max 1 hari kerja setelah barang diterima
