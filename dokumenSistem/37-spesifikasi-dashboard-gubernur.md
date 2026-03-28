# PROMPT SPESIFIKASI — DASHBOARD GUBERNUR
## SIGAP MALUT · Sistem Informasi Terintegrasi Dinas Pangan Provinsi Maluku Utara

---

## 1. IDENTITAS ROLE

| Atribut | Nilai |
|---------|-------|
| Role Code | `gubernur` |
| Role Level | 0 (tertinggi) |
| Unit | Pemerintah Provinsi Maluku Utara |
| Jabatan | Gubernur Maluku Utara |
| e-Pelara Role | PEMBINA UTAMA |
| Direktur Laporan | Kepala Dinas Pangan |

---

## 2. ALUR PERINTAH (CHAIN OF COMMAND)

### 2.1 Gubernur → Kepala Dinas

```
GUBERNUR
  → [Buat Perintah/Instruksi] → POST /perintah
  → Kepala Dinas menerima notifikasi push (in_app + email)
  → Kepala Dinas menindaklanjuti → update status perintah
  → Gubernur memantau progress real-time di dashboard
```

**Status Perintah:**
- `draft` — dibuat, belum dikirim
- `terkirim` — dikirim ke Kepala Dinas
- `diterima` — Kepala Dinas konfirmasi terima
- `dalam_proses` — sedang dikerjakan
- `diajukan_ke_gubernur` — Kepala Dinas mengajukan hasil/progres untuk di-review
- `disetujui` — Gubernur menyetujui
- `dikembalikan` — Gubernur mengembalikan dengan catatan
- `ditolak` — Gubernur menolak
- `selesai` — perintah tuntas

### 2.2 Kepala Dinas → Gubernur (Approval Request)

Kepala Dinas dapat mengajukan:
- Laporan pelaksanaan program
- Permohonan anggaran tambahan
- Eskalasi masalah ketahanan pangan kritis
- Rencana aksi darurat pangan

Gubernur menerima notifikasi → review di panel Approval Queue → Setuju / Tolak / Kembalikan + catatan

---

## 3. INFORMASI DAN DATA WAJIB DALAM DASHBOARD GUBERNUR

### 3.1 KPI Strategis Ketahanan Pangan (real-time)

| Indikator | Sumber Data | Threshold |
|-----------|-------------|-----------|
| Indeks Ketahanan Pangan Provinsi (IKP) | BKT-KRW, BDS-HRG | < 3.5 = Kritis |
| Stok Pangan Strategis (hari) | BKT-PGD, BKT-KRW | < 30 hari = Waspada |
| Inflasi Pangan (% MoM) | BDS-HRG | > 5% = Peringatan |
| Realisasi Distribusi (% target) | BDS-MON | < 80% = Warning |
| Kab. Rawan Pangan | BKT-KRW | > 3 = Kritis |
| Skor Konsumsi Gizi (PPH) | BKS-DVR | < 85 = Waspada |
| UPTD Aktif/Total | UPT-ADM | < 90% = Warning |
| Realisasi Anggaran (% DPA) | SEK-KEU | < 70% di Q3 = Warning |

### 3.2 Peta Rawan Pangan Per Kabupaten (Maluku Utara 10 Kab/Kota)

- Ternate, Tidore Kepulauan, Halmahera Barat, Halmahera Timur
- Halmahera Selatan, Halmahera Utara, Halmahera Tengah
- Kepulauan Sula, Pulau Taliabu, Morotai

Level IKP: Kritis (merah) | Rentan (oranye) | Waspada (kuning) | Tahan (hijau)

### 3.3 Monitoring Kinerja Kepala Dinas

| Metrik | Deskripsi |
|--------|-----------|
| Program Selesai Tepat Waktu | % program selesai sebelum deadline |
| Perintah Gubernur Terlaksana | % perintah yang sudah closed/selesai |
| Laporan Tepat Waktu | % laporan dikirim sesuai jadwal |
| Eskalasi Belum Direspon | Jumlah perintah > 7 hari tanpa update |
| Approval Pending > 3 hari | Dokumen pending persetujuan Gubernur |

### 3.4 Tabs Dashboard Gubernur

1. **Ringkasan Eksekutif** — IKP, stok, inflasi, map, kinerja KaDin, notifikasi
2. **Perintah & Instruksi** — buat perintah, tracking status, riwayat
3. **Persetujuan** — approval queue dari Kepala Dinas (setuju/tolak/kembalikan)
4. **Kinerja Kepala Dinas** — SLA, realisasi program, laporan, eskalasi
5. **Laporan Strategis** — LAKIP, Renstra, realisasi per bidang/UPTD
6. **Alert & Eskalasi** — notifikasi kritis, threshold violations

