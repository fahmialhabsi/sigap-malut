# Panduan Implementasi 94 Modul SIGAP-MALUT — Semua Pekerjaan Dalam Sistem

**Versi:** 1.0 | **Tanggal:** 2026-04-05 | **Status:** AKTIF

## Prinsip Utama

> **Seluruh pekerjaan operasional harus dilakukan di dalam sistem SIGAP-MALUT.**
> Tidak ada dokumen yang dibuat di luar sistem (Excel, Google Sheets, Google Drive) kecuali sebagai lampiran pendukung opsional.

---

## Arsitektur Fondasi Form

### 1. Engine Form Universal (`DynamicForm.jsx`)
- Membaca definisi field dari **FIELDS CSV di master-data**
- Mendukung semua tipe: `varchar`, `text`, `int`, `decimal`, `date`, `datetime`, `enum`, `boolean`, `file`
- Validasi otomatis berdasarkan kolom `is_required` dan `validation` di CSV
- Digunakan oleh semua 94 modul — tidak perlu kode duplikat

### 2. Hook Field Loader (`useModulFields.js`)
- Fetch CSV dari `/master-data/FIELDS/FIELDS_{modul_id}.csv`
- Parse CSV ke array field definition
- Cache per modul (tidak fetch ulang)

### 3. Panel Modul Universal (`ModulFormPanel.jsx`)
- Wrapper di atas `DynamicForm` + tab Riwayat
- Terima prop `modulId` → otomatis load fields + endpoint API
- Semua 94 modul dapat dirender dengan satu komponen

### 4. Penggunaan di Dashboard
```jsx
// Contoh: Tampilkan modul Data ASN di Dashboard Kasubag
import ModulFormPanel from "../components/ModulFormPanel";

<ModulFormPanel modulId="M001" title="Data ASN" />

// Contoh: Modul Harga Pangan Harian di Dashboard Pelaksana Distribusi
<ModulFormPanel modulId="M043" title="Input Harga Pangan Harian" taskId={tugasSaatIni.id} />
```

---

## Tabel Lengkap 94 Modul — Role, Endpoint, Status

### Sekretariat

