# PROMPT SPESIFIKASI — DASHBOARD SEKRETARIS
## SIGAP MALUT · Sistem Informasi Terintegrasi Dinas Pangan Provinsi Maluku Utara

---

## 1. IDENTITAS ROLE

| Atribut | Nilai |
|---------|-------|
| Role Code | `sekretaris` |
| Role Level | 6 |
| Unit | Sekretariat Dinas Pangan |
| Jabatan | Sekretaris Dinas |
| e-Pelara Role | PRATAMA |
| Melapor Ke | Kepala Dinas |
| Membawahi | Kasubag Umum & Kepegawaian, Fungsional Perencanaan, Fungsional Keuangan, Pelaksana Sekretariat |

---

## 2. POSISI SEKRETARIS SEBAGAI HUB DATA

Sekretaris adalah **hub koordinasi** antara Kepala Dinas dan operasional harian sekretariat. Semua dokumen, surat, laporan keuangan, dan kepegawaian mengalir melalui Sekretaris sebelum naik ke Kepala Dinas.

### Alur Kerja Utama:

```
[Pelaksana Sekretariat input data / buat surat]
  → Fungsional (Perencanaan/Keuangan) analisa + verifikasi data
  → Kasubag Umum & Kepegawaian verifikasi administrasi
  → Sekretaris review + setujui / kembalikan
  → Kepala Dinas (jika perlu approval tingkat atas)
```

---

## 3. ALUR PERINTAH (CHAIN OF COMMAND)

### 3.1 Kepala Dinas → Sekretaris (Menerima Perintah)

```
KEPALA DINAS membuat perintah → POST /perintah (ke_role: sekretaris)
  → Notifikasi push ke Sekretaris
  → Sekretaris buka tab "Perintah Masuk"
  → Terima → proses → delegasikan ke Kasubag/Fungsional jika perlu
  → Update progress → laporkan ke KaDin
```

### 3.2 Sekretaris → Bawahan (Membuat Perintah)

```
SEKRETARIS buat perintah → ke_role: kasubag_umum_kepegawaian | fungsional_perencana
                                  | fungsional_analis_keuangan | pelaksana
  → Bawahan terima, proses, laporan kembali
  → Sekretaris review, setujui/kembalikan
```

### 3.3 Approval Workflow Sekretariat

```
[Surat Masuk] → Pelaksana input → Kasubag disposisi → Sekretaris tanda tangan
[Surat Keluar] → Pelaksana draft → Fungsional review → Kasubag verif → Sekretaris TTD + kirim
[Laporan Keuangan] → Bendahara input → Fungsional Keuangan (PPK verify) → Sekretaris setuju → KaDin
[Laporan Kepegawaian] → Pelaksana input → Kasubag verif → Sekretaris setuju
[Perencanaan Anggaran] → Fungsional Perencana susun → Sekretaris setuju → KaDin approval
```

---

## 4. INFORMASI DAN DATA WAJIB

### 4.1 KPI Sekretariat

| Indikator | Sumber | Threshold |
|-----------|--------|-----------|
| Surat Masuk Belum Disposisi | SEK-ADM | > 10 = Warning |
| Surat Keluar Pending Tanda Tangan | SEK-LDS | > 5 = Warning |
| Anggaran Terserap (%) | SEK-KEU | < 70% di Q3 = Warning |
| Pegawai Aktif (%) | SEK-HUM | < 90% = Warning |
| Laporan Tepat Waktu (%) | SEK-LAP (via SEK-KEP) | < 85% = Warning |
| Tugas Pending Bawahan | Perintah outbound | > 5 unresolved = Alert |
| KGB Pending Approval | SEK-KBJ | > 3 = Warning |
| SKP Belum Dinilai | SEK-KEP | > 0 (past deadline) = Kritis |

### 4.2 Modul Sekretariat yang Dipantau

