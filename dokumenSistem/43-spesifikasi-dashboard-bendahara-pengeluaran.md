# PROMPT SPESIFIKASI — DASHBOARD BENDAHARA PENGELUARAN
## SIGAP MALUT · Sistem Informasi Terintegrasi Dinas Pangan Provinsi Maluku Utara

---

## 1. IDENTITAS ROLE

| Atribut | Nilai |
|---------|-------|
| Role Code | `bendahara_pengeluaran` |
| Role Level | 3 |
| Unit | Sekretariat — Sub Bagian Keuangan |
| Jabatan | Bendahara Pengeluaran |
| e-Pelara Role | PERTAMA |
| Melapor Ke | Fungsional Keuangan (PPK) / Sekretaris |
| Fungsi | Penatausahaan uang persediaan, pembayaran tagihan, pembuatan SPP |

---

## 2. POSISI DAN FUNGSI

Bendahara Pengeluaran bertanggung jawab atas **penatausahaan uang persediaan (UP)** dan **pembayaran tagihan** satuan kerja. Setiap pengeluaran harus didukung SPP yang diverifikasi PPK sebelum dilakukan pembayaran.

### Fungsi Utama:
1. **Pengelolaan UP** — uang persediaan untuk pengeluaran rutin
2. **Pembuatan SPP-UP** — pengajuan uang persediaan awal
3. **Pembuatan SPP-GU** — ganti uang persediaan (setelah UP habis + SPJ terverifikasi)
4. **Pembuatan SPP-TU** — tambahan uang persediaan untuk kegiatan mendadak
5. **Pembuatan SPP-LS** — langsung untuk pembayaran ke pihak ketiga
6. **Pembuatan SPJ** — Surat Pertanggungjawaban penggunaan UP
7. **Buku Kas** — buku kas umum, buku pembantu, buku bank

---

## 3. ALUR KERJA BENDAHARA PENGELUARAN

```
[Penerimaan Dana via SP2D]
  → SP2D dari BPKAD masuk → dana ke rekening bendahara
  → Bendahara catat di Buku Kas Umum
  → Update saldo kas sistem

[Pembayaran Tagihan (SPP-LS)]
  → Terima dokumen tagihan dari kegiatan
  → Verifikasi kelengkapan: kwitansi, faktur, BAST, kontrak
  → Input di sistem → buat draft SPP-LS
  → Submit ke PPK untuk verifikasi → PPK setujui → SPM diterbitkan
  → SP2D terbit → bayar ke rekening pihak ketiga
  → Simpan bukti transfer + kwitansi → update SPJ

[Pengisian Kembali UP (SPP-GU)]
  → UP sudah digunakan ≥ 75% → saatnya GU
  → Kumpulkan seluruh bukti pengeluaran
  → Buat SPJ UP → cek oleh PPK → verifikasi
  → Jika SPJ clear → PPK approve SPP-GU → SPM-GU diterbitkan
  → Dana masuk kembali ke rekening bendahara

[Tutup Buku Bulanan]
  → Tanggal akhir bulan → Bendahara buat LPJ Bendahara
  → Rekonsiliasi saldo kas buku vs bank
  → Submit LPJ ke PPK untuk review
  → PPK cek → Sekretaris approval → arsip
```

---

## 4. INFORMASI DAN DATA WAJIB

### 4.1 KPI Bendahara Pengeluaran

| Indikator | Nilai |
|-----------|-------|
| Saldo UP Saat Ini | Nominal + persentase terpakai |
| SPP Draft Belum Disubmit | Jumlah |
| SPP Pending di PPK | Jumlah (sudah submit, belum diverifikasi) |
| SPP Dikembalikan PPK | Jumlah perlu perbaikan |
| SPJ Pending (belum dibuat) | Jumlah transaksi belum di-SPJ-kan |
| Buku Kas Hari Ini (debet) | Total pengeluaran hari ini |
| Buku Kas Hari Ini (kredit) | Total penerimaan hari ini |
| LPJ Terakhir Bulan | Status: sudah/belum submit |

### 4.2 Jenis SPP