---

## 4. ERD — TABEL BARU UNTUK GUBERNUR

```sql
-- Tabel Perintah (Command/Instruction) — lintas semua level
CREATE TABLE perintah (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_perintah VARCHAR(50) UNIQUE,     -- auto: P/GUB/2026/001
  judul         VARCHAR(255) NOT NULL,
  isi           TEXT NOT NULL,
  dari_role     VARCHAR(50) NOT NULL,    -- gubernur | kepala_dinas | dll
  dari_user_id  INTEGER NOT NULL,
  ke_role       VARCHAR(50) NOT NULL,    -- kepala_dinas | sekretaris | dll
  ke_user_id    INTEGER,                 -- NULL = broadcast ke semua role tsb
  prioritas     VARCHAR(20) DEFAULT 'normal', -- kritis|tinggi|normal|rendah
  deadline      TIMESTAMP,
  status        VARCHAR(30) DEFAULT 'terkirim',
  -- terkirim|diterima|dalam_proses|diajukan|disetujui|dikembalikan|ditolak|selesai
  progres_persen INTEGER DEFAULT 0,
  lampiran_url  VARCHAR(500),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  deleted_at    TIMESTAMP
);

-- Log tindak lanjut perintah
CREATE TABLE perintah_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perintah_id   UUID REFERENCES perintah(id),
  aksi          VARCHAR(30) NOT NULL, -- diterima|update_progres|ajukan|setujui|kembalikan|tolak|selesai
  oleh_user_id  INTEGER NOT NULL,
  oleh_role     VARCHAR(50),
  catatan       TEXT,
  progres_baru  INTEGER,
  lampiran_url  VARCHAR(500),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Tabel Task Assignment (ekstensi Task)
ALTER TABLE tasks ADD COLUMN assignee_id      INTEGER;
ALTER TABLE tasks ADD COLUMN jenis_tugas      VARCHAR(20) DEFAULT 'satu_kali'; -- satu_kali|rutin|insidental
ALTER TABLE tasks ADD COLUMN jadwal_rutin     VARCHAR(100); -- cron expression
ALTER TABLE tasks ADD COLUMN adalah_substitusi BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN alasan_substitusi TEXT;
ALTER TABLE tasks ADD COLUMN kinerja_ke_user_id INTEGER; -- siapa yang dapat kredit
ALTER TABLE tasks ADD COLUMN unit_kerja       VARCHAR(100);
ALTER TABLE tasks ADD COLUMN catatan_penolakan TEXT;
ALTER TABLE tasks ADD COLUMN perintah_id      UUID; -- link ke tabel perintah
```

---

## 5. API DESIGN — GUBERNUR

```yaml
# Perintah Endpoints
POST   /api/perintah                     — Buat perintah baru (Gubernur)
GET    /api/perintah                     — List perintah (filter: dari_role, ke_role, status)
GET    /api/perintah/:id                 — Detail perintah + log
PUT    /api/perintah/:id                 — Update status/progres (Kepala Dinas)
POST   /api/perintah/:id/tindak-lanjut   — Kepala Dinas update progres/ajukan ke Gubernur
POST   /api/perintah/:id/setujui         — Gubernur setuju hasil
POST   /api/perintah/:id/kembalikan      — Gubernur kembalikan + catatan
POST   /api/perintah/:id/tolak           — Gubernur tolak + alasan

# Dashboard Gubernur endpoints
GET    /api/dashboard/gubernur/summary          — 8 KPI strategis
GET    /api/dashboard/gubernur/kinerja-kadin    — Kinerja Kepala Dinas
GET    /api/dashboard/gubernur/ikp-map          — IKP per kab/kota
GET    /api/dashboard/gubernur/approval-queue   — Daftar dokumen pending approval
GET    /api/dashboard/gubernur/alerts           — Alert kritis aktif
GET    /api/dashboard/gubernur/perintah         — List perintah dengan status

# Notification Gubernur
POST   /api/notifications/broadcast-gubernur    — Gubernur → Kepala Dinas (broadcast umum)
```

---

## 6. STRUKTUR FOLDER REACT + EXPRESS