Sesuai master-data `00_MASTER_MODUL_UI_SEKRETARIAT.csv`:
- **SEK-ADM** — Administrasi & Kearsipan
- **SEK-AST** — Pengelolaan Aset
- **SEK-HUM** — Administrasi Kepegawaian (SDM)
- **SEK-KBJ** — Kenaikan Berkala & Jabatan
- **SEK-KEP** — Kepegawaian & SKP
- **SEK-KEU** — Pengelolaan Keuangan
- **SEK-LDS** — Layanan Dokumen & Surat
- **SEK-LKS** — Laporan Kegiatan Sekretariat
- **SEK-LKT** — Laporan Keuangan Triwulan
- **SEK-LUP** — Layanan Umum & Perlengkapan
- **SEK-REN** — Perencanaan Program Sekretariat
- **SEK-RMH** — Rumah Tangga & Fasilitas

### 4.3 Tabs Dashboard Sekretaris

1. **Ringkasan** — KPI tiles, surat masuk/keluar hari ini, notif baru, alert
2. **Perintah** — Masuk (dari KaDin) + Keluar (ke bawahan), tracking
3. **Persetujuan** — approval queue dari Kasubag/Fungsional
4. **Surat & Dokumen** — daftar surat masuk disposisi, surat keluar pending TTD
5. **Keuangan & Anggaran** — ringkasan realisasi, pending dari Fungsional Keuangan
6. **Kepegawaian** — status pegawai, KGB pending, SKP jadwal
7. **Laporan** — laporan berkala per modul sekretariat

---

## 5. ERD — TABEL PENDUKUNG SEKRETARIAT

```sql
-- Surat Masuk (jika belum ada)
-- Sudah dispesifikasikan di migrasi 20260322-create-surat-masuk.js
-- Tambahan: tabel disposisi surat
-- Sudah dispesifikasikan di migrasi 20260322-create-disposisi.js

-- Tambahan kolom TTD digital untuk surat keluar
ALTER TABLE surat_keluar ADD COLUMN IF NOT EXISTS
  ttd_sekretaris_at TIMESTAMP;
ALTER TABLE surat_keluar ADD COLUMN IF NOT EXISTS
  ttd_sekretaris_user_id INTEGER;

-- Tabel Agenda Sekretariat (rapat, kegiatan)
-- Sudah di migrasi 20260322-create-agenda-surat.js

-- Link perintah ke modul SEK
ALTER TABLE perintah ADD COLUMN IF NOT EXISTS
  modul_terkait VARCHAR(20); -- SEK-ADM | SEK-KEU | SEK-HUM | dll
```

---

## 6. API DESIGN — SEKRETARIS

```yaml
# Perintah
GET    /api/perintah/masuk                          — Perintah dari KaDin
PUT    /api/perintah/:id/terima                     — Terima perintah
PUT    /api/perintah/:id/tindak-lanjut              — Update progress + lampiran
POST   /api/perintah/:id/ajukan-ke-kepala-dinas     — Ajukan hasil ke KaDin
POST   /api/perintah                                — Buat perintah ke bawahan

# Surat
GET    /api/surat/masuk?status=belum_disposisi      — Surat masuk perlu disposisi
POST   /api/surat/masuk/:id/disposisi               — Disposisi ke Kasubag/Staf
GET    /api/surat/keluar?status=pending_ttd         — Surat keluar perlu TTD Sekretaris
PUT    /api/surat/keluar/:id/ttd                    — Sekretaris TTD surat keluar
GET    /api/surat/masuk                             — Semua surat masuk
GET    /api/surat/keluar                            — Semua surat keluar

# Approval
GET    /api/approval-queue/sekretaris               — Approval dari bawahan
POST   /api/approval/:id/setujui                    — Setujui dokumen
POST   /api/approval/:id/kembalikan                 — Kembalikan + catatan
POST   /api/approval/:id/tolak                      — Tolak + alasan

# Dashboard Sekretaris
GET    /api/dashboard/sekretaris/summary            — 8 KPI sekretariat
GET    /api/dashboard/sekretaris/surat-today        — Surat masuk/keluar hari ini
GET    /api/dashboard/sekretaris/keuangan-ringkas   — Ringkasan realisasi anggaran
GET    /api/dashboard/sekretaris/kepegawaian        — Status kepegawaian
GET    /api/dashboard/sekretaris/approval-queue     — Pending dari bawahan
GET    /api/dashboard/sekretaris/alerts             — Alert kritis

# Notification
POST   /api/notifications/broadcast-sekretaris      — Sekretaris → bawahan (broadcast)
```

