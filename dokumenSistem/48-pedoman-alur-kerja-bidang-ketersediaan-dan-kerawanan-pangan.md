# 48 — Pedoman Alur Kerja, Struktur Organisasi, dan Prinsip Kinerja Berjenjang
## Bidang Ketersediaan dan Kerawanan Pangan — Dinas Pangan Provinsi Maluku Utara

**Versi:** 1.0
**Tanggal:** 5 April 2026
**Status:** FINAL — Telah dikonfirmasi dan disetujui
**Dasar Hukum:**
- Peraturan Gubernur Nomor 56 Tahun 2021 (SOTK Dinas Pangan)
- Peraturan Gubernur Nomor 72 Tahun 2023 (Perubahan SOTK)
- PP Nomor 12 Tahun 2019 tentang Pengelolaan Keuangan Daerah
- Permendagri Nomor 77 Tahun 2020 tentang Pedoman Teknis Pengelolaan Keuangan Daerah
- PP Nomor 30 Tahun 2019 tentang Penilaian Kinerja PNS
- PP Nomor 95 Tahun 2018 tentang SPBE
- Dokumen 37 SIGAP-MALUT (Pedoman Alur Kerja Sekretariat)
- Dokumen 38 SIGAP-MALUT (Pedoman Mekanisme SPJ Mandiri dan Delegasi)

---

## BAGIAN I — STRUKTUR ORGANISASI

### 1.1 Kedudukan

Bidang Ketersediaan dan Kerawanan Pangan dipimpin oleh **Kepala Bidang** yang berada langsung di bawah dan bertanggung jawab kepada **Kepala Dinas**.

Kepala Bidang berkedudukan **setara** dengan Sekretaris Dinas dan Kepala Bidang lainnya. Setiap laporan ke Kepala Dinas wajib ditembuskan (CC) kepada Sekretaris.

### 1.2 Komposisi SDM

| Jabatan | Jumlah | Keterangan |
|---------|--------|------------|
| Kepala Bidang | 1 | Eselon III — atasan langsung seluruh staf Bidang |
| JF Analis Ketahanan Pangan | 2 | Kelompok Jabatan Fungsional |
| Pelaksana | 14 | Staf teknis Bidang |
| PPTK | 2 | Merangkap sebagai Pelaksana — ditetapkan SK KPA |
| **Total** | **17** | 1 Kepala Bidang + 2 JF + 14 Pelaksana |

> **Catatan:** 2 PPTK adalah bagian dari 14 Pelaksana — bukan orang tambahan. Total SDM tetap 1 + 2 + 14 = 17 orang.

### 1.3 Pembagian Dua Kelompok Kerja

Bidang ini mengemban dua fungsi besar yang berbeda karakter namun saling berkaitan. Pembagian dilakukan berdasarkan DPA yang terpisah:

#### Kelompok Ketersediaan Pangan (DPA Ketersediaan)

| Jabatan | Jumlah | Tugas Pokok |
|---------|--------|-------------|
| JF 1 — Analis Ketahanan Pangan | 1 | Analisis dan verifikasi teknis sub-modul 2.1, 2.2, 2.5 |
| PPTK 1 | 1 | Merangkap Pelaksana — mengelola DPA Ketersediaan |
| Pelaksana | 6 | Input data stok, neraca, survei pasar, EWS, monev |
| **Subtotal** | **8** | 1 JF + 7 Pelaksana (1 merangkap PPTK) |

#### Kelompok Kerawanan Pangan (DPA Kerawanan)

| Jabatan | Jumlah | Tugas Pokok |
|---------|--------|-------------|
| JF 2 — Analis Ketahanan Pangan | 1 | Analisis dan verifikasi teknis sub-modul 2.3, 2.4, 2.5 |
| PPTK 2 | 1 | Merangkap Pelaksana — mengelola DPA Kerawanan |
| Pelaksana | 6 | Input data peta rawan, indeks risiko, intervensi, bimtek |
| **Subtotal** | **8** | 1 JF + 7 Pelaksana (1 merangkap PPTK) |

### 1.4 Sub-Modul dalam SIGAP-MALUT

Berdasarkan dokumen sistem, Bidang Ketersediaan dan Kerawanan Pangan memiliki 5 sub-modul dengan total 25 layanan:

