# 📚 Dokumen Integrasi Sistem & Mapping Modul SIGAP-MALUT

## 1. Pendahuluan

Dokumen ini menjelaskan analisis integrasi, relasi, dan konektivitas antar modul sistem SIGAP-MALUT berbasis dokumen utama dan master data. Tujuan utama: implementasi prinsip satu data, konsistensi, dan eliminasi duplikasi input demi integrasi profesional, audit-ready, dan mudah dipelihara.

---

## 2. Prinsip & Ringkasan Integrasi

- **Single Source of Truth:** Semua data dasar (pegawai, komoditas, dsb) hanya diinput & dikelola pada modul master data.
- **Konsumsi data** oleh modul-modul lain wajib melalui referensi (ID/data lookup), dilarang input duplikasi.
- **Sinkronisasi dan validasi** wajib selalu dilakukan agar tidak terjadi inkonsistensi data antar modul.
- **Relasi utama:**
  - **Pegawai** → men-drive data di keuangan, kepegawaian, audit, distribusi, UPTD, dsb.
  - **Komoditas** → digunakan/direferensikan di distribusi, keuangan, UPTD, inflasi, dsb.

---

## 3. Analisis Struktur & Relasi Master Data

### 3.1 Struktur Folder Master Data

Semua data utama (pegawai, komoditas, keuangan, kepegawaian, UPTD, dsb) tersimpan pada folder `master-data/` dalam format JSON, CSV, atau DB seed.

Sub-folder utama:

- `pegawai/` → data ASN, jabatan, NIP
- `komoditas/` → list komoditas, stok, harga
- `keuangan/` → akun, transaksi, DPA/RKA
- `kepegawaian/` → tracking KGB, SK, status
- `uptd/` → hasil lab, sertifikat
- dst.

### 3.2 Relasi Struktur Master Data

- **Pegawai**: referensi utama untuk seluruh entitas terkait (keuangan, kepegawaian, audit, dsb).
- **Komoditas**: dipakai di dashboard stok, inflasi, distribusi, dan modul SSOT.
- **Keuangan**: referensi ke _pegawai_ (bendahara, pejabat verifikator), _komoditas_ (pengadaan).
- **Kepegawaian**: tracking KGB dan kaitan dokumen ke pegawai.
- **UPTD**: hasil uji dan sertifikat, referensi ke komoditas dan pegawai.

---

## 4. Mapping Integrasi Modul & Relasi Data

### 4.1 Tabel Mapping Lengkap

| Modul                          | Data Dimasukkan Langsung       | Konsumsi Referensi dari Master Data          | Relasi Data Utama                              | Catatan Penting                           |
| ------------------------------ | ------------------------------ | -------------------------------------------- | ---------------------------------------------- | ----------------------------------------- |
| **Master Pegawai**             | ✅ (Nama, NIP, Jabatan, dll.)  | —                                            | —                                              | Sumber data pegawai satu-satunya          |
| **Master Komoditas**           | ✅ (Nama, Jenis, Satuan, dll.) | ��                                           | —                                              | Sumber data komoditas satu-satunya        |
| **Master Keuangan**            | ✅ (Tahun, DPA, RKA, Akun)     | Pegawai, Komoditas dari master               | keuangan.pegawai_id, keuangan.komoditas_id     | Wajib referensi, tidak input sembarangan  |
| **Keuangan (SPJ, transaksi)**  | —                              | Pegawai, Komoditas dari master               | transaksi.bendahara_id, transaksi.komoditas_id | Input hanya via lookup, foreign key wajib |
| **Kepegawaian (KGB, Pangkat)** | —                              | Pegawai dari master                          | kgb.pegawai_id                                 | Tidak boleh input nama pegawai manual     |
| **Distribusi Komoditas**       | —                              | Komoditas, Pegawai dari master               | distribusi.komoditas_id, distribusi.petugas_id |                                           |
| **UPTD (Hasil Uji)**           | ✅ (Data hasil lab, dsb.)      | Komoditas, Pegawai dari master               | hasiluji.komoditas_id, hasiluji.petugas_id     | Semua relasi id                           |
| **Inflasi/SSOT**               | —                              | Komoditas dari master                        | inflasi.komoditas_id                           |                                           |
| **Audit Log**                  | —                              | Pegawai, modul lain via foreign key          | audit.pegawai_id, audit.transaksi_id           | Menyimpan seluruh jejak transaksi         |
| **Dashboard**                  | —                              | Agregasi dari semua master-data & modul lain | Data summary, tidak input baru                 | Hanya menampilkan, tidak input data       |
| **Dynamic Module Creator**     | —                              | Konsumsi struktur master data                | module.field.ref_to_master                     | Hanya desain, sumber tetap master data    |