| Jenis | Kode | Fungsi |
|-------|------|--------|
| SPP-UP | Uang Persediaan | Pengajuan UP awal tahun |
| SPP-GU | Ganti Uang | Penggantian UP yang sudah dipertanggungjawabkan |
| SPP-TU | Tambahan Uang | UP tambahan untuk kegiatan tertentu |
| SPP-LS-Gaji | Langsung Gaji | Pembayaran gaji via transfer langsung |
| SPP-LS-Pengadaan | Langsung Pengadaan | Pembayaran ke pihak ketiga |
| SPP-LS-Perjalanan | Langsung Perjalanan | Pembayaran SPPD perjalanan dinas |

### 4.3 Tabs Dashboard Bendahara Pengeluaran

1. **Ringkasan** — saldo UP, SPP status, buku kas harian, alert
2. **Buat SPP** — form wizard multi-step per jenis SPP
3. **Tracking SPP** — daftar SPP semua status + filter
4. **Buku Kas** — tabel transaksi harian (debet/kredit), rekonsiliasi
5. **SPJ** — daftar dokumen SPJ per periode + status
6. **LPJ Bulanan** — laporan pertanggungjawaban bendahara

---

## 5. ERD — TABEL BENDAHARA PENGELUARAN

```sql
-- Tabel SPP/SPJ sudah ada di migrasi 20260329-create-spj.cjs
-- Tambahan untuk Bendahara Pengeluaran:

-- Buku Kas Umum
CREATE TABLE IF NOT EXISTS buku_kas_umum (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bendahara_id    INTEGER NOT NULL,
  tanggal         DATE NOT NULL,
  uraian          VARCHAR(255),
  no_bukti        VARCHAR(50),
  debet           NUMERIC(15,2) DEFAULT 0,
  kredit          NUMERIC(15,2) DEFAULT 0,
  saldo           NUMERIC(15,2),
  jenis_transaksi VARCHAR(30), -- up|gu|tu|ls_gaji|ls_pengadaan|ls_perjalanan
  spj_id          UUID,        -- link ke SPJ terkait
  created_at      TIMESTAMP DEFAULT NOW()
);

-- LPJ Bulanan
CREATE TABLE IF NOT EXISTS lpj_bendahara (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bendahara_id    INTEGER NOT NULL,
  jenis_bendahara VARCHAR(20) NOT NULL, -- pengeluaran|gaji|barang
  periode         VARCHAR(7) NOT NULL,  -- 2026-03
  saldo_awal      NUMERIC(15,2),
  total_penerimaan NUMERIC(15,2),
  total_pengeluaran NUMERIC(15,2),
  saldo_akhir     NUMERIC(15,2),
  status          VARCHAR(20) DEFAULT 'draft',
  submitted_at    TIMESTAMP,
  ppk_approved_at TIMESTAMP,
  file_url        VARCHAR(500),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Dokumen Pendukung SPP
CREATE TABLE IF NOT EXISTS spp_dokumen (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spj_id          UUID NOT NULL,
  jenis_dokumen   VARCHAR(50), -- kwitansi|faktur|bast|kontrak|nota_dinas
  file_url        VARCHAR(500) NOT NULL,
  uploaded_by     INTEGER,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

---

## 6. API DESIGN — BENDAHARA PENGELUARAN

```yaml
# SPP
GET    /api/spj?bendahara_id=:id                         — SPP milik bendahara ini
POST   /api/spj/create                                   — Buat draft SPP baru
PUT    /api/spj/:id                                      — Edit draft SPP
POST   /api/spj/:id/submit-ke-ppk                        — Submit SPP ke PPK
GET    /api/spj/:id/detail                               — Detail SPP + dokumen pendukung
POST   /api/spj/:id/upload-dokumen                       — Upload kwitansi/faktur/BAST
GET    /api/spj?status=dikembalikan&bendahara_id=:id     — SPP dikembalikan PPK

# Buku Kas
GET    /api/buku-kas?bendahara_id=:id&tanggal=:date      — Transaksi hari ini
POST   /api/buku-kas/entry                               — Input transaksi manual
GET    /api/buku-kas/rekap?periode=2026-03               — Rekap bulanan

# LPJ
GET    /api/lpj?bendahara_id=:id&periode=:periode        — LPJ per periode
POST   /api/lpj/create                                   — Buat LPJ bulanan
POST   /api/lpj/:id/submit                               — Submit ke PPK