| Sub-Modul | Fungsi Utama | Kelompok |
|-----------|-------------|----------|
| 2.1 Kebijakan | Analisis ketersediaan, rekomendasi kebijakan, komoditas strategis, pedoman teknis, sinkronisasi pusat-daerah | Ketersediaan |
| 2.2 Pengendalian & Pemantauan | Produksi, pasokan, neraca pangan, early warning defisit, sistem informasi pangan | Ketersediaan |
| 2.3 Penanganan Kerawanan | Identifikasi wilayah rawan, peta kerawanan, rencana aksi, koordinasi lintas sektor, fasilitasi intervensi | Kerawanan |
| 2.4 Bimbingan Teknis & Supervisi | Bimtek ketersediaan, bimtek pemetaan rawan, supervisi, pendampingan, konsultasi | Kerawanan |
| 2.5 Monitoring & Evaluasi | Evaluasi program, evaluasi kerawanan, laporan kinerja, laporan teknis, data SAKIP | Keduanya |

### 1.5 Prinsip Pembagian Kelompok

- Pembagian dua kelompok ini **bukan hierarki** — JF 1 tidak membawahi JF 2 dan sebaliknya
- Keduanya **setara** dan sama-sama bertanggung jawab langsung kepada Kepala Bidang
- Data Kelompok Ketersediaan (stok, neraca) menjadi **input** bagi Kelompok Kerawanan untuk analisis peta risiko — keduanya saling bergantung
- Pembagian dikonfigurasi dalam SIGAP-MALUT melalui atribut `unit_kerja` dan penugasan sub-modul — **bukan** melalui role baru di database

### 1.6 Posisi PPTK

PPTK ditetapkan melalui SK Kepala Dinas selaku KPA. Penetapan 2 PPTK terpisah sesuai pemisahan DPA:

- **PPTK 1** → bertanggung jawab atas seluruh kegiatan dan anggaran dalam DPA Ketersediaan
- **PPTK 2** → bertanggung jawab atas seluruh kegiatan dan anggaran dalam DPA Kerawanan

Pemisahan ini memastikan bahwa jika satu PPTK berhalangan, kegiatan di DPA lainnya tidak terganggu.

---

## BAGIAN II — TUGAS DAN FUNGSI JABATAN

### 2.1 Kepala Bidang

**Atasan langsung:** Kepala Dinas

**Tugas dan fungsi:**
- Merumuskan dan melaksanakan kebijakan operasional ketersediaan dan kerawanan pangan
- Bimbingan teknis dan supervisi kepada seluruh staf Bidang
- Mengoordinasikan dan memadukan laporan dari Kelompok Ketersediaan dan Kelompok Kerawanan
- Memberikan rekomendasi strategis kepada Kepala Dinas
- Monitoring, evaluasi, dan pelaporan kinerja Bidang
- Berkoordinasi dengan Bidang Distribusi, Bidang Konsumsi, UPTD, dan Sekretariat

**Kewenangan laporan ke Kepala Dinas:**
Kepala Bidang **boleh** menyampaikan laporan langsung kepada Kepala Dinas, namun **wajib melakukan CC kepada Sekretaris** pada setiap komunikasi tersebut.

### 2.2 JF 1 — Analis Ketahanan Pangan (Kelompok Ketersediaan)

**Atasan langsung:** Kepala Bidang

**Prinsip regulasi:** JF tidak memiliki bawahan dan tidak mendisposisi tugas kepada Pelaksana. JF menerima tugas dari Kepala Bidang dan melaporkan hasilnya kembali ke Kepala Bidang.

**Tugas dan fungsi:**
- Menganalisis dan memverifikasi secara teknis seluruh dokumen yang dihasilkan 6 Pelaksana Kelompok Ketersediaan
- Menganalisis data stok komoditas, neraca pangan, dan pasokan wilayah
- Menyusun rekomendasi kebijakan ketersediaan pangan
- Memverifikasi laporan sub-modul 2.1, 2.2, dan 2.5 (bagian ketersediaan)
- Menyetujui atau mengembalikan dokumen untuk perbaikan
- Melaporkan hasil kerja kepada Kepala Bidang

### 2.3 JF 2 — Analis Ketahanan Pangan (Kelompok Kerawanan)

