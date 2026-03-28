# PROMPT SPESIFIKASI — DASHBOARD KEPALA DINAS
## SIGAP MALUT · Sistem Informasi Terintegrasi Dinas Pangan Provinsi Maluku Utara

---

## 1. IDENTITAS ROLE

| Atribut | Nilai |
|---------|-------|
| Role Code | `kepala_dinas` |
| Role Level | 7 |
| Unit | Dinas Pangan Provinsi Maluku Utara |
| Jabatan | Kepala Dinas Pangan |
| e-Pelara Role | UTAMA |
| Melapor Ke | Gubernur Maluku Utara |
| Membawahi | Sekretaris, Kabid Ketersediaan, Kabid Distribusi, Kabid Konsumsi, Kepala UPTD |

---

## 2. ALUR PERINTAH (CHAIN OF COMMAND)

### 2.1 Gubernur → Kepala Dinas (Menerima Perintah)

```
GUBERNUR membuat perintah → POST /perintah (status: terkirim)
  → Notifikasi push ke Kepala Dinas (in_app + email)
  → Badge merah muncul di header dashboard KaDin
  → Kepala Dinas buka tab "Perintah Masuk"
  → Klik "Terima" → PUT /perintah/:id (status: diterima)
  → Mulai kerjakan (delegasikan ke bawahan atau langsung)
  → Update progress → PUT /perintah/:id/tindak-lanjut
  → Jika perlu approval Gubernur → POST /perintah/:id/ajukan
  → Gubernur setuju/kembalikan/tolak
```

**Status Perintah dari Gubernur:**
- `terkirim` → `diterima` → `dalam_proses` → `diajukan_ke_gubernur` → `disetujui/dikembalikan/ditolak` → `selesai`

### 2.2 Kepala Dinas → Bawahan (Membuat Perintah)

```
KEPALA DINAS membuat perintah → POST /perintah
  ke_role: sekretaris | kepala_bidang_ketersediaan | kepala_bidang_distribusi
           | kepala_bidang_konsumsi | kepala_uptd
  → Notifikasi push ke penerima
  → Penerima melihat di panel "Perintah Masuk"
  → Penerima terima → proses → laporkan hasil
  → Kepala Dinas pantau di panel "Perintah Keluar"
  → Kepala Dinas dapat setujui/kembalikan/tolak laporan dari bawahan
```

### 2.3 Bawahan → Kepala Dinas (Pengajuan Approval)

Bawahan dapat mengajukan:
- Laporan program per bidang
- Permohonan anggaran bidang
- Eskalasi masalah di lapangan
- Rencana aksi program tertentu

---

## 3. INFORMASI DAN DATA WAJIB

### 3.1 KPI Operasional (real-time)

| Indikator | Sumber | Threshold |
|-----------|--------|-----------|
| Stok Pangan Aman (%) | BKT-PGD, BKT-KRW | < 80% = Warning |
| Distribusi Tepat Sasaran (%) | BDS-MON | < 85% = Warning |
| Konsumsi Gizi (PPH) | BKS-DVR | < 85 = Waspada |
| UPTD Aktif / Total | UPT-ADM | < 90% = Warning |
| Realisasi Anggaran (%) | SEK-KEU | < 70% di Q3 = Warning |
| Program On-Track | Semua bidang | < 75% = Warning |
| Pengaduan Belum Direspon | UPT-INS | > 5 = Kritis |
| SLA Perintah KaDin | Perintah outbound | > 7 hari tanpa update = Eskalasi |

### 3.2 Monitoring Kinerja 5 Bawahan Langsung

| Bawahan | Metrik Utama |
|---------|--------------|
| Sekretaris | Administrasi selesai %, anggaran terserap % |
| Kabid Ketersediaan | Stok aman %, laporan tepat waktu % |
| Kabid Distribusi | Distribusi tercapai %, realisasi jalur % |
| Kabid Konsumsi | PPH score, diversifikasi pangan % |
| Kepala UPTD | UPTD aktif %, pelaporan UPTD % |