# Dashboard
GET    /api/dashboard/bendahara-pengeluaran/summary      — KPI + saldo UP
GET    /api/dashboard/bendahara-pengeluaran/spp-status   — Status SPP semua jenis
GET    /api/dashboard/bendahara-pengeluaran/buku-kas-today — Transaksi hari ini
```

---

## 7. STRUKTUR FOLDER REACT + EXPRESS

```
frontend/src/
├── pages/dashboard/
│   └── bendahara-pengeluaran.jsx               # Main Dashboard
├── components/bendahara-pengeluaran/
│   ├── SPPWizardPanel.jsx                      # Form buat SPP multi-step
│   ├── TrackingSPPPanel.jsx                    # Daftar SPP + filter status
│   ├── BukuKasPanel.jsx                        # Tabel buku kas harian
│   ├── SPJPanel.jsx                            # Dokumen SPJ per periode
│   └── LPJBulananPanel.jsx                     # Laporan pertanggungjawaban

backend/
├── models/
│   ├── BukuKasUmum.js
│   ├── LpjBendahara.js
│   └── SppDokumen.js
├── controllers/
│   └── dashboardBendaharaPengeluaranController.js
├── routes/
│   ├── spj.js                                  # CRUD SPJ/SPP (SUDAH ADA di routes/)
│   ├── bukuKas.js
│   └── lpj.js
```

---

## 8. WORKFLOW LOGIKA BENDAHARA PENGELUARAN

```
[Buat SPP-LS Pengadaan]
  Langkah 1: Pilih jenis SPP → LS-Pengadaan
  Langkah 2: Isi data pokok:
    - Nama penerima / nomor rekening
    - Jumlah pembayaran
    - Uraian kegiatan
    - Nomor kontrak / SP3
    - Kode rekening DPA
  Langkah 3: Upload dokumen:
    - Faktur/kwitansi
    - BAST (jika pengadaan barang)
    - Surat Perjanjian Kerja
  Langkah 4: Review → Simpan Draft
  Langkah 5: Submit ke PPK → PPK verifikasi
  Langkah 6: PPK setujui → SPM diterbitkan → SP2D → bayar

[Monitoring Status SPP]
  → Panel "Tracking SPP" tampil semua SPP dengan status:
    - draft (belum submit)
    - pending_ppk (sudah submit, menunggu PPK)
    - dikembalikan (PPK kembalikan, perlu perbaikan)
    - spm_diterbitkan (SPM sudah terbit)
    - sp2d_terbit (SP2D terbit, dana cair)
    - selesai (sudah dibayarkan)
  → Klik SPP yang dikembalikan → lihat catatan PPK → perbaiki → submit ulang
```

---

## 9. UI DESIGN

**Warna scheme:** Hijau Keuangan + Kuning Warning — `primary: "#1B5E20"`, `accent: "#F59E0B"`

**Header:** sticky, gradient hijau tua, nama Bendahara, saldo UP saat ini (besar), badge SPP pending PPK, bell notif

**Tabs:**
1. `ringkasan` — saldo UP gauge, 7 KPI tiles, alert SPP dikembalikan
2. `buat_spp` — pilih jenis SPP → wizard multi-step
3. `tracking` — tabel SPP semua jenis + filter status + warna per status
4. `buku_kas` — tabel transaksi harian + rekap saldo (debet/kredit/saldo)
5. `lpj` — tabel LPJ per bulan + status submit ke PPK

**Design pattern:** `fungsional-ketersediaan.jsx` pattern, design tokens T

**Footer:** "SIGAP-MALUT © 2026 · Bendahara Pengeluaran · Sub Bagian Keuangan"

---

## 10. CATATAN PROFESIONAL

- **Batas UP:** Sesuai aturan, UP maksimal 1/12 dari pagu DIPA — alert jika mendekati batas
- **SPJ Tepat Waktu:** SPJ UP harus sudah dipertanggungjawabkan sebelum GU diajukan
- **Dokumen Wajib:** SPP-LS pengadaan tanpa BAST → otomatis ditolak sistem
- **Rekonsiliasi Otomatis:** Sistem bandingkan saldo buku kas vs mutasi rekening bank setiap hari
- **Audit Trail:** Setiap pembuatan/edit/submit SPP tercatat di audit_log
- **Saldo Real-time:** Setelah SP2D input, saldo UP otomatis bertambah
- **Notifikasi:** Jika SPP dikembalikan PPK → notif push segera ke Bendahara dengan catatan