**Atasan langsung:** Kepala Bidang

**Prinsip regulasi:** Sama dengan JF 1 — tidak memiliki bawahan.

**Tugas dan fungsi:**
- Menganalisis dan memverifikasi secara teknis seluruh dokumen yang dihasilkan 6 Pelaksana Kelompok Kerawanan
- Menganalisis indeks kerawanan pangan per wilayah kabupaten/kota
- Menyusun peta kerawanan dan rekomendasi intervensi
- Memverifikasi laporan sub-modul 2.3, 2.4, dan 2.5 (bagian kerawanan)
- Berkoordinasi dengan Dinas Sosial, Dinas Kesehatan, dan BPBD untuk data pendukung kerawanan
- Menyetujui atau mengembalikan dokumen untuk perbaikan
- Melaporkan hasil kerja kepada Kepala Bidang

### 2.4 PPTK 1 — Pelaksana merangkap PPTK DPA Ketersediaan

**Dua peran yang dijalankan bersamaan:**

**Peran sebagai Pelaksana:**
- Menerima tugas harian dari Kepala Bidang
- Mengerjakan dan melaporkan hasil kerja
- Wajib membuat SPJ sendiri untuk pengeluaran atas namanya

**Peran sebagai PPTK (berdasarkan SK KPA):**
- Mengendalikan dan melaporkan perkembangan pelaksanaan teknis kegiatan DPA Ketersediaan
- Menyiapkan dokumen dalam rangka pelaksanaan anggaran DPA Ketersediaan
- Menyiapkan dokumen pengadaan barang/jasa untuk kegiatan DPA Ketersediaan
- Melaporkan progres DPA kepada Kepala Bidang secara berkala

**Batasan PPTK:** Tidak berwenang menandatangani kontrak dan tidak berwenang melakukan pembayaran.

### 2.5 PPTK 2 — Pelaksana merangkap PPTK DPA Kerawanan

Sama dengan PPTK 1 namun untuk DPA Kerawanan Pangan.

### 2.6 Pelaksana (12 orang — di luar 2 PPTK)

**Atasan langsung:** Kepala Bidang (melalui penugasan dari JF masing-masing kelompok)

**Tugas dan fungsi umum:**
- Mengumpulkan data lapangan sesuai sub-modul yang ditugaskan
- Menginput data ke dalam SIGAP-MALUT
- Mengajukan dokumen ke JF untuk dianalisis dan diverifikasi
- Wajib membuat SPJ sendiri untuk pengeluaran atas namanya (honor, perjalanan dinas, dll)
- Dapat membantu pembuatan draft SPJ atas nama pejabat (Kepala Bidang, JF) — mengikuti mekanisme Dokumen 38

---

## BAGIAN III — ALUR KERJA DAN PROSES VERIFIKASI

### 3.1 Prinsip Umum

> **"Kinerja 14 Pelaksana + 2 PPTK adalah kinerja 2 JF. Kinerja 2 JF adalah kinerja Kepala Bidang. Kinerja Kepala Bidang adalah kinerja Kepala Dinas."**

Seluruh alur kerja bersifat **hierarkis dan berjenjang**. Tidak ada dokumen yang dapat langsung naik ke Kepala Dinas tanpa melalui Kepala Bidang. Tidak ada dokumen yang dapat langsung naik ke Kepala Bidang tanpa melalui JF.

---

### 3.2 Jalur 1 — Alur Dokumen Ketersediaan Pangan

```
Pelaksana Ketersediaan (6 orang)
    │
    │  Input data dan laporan:
    │  Stok komoditas (beras, jagung, sagu, dll) per gudang/wilayah
    │  Neraca ketersediaan pangan daerah
    │  Survei pasar dan pemantauan pasokan
    │  Early warning defisit stok
    │  Laporan sub-modul 2.1 Kebijakan
    │  Laporan sub-modul 2.2 Pengendalian & Pemantauan
    │  Laporan sub-modul 2.5 Monev (bagian ketersediaan)
    ▼
JF 1 — Analis Ketahanan Pangan (Kelompok Ketersediaan)
    │
    │  Analisis teknis dan verifikasi seluruh dokumen
    │  → Setujui / Kembalikan untuk perbaikan
    ▼
Kepala Bidang
    │
    │  Terima hasil verifikasi JF 1
    │  Review dan setujui
    │  → Gabungkan dengan laporan Jalur 2 untuk pelaporan ke Kepala Dinas
    ▼
Kepala Dinas (dengan CC Sekretaris)
```