---

### 4.2 Tabel Sumber & Konsumen Data

| Data        | Sumber Utama       | Modul Konsumen                                            |
| ----------- | ------------------ | --------------------------------------------------------- |
| Pegawai     | Master Pegawai     | Keuangan, Kepegawaian, Distribusi, UPTD, Audit, Dashboard |
| Komoditas   | Master Komoditas   | Keuangan, Distribusi, UPTD, Inflasi, Dashboard            |
| Keuangan    | Master Keuangan    | Dashboard, Audit                                          |
| Kepegawaian | Master Kepegawaian | Dashboard, Audit                                          |
| UPTD        | Master UPTD        | Dashboard, Audit                                          |

---

## 5. Penjelasan Relasi Logis & Teknis Antar Modul

### a. pegawai → [keuangan, kepegawaian, distribusi, UPTD, audit]

- Data sumber pegawai diinput di master. Modul lain hanya memilih pegawai lewat lookup ke daftar master.
- Contoh: Submit SPJ → user pick bendahara dari drop-down master-data pegawai (bukan input manual).

### b. komoditas → [distribusi, keuangan, UPTD, inflasi]

- Data komoditas (nama, satuan, kode) hanya satu kali di master.
- Semua konsumsi by referensi id/master, lookup wajib.

### c. keuangan <-> pegawai & komoditas

- Setiap transaksi SPJ/realisasi merekam bendahara_id dan komoditas_id (dari master).
- Penambahan transaksi wajib _lookup_, bukan input baru.

### d. audit log → seluruh proses

- Setiap aksi/modifikasi transaksi di modul mana pun tercatat di audit log, menyimpan id pegawai pelaku dan id entitas yang diubah.

### e. Dynamic Module Creator

- Jika modul baru dibuat super admin, field referensi ke master data (pegawai_id, komoditas_id) wajib pakai foreign key.

---

## 6. Mekanisme Integrasi dan Validasi (Rekomendasi Teknis)

- **Single Source of Truth**: Semua data pegawai, komoditas, keuangan, dsb hanya dikelola via master data.
- **Pemanggilan data:**
  - Frontend ambil data via API (e.g. `/api/master/pegawai`), tidak boleh input manual di form lain.
  - Backend enforce validasi: foreign key harus dari master, tidak boleh asal tulis.
- **Validasi:**
  - Input baru di modul dipilih dengan `select/lookup` ke master, tidak manual entry text.
  - Cek konsistensi referensi (foreign-key validasi) sebelum data commit.
  - Periodik audit oleh sistem/dba: scan detection data dobel.
- **API Contracts:** GET dari master, POST ke modul konsumsi menggunakan id referensi.
- **Sync**: Perubahan master harus otomatis trigger update/sync data konsumsi & cache.

---

## 7. Checklist Validasi Integrasi & Konsistensi Data

- [ ] Tidak ada field input manual untuk data pegawai/komoditas di luar master.
- [ ] Semua foreign key konsisten mengacu ke id master data, bukan string duplikat.
- [ ] Setiap modul konsumsi hanya lookup data, tidak menambah entitas master sendiri.
- [ ] API pengambilan data modul konsisten (`/api/master/pegawai, /api/master/komoditas`, dst).
- [ ] Proses penting (transaksi, approval, upload) menyimpan id foreign key, bukan nama/text raw.
- [ ] Dashboard dan analitik hanya menampilkan agregat/master, tidak input sendiri.
- [ ] Setiap perubahan di master data trigger update/sync ke consumer/cache.
- [ ] Audit periodik memeriksa tidak ada redundansi data master di modul lain.
- [ ] Contoh kasus: input SPJ → pilih bendahara dari master-data/pegawai (lookup, bukan manual).

---

## 8. Narasi Alur Data Integrasi

**Input**
➡️ _Pegawai/komoditas diinput sekali di master-data (oleh admin/master superuser)._

**Penyimpanan**
➡️ _Data tersimpan di master-data (DB/file sebagai single source of truth)._

**Konsumsi**
➡️ _Setiap modul lain (keuangan, distribusi, dsb) hanya memilih data dari master via lookup (dropdown/relasi id)._

