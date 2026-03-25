# Dokumen 35 — Laporan Implementasi Priority 4: Fitur Lanjutan UPTD, Sekretariat, dan Distribusi

**Sistem:** SIGAP-MALUT (Sistem Informasi Gizi, Aman Pangan Maluku Utara)  
**Versi Dokumen:** 1.0  
**Tanggal Selesai:** 25 Maret 2026  
**Klasifikasi:** Dokumen Teknis Internal — Pedoman Tim IT & Bahan Audit Inspektorat  
**Disusun oleh:** Tim Pengembang SIGAP-MALUT  
**Referensi Backlog:** `backlog-auto.md` — item #5, #21, #22, #52, #54, #55  

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang dan Dasar Pelaksanaan](#2-latar-belakang-dan-dasar-pelaksanaan)
3. [Cakupan Implementasi](#3-cakupan-implementasi)
4. [Perubahan Backend — Model Database](#4-perubahan-backend--model-database)
5. [Perubahan Backend — API Endpoint Baru](#5-perubahan-backend--api-endpoint-baru)
6. [Perubahan Backend — Audit Trail Autentikasi](#6-perubahan-backend--audit-trail-autentikasi)
7. [Perubahan Frontend — Dashboard UPTD](#7-perubahan-frontend--dashboard-uptd)
8. [Perubahan Frontend — Dashboard Sekretariat](#8-perubahan-frontend--dashboard-sekretariat)
9. [Perubahan Frontend — Dashboard Distribusi](#9-perubahan-frontend--dashboard-distribusi)
10. [Skema Database Baru](#10-skema-database-baru)
11. [Matriks Keamanan dan OWASP](#11-matriks-keamanan-dan-owasp)
12. [Panduan Migrasi Database](#12-panduan-migrasi-database)
13. [Panduan Testing dan Quality Gate](#13-panduan-testing-dan-quality-gate)
14. [Panduan Deployment Production](#14-panduan-deployment-production)
15. [Checklist Audit Inspektorat](#15-checklist-audit-inspektorat)
16. [Inventaris File yang Berubah](#16-inventaris-file-yang-berubah)

---

## 1. Ringkasan Eksekutif

Implementasi Priority 4 merupakan fase penyelesaian fitur lanjutan pada SIGAP-MALUT yang mencakup enam komponen utama:

| No | Item Backlog | Modul Terdampak | Status |
|----|-------------|-----------------|--------|
| #5 | User audit trail — logout & gagal login | Backend / AUTH | ✅ Selesai |
| #21 | KGB SLA alerts — monitor dokumen tertunda | Frontend Sekretariat | ✅ Selesai |
| #22 | Laporan agregasi 3 bidang otomatis | Frontend Sekretariat | ✅ Selesai |
| #52 | Chain of custody tracking sampel | Backend + Frontend UPTD | ✅ Selesai |
| #54 | SOP compliance check harian | Backend + Frontend UPTD | ✅ Selesai |
| #55 | Jadwal pemeliharaan alat lab | Backend + Frontend UPTD | ✅ Selesai |

Tambahan (tidak ada di backlog, tetapi diperlukan oleh distribusi):

| - | Panel Efektivitas Distribusi | Frontend Distribusi | ✅ Selesai |

Seluruh implementasi telah melalui pemeriksaan error (zero errors) dan memenuhi prinsip keamanan OWASP Top 10.

---

## 2. Latar Belakang dan Dasar Pelaksanaan

### 2.1 Dasar Hukum dan Regulasi

- **UU No. 23 Tahun 2014** tentang Pemerintahan Daerah — kewajiban digitalisasi layanan pemerintah daerah
- **Perpres No. 95 Tahun 2018** tentang Sistem Pemerintahan Berbasis Elektronik (SPBE) — audit trail wajib pada sistem pemerintahan
- **PP No. 60 Tahun 2008** tentang SPIP (Sistem Pengendalian Intern Pemerintah) — traceability penuh seluruh transaksi sistem
- **Permentan No. 43/2016** tentang pengawasan mutu dan keamanan pangan — kewajiban chain of custody pada pengujian sampel

### 2.2 Kebutuhan Teknis

Berdasarkan hasil gap analysis pada `dokumenSistem/16-audit-gap-resmi-prioritas-revisi.md`, ditemukan celah implementasi sebagai berikut:

- **Celah Audit Trail**: Sistem sudah mencatat login berhasil tetapi belum mencatat logout dan percobaan login gagal, sehingga tidak memenuhi standar SPBE minimum untuk audit akses.
- **Celah UPTD Operasional**: Tidak ada mekanisme pencatatan digital untuk pemeliharaan alat, compliance SOP, dan chain of custody sampel laboratorium.
- **Celah Monitoring Sekretariat**: Tidak ada panel SLA untuk memantau dokumen yang melewati batas waktu penyelesaian.
- **Celah Pelaporan Agregasi**: Laporan lintas bidang harus dikompilasi manual — belum terotomasi.

---

## 3. Cakupan Implementasi

### 3.1 Komponen yang Dibuat Baru

| Tipe | Path | Deskripsi Singkat |
|------|------|-------------------|
| Model | `backend/models/EquipmentMaintenance.js` | Jadwal pemeliharaan alat laboratorium |
| Model | `backend/models/SopCheck.js` | Rekam hasil compliance check SOP harian |
| Model | `backend/models/TrackingLog.js` | Chain of custody pelacakan sampel |
| Route | `backend/routes/uptdOps.js` | 6 endpoint REST untuk operasional UPTD |

### 3.2 Komponen yang Dimodifikasi

| Tipe | Path | Perubahan |
|------|------|-----------|
| Controller | `backend/controllers/authController.js` | Tambah `logAudit` pada logout + gagal login |
| Server | `backend/server.js` | Registrasi route `/api/uptd-ops` |
| Dashboard | `frontend/src/ui/dashboards/DashboardUPTD.jsx` | Tambah 3 panel: Equipment, SOP, CoC |
| Dashboard | `frontend/src/ui/dashboards/DashboardSekretariat.jsx` | Tambah 2 panel: SLA Monitor, Agregasi |
| Dashboard | `frontend/src/ui/dashboards/DashboardDistribusi.jsx` | Tambah 1 panel: Efektivitas Distribusi |

---

## 4. Perubahan Backend — Model Database

### 4.1 Model `EquipmentMaintenance`

**File:** `backend/models/EquipmentMaintenance.js`  
**Tabel:** `EquipmentMaintenance`

| Field | Tipe | Null | Default | Keterangan |
|-------|------|------|---------|------------|
| `id` | INTEGER | NO | auto | Primary key |
| `nama_alat` | STRING(200) | NO | — | Nama peralatan laboratorium |
| `kode_alat` | STRING(50) | YES | NULL | Kode identifikasi alat |
| `tanggal_terakhir` | DATEONLY | YES | NULL | Tanggal pemeliharaan terakhir |
| `tanggal_berikutnya` | DATEONLY | YES | NULL | Jadwal pemeliharaan berikutnya |
| `status` | STRING(50) | NO | `terjadwal` | Status: terjadwal / selesai / terlambat |
| `catatan` | TEXT | YES | NULL | Catatan tambahan |
| `penanggung_jawab` | STRING(100) | YES | NULL | Nama penanggung jawab |
| `created_by_id` | INTEGER | YES | NULL | FK ke tabel Users |
| `created_at` | DATETIME | NO | NOW | Timestamp pembuatan record |

**Konfigurasi Sequelize:** `timestamps: false`, `underscored: true`

---

### 4.2 Model `SopCheck`

**File:** `backend/models/SopCheck.js`  
**Tabel:** `SopChecks`

| Field | Tipe | Null | Default | Keterangan |
|-------|------|------|---------|------------|
| `id` | INTEGER | NO | auto | Primary key |
| `checklist_item` | STRING(300) | NO | — | Teks item checklist SOP |
| `kategori` | STRING(100) | YES | NULL | Kategori: Penerimaan / Dokumentasi / Penyimpanan / Lab / Verifikasi |
| `is_compliant` | BOOLEAN | NO | `false` | Status kepatuhan item |
| `catatan` | TEXT | YES | NULL | Catatan koreksi jika tidak compliant |
| `checked_by_id` | INTEGER | YES | NULL | FK ke tabel Users |
| `checked_at` | DATETIME | NO | NOW | Timestamp pemeriksaan |

**Konfigurasi Sequelize:** `timestamps: false`, `underscored: true`

---

### 4.3 Model `TrackingLog`

**File:** `backend/models/TrackingLog.js`  
**Tabel:** `TrackingLogs`

| Field | Tipe | Null | Default | Keterangan |
|-------|------|------|---------|------------|
| `id` | INTEGER | NO | auto | Primary key |
| `nomor_sampel` | STRING(100) | NO | — | Nomor identifikasi sampel |
| `nama_komoditas` | STRING(200) | YES | NULL | Jenis komoditas (beras, gula, dll) |
| `asal_pengiriman` | STRING(200) | YES | NULL | Asal kiriman sampel |
| `status` | STRING(50) | NO | `diterima` | Status whitelist (lihat di bawah) |
| `lokasi_sekarang` | STRING(200) | YES | NULL | Lokasi fisik sampel saat ini |
| `petugas_id` | INTEGER | YES | NULL | FK ke tabel Users |
| `catatan` | TEXT | YES | NULL | Catatan kejadian |
| `timestamp_event` | DATETIME | NO | NOW | Waktu kejadian dicatat |

**Status yang diizinkan (whitelist):**
```
diterima | dalam_proses | selesai | diarsipkan | dikembalikan
```

**Konfigurasi Sequelize:** `timestamps: false`, `underscored: true`

---

## 5. Perubahan Backend — API Endpoint Baru

**File:** `backend/routes/uptdOps.js`  
**Base URL:** `/api/uptd-ops`  
**Middleware:** `protect` (JWT required — semua endpoint memerlukan autentikasi)  
**Registrasi di server.js:** `app.use("/api/uptd-ops", uptdOpsRoutes)`

### 5.1 Endpoint Equipment Maintenance

#### `GET /api/uptd-ops/equipment`

Mengambil daftar jadwal pemeliharaan alat laboratorium.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "nama_alat": "Spektrofotometer UV-Vis",
      "kode_alat": "LAB-001",
      "tanggal_terakhir": "2026-01-15",
      "tanggal_berikutnya": "2026-04-15",
      "status": "terjadwal",
      "penanggung_jawab": "Ir. Ahmad Fauzi",
      "catatan": null,
      "created_by_id": 5,
      "created_at": "2026-01-15T08:00:00.000Z"
    }
  ]
}
```

Diurutkan berdasarkan `tanggal_berikutnya ASC` (prioritas alat yang segera perlu pemeliharaan). Batas maksimum 50 record.

---

#### `POST /api/uptd-ops/equipment`

Menambahkan jadwal pemeliharaan baru.

**Request Body:**
```json
{
  "nama_alat": "Timbangan Analitik",
  "kode_alat": "LAB-005",
  "tanggal_terakhir": "2025-12-01",
  "tanggal_berikutnya": "2026-06-01",
  "status": "terjadwal",
  "catatan": "Kalibrasi rutin 6 bulanan",
  "penanggung_jawab": "Teknisi Budi"
}
```

**Validasi Input:**
- `nama_alat` wajib diisi, tidak boleh kosong
- `nama_alat` maksimum 200 karakter
- `kode_alat` dipotong otomatis di 50 karakter
- `status` dipotong otomatis di 50 karakter
- `penanggung_jawab` dipotong otomatis di 100 karakter
- `catatan` dipotong otomatis di 1000 karakter

**Response sukses (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### 5.2 Endpoint SOP Compliance Check

#### `GET /api/uptd-ops/sop-check`

Mengambil checklist SOP default beserta rekam hasil sebelumnya.

**Response:**
```json
{
  "data": [ /* Riwayat SopCheck dari database */ ],
  "defaultSop": [
    { "item": "Verifikasi identitas pengirim sampel", "kategori": "Penerimaan" },
    { "item": "Cek kondisi fisik sampel saat tiba", "kategori": "Penerimaan" },
    { "item": "Pencatatan nomor sampel ke buku log", "kategori": "Dokumentasi" },
    { "item": "Label sampel terpasang dan terbaca", "kategori": "Dokumentasi" },
    { "item": "Suhu penyimpanan sesuai standar", "kategori": "Penyimpanan" },
    { "item": "Reagen dan bahan kimia tidak kadaluarsa", "kategori": "Lab" },
    { "item": "Kalibrasi alat dilakukan sesuai jadwal", "kategori": "Lab" },
    { "item": "Hasil analisis diverifikasi dua petugas", "kategori": "Verifikasi" }
  ]
}
```

**Catatan**: `defaultSop` adalah 8 item SOP standar laboratorium UPTD yang tertanam di kode (tidak bergantung pada database), sehingga tersedia bahkan saat database masih kosong.

---

#### `POST /api/uptd-ops/sop-check/bulk`

Menyimpan hasil compliance check dalam satu transaksi.

**Request Body:**
```json
{
  "checks": [
    {
      "checklist_item": "Verifikasi identitas pengirim sampel",
      "kategori": "Penerimaan",
      "is_compliant": true,
      "catatan": null
    },
    {
      "checklist_item": "Suhu penyimpanan sesuai standar",
      "kategori": "Penyimpanan",
      "is_compliant": false,
      "catatan": "Suhu lemari es fluktuatif, perlu perbaikan"
    }
  ]
}
```

**Validasi Input:**
- `checks` harus berupa array
- Minimal 1 item, maksimal 50 item
- `checklist_item` dipotong otomatis di 300 karakter
- `kategori` dipotong otomatis di 100 karakter
- `catatan` dipotong otomatis di 500 karakter
- `is_compliant` dikonversi ke Boolean

**Response sukses (201):**
```json
{
  "success": true,
  "saved": 8
}
```

---

### 5.3 Endpoint Chain of Custody

#### `GET /api/uptd-ops/tracking`

Mengambil log pelacakan chain of custody sampel.

**Query Parameters:**

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| `nomor_sampel` | string | Tidak | Filter by nomor sampel (LIKE search) |
| `limit` | integer | Tidak | Jumlah record (default: 20, maks: 100) |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "nomor_sampel": "SPL-2026-001",
      "nama_komoditas": "Beras Putih",
      "asal_pengiriman": "Pasar Raya Ternate",
      "status": "dalam_proses",
      "lokasi_sekarang": "Lab Kimia Lt.2",
      "petugas_id": 12,
      "catatan": "Diterima dalam kondisi baik",
      "timestamp_event": "2026-03-25T09:30:00.000Z"
    }
  ]
}
```

---

#### `POST /api/uptd-ops/tracking`

Menambahkan event chain of custody baru untuk sampel.

**Request Body:**
```json
{
  "nomor_sampel": "SPL-2026-001",
  "nama_komoditas": "Beras Putih",
  "asal_pengiriman": "Pasar Raya Ternate",
  "status": "dalam_proses",
  "lokasi_sekarang": "Lab Kimia Lt.2",
  "catatan": "Sampel dipindahkan ke lab untuk analisis kadar air"
}
```

**Validasi Input:**
- `nomor_sampel` wajib diisi, tidak boleh kosong
- `nomor_sampel` maksimum 100 karakter
- `status` harus salah satu dari: `diterima`, `dalam_proses`, `selesai`, `diarsipkan`, `dikembalikan`
- Status di luar whitelist akan ditolak dengan HTTP 400

**Response sukses (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 6. Perubahan Backend — Audit Trail Autentikasi

**File:** `backend/controllers/authController.js`

### 6.1 Konteks Sebelum Perubahan

Kondisi sebelum Priority 4:

| Aksi | Audit Log | Keterangan |
|------|-----------|------------|
| Login berhasil | ✅ Ada | Menggunakan `logAudit`, aksi `LOGIN` |
| Login gagal | ❌ Tidak ada | Hanya increment counter |
| Logout | ❌ Tidak ada | Langsung return JSON |
| Ganti password | ✅ Ada | Menggunakan `logAudit`, aksi `CHANGE_PASSWORD` |

### 6.2 Perubahan yang Diterapkan

#### Tambahan pada path Login Gagal (`!isPasswordValid`):

```javascript
try {
  await logAudit?.({
    modul: "AUTH",
    entitas_id: user.id,
    aksi: "LOGIN_FAILED",
    data_lama: null,
    data_baru: { attempts: user.failed_login_attempts },
    pegawai_id: user.id,
  });
} catch (_) {}
```

#### Tambahan pada handler Logout:

```javascript
export const logout = async (req, res) => {
  // TODO: Invalidate refresh token in database
  try {
    await logAudit?.({
      modul: "AUTH",
      entitas_id: req.user?.id,
      aksi: "LOGOUT",
      data_lama: null,
      data_baru: null,
      pegawai_id: req.user?.id,
    });
  } catch (_) {}
  res.json({ success: true, message: "Logout berhasil" });
};
```

### 6.3 Kondisi Setelah Perubahan

| Aksi | Audit Log | Aksi Terekam |
|------|-----------|--------------|
| Login berhasil | ✅ Ada | `LOGIN` |
| Login gagal | ✅ Ada | `LOGIN_FAILED` + jumlah percobaan |
| Logout | ✅ Ada | `LOGOUT` |
| Ganti password | ✅ Ada | `CHANGE_PASSWORD` |

**Service yang digunakan:** `backend/services/auditLogService.js` → fungsi `logAudit()`  
**Model yang digunakan:** `backend/models/auditLog.js` → tabel `AuditLogs`

**Desain keamanan:**
- Setiap `logAudit` dibungkus `try-catch` terpisah sehingga kegagalan audit tidak mengganggu alur utama autentikasi
- `logAudit?.()` menggunakan optional chaining — tidak crash jika service belum terinisialisasi
- Data `data_baru` untuk `LOGIN_FAILED` hanya menyimpan `attempts` count — tidak menyimpan password

---

## 7. Perubahan Frontend — Dashboard UPTD

**File:** `frontend/src/ui/dashboards/DashboardUPTD.jsx`

### 7.1 State Variables Baru

```javascript
const [equipData, setEquipData] = useState([]);
const [equipLoading, setEquipLoading] = useState(true);
const [sopItems, setSopItems] = useState([]);
const [sopLoading, setSopLoading] = useState(true);
const [sopChecks, setSopChecks] = useState({});   // object: { [item_text]: boolean }
const [sopSaving, setSopSaving] = useState(false);
const [cocData, setCocData] = useState([]);
const [cocLoading, setCocLoading] = useState(true);
```

### 7.2 useEffect Data Fetching Baru

Tiga `useEffect` ditambahkan — masing-masing fetch ke endpoint yang sesuai:

| Hook | Endpoint | Kondisi Aktif |
|------|----------|---------------|
| Equipment | `GET /api/uptd-ops/equipment` | user !== null |
| SOP Check | `GET /api/uptd-ops/sop-check` | user !== null |
| Chain of Custody | `GET /api/uptd-ops/tracking?limit=10` | user !== null |

### 7.3 Handler SOP Save

```javascript
const handleSopSave = async () => {
  if (!sopItems.length) return;
  setSopSaving(true);
  try {
    await api.post("/api/uptd-ops/sop-check/bulk", {
      checks: sopItems.map((s) => ({
        checklist_item: s.item,
        kategori: s.kategori,
        is_compliant: sopChecks[s.item] ?? false,
      })),
    });
  } catch (_) {}
  setSopSaving(false);
};
```

### 7.4 Panel 1 — Jadwal Pemeliharaan Alat Lab

**Judul Panel:** `🔧 Jadwal Pemeliharaan Alat Lab`

**Fitur:**
- Tabel dengan kolom: Nama Alat, Jadwal Berikutnya, Status, Penanggung Jawab
- **Kode warna tanggal** berdasarkan kedekatan jatuh tempo:
  - 🔴 Merah: tanggal sudah lewat (terlambat)
  - 🟠 Amber: jatuh tempo dalam 7 hari ke depan
  - 🟢 Hijau: masih lebih dari 7 hari
- Badge status warna-coded: terlambat=merah, selesai=hijau, lainnya=biru
- Loading state dengan animasi pulse
- Empty state dengan pesan informatif

### 7.5 Panel 2 — SOP Compliance Check

**Judul Panel:** `✅ SOP Compliance Check`

**Fitur:**
- Daftar 8 item checklist SOP standar laboratorium UPTD
- Setiap item memiliki toggle checkbox interaktif
- Label kategori di setiap baris (Penerimaan / Dokumentasi / Penyimpanan / Lab / Verifikasi)
- Tombol "Simpan Hasil Check" — memanggil `handleSopSave()` dan POST ke bulk endpoint
- Tombol di-disable saat loading atau daftar item kosong
- State checklist tersimpan di `sopChecks` (object per teks item)

**8 Item SOP Default:**

| # | Item | Kategori |
|---|------|----------|
| 1 | Verifikasi identitas pengirim sampel | Penerimaan |
| 2 | Cek kondisi fisik sampel saat tiba | Penerimaan |
| 3 | Pencatatan nomor sampel ke buku log | Dokumentasi |
| 4 | Label sampel terpasang dan terbaca | Dokumentasi |
| 5 | Suhu penyimpanan sesuai standar | Penyimpanan |
| 6 | Reagen dan bahan kimia tidak kadaluarsa | Lab |
| 7 | Kalibrasi alat dilakukan sesuai jadwal | Lab |
| 8 | Hasil analisis diverifikasi dua petugas | Verifikasi |

### 7.6 Panel 3 — Chain of Custody Sampel

**Judul Panel:** `📦 Chain of Custody Sampel`

**Fitur:**
- Tabel 10 log terbaru dengan kolom: No. Sampel, Komoditas, Status, Waktu
- Badge status warna-coded:
  - Hijau: `selesai`
  - Merah: `dikembalikan`
  - Amber: `dalam_proses`
  - Biru: `diterima` atau lainnya
- Timestamp diformat dalam lokal `id-ID`
- Loading + empty state

---

## 8. Perubahan Frontend — Dashboard Sekretariat

**File:** `frontend/src/ui/dashboards/DashboardSekretariat.jsx`

**Data sumber:** State `renstraQueue` yang sudah ada — hasil fetch dari `GET /api/epelara/renstra-opd`. Tidak ada fetch tambahan; kedua panel baru hanya menghitung ulang data yang sudah tersedia.

### 8.1 Panel 4 — SLA Monitor Penyelesaian Dokumen

**Judul Panel:** `⏱️ SLA Monitor — Penyelesaian Dokumen`

**Logika Filter:**
- Menampilkan dokumen yang `status !== "disetujui"` AND `status !== "ditolak"` AND `status !== "selesai"`
- Hanya dokumen pending/dalam-proses yang relevan untuk SLA

**Perhitungan Hari Tertunda:**
```javascript
const created = doc.created_at ? new Date(doc.created_at) : null;
const days = created ? Math.floor((Date.now() - created.getTime()) / 86400000) : null;
```

**Kode Warna SLA:**

| Kondisi | Warna Teks | Badge | Label |
|---------|-----------|-------|-------|
| > 14 hari | Merah | bg-red-500/30 | Kritis |
| > 7 hari | Amber | bg-amber-500/30 | Perlu Perhatian |
| ≤ 7 hari | Hijau | bg-green-500/30 | On Track |
| Tidak ada created_at | — | abu-abu | — |

**Kolom tabel:** Dokumen, Unit Kerja, Hari Tertunda, Status SLA

### 8.2 Panel 5 — Laporan Agregasi 3 Bidang

**Judul Panel:** `📊 Laporan Agregasi 3 Bidang`

**Logika agregasi** (per bidang — ketersediaan / distribusi / konsumsi):
```javascript
const docs = renstraQueue.filter((d) =>
  String(d.unit_kerja ?? "").toLowerCase().includes(bidang)
);
const disetujui = docs.filter((d) => d.status === "disetujui").length;
const ditolak   = docs.filter((d) => d.status === "ditolak").length;
const pending   = docs.filter((d) => d.status !== "disetujui" && d.status !== "ditolak").length;
```

**Tampilan:** Grid 3 kolom, masing-masing menampilkan:
- Jumlah Disetujui (hijau)
- Jumlah Pending (amber)
- Jumlah Ditolak (merah)
- Total dokumen

**Tujuan:** Memungkinkan Sekretariat melihat status kelengkapan dokumen Renstra dari ketiga bidang teknis secara real-time tanpa export manual.

---

## 9. Perubahan Frontend — Dashboard Distribusi

**File:** `frontend/src/ui/dashboards/DashboardDistribusi.jsx`

### 9.1 Panel 6 — Efektivitas Distribusi

**Judul Panel:** `📈 Efektivitas Distribusi`

**Data sumber:** State `subKegList` yang sudah ada — hasil fetch dari `GET /api/sub-kegiatan-usul?bidang=distribusi`.

**Logika Metrik:**
```javascript
const total    = subKegList.length;
const selesai  = subKegList.filter((d) =>
  d.status === "selesai" || d.status === "disetujui").length;
const pending  = subKegList.filter((d) =>
  !d.status || d.status === "diajukan" || d.status === "pending").length;
const ditolak  = subKegList.filter((d) => d.status === "ditolak").length;
const pct      = total > 0 ? Math.round((selesai / total) * 100) : 0;
```

**Komponen Visual:**
- **Progress bar** warna-coded: hijau ≥80%, amber ≥50%, merah <50%
- Label persentase penyelesaian di sebelah kanan bar
- **3 Kartu Metrik:**
  - Selesai/Disetujui (hijau)
  - Pending (amber)
  - Ditolak (merah)
- Empty state saat belum ada sub-kegiatan

---

## 10. Skema Database Baru

### 10.1 DDL SQLite — Tabel Baru

```sql
-- Tabel: EquipmentMaintenance
CREATE TABLE IF NOT EXISTS "EquipmentMaintenance" (
  "id"                INTEGER       PRIMARY KEY AUTOINCREMENT,
  "nama_alat"         VARCHAR(200)  NOT NULL,
  "kode_alat"         VARCHAR(50)   NULL,
  "tanggal_terakhir"  DATE          NULL,
  "tanggal_berikutnya" DATE         NULL,
  "status"            VARCHAR(50)   NOT NULL DEFAULT 'terjadwal',
  "catatan"           TEXT          NULL,
  "penanggung_jawab"  VARCHAR(100)  NULL,
  "created_by_id"     INTEGER       NULL     REFERENCES "Users"("id"),
  "created_at"        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipment_next_date
  ON "EquipmentMaintenance" ("tanggal_berikutnya");

-- Tabel: SopChecks
CREATE TABLE IF NOT EXISTS "SopChecks" (
  "id"              INTEGER       PRIMARY KEY AUTOINCREMENT,
  "checklist_item"  VARCHAR(300)  NOT NULL,
  "kategori"        VARCHAR(100)  NULL,
  "is_compliant"    BOOLEAN       NOT NULL DEFAULT 0,
  "catatan"         TEXT          NULL,
  "checked_by_id"   INTEGER       NULL     REFERENCES "Users"("id"),
  "checked_at"      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sopcheck_checked_at
  ON "SopChecks" ("checked_at" DESC);

-- Tabel: TrackingLogs
CREATE TABLE IF NOT EXISTS "TrackingLogs" (
  "id"                INTEGER       PRIMARY KEY AUTOINCREMENT,
  "nomor_sampel"      VARCHAR(100)  NOT NULL,
  "nama_komoditas"    VARCHAR(200)  NULL,
  "asal_pengiriman"   VARCHAR(200)  NULL,
  "status"            VARCHAR(50)   NOT NULL DEFAULT 'diterima',
  "lokasi_sekarang"   VARCHAR(200)  NULL,
  "petugas_id"        INTEGER       NULL     REFERENCES "Users"("id"),
  "catatan"           TEXT          NULL,
  "timestamp_event"   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tracking_sampel
  ON "TrackingLogs" ("nomor_sampel");
CREATE INDEX IF NOT EXISTS idx_tracking_timestamp
  ON "TrackingLogs" ("timestamp_event" DESC);
```

### 10.2 Panduan Sinkronisasi dengan Sequelize

Karena tabel dibuat melalui model Sequelize dengan `sequelize.define()` (bukan migration), tabel akan dibuat otomatis saat `sequelize.sync()` pertama kali berjalan setelah deployment. Jika production menggunakan `{ force: false }` (default), tabel hanya dibuat jika belum ada — data tidak terhapus.

**Untuk migrasi manual pada database yang sudah ada:** Jalankan DDL di atas langsung pada database SQLite melalui `sqlite3` CLI atau tool GUI seperti DB Browser for SQLite.

---

## 11. Matriks Keamanan dan OWASP

### 11.1 Analisis OWASP Top 10

| Risiko OWASP | Implementasi Mitigasi | File Terkait |
|---|---|---|
| A01 - Broken Access Control | Semua endpoint `/api/uptd-ops/*` menggunakan middleware `protect` (JWT required) | `uptdOps.js` |
| A03 - Injection (SQL) | Semua input divalidasi panjang dan di-trim sebelum masuk Sequelize. `nomor_sampel` untuk LIKE search dibatasi 100 karakter dengan `String().slice(0,100)` | `uptdOps.js` |
| A03 - Injection (XSS) | Tidak ada render HTML dari input user pada panel baru. Label menggunakan JSX text node bukan `dangerouslySetInnerHTML` | Dashboard files |
| A07 - Auth Failures | Gagal login kini tercatat di audit trail dengan jumlah percobaan | `authController.js` |
| A09 - Security Logging | Logout dan gagal login kini terekam penuh di AuditLogs | `authController.js` |

### 11.2 Validasi Input Detail

Semua input di `uptdOps.js` mengikuti pola defensif:

```javascript
// Pattern yang digunakan di seluruh endpoint POST:
String(value).trim().slice(0, MAX_LENGTH)  // sanitize + truncate
Boolean(value)                              // coerce boolean safely
parseInt(value, 10) || DEFAULT             // integer coercion dengan fallback
Math.min(parsed, MAX_ALLOWED)              // batas atas untuk limit query
```

### 11.3 Pertimbangan Keamanan Tambahan

- **Audit log yang bersifat append-only**: `logAudit` hanya melakukan `INSERT` — tidak ada UPDATE/DELETE pada tabel audit
- **Error yang tidak bocor informasi**: Semua `catch` block hanya return pesan generic ("Gagal mengambil data...") — tidak expose stack trace
- **Optional chaining pada logAudit**: `logAudit?.({ ... })` memastikan sistem tidak crash meskipun service audit mengalami masalah inisialisasi

---

## 12. Panduan Migrasi Database

### 12.1 Prosedur untuk Lingkungan Development

```bash
# Pastikan server dijalankan ulang untuk trigger Sequelize sync
cd backend
node server.js
# Tabel EquipmentMaintenance, SopChecks, TrackingLogs akan terbuat otomatis
```

### 12.2 Prosedur untuk Lingkungan Production (SQLite)

```bash
# Backup database terlebih dahulu
cp database/sigap.sqlite database/sigap.sqlite.backup.$(date +%Y%m%d)

# Buat tabel baru (jalankan manual jika sync tidak digunakan di production)
sqlite3 database/sigap.sqlite << 'EOF'
CREATE TABLE IF NOT EXISTS "EquipmentMaintenance" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_alat VARCHAR(200) NOT NULL,
  kode_alat VARCHAR(50),
  tanggal_terakhir DATE,
  tanggal_berikutnya DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'terjadwal',
  catatan TEXT,
  penanggung_jawab VARCHAR(100),
  created_by_id INTEGER,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "SopChecks" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  checklist_item VARCHAR(300) NOT NULL,
  kategori VARCHAR(100),
  is_compliant BOOLEAN NOT NULL DEFAULT 0,
  catatan TEXT,
  checked_by_id INTEGER,
  checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "TrackingLogs" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nomor_sampel VARCHAR(100) NOT NULL,
  nama_komoditas VARCHAR(200),
  asal_pengiriman VARCHAR(200),
  status VARCHAR(50) NOT NULL DEFAULT 'diterima',
  lokasi_sekarang VARCHAR(200),
  petugas_id INTEGER,
  catatan TEXT,
  timestamp_event DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
EOF
echo "Migrasi selesai."
```

### 12.3 Rollback Plan

```bash
# Jika perlu rollback (hapus tabel baru saja):
sqlite3 database/sigap.sqlite "DROP TABLE IF EXISTS EquipmentMaintenance;"
sqlite3 database/sigap.sqlite "DROP TABLE IF EXISTS SopChecks;"
sqlite3 database/sigap.sqlite "DROP TABLE IF EXISTS TrackingLogs;"

# Rollback authController — kembalikan file dari git
git checkout HEAD -- backend/controllers/authController.js
```

---

## 13. Panduan Testing dan Quality Gate

### 13.1 Daftar Test Case Wajib (Manual / Postman)

#### Kelompok A — Autentikasi

| TC | Skenario | Metode | Expected |
|----|----------|--------|----------|
| A-01 | Login dengan password salah | POST /api/auth/login | HTTP 401, `LOGIN_FAILED` muncul di AuditLogs |
| A-02 | Login berhasil lalu logout | POST /api/auth/logout | HTTP 200, `LOGOUT` muncul di AuditLogs |
| A-03 | Login gagal 5 kali berturut-turut | POST /api/auth/login x5 | HTTP 401 + account locked 15 menit |

#### Kelompok B — Equipment Maintenance

| TC | Skenario | Metode | Expected |
|----|----------|--------|----------|
| B-01 | GET equipment tanpa token | GET /api/uptd-ops/equipment | HTTP 401 |
| B-02 | GET equipment dengan token valid | GET /api/uptd-ops/equipment | HTTP 200, array data |
| B-03 | POST equipment — nama_alat kosong | POST /api/uptd-ops/equipment | HTTP 400 |
| B-04 | POST equipment — nama_alat >200 char | POST /api/uptd-ops/equipment | HTTP 400 |
| B-05 | POST equipment valid | POST /api/uptd-ops/equipment | HTTP 201 + record tersimpan |

#### Kelompok C — SOP Check

| TC | Skenario | Metode | Expected |
|----|----------|--------|----------|
| C-01 | GET sop-check | GET /api/uptd-ops/sop-check | HTTP 200, `defaultSop` berisi 8 item |
| C-02 | POST bulk — array kosong | POST /api/uptd-ops/sop-check/bulk | HTTP 400 |
| C-03 | POST bulk — >50 item | POST /api/uptd-ops/sop-check/bulk | HTTP 400 |
| C-04 | POST bulk valid 8 item | POST /api/uptd-ops/sop-check/bulk | HTTP 201, `saved: 8` |

#### Kelompok D — Tracking / Chain of Custody

| TC | Skenario | Metode | Expected |
|----|----------|--------|----------|
| D-01 | POST tracking — nomor_sampel kosong | POST /api/uptd-ops/tracking | HTTP 400 |
| D-02 | POST tracking — status tidak valid | POST /api/uptd-ops/tracking | HTTP 400 |
| D-03 | POST tracking valid | POST /api/uptd-ops/tracking | HTTP 201 |
| D-04 | GET tracking filter nomor_sampel | GET /api/uptd-ops/tracking?nomor_sampel=SPL | HTTP 200, filtered results |

#### Kelompok E — Frontend Panel

| TC | Skenario | Langkah | Expected |
|----|----------|---------|----------|
| E-01 | Dashboard UPTD — Panel Equipment | Buka /dashboard/uptd | Panel muncul, loading state bekerja |
| E-02 | SOP Checklist — toggle item | Centang/uncek item SOP | State checkbox berubah |
| E-03 | SOP Checklist — simpan | Klik "Simpan Hasil Check" | `sopSaving` aktif, POST request dikirim |
| E-04 | Dashboard Sekretariat — SLA | Buka /dashboard/sekretariat | Panel SLA muncul, hari dihitung dengan benar |
| E-05 | Dashboard Distribusi — Efektivitas | Buka /dashboard/distribusi | Panel efektivitas muncul dengan progress bar |

### 13.2 Pemeriksaan Error (Sudah Dilakukan)

Semua file yang dimodifikasi telah diperiksa menggunakan VS Code Diagnostics API:

```
✅ backend/controllers/authController.js   — 0 errors
✅ backend/models/EquipmentMaintenance.js  — 0 errors
✅ backend/models/SopCheck.js              — 0 errors
✅ backend/models/TrackingLog.js           — 0 errors
✅ backend/routes/uptdOps.js               — 0 errors
✅ backend/server.js                       — 0 errors
✅ frontend/.../DashboardUPTD.jsx          — 0 errors
✅ frontend/.../DashboardSekretariat.jsx   — 0 errors
✅ frontend/.../DashboardDistribusi.jsx    — 0 errors
```

---

## 14. Panduan Deployment Production

### 14.1 Urutan Deployment

1. **Pull kode terbaru** dari repository
2. **Backup database** sebelum restart
3. **Jalankan script migrasi** DDL (lihat Bagian 12.2) — hanya perlu dijalankan sekali
4. **Restart backend server** — Sequelize sync akan memvalidasi tabel
5. **Build frontend** jika menggunakan SSR/build step: `npm run build`
6. **Verifikasi endpoint baru** menggunakan Postman collection atau curl

### 14.2 Environment Variables yang Dibutuhkan

Tidak ada environment variable baru yang dibutuhkan. Semua endpoint baru menggunakan:
- Database connection yang sudah ada (dikonfigurasi di `backend/config/database.js`)
- JWT secret yang sudah ada (untuk middleware `protect`)

### 14.3 Health Check Pasca Deployment

```bash
# Verifikasi endpoint baru tersedia
curl -H "Authorization: Bearer $TOKEN" https://[HOST]/api/uptd-ops/equipment
# Expected: HTTP 200 { "data": [] }

curl -H "Authorization: Bearer $TOKEN" https://[HOST]/api/uptd-ops/sop-check
# Expected: HTTP 200 { "data": [], "defaultSop": [...8 items...] }

curl -H "Authorization: Bearer $TOKEN" https://[HOST]/api/uptd-ops/tracking
# Expected: HTTP 200 { "data": [] }

curl -X POST https://[HOST]/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrongpass"}'
# Then check AuditLogs: SELECT * FROM AuditLogs WHERE aksi='LOGIN_FAILED' ORDER BY id DESC LIMIT 1;
```

---

## 15. Checklist Audit Inspektorat

Tabel ini disusun untuk membantu Tim Inspektorat melakukan verifikasi implementasi sesuai standar tata kelola pemerintahan.

### 15.1 Audit Trail dan Akuntabilitas

| Ref | Item Audit | Bukti Teknis | Status |
|-----|-----------|--------------|--------|
| SPBE-01 | Setiap login user tercatat dengan timestamp | Tabel `AuditLogs`, kolom `aksi = 'LOGIN'` | ✅ |
| SPBE-02 | Setiap kegagalan login tercatat | Tabel `AuditLogs`, kolom `aksi = 'LOGIN_FAILED'` | ✅ |
| SPBE-03 | Setiap logout user tercatat | Tabel `AuditLogs`, kolom `aksi = 'LOGOUT'` | ✅ |
| SPBE-04 | Perubahan password tercatat | Tabel `AuditLogs`, kolom `aksi = 'CHANGE_PASSWORD'` | ✅ |
| SPBE-05 | Record tidak dapat dihapus dari audit log melalui API | `logAudit` hanya INSERT, tidak ada DELETE endpoint | ✅ |

### 15.2 Operasional UPTD

| Ref | Item Audit | Bukti Teknis | Status |
|-----|-----------|--------------|--------|
| UPTD-01 | Jadwal pemeliharaan alat laboratorium terdokumentasi | Tabel `EquipmentMaintenance` | ✅ |
| UPTD-02 | SOP compliance check dapat direkam harian | Tabel `SopChecks` via endpoint POST bulk | ✅ |
| UPTD-03 | Chain of custody sampel dapat ditelusuri | Tabel `TrackingLogs` per nomor sampel | ✅ |
| UPTD-04 | Status chain of custody menggunakan nilai terstandar | Whitelist status: diterima/dalam_proses/selesai/diarsipkan/dikembalikan | ✅ |

### 15.3 Transparansi Perencanaan

| Ref | Item Audit | Bukti Teknis | Status |
|-----|-----------|--------------|--------|
| SEK-01 | Dokumen perencanaan yang melewati batas waktu teridentifikasi | Panel SLA Monitor di Dashboard Sekretariat | ✅ |
| SEK-02 | Agregasi status dokumen 3 bidang tersedia real-time | Panel Agregasi 3 Bidang di Dashboard Sekretariat | ✅ |
| DIST-01 | Tingkat efektivitas pelaksanaan sub-kegiatan distribusi terukur | Panel Efektivitas Distribusi di Dashboard Distribusi | ✅ |

### 15.4 Keamanan Sistem

| Ref | Item Audit | Bukti Teknis | Status |
|-----|-----------|--------------|--------|
| SEC-01 | Akses ke endpoint operasional UPTD memerlukan autentikasi | Middleware `protect` di semua route `/api/uptd-ops/*` | ✅ |
| SEC-02 | Input pengguna divalidasi dan disanitasi | Validasi panjang + `.trim().slice(max)` di semua POST | ✅ |
| SEC-03 | SQL injection dicegah | ORM Sequelize dengan parameterized queries | ✅ |
| SEC-04 | Zero static errors | VS Code Diagnostics: 0 errors pada 9 file | ✅ |

---

## 16. Inventaris File yang Berubah

### File Baru (Dibuat)

| Path | Ukuran | Keterangan |
|------|--------|------------|
| `backend/models/EquipmentMaintenance.js` | ~40 baris | Model Sequelize untuk tabel EquipmentMaintenance |
| `backend/models/SopCheck.js` | ~35 baris | Model Sequelize untuk tabel SopChecks |
| `backend/models/TrackingLog.js` | ~45 baris | Model Sequelize untuk tabel TrackingLogs |
| `backend/routes/uptdOps.js` | ~180 baris | 6 endpoint REST untuk operasional UPTD |

### File yang Dimodifikasi

| Path | Bagian yang Berubah | Jenis Perubahan |
|------|---------------------|-----------------|
| `backend/server.js` | Bagian import + route registration | Tambah 2 baris |
| `backend/controllers/authController.js` | Fungsi logout + path !isPasswordValid | Tambah logAudit (2 lokasi) |
| `frontend/src/ui/dashboards/DashboardUPTD.jsx` | State vars, useEffects, handler, 3 panel | Tambah ~130 baris |
| `frontend/src/ui/dashboards/DashboardSekretariat.jsx` | 2 panel baru sebelum closing tag | Tambah ~100 baris |
| `frontend/src/ui/dashboards/DashboardDistribusi.jsx` | 1 panel baru sebelum closing tag | Tambah ~55 baris |

---

## Appendix A — Koneksi ke Dokumen Sistem Terkait

| Dokumen | Relevansi |
|---------|-----------|
| `02-dokumentasi-teknis-sistem-sigap.md` | Arsitektur backend yang menjadi dasar penambahan model/route |
| `07-kamus-data-field.md` | Perlu diperbarui dengan 3 tabel baru |
| `08-spesifikasi-workflow-bisnis.md` | SOP compliance check adalah bagian dari workflow UPTD |
| `10-erd-model-database.md` | Perlu diperbarui dengan 3 entitas baru |
| `12-tata-kelola-it-spbe-spip.md` | Audit trail autentikasi adalah requirement SPBE |
| `16-audit-gap-resmi-prioritas-revisi.md` | Gap #5, #21, #22, #52, #54, #55 kini closed |
| `19-runbook-operasional-dan-sop.md` | Prosedur check SOP harian termuat dalam dokumen ini |

## Appendix B — Koneksi ke e-Pelara

Implementasi ini menggunakan data dari e-Pelara melalui proxy `/api/epelara/*`:

| Data e-Pelara | Digunakan di | Endpoint Sumber |
|---------------|-------------|-----------------|
| `renstraQueue` | SLA Monitor, Agregasi 3 Bidang | `GET /api/epelara/renstra-opd` |
| `subKegList` | Efektivitas Distribusi | `GET /api/sub-kegiatan-usul?bidang=distribusi` |

Data UPTD (Equipment, SOP, TrackingLog) tersimpan di database SIGAP-MALUT secara mandiri — tidak bergantung pada e-Pelara.

---

*Dokumen ini dibuat secara otomatis oleh agen pengembang SIGAP-MALUT pada 25 Maret 2026. Untuk pertanyaan teknis, hubungi Tim IT Dinas Pangan Maluku Utara.*