---

## 7. STRUKTUR FOLDER REACT + EXPRESS

```
frontend/src/
├── pages/dashboard/
│   └── sekretaris.jsx                          # Main Dashboard Sekretaris
├── components/sekretaris/
│   ├── PerintahSekretarisPanel.jsx             # Masuk dari KaDin + keluar ke bawahan
│   ├── ApprovalQueueSekretaris.jsx             # Approval dari Kasubag/Fungsional
│   ├── SuratDisposisiPanel.jsx                 # Surat masuk + disposisi
│   ├── SuratKeluarTTDPanel.jsx                 # Surat keluar pending TTD
│   ├── KeuanganRingkasPanel.jsx                # Ringkasan realisasi anggaran
│   └── KepegawaianSekretarisPanel.jsx          # Status pegawai + KGB + SKP

backend/
├── controllers/
│   └── dashboardSekretarisController.js        # Aggregates KPI dari semua modul SEK
├── routes/
│   └── dashboard.js                            # Tambah endpoint sekretaris
```

---

## 8. WORKFLOW LOGIKA SEKRETARIS

```
[Surat Masuk Perlu Disposisi]
  → Sistem auto-assign ke Sekretaris jika belum didisposisi > 24 jam
  → Alert muncul di dashboard
  → Sekretaris klik "Disposisi" → pilih Kasubag/Fungsional/Pelaksana
  → Penerima disposisi dapat notif

[Surat Keluar Perlu TTD]
  → Pelaksana/Kasubag submit surat keluar
  → Masuk antrian di panel "Surat Keluar — Pending TTD"
  → Sekretaris buka detail → review → TTD digital (click confirm)
  → Sistem catat ttd_sekretaris_at + ttd_sekretaris_user_id
  → Status: ditandatangani → siap kirim

[Approval Keuangan]
  → Fungsional Keuangan (PPK) proses SPP → approve SPM
  → Masuk antrian Sekretaris untuk co-approval
  → Sekretaris setuju → naik ke KaDin jika perlu
  → Tolak/kembalikan → kembali ke Fungsional Keuangan

[Laporan Periodik]
  → Kasubag/Fungsional submit laporan modul
  → Sekretaris review → setujui → forward ke KaDin
  → Sistem catat di audit_log
```

---

## 9. UI DESIGN

**Warna scheme:** Biru Dinas + Hijau Tua — `primary: "#1B4F8A"`, `secondary: "#2E7D32"` (sekretariat = hijau)

**Header:** sticky, gradient biru-hijau gelap, nama Sekretaris, badge surat masuk belum disposisi, badge approval pending, bell notif

**Tabs:**
1. `ringkasan` — KPI tiles (8), activity feed hari ini, 3 alert teratas
2. `perintah` — split view: Masuk (dari KaDin) | Keluar (ke bawahan)
3. `persetujuan` — card list: keuangan, kepegawaian, surat keluar, laporan
4. `surat` — inbox surat masuk + disposisi + outbox TTD
5. `keuangan` — mini realisasi chart + pending dari Fungsional Keuangan
6. `kepegawaian` — daftar pegawai aktif, KGB timeline, SKP status

**Footer:** "SIGAP-MALUT © 2026 · Sekretariat Dinas Pangan · Dashboard Sekretaris"

---

## 10. CATATAN PROFESIONAL

- **Hub Koordinasi:** Semua alur dokumen sekretariat wajib melewati Sekretaris sebelum ke KaDin
- **TTD Digital:** Menggunakan konfirmasi explicit (bukan auto-sign) — Sekretaris harus aktif klik "Tanda Tangani"
- **Audit Trail:** Setiap TTD, disposisi, approval tercatat di `audit_log` dengan IP + timestamp
- **SLA Disposisi:** Surat masuk harus didisposisi max 1×24 jam sejak diterima
- **SLA Approval:** Dokumen dari bawahan harus diproses max 2×24 jam
- **Notifikasi Eskalasi:** Jika Sekretaris tidak respon > SLA → auto-notif ke KaDin
- **Arsip Digital:** Setiap surat yang sudah TTD otomatis terarsip di `arsip_surat`