```
frontend/src/
├── pages/dashboard/
│   └── gubernur.jsx                     # Main Dashboard Gubernur (pages pattern)
├── components/gubernur/
│   ├── PerintahPanel.jsx                # Buat + pantau perintah
│   ├── ApprovalQueueGubernur.jsx        # Queue persetujuan dari KaDin
│   ├── KinerjaKadinPanel.jsx            # Monitoring kinerja KaDin
│   ├── IKPMapPanel.jsx                  # Peta rawan pangan Maluku Utara
│   ├── AlertKritisPanel.jsx             # Alert & eskalasi kritis
│   └── LaporanStrategisPanel.jsx        # LAKIP, Renstra, realisasi

backend/
├── models/Perintah.js                   # Model Sequelize
├── models/PerintahLog.js                # Log tindak lanjut
├── migrations/
│   ├── 20260401-create-perintah.cjs     # Tabel perintah
│   ├── 20260401-create-perintah-log.cjs
│   └── 20260401-add-task-assignment-fields.cjs
├── controllers/
│   ├── perintahController.js            # CRUD + tindak lanjut
│   └── dashboardGubernurController.js   # KPI, kinerja, IKP map
├── routes/
│   ├── perintah.js                      # Route perintah (upgrade dari in-memory)
│   └── dashboard.js                     # Tambah endpoint gubernur
└── services/
    └── perintahService.js               # Business logic + notifikasi otomatis
```

---

## 7. WORKFLOW LOGIKA GUBERNUR

```
[Gubernur buat perintah]
  → POST /perintah (status: terkirim)
  → Notifikasi push ke Kepala Dinas (in_app + email)
  → Kepala Dinas lihat di panel "Perintah Masuk"
  → Kepala Dinas klik "Terima" → status: diterima
  → Kepala Dinas mulai kerjakan → status: dalam_proses
  → Kepala Dinas update progress (0-100%) secara berkala
  → Gubernur melihat progress real-time
  → [Opsi A] Kepala Dinas selesai → status: selesai (langsung)
  → [Opsi B] Kepala Dinas ajukan hasil ke Gubernur → status: diajukan_ke_gubernur
    → Gubernur review → Setuju (status: disetujui) | Kembalikan + catatan | Tolak
    → Jika dikembalikan → Kepala Dinas perbaiki → ajukan ulang
  → [Eskalasi] Jika > 7 hari tanpa update → alert merah di dashboard Gubernur
  → [Auto-escalate] jika deadline terlewat → status: escalated + notifikasi
```

---

## 8. UI DESIGN — MENGIKUTI POLA fungsional-ketersediaan.jsx

**Alasan cocok:** Gubernur butuh tab navigation, KPI tiles, chart, notification panel — persis seperti pola fungsional-ketersediaan.

**Warna scheme:** Merah/Emas (warna pemerintahan) — `primary: "#8B0000"` (merah maroon), `accent: "#DAA520"` (gold)

**Tabs:**
1. `ringkasan` — KPI strategis, peta IKP, top alert
2. `perintah` — buat + pantau perintah ke KaDin
3. `persetujuan` — approval queue (dokumen dari KaDin)
4. `kinerja` — monitoring KaDin per KPI
5. `laporan` — LAKIP, Renstra, Realisasi Program

**Header:** sticky, gradient merah gelap, nama Gubernur, tanggal, total perintah aktif, bell notifikasi
**Footer:** "SIGAP-MALUT © 2026 · Pemerintah Provinsi Maluku Utara · Dashboard Gubernur · v1.0.0"

---

## 9. SINKRONISASI DENGAN DASHBOARD KEPALA DINAS

| Event di Gubernur | Efek di Kepala Dinas |
|-------------------|----------------------|
| Perintah dibuat (terkirim) | Notifikasi muncul → badge merah di header |
| Perintah dikembalikan | Alert "Perlu Perbaikan" di panel Perintah Masuk |
| Perintah ditolak | Notifikasi merah + catatan alasan |
| Approval disetujui | Notifikasi hijau "Disetujui oleh Gubernur" |
| Alert kritis IKP | Notifikasi broadcast ke KaDin otomatis |

---

## 10. CATATAN TAMBAHAN (PROFESSIONAL GOVERNMENT STANDARDS)

- **Nomor Perintah Otomatis:** Format P/GUB/YYYY/NNN
- **Audit Trail:** Setiap aksi tercatat di `perintah_log`
- **Confidentiality:** Perintah dapat ditandai `is_rahasia` — hanya penerima yang bisa baca
- **Deadline Warning:** 3 hari sebelum deadline → notifikasi kuning; H-1 → notifikasi merah
- **SLA Gubernur:** Response target dari KaDin = 2×24 jam sejak perintah diterima
- **Cross-referensi:** Perintah terhubung ke `tasks`, `workflow_instances`, `approval_log`
- **Laporan Kinerja Otomatis:** Setiap akhir bulan, sistem generate ringkasan kinerja KaDin ke email Gubernur