---

### 3.3 Jalur 2 — Alur Dokumen Kerawanan Pangan

```
Pelaksana Kerawanan (6 orang)
    │
    │  Input data dan laporan:
    │  Peta kerawanan pangan per wilayah kabupaten/kota
    │  Indeks kerawanan (akses, ketersediaan, stabilitas)
    │  Rencana aksi penanganan kerawanan
    │  Data koordinasi lintas sektor (Dinsos, Dinkes, BPBD)
    │  Laporan fasilitasi intervensi pangan
    │  Laporan sub-modul 2.3 Penanganan Kerawanan
    │  Laporan sub-modul 2.4 Bimbingan Teknis
    │  Laporan sub-modul 2.5 Monev (bagian kerawanan)
    ▼
JF 2 — Analis Ketahanan Pangan (Kelompok Kerawanan)
    │
    │  Analisis teknis dan verifikasi seluruh dokumen
    │  → Setujui / Kembalikan untuk perbaikan
    ▼
Kepala Bidang
    │
    │  Terima hasil verifikasi JF 2
    │  Review dan setujui
    │  → Gabungkan dengan laporan Jalur 1 untuk pelaporan ke Kepala Dinas
    ▼
Kepala Dinas (dengan CC Sekretaris)
```

---

### 3.4 Jalur 3 — Alur SPJ dan Pelaksanaan DPA

```
PPTK 1 (DPA Ketersediaan)        PPTK 2 (DPA Kerawanan)
    │                                     │
    │  Buat SPJ kegiatan                  │  Buat SPJ kegiatan
    │  Siapkan dokumen DPA                │  Siapkan dokumen DPA
    │  Kendalikan progres kegiatan        │  Kendalikan progres kegiatan
    │  Laporan kemajuan kegiatan          │  Laporan kemajuan kegiatan
    ▼                                     ▼
                  Kepala Bidang
                      │
                      │  Terima laporan PPTK 1 dan PPTK 2
                      │  Review progres DPA Ketersediaan dan DPA Kerawanan
                      │  Setujui → teruskan ke Sekretariat
                      ▼
                  Sekretariat
                      │
                      ├── JF Penata Usahaan Keuangan
                      │   Analisis dan verifikasi dokumen keuangan
                      │
                      ├── PPK-SKPD
                      │   Mengesahkan SPJ → menerbitkan SPM
                      │
                      └── Sekretaris
                          Menerima laporan keuangan Bidang
```

> **Catatan penting:** Bidang Ketersediaan **tidak memiliki** Bendahara, PPK-SKPD, atau PPK sendiri. Seluruh proses verifikasi dan pengesahan keuangan dilakukan di Sekretariat.

---

### 3.5 Jalur 4 — Alur SPJ Seluruh ASN Bidang

Seluruh ASN di Bidang Ketersediaan dan Kerawanan Pangan **wajib membuat SPJ** ketika menerima honor, melakukan perjalanan dinas, atau pengeluaran lainnya atas namanya. Mekanisme mengikuti **Dokumen 38 SIGAP-MALUT**:

**SPJ Mandiri (Kondisi A)** — berlaku untuk seluruh 14 Pelaksana dan 2 PPTK yang membuat SPJ atas namanya sendiri:

```
Pelaksana / PPTK
    │  Buat SPJ sendiri → upload bukti
    ▼
JF (sesuai kelompok)
    │  Verifikasi teknis → setujui
    ▼
Kepala Bidang → Sekretariat (JF Keuangan → PPK-SKPD → SPM)
```

**SPJ Delegasi (Kondisi B)** — berlaku untuk SPJ atas nama Kepala Bidang dan JF 1 / JF 2:

```
Pejabat (Kepala Bidang / JF)
    │  Serahkan bukti pengeluaran asli ke Pelaksana
    ▼
Pelaksana
    │  Buat draft SPJ atas nama Pejabat → upload bukti
    │  Status: menunggu_konfirmasi_pejabat
    ▼
Pejabat — WAJIB KONFIRMASI DAN SETUJUI DIGITAL
    │  Periksa draft → tekan "Saya Setujui SPJ ini"
    │  Status: dikonfirmasi_pejabat
    ▼
JF (sesuai kelompok) → Kepala Bidang → Sekretariat (JF Keuangan → PPK-SKPD → SPM)
```