| Modul ID | Nama Modul | Role Input | Role Verifikasi | Endpoint API | FIELDS CSV | Status |
|----------|-----------|-----------|----------------|-------------|-----------|--------|
| M001 | Data ASN | Kasubag / Pelaksana | Sekretaris | `/api/sek-adm` | `FIELDS_M001.csv` | ✅ API ada |
| M002 | Tracking KGB | Kasubag | Sekretaris → Kadis | `/api/kgb` | `FIELDS_M002.csv` | ✅ API ada |
| M003 | Tracking Kenaikan Pangkat | Kasubag | Sekretaris | `/api/sek-kep` | `FIELDS_M003.csv` | ✅ API ada |
| M004 | Tracking Penghargaan | Kasubag | Sekretaris | `/api/sek-kep` | `FIELDS_M004.csv` | ⚠️ Partial |
| M005 | Data Cuti | Pelaksana / ASN | Kasubag | `/api/sek-kep` | `FIELDS_M005.csv` | ✅ API ada |
| M006 | SPPD / Perjalanan Dinas | Pelaksana | Kasubag → Bendahara | `/api/sek-lup` | `FIELDS_M006.csv` | ✅ API ada |
| M007 | Diklat & Pelatihan | Kasubag | Sekretaris | `/api/sek-kep` | `FIELDS_M007.csv` | ⚠️ Partial |
| M008 | SKP | Pelaksana | Kasubag → Sekretaris | `/api/sek-kep` | `FIELDS_M008.csv` | ⚠️ Partial |
| M009 | Database Kepegawaian | Kasubag | Sekretaris | `/api/sek-adm` | `FIELDS_M009.csv` | ✅ API ada |
| M010 | Arsip Digital Kepegawaian | Pelaksana | Kasubag | `/api/sek-adm` | `FIELDS_M010.csv` | ❌ UI belum |
| M011 | Surat Masuk | Pelaksana | Kasubag | `/api/sek-hum` | `FIELDS_M011.csv` | ✅ API ada |
| M012 | Surat Keluar | Pelaksana | Kasubag | `/api/sek-hum` | `FIELDS_M012.csv` | ✅ API ada |
| M013 | Disposisi Surat | Kasubag | Sekretaris | `/api/sek-hum` | `FIELDS_M013.csv` | ✅ API ada |
| M014 | Agenda Kegiatan | Pelaksana | Kasubag | `/api/sek-adm` | `FIELDS_M014.csv` | ❌ UI belum |
| M015 | Notulensi Rapat | Pelaksana | Kasubag | `/api/sek-adm` | `FIELDS_M015.csv` | ❌ UI belum |
| M016 | Data Aset Barang | Pelaksana | Kasubag | `/api/sek-ast` | `FIELDS_M016.csv` | ✅ API ada |
| M017 | Data Kendaraan Dinas | Pelaksana | Kasubag | `/api/sek-ast` | `FIELDS_M017.csv` | ⚠️ Partial |
| M018 | Pemeliharaan Aset | Pelaksana | Kasubag | `/api/sek-ast` | `FIELDS_M018.csv` | ❌ UI belum |
| M019 | Mutasi Aset | Kasubag | Sekretaris | `/api/sek-ast` | `FIELDS_M019.csv` | ❌ UI belum |
| M020 | DPA | Bendahara | Sekretaris → Kadis | `/api/sek-keu` | `FIELDS_M020.csv` | ⚠️ Partial |
| M021 | RKA | Bendahara | Sekretaris → Kadis | `/api/sek-keu` | `FIELDS_M021.csv` | ⚠️ Partial |
| M022 | SPJ | Pelaksana | Bendahara → Sekretaris | `/api/pelaksana/spj` | `FIELDS_M022.csv` | ✅ API ada |
| M023 | Realisasi Anggaran | Bendahara | Sekretaris | `/api/sek-keu` | `FIELDS_M023.csv` | ✅ API ada |
| M024 | Belanja Pegawai | Bendahara | Sekretaris | `/api/sek-keu` | `FIELDS_M024.csv` | ⚠️ Partial |
| M025 | Belanja Barang | Bendahara | Sekretaris | `/api/sek-keu` | `FIELDS_M025.csv` | ⚠️ Partial |
| M026 | Belanja Modal | Bendahara | Sekretaris | `/api/sek-keu` | `FIELDS_M026.csv` | ❌ UI belum |
| M027 | Renstra | JF / Kasubag | Sekretaris → Kadis | `/api/sek-ren` | `FIELDS_M027.csv` | ⚠️ Partial |
| M028 | Renja | JF / Kasubag | Sekretaris | `/api/sek-ren` | `FIELDS_M028.csv` | ⚠️ Partial |
| M029 | RKPD | Sekretaris | Kadis | `/api/sek-ren` | `FIELDS_M029.csv` | ❌ UI belum |
| M030 | LAKIP | Sekretaris | Kadis | `/api/sek-lks` | `FIELDS_M030.csv` | ❌ UI belum |
| M031 | Monitoring & Evaluasi | Kasubag / JF | Sekretaris | `/api/sek-lkt` | `FIELDS_M031.csv` | ✅ API ada |

**Modul khusus Absensi (di luar 94 tapi wajib):**
- Endpoint: `/api/pelaksana/absensi`, `/api/pelaksana/absensi/hari-ini`, `/api/pelaksana/absensi/bulan-ini`
- Komponen: `AbsensiHarianPanel.jsx` (sudah tersedia di `src/components/pelaksana/`)

### Bidang Ketersediaan & Kerawanan Pangan

| Modul ID | Nama | Role Input | Verifikasi | Endpoint | Status |
|----------|------|-----------|-----------|---------|--------|
| M032 | Data Komoditas | Pelaksana | JF → Kabid | `/api/komoditas` | ✅ |
| M033 | Produksi Pangan | Pelaksana | JF → Kabid | `/api/bkt-pgd` | ✅ |
| M034 | Stok Pangan | Pelaksana | JF → Kabid | `/api/stok` | ✅ |
| M035 | Neraca Pangan | JF (hitung) | Kabid → Kadis | `/api/bkt-bmb` | ✅ |
| M036 | Peta Kerawanan | JF | Kabid → Kadis | `/api/bkt-krw` | ✅ |
| M037 | Indeks Ketahanan | JF | Kabid | `/api/bkt-mev` | ⚠️ |
| M038 | Early Warning | JF | Kabid → Kadis | `/api/bkt-mev` | ❌ UI |
| M039 | Data Bencana Dampak | Pelaksana | JF → Kabid | `/api/bkt-pgd` | ❌ UI |
| M040 | Luas Panen | Pelaksana | JF → Kabid | `/api/bkt-fsl` | ✅ |
| M041 | Produktivitas | JF (hitung) | Kabid | `/api/bkt-mev` | ⚠️ |