**Referensi**
➡️ _Transactions/entri di modul consumer akan menyimpan id referensi saja, bukan copy/duplikasi detail raw._

**Agregasi**
➡️ _Dashboard hanya menampilkan hasil lookup dan agregat ke master, tidak pernah input data baru untuk entitas master._

---

## 9. Contoh Kasus Nyata: Input Data Pegawai & SPJ

### Input Data Pegawai

1. Admin input NIP, Nama, Jabatan ke master pegawai.
2. Pegawai otomatis muncul di dropdown pemilihan bendahara/petugas pada modul keuangan, kepegawaian, distribusi, dan UPTD.

### Input Transaksi SPJ (Keuangan)

1. User buka form SPJ, memilih bendahara dari master pegawai (berdasarkan id, bukan input manual).
2. Data tersimpan sebagai transaksi dengan `bendahara_id`.
3. Jika data bendahara diperbarui (misal: mutasi, promosi), semua transaksi otomatis tetap konsisten tanpa perlu update manual/duplikat.
4. Dashboard menampilkan daftar transaksi dengan _join_ data pegawai dari master (untuk nama/NIP).

---

## 10. Diagram Alur Data (Konsep)

```
[INPUT MASTER DATA]
   |         |         |
[Pegawai] [Komoditas] [Keuangan]
   |           |          |
   |---------->|          |
   |           |----------|
   |           |          |
[Kepegawaian][UPTD][Distribusi]
   |           |          |
  [Audit Log - referensi ke source]
  [Dashboard - agregasi summary ke master]
```

_Diagram ERD penuh dapat dibuat dengan tool seperti dbdiagram.io/mermaid/draw.io dari struktur master-data._

---

## 11. Rekomendasi Teknis (Implementasi)

- **Seluruh dropdown, lookup, assignment** data pegawai/komoditas WAJIB mengambil data dari master, tidak pernah input text bebas.
- **Validasi schema database & API**: foreign key konsisten, tidak boleh simpan string nama kecuali untuk display (wajib id).
- **Modul konsumsi** tidak boleh membuat data master sendiri (no duplicate insert).
- **Audit periodik**: Scan DB untuk deteksi data pegawai/komoditas ganda.
- **Perubahan data master**: hanya dilakukan oleh admin via modul master, modul lain wajib mengikuti.

### **Penambahan Modul Integrasi: Perintah Digital & Workflow Berjenjang**

#### **Modul Perintah & Workflow**

- Ditambahkan pada mapping master data & modul sebagai modul baru:
  - `perintah` sebagai master record perintah antar unit/pegawai,
  - `perintah_log` sebagai log/tracking setiap aksi/forward/feedback,
  - `perintah_verifikasi` untuk tracking status dan approval/revisi di setiap level.
- **Relasi:**
  - Setiap entitas `perintah` terkait ke master data pegawai (dari_user_id, ke_user_id), chain-tracking via foreign key.
  - Mapping relasi satu perintah bisa melibatkan banyak node (multi-forward), semua status progress terdokumentasi di satu pohon.
- **API Contracts:**
  - **POST /perintah:** Buat perintah baru
  - **GET /perintah/inbox:** List perintah yang masuk ke user
  - **GET /perintah/outbox:** Perintah dikeluarkan oleh user
  - **POST /perintah/:id/forward:** Forward/limpahkan ke bawah
  - **POST /perintah/:id/feedback:** Feedback/revisi/kendala
  - **POST /perintah/:id/close:** Tutup/akhiri perintah status selesai
  - **GET /perintah/:id/history:** Lihat seluruh history perintah (audit trail)

#### **Checklist Integrasi**

- [x] Semua lookup pegawai/role melalui master data.
- [x] Tidak ada perintah manual via WA/email diijinkan (tidak terhitung jika tidak lewat sistem).
- [x] Semua progress dan chain of command terdokumentasi dan dapat dimonitor oleh auditor BPK/Inspektorat.
- [x] Sistem siap untuk diekspor dan diarsipkan periodik.

---

## 12. Penutup

Dokumen ini menjadi acuan teknis sekaligus basis audit dan pengembangan sistem SIGAP-MALUT. Semua anggota tim WAJIB memahami, menerapkan mapping & pola integrasi ini di setiap pengembangan, review, dan perbaikan.  
Setiap perubahan data master harus otomatis relasi ke seluruh modul konsumsi.

_Segala proses, flow, dan mapping Wajib Dievaluasi Periodik agar tidak terjadi inkonsistensi dan menjaga auditabilitas\_\_._