---

### 3.6 Jalur 5 — Pelaporan Gabungan ke Kepala Dinas

```
Kepala Bidang
    │
    │  Menggabungkan:
    │  → Laporan Ketersediaan (dari JF 1)
    │  → Laporan Kerawanan (dari JF 2)
    │  → Laporan Progres DPA (dari PPTK 1 dan PPTK 2)
    │
    │  Menambahkan rekomendasi strategis:
    │  → Wilayah yang perlu intervensi segera
    │  → Komoditas yang perlu penambahan stok
    │  → Koordinasi yang perlu diinisiasi lintas bidang/sektor
    │
    │  Mengirimkan laporan ke Kepala Dinas
    │  WAJIB CC kepada Sekretaris
    ▼
Kepala Dinas
    │  Menerima laporan → evaluasi → beri arahan kebijakan
    ▼
Sekretaris
    │  Menerima CC → dokumentasi → arsip resmi Dinas
```

---

## BAGIAN IV — KOORDINASI LINTAS UNIT

### 4.1 Koordinasi dengan Bidang Distribusi dan Cadangan Pangan

Data ketersediaan dan kerawanan dari Bidang ini menjadi **dasar perencanaan distribusi** bagi Bidang Distribusi. Alur koordinasi:

```
Kepala Bidang Ketersediaan
    │  Kirim data stok dan peta kerawanan
    │  (melalui SIGAP-MALUT — CC Sekretaris)
    ▼
Kepala Bidang Distribusi
    │  Gunakan sebagai dasar rencana distribusi
```

### 4.2 Koordinasi dengan UPTD Balai PMKP

Jika ditemukan indikasi kerawanan terkait mutu atau keamanan pangan, Bidang Ketersediaan berkoordinasi dengan UPTD:

```
Kepala Bidang Ketersediaan
    │  Kirim permintaan pengujian sampel
    │  (melalui SIGAP-MALUT — CC Sekretaris)
    ▼
Kepala UPTD
    │  Lakukan pengujian → kirim hasil ke Bidang Ketersediaan
```

### 4.3 Koordinasi dengan Sekretariat

Seluruh dokumen perencanaan (Renja, RKA, LAKIP yang berkaitan dengan Bidang) yang telah diverifikasi JF dan disetujui Kepala Bidang diteruskan ke Sekretariat untuk proses lebih lanjut melalui JF Perencana Sekretariat.

---

## BAGIAN V — PRINSIP KINERJA BERJENJANG

### 5.1 Rantai Pertanggungjawaban Kinerja

```
KINERJA 6 PELAKSANA KETERSEDIAAN + PPTK 1
        ↓ merupakan bagian dari
KINERJA JF 1 (Analis Ketahanan Pangan — Ketersediaan)

KINERJA 6 PELAKSANA KERAWANAN + PPTK 2
        ↓ merupakan bagian dari
KINERJA JF 2 (Analis Ketahanan Pangan — Kerawanan)

KINERJA JF 1 + KINERJA JF 2
        ↓ merupakan bagian dari
KINERJA KEPALA BIDANG

KINERJA KEPALA BIDANG
        ↓ merupakan bagian dari
KINERJA KEPALA DINAS
```

### 5.2 Matriks Penilaian Kinerja (SKP)

| Jabatan Penilai | Jabatan yang Dinilai | Kewenangan |
|-----------------|----------------------|------------|
| Kepala Dinas | Kepala Bidang | Isi penilaian + lihat nilai |
| Kepala Bidang | JF 1, JF 2, PPTK 1, PPTK 2, seluruh 12 Pelaksana | Isi penilaian + lihat nilai |
| JF 1 dan JF 2 | Tidak ada bawahan | Tidak menilai |
| PPTK 1 dan PPTK 2 | Tidak ada bawahan (peran sebagai Pelaksana) | Tidak menilai |
| Pelaksana | Diri sendiri | Hanya lihat nilai sendiri (read-only) |