### Bidang Distribusi & Cadangan Pangan

| Modul ID | Nama | Role Input | Verifikasi | Endpoint | Status |
|----------|------|-----------|-----------|---------|--------|
| M042 | Data Pasar | Pelaksana | JF → Kabid | `/api/pasar` | ✅ |
| M043 | Harga Pangan Harian | Pelaksana (per pasar) | JF → Kabid | `/api/pelaksana/harga-pasar` | ✅ |
| M044 | Inflasi Pangan Bulanan | JF (auto-hitung dari M043) | Kabid → TPID | `/api/bds-evl` | ✅ |
| M045 | Inflasi per Komoditas | JF | Kabid | `/api/bds-evl` | ⚠️ |
| M046 | Dashboard Inflasi TPID | Kabid | Kadis → TPID | `/api/bds-evl` | ⚠️ |
| M047 | Distribusi Pangan | Pelaksana | JF → Kabid | `/api/bds-mon` | ✅ |
| M048 | CPPD | JF | Kabid | `/api/bds-cpd` | ✅ |
| M049 | CBP BULOG | JF | Kabid → Kadis | `/api/bds-cpd` | ⚠️ |
| M050 | Pelepasan Cadangan | Kabid | Kadis | `/api/bds-cpd` | ❌ UI |
| M051 | Operasi Pasar | Pelaksana | JF → Kabid | `/api/bds-lap` | ❌ UI |
| M052 | GPM | Pelaksana | JF → Kabid | `/api/bds-lap` | ✅ |
| M053 | Bantuan Pangan | Pelaksana | JF → Kabid → Kadis | `/api/bds-lap` | ⚠️ |
| M054 | Rapat TPID | Kasubag / Sekretaris | Kadis | `/api/sek-adm` | ❌ UI |
| M055 | Analisis Pasokan | JF | Kabid | `/api/bds-evl` | ❌ UI |

### Bidang Konsumsi & Keamanan Pangan

| Modul ID | Nama | Role Input | Verifikasi | Endpoint | Status |
|----------|------|-----------|-----------|---------|--------|
| M056 | Data Konsumsi Pangan | Pelaksana | JF → Kabid | `/api/pelaksana/data-konsumsi` | ✅ |
| M057 | PPH | JF (hitung) | Kabid → Kadis | `/api/bks-kbj` | ✅ |
| M058 | Data SPPG Penerima | Pelaksana | JF → Kabid | `/api/bks-lap` | ⚠️ |
| M059 | SPPG Distribusi | Pelaksana | JF → Kabid | `/api/bks-lap` | ⚠️ |
| M060 | Program MBG | Kabid | Kadis | `/api/bks-kbj` | ❌ UI |
| M061 | Program B2SA | Pelaksana | JF → Kabid | `/api/bks-lap` | ❌ UI |
| M062 | Diversifikasi Pangan | JF | Kabid | `/api/bks-kbj` | ❌ UI |
| M063 | Inspeksi Keamanan | Pelaksana | JF → Kabid → Kadis | `/api/bks-lap` | ⚠️ |
| M064 | Data Keracunan | Pelaksana | Kabid → Kadis (eskalasi) | `/api/bks-lap` | ❌ UI |
| M065 | Edukasi Konsumsi | Pelaksana | JF → Kabid | `/api/bks-lap` | ❌ UI |
| M066 | Data UMKM Pangan | Pelaksana | JF → Kabid | `/api/bks-lap` | ⚠️ |
| M067 | Pembinaan UMKM | Pelaksana | JF → Kabid | `/api/bks-lap` | ❌ UI |

### UPTD Balai PMKP