### 3.3 Tabs Dashboard Kepala Dinas

1. **Ringkasan Eksekutif** — KPI operasional, status perintah dari Gubernur, alert kritis
2. **Perintah Masuk** — dari Gubernur (terima, update progress, ajukan ke Gubernur)
3. **Perintah Keluar** — ke 5 bawahan (buat, pantau, setujui laporan)
4. **Persetujuan** — approval queue dari bawahan
5. **Kinerja Bawahan** — SLA, realisasi program, laporan per bawahan
6. **Laporan & Program** — progress program per bidang

---

## 4. ERD — TABEL PENDUKUNG

```sql
-- Menggunakan tabel perintah yang sudah dibuat di spesifikasi Gubernur
-- Tambahan: Tabel Delegasi Perintah (KaDin menugaskan ke bawahan)
CREATE TABLE perintah_delegasi (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perintah_id   UUID REFERENCES perintah(id), -- perintah dari Gubernur
  delegasi_ke_user_id INTEGER NOT NULL,
  delegasi_ke_role    VARCHAR(50) NOT NULL,
  catatan_delegasi    TEXT,
  status              VARCHAR(20) DEFAULT 'aktif',
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Tabel KPI Snapshot per periode
CREATE TABLE kpi_snapshot (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periode       DATE NOT NULL,       -- tanggal snapshot
  role_target   VARCHAR(50),         -- untuk role apa snapshot ini
  indikator     VARCHAR(100) NOT NULL,
  nilai         NUMERIC(10,2),
  satuan        VARCHAR(20),
  threshold_min NUMERIC(10,2),
  threshold_max NUMERIC(10,2),
  status_level  VARCHAR(20),         -- normal|waspada|kritis
  sumber_data   VARCHAR(100),
  created_at    TIMESTAMP DEFAULT NOW()
);
```

---

## 5. API DESIGN — KEPALA DINAS

```yaml
# Perintah dari Gubernur
GET    /api/perintah/masuk                     — List perintah dari Gubernur
PUT    /api/perintah/:id/terima                — KaDin terima perintah
PUT    /api/perintah/:id/tindak-lanjut         — KaDin update progress + lampiran
POST   /api/perintah/:id/ajukan-ke-gubernur    — KaDin ajukan hasil ke Gubernur

# Perintah ke Bawahan
POST   /api/perintah                           — KaDin buat perintah ke bawahan
GET    /api/perintah/keluar                    — List perintah yang sudah dibuat KaDin
PUT    /api/perintah/:id/setujui               — KaDin setujui laporan bawahan
PUT    /api/perintah/:id/kembalikan            — KaDin kembalikan + catatan
PUT    /api/perintah/:id/tolak                 — KaDin tolak + alasan

# Delegasi
POST   /api/perintah/:id/delegasikan           — Delegasikan perintah Gubernur ke bawahan

# Dashboard Kepala Dinas
GET    /api/dashboard/kepala-dinas/summary          — 8 KPI operasional
GET    /api/dashboard/kepala-dinas/kinerja-bawahan  — Kinerja 5 bawahan langsung
GET    /api/dashboard/kepala-dinas/program-progress — Progress program per bidang
GET    /api/dashboard/kepala-dinas/approval-queue   — Dokumen pending dari bawahan
GET    /api/dashboard/kepala-dinas/alerts           — Alert kritis aktif
GET    /api/dashboard/kepala-dinas/perintah-masuk   — Perintah dari Gubernur + status

# Notification
POST   /api/notifications/broadcast-kepala-dinas    — KaDin → bawahan (broadcast)
```

---

## 6. STRUKTUR FOLDER REACT + EXPRESS