> **Catatan:** Meskipun secara operasional JF mengkoordinasikan pekerjaan Pelaksana di kelompoknya, **penilaian kinerja Pelaksana tetap menjadi kewenangan Kepala Bidang** — bukan JF. Ini sesuai prinsip regulasi bahwa JF tidak memiliki bawahan.

### 5.3 Prinsip Kerahasiaan Penilaian Kinerja

Berdasarkan PP Nomor 30 Tahun 2019:
- Setiap Pelaksana hanya dapat melihat nilai kinerjanya sendiri (read-only)
- Sesama Pelaksana tidak dapat saling melihat nilai kinerja masing-masing
- JF 1 tidak dapat melihat nilai kinerja JF 2, dan sebaliknya
- Hanya Kepala Bidang yang dapat melihat nilai kinerja seluruh staf Bidang

---

## BAGIAN VI — IMPLEMENTASI DALAM SIGAP-MALUT

### 6.1 Konfigurasi Role Database

| Jabatan | Role DB | Atribut Tambahan |
|---------|---------|-----------------|
| Kepala Bidang | `KEPALA_BIDANG_KETERSEDIAAN` | — |
| JF 1 | `PEJABAT_FUNGSIONAL` | `unit_kerja = Bidang-Ketersediaan`, `sub_fungsi = Ketersediaan` |
| JF 2 | `PEJABAT_FUNGSIONAL` | `unit_kerja = Bidang-Ketersediaan`, `sub_fungsi = Kerawanan` |
| PPTK 1 | `PELAKSANA` | `unit_kerja = Bidang-Ketersediaan`, `jenis = PPTK`, `dpa = Ketersediaan` |
| PPTK 2 | `PELAKSANA` | `unit_kerja = Bidang-Ketersediaan`, `jenis = PPTK`, `dpa = Kerawanan` |
| Pelaksana Ketersediaan | `PELAKSANA` | `unit_kerja = Bidang-Ketersediaan`, `sub_fungsi = Ketersediaan` |
| Pelaksana Kerawanan | `PELAKSANA` | `unit_kerja = Bidang-Ketersediaan`, `sub_fungsi = Kerawanan` |

> Seluruh role mengacu pada 15 role terkunci dalam Dokumen 33 SIGAP-MALUT. Tidak ada penambahan role baru.

### 6.2 Status Workflow Dokumen Teknis

```
draft
    → submitted (oleh Pelaksana)
    → verified_jf (oleh JF 1 atau JF 2)
    → approved_kabid (oleh Kepala Bidang)
    → forwarded_to_sekretariat (jika dokumen perencanaan/keuangan)
    → forwarded_to_kadin (jika laporan strategis)
    → closed
    → returned (jika dikembalikan untuk perbaikan)
```

### 6.3 Aturan Sistem yang Tidak Bisa Dilangkahi

1. Dokumen dari Pelaksana yang **belum diverifikasi JF** tidak bisa naik ke Kepala Bidang
2. Laporan Kepala Bidang ke Kepala Dinas **wajib ada CC Sekretaris** — sistem memblokir jika tidak ada CC
3. SPJ atas nama Kepala Bidang atau JF yang **belum dikonfirmasi pejabat** tidak bisa diproses (Dokumen 38)
4. PPTK **tidak bisa** menandatangani kontrak melalui sistem
5. Dokumen kerawanan dari JF 2 **dapat mengakses** data ketersediaan dari JF 1 sebagai referensi — tetapi tidak bisa mengubahnya
6. Pelaksana Ketersediaan **tidak bisa** melihat tugas Pelaksana Kerawanan, dan sebaliknya

### 6.4 Fitur Dashboard Kepala Bidang

Mengingat tidak adanya eselon IV, dashboard Kepala Bidang harus menampilkan secara real-time:

| Komponen | Deskripsi |
|----------|-----------|
| Antrian verifikasi JF 1 | Dokumen Ketersediaan yang sudah diverifikasi JF 1 dan menunggu persetujuan Kepala Bidang |
| Antrian verifikasi JF 2 | Dokumen Kerawanan yang sudah diverifikasi JF 2 dan menunggu persetujuan Kepala Bidang |
| Status DPA Ketersediaan | Progres realisasi anggaran DPA Ketersediaan (dari PPTK 1) |
| Status DPA Kerawanan | Progres realisasi anggaran DPA Kerawanan (dari PPTK 2) |
| Peta kerawanan real-time | Visualisasi indeks kerawanan per kabupaten/kota Maluku Utara |
| Alert stok komoditas | Peringatan jika stok mendekati batas kritis |
| Dokumen menunggu konfirmasi | SPJ atas nama Kepala Bidang yang menunggu persetujuan digital |
| Tugas overdue | Tugas yang melewati tenggat waktu dari seluruh staf |

### 6.5 Fitur Antrian Verifikasi JF

Mengingat rasio 1 JF berbanding 7 Pelaksana, sistem SIGAP-MALUT wajib menyediakan:

| Fitur | Deskripsi |
|-------|-----------|
| Antrian prioritas | Dokumen diurutkan berdasarkan urgensi dan tenggat waktu |
| Label deadline | Setiap dokumen memiliki label tenggat waktu yang jelas |
| Delegasi darurat | Jika JF berhalangan, Kepala Bidang dapat mengambil alih verifikasi |
| Notifikasi eskalasi | Alert ke Kepala Bidang jika dokumen menunggu verifikasi lebih dari 2 hari kerja |

---

## BAGIAN VII — KETENTUAN KHUSUS BIDANG KETERSEDIAAN

### 7.1 Data yang Wajib Diinput Rutin

| Data | Frekuensi | Penanggung Jawab |
|------|-----------|-----------------|
| Stok beras, jagung, sagu per gudang | Mingguan | Pelaksana Ketersediaan |
| Harga komoditas di pasar | Mingguan | Pelaksana Ketersediaan |
| Neraca ketersediaan pangan daerah | Bulanan | Pelaksana Ketersediaan |
| Indeks kerawanan pangan per wilayah | Triwulan | Pelaksana Kerawanan |
| Peta kerawanan pangan | Triwulan | Pelaksana Kerawanan |
| Laporan early warning defisit | Insidental | Pelaksana Ketersediaan |
| Status darurat pangan (jika ada) | Insidental | Pelaksana Ketersediaan |
| Laporan realisasi intervensi | Bulanan | Pelaksana Kerawanan |

### 7.2 Koordinasi Data dengan Instansi Eksternal

Berdasarkan dokumen sistem, data dari instansi berikut menjadi referensi bagi Bidang Ketersediaan:

| Instansi | Data yang Dibutuhkan |
|----------|---------------------|
| BPS Provinsi | Neraca Bahan Makanan, statistik produksi pangan |
| Dinas Pertanian Provinsi | Data produksi tanaman pangan per kabupaten |
| Perum BULOG Cabang Ternate | Stok Cadangan Beras Pemerintah (CBP) |
| Dinas Sosial | Data rumah tangga miskin dan rentan pangan (DTKS) |
| Dinas Kesehatan | Prevalensi stunting dan gizi buruk (agregat) |
| BPBD | Data dampak bencana terhadap produksi dan ketersediaan pangan |

---

## CATATAN AKHIR

Dokumen ini merupakan pedoman, syarat, dan panduan alur kerja di lingkungan Bidang Ketersediaan dan Kerawanan Pangan Dinas Pangan Provinsi Maluku Utara yang berlaku dalam sistem SIGAP-MALUT. Seluruh ketentuan dalam dokumen ini bersifat mengikat dan wajib diimplementasikan dalam konfigurasi sistem.

Dokumen pedoman alur kerja ini merupakan satu kesatuan dengan:
- **Dokumen 37** — Pedoman Alur Kerja Sekretariat
- **Dokumen 38** — Pedoman Mekanisme SPJ Mandiri dan Delegasi
- **Dokumen 40** — Pedoman Alur Kerja Bidang Distribusi dan Cadangan Pangan *(akan disusun)*
- **Dokumen 41** — Pedoman Alur Kerja Bidang Konsumsi dan Keamanan Pangan *(akan disusun)*
- **Dokumen 42** — Pedoman Alur Kerja UPTD Balai Pengawasan Mutu dan Keamanan Pangan *(akan disusun)*

---

*Dokumen 39 — SIGAP-MALUT — Dinas Pangan Provinsi Maluku Utara — 5 April 2026*