| Modul ID | Nama | Role Input | Verifikasi | Endpoint | Status |
|----------|------|-----------|-----------|---------|--------|
| M068 | Sertifikasi Prima | Pelaksana | Kasi → Kepala UPTD | `/api/upt-ins` | ✅ |
| M069 | Sertifikasi GMP/NKV | Pelaksana | Kasi → Kepala UPTD | `/api/upt-ins` | ⚠️ |
| M070 | Sertifikasi GFP | Pelaksana | Kasi → Kepala UPTD | `/api/upt-ins` | ⚠️ |
| M071 | Sertifikasi GHP | Pelaksana | Kasi → Kepala UPTD | `/api/upt-ins` | ❌ UI |
| M072 | Audit Pangan | Kasi Mutu | Kepala UPTD → Kabid Konsumsi | `/api/upt-ins` | ❌ UI |
| M073 | Registrasi Produk | Pelaksana | Kasi Mutu → Kepala UPTD | `/api/upt-mtu` | ❌ UI |
| M074 | Uji Laboratorium | Pelaksana Teknis | Kasi Teknis → Kepala UPTD | `/api/upt-mtu` | ✅ |
| M075 | Hasil Uji Kimia | Pelaksana Teknis | Kasi Teknis | `/api/upt-mtu` | ✅ |
| M076 | Hasil Uji Mikrobiologi | Pelaksana Teknis | Kasi Teknis | `/api/upt-mtu` | ✅ |
| M077 | Hasil Uji Fisik | Pelaksana Teknis | Kasi Teknis | `/api/upt-mtu` | ⚠️ |
| M078 | Pengawasan Berisiko | Kasi Teknis | Kepala UPTD | `/api/upt-tkn` | ❌ UI |
| M079 | Sampling Pangan | Pelaksana | Kasi → Kepala UPTD → Kabid Konsumsi | `/api/upt-tkn` | ❌ UI |
| M080 | UMKM Tersertifikasi | Kasi | Kepala UPTD | `/api/upt-mtu` | ❌ UI |

### Layanan Publik

| Modul ID | Nama | Endpoint | Status |
|----------|------|---------|--------|
| M081 | Laporan Masyarakat | `/api/public/laporan` | ❌ UI |
| M082 | Portal Data Terbuka | `/api/public/data` | ⚠️ |
| M083 | Dataset Publik | `/api/public/dataset` | ❌ UI |
| M084 | Request Data Peneliti | `/api/public/request` | ❌ UI |

---

## Cara Menambahkan Modul Baru (Template)

### Langkah 1: Pastikan FIELDS CSV ada
```
master-data/FIELDS/FIELDS_M0XX.csv
```

### Langkah 2: Tambahkan ke `MODUL_API_MAP` di `useModulFields.js`
```js
M0XX: { endpoint: "/api/...", label: "Nama Modul", unit: "Bidang" },
```

### Langkah 3: Render di Dashboard yang sesuai
```jsx
// Di dashboard role yang bertanggung jawab (input):
<ModulFormPanel modulId="M0XX" title="Nama Modul" taskId={task?.id} />

// Dengan task context (agar output otomatis terhubung ke tugas):
<ModulFormPanel
  modulId="M0XX"
  title="Nama Modul"
  taskId={currentTask?.id}
  onDataSaved={(data) => {
    // Update task submission atau notify parent
  }}
/>
```

### Langkah 4: Update `SubmitHasilModal` (jika modul baru)
Tidak diperlukan — modal otomatis detect `task.module` dan handle dengan benar.

---

## Prioritas Implementasi Selanjutnya

### Sprint 1 (Minggu ini — P0)
- [ ] Tambahkan `ModulFormPanel modulId="M001"` di tab Data ASN di Dashboard Kasubag
- [ ] Tambahkan `ModulFormPanel modulId="M022"` di tab SPJ di Dashboard Pelaksana  
- [ ] Tambahkan `ModulFormPanel modulId="M011"` Surat Masuk di Dashboard Pelaksana Sekretariat

### Sprint 2 (Minggu depan — P1)
- [ ] M003 Tracking Pangkat di Dashboard Kasubag
- [ ] M005 Data Cuti di Dashboard Pelaksana
- [ ] M006 SPPD di Dashboard Pelaksana
- [ ] M043 Harga Pangan Harian di Dashboard Pelaksana Distribusi (sudah partial)

### Sprint 3 (2 minggu — P2)
- [ ] M033–M041 Ketersediaan (sudah ada API, perlu wrap di ModulFormPanel)
- [ ] M058–M067 Konsumsi (perlu endpoint + UI)
- [ ] M068–M080 UPTD (sudah ada `FormInputSertifikasiUptd`, perlu M069–M071)

---

## Keterangan Status

| Simbol | Arti |
|--------|------|
| ✅ API ada | Backend endpoint ada, FIELDS CSV ada, perlu hubungkan di frontend |
| ⚠️ Partial | Ada sebagian implementasi, perlu dilengkapi |
| ❌ UI belum | API mungkin ada, tapi belum ada form UI di dashboard |