```
frontend/src/
├── pages/dashboard/
│   └── kepala-dinas.jsx                     # Main Dashboard Kepala Dinas
├── components/kepala-dinas/
│   ├── PerintahMasukPanel.jsx               # Perintah dari Gubernur
│   ├── PerintahKeluarPanel.jsx              # Buat + pantau perintah ke bawahan
│   ├── ApprovalQueueKaDin.jsx               # Approval dari bawahan
│   ├── KinerjaBawahanPanel.jsx              # Monitoring 5 bawahan
│   ├── ProgramProgressPanel.jsx             # Progress program bidang
│   └── AlertOperasionalPanel.jsx            # Alert & eskalasi

backend/
├── controllers/
│   └── dashboardKadinController.js          # KPI, kinerja bawahan, program progress
├── routes/
│   └── dashboard.js                         # Tambah endpoint kepala-dinas
```

---

## 7. WORKFLOW LOGIKA KEPALA DINAS

```
[Terima Perintah Gubernur]
  → Notif in_app muncul → badge di header
  → Buka tab "Perintah Masuk" → klik detail
  → Klik "Terima" → status: diterima
  → Pilih: kerjakan sendiri | delegasikan ke bawahan
  → Jika delegasi: POST /perintah/:id/delegasikan → bawahan terima tugas
  → Update progress secara berkala (0-100%)
  → Jika selesai: mark selesai | ajukan ke Gubernur untuk approval
  → [Eskalasi] > 2×24 jam tidak direspon → alert kuning di dashboard Gubernur

[Buat Perintah ke Bawahan]
  → Pilih penerima (Sekretaris/Kabid/Kepala UPTD)
  → Isi judul, isi perintah, deadline, prioritas, lampiran
  → POST /perintah → penerima dapat notif
  → Pantau di tab "Perintah Keluar"
  → Jika bawahan mengajukan laporan → review → Setuju/Kembalikan/Tolak

[Approval dari Bawahan]
  → Bawahan kirim approval request → masuk "Approval Queue"
  → Kepala Dinas review detail + lampiran
  → Setuju → notif hijau ke bawahan
  → Kembalikan → catatan → bawahan perbaiki
  → Tolak → notif merah + alasan
```

---

## 8. UI DESIGN

**Warna scheme:** Biru Dinas — `primary: "#1B4F8A"`, `accent: "#F57C00"` (orange untuk alert)

**Header:** sticky, gradient biru gelap, nama Kepala Dinas, total perintah masuk (badge), total pending approval, bell notif

**Tabs:**
1. `ringkasan` — KPI tiles (8), donut chart realisasi program, top 3 alert
2. `perintah_masuk` — tabel perintah dari Gubernur, filter: status, deadline
3. `perintah_keluar` — form buat perintah + tabel status ke bawahan
4. `persetujuan` — card list pending approval dari bawahan
5. `kinerja` — tabel metrik 5 bawahan per periode

**Footer:** "SIGAP-MALUT © 2026 · Dinas Pangan Provinsi Maluku Utara · Dashboard Kepala Dinas"

---

## 9. SINKRONISASI DENGAN GUBERNUR DAN BAWAHAN

| Event di KaDin | Efek di Gubernur | Efek di Bawahan |
|----------------|------------------|-----------------|
| KaDin terima perintah | Status berubah: diterima | — |
| KaDin delegasikan ke bawahan | — | Notif tugas baru |
| KaDin ajukan ke Gubernur | Masuk Approval Queue | — |
| KaDin setujui laporan bawahan | — | Notif hijau "Disetujui" |
| KaDin buat perintah baru | — | Notif perintah masuk |
| KaDin > 2 hari tidak respon Gubernur | Alert kuning | — |

---

## 10. CATATAN PROFESIONAL

- **Hierarki Perintah:** Perintah Gubernur > Perintah KaDin > Perintah Kabid/Sekretaris
- **Audit Trail:** Setiap aksi tersimpan di `perintah_log` dengan user_id + timestamp
- **Deadline Warning:** H-3 notif kuning; H-1 notif merah; Lewat deadline → status `escalated`
- **SLA KaDin → Gubernur:** Response target = 2×24 jam sejak perintah diterima
- **SLA Bawahan → KaDin:** Response target = 1×24 jam untuk perintah prioritas `kritis`
- **Laporan Otomatis:** Setiap akhir minggu, sistem generate rekapitulasi progress ke email KaDin
