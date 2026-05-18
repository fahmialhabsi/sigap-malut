# 50 — Pedoman Alur Kerja, Struktur Organisasi, dan Prinsip Kinerja Berjenjang
## Bidang Distribusi dan Cadangan Pangan — Dinas Pangan Provinsi Maluku Utara

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
- Dokumen 39 SIGAP-MALUT (Pedoman Alur Kerja Bidang Ketersediaan dan Kerawanan Pangan)

---

## BAGIAN I — STRUKTUR ORGANISASI

### 1.1 Kedudukan

Bidang Distribusi dan Cadangan Pangan dipimpin oleh **Kepala Bidang** yang berada langsung di bawah dan bertanggung jawab kepada **Kepala Dinas**.

Kepala Bidang berkedudukan **setara** dengan Sekretaris Dinas dan Kepala Bidang lainnya. Setiap laporan ke Kepala Dinas wajib ditembuskan (CC) kepada Sekretaris.

### 1.2 Komposisi SDM

| Jabatan | Jumlah | Keterangan |
|---------|--------|------------|
| Kepala Bidang | 1 | Eselon III — atasan langsung seluruh staf Bidang |
| JF Analis Ketahanan Pangan | 2 | Kelompok Jabatan Fungsional |
| Pelaksana | 12 | Staf teknis Bidang |
| PPTK | 2 | Merangkap sebagai Pelaksana — ditetapkan SK KPA |
| **Total** | **15** | 1 Kepala Bidang + 2 JF + 12 Pelaksana |

> **Catatan:** 2 PPTK adalah bagian dari 12 Pelaksana — bukan orang tambahan. Total SDM tetap 1 + 2 + 12 = 15 orang.

### 1.3 Pembagian Dua Kelompok Kerja

Bidang ini mengemban dua fungsi besar yang berbeda namun saling berkaitan. Pembagian dilakukan berdasarkan DPA yang terpisah:

#### Kelompok Distribusi Pangan (DPA Distribusi)

| Jabatan | Jumlah | Tugas Pokok |
|---------|--------|-------------|
| JF 1 — Analis Ketahanan Pangan | 1 | Analisis dan verifikasi teknis sub-modul 3.1, 3.2, 3.3, dan 3.6 (bagian distribusi) |
| PPTK 1 | 1 | Merangkap Pelaksana — mengelola DPA Distribusi |
| Pelaksana | 5 | Input data distribusi, harga, stabilisasi, koordinasi TPID/GPM |
| **Subtotal** | **7** | 1 JF + 6 Pelaksana (1 merangkap PPTK) |

#### Kelompok Cadangan Pangan (DPA Cadangan)

| Jabatan | Jumlah | Tugas Pokok |
|---------|--------|-------------|
| JF 2 — Analis Ketahanan Pangan | 1 | Analisis dan verifikasi teknis sub-modul 3.4, 3.5, dan 3.6 (bagian cadangan) |
| PPTK 2 | 1 | Merangkap Pelaksana — mengelola DPA Cadangan |
| Pelaksana | 5 | Input data CPPD, stok cadangan, GPM, bimbingan teknis |
| **Subtotal** | **7** | 1 JF + 6 Pelaksana (1 merangkap PPTK) |

### 1.4 Sub-Modul dalam SIGAP-MALUT

Bidang Distribusi dan Cadangan Pangan memiliki 6 sub-modul dengan total 30 layanan:

| Sub-Modul | Fungsi Utama | Kelompok |
|-----------|-------------|----------|
| 3.1 Kebijakan | Kebijakan distribusi, peta distribusi, jalur distribusi, sinkronisasi pusat-daerah, pedoman teknis | Distribusi |
| 3.2 Pengendalian & Kelancaran Distribusi | Arus distribusi, ketersediaan pasar, hambatan, fasilitasi, koordinasi lintas wilayah | Distribusi |
| 3.3 Stabilisasi Harga | Pemantauan harga, analisis fluktuasi, rekomendasi stabilisasi, operasi pasar, koordinasi TPID | Distribusi |
| 3.4 Pengelolaan CPPD | Perencanaan CPPD, pengadaan, pengelolaan stok cadangan, penyaluran darurat, evaluasi | Cadangan |
| 3.5 Bimbingan Teknis | Bimtek distribusi, bimtek CPPD, supervisi lapangan, konsultasi, fasilitasi stakeholder | Cadangan |
| 3.6 Monitoring & Evaluasi | Evaluasi distribusi, evaluasi harga, evaluasi CPPD, laporan kinerja, data SAKIP | Keduanya |

> **Catatan Sub-Modul 3.6:** Dikerjakan bersama oleh kedua kelompok. Bagian evaluasi distribusi dan harga diverifikasi JF 1, bagian evaluasi CPPD diverifikasi JF 2. Kepala Bidang menggabungkan keduanya menjadi laporan Monev terpadu.

### 1.5 Prinsip Pembagian Kelompok

- Pembagian ini **bukan hierarki** — JF 1 tidak membawahi JF 2 dan sebaliknya
- Keduanya **setara** dan sama-sama bertanggung jawab langsung kepada Kepala Bidang
- Data Kelompok Distribusi (arus distribusi, harga) menjadi **referensi** bagi Kelompok Cadangan dalam menentukan kebutuhan penyaluran CPPD
- Pembagian dikonfigurasi dalam SIGAP-MALUT melalui atribut `unit_kerja` dan `sub_fungsi` — **bukan** melalui role baru di database

### 1.6 Posisi PPTK

- **PPTK 1** → bertanggung jawab atas seluruh kegiatan dan anggaran dalam DPA Distribusi
- **PPTK 2** → bertanggung jawab atas seluruh kegiatan dan anggaran dalam DPA Cadangan

Pemisahan ini memastikan pertanggungjawaban anggaran yang jelas dan tidak tumpang tindih antara dua DPA.

---

## BAGIAN II — TUGAS DAN FUNGSI JABATAN

### 2.1 Kepala Bidang

**Atasan langsung:** Kepala Dinas

**Tugas dan fungsi:**
- Merumuskan dan melaksanakan kebijakan operasional distribusi, harga, dan cadangan pangan
- Bimbingan teknis dan supervisi kepada seluruh staf Bidang
- Mengoordinasikan dan memadukan laporan dari Kelompok Distribusi dan Kelompok Cadangan
- Memberikan rekomendasi strategis kepada Kepala Dinas terkait stabilisasi pasokan dan harga pangan
- Monitoring, evaluasi, dan pelaporan kinerja Bidang
- Berkoordinasi dengan Bidang Ketersediaan, Bidang Konsumsi, UPTD, Sekretariat, dan instansi eksternal (TPID, BULOG, Disperindag)

**Kewenangan laporan ke Kepala Dinas:**
Kepala Bidang **boleh** menyampaikan laporan langsung kepada Kepala Dinas, namun **wajib melakukan CC kepada Sekretaris** pada setiap komunikasi tersebut.

### 2.2 JF 1 — Analis Ketahanan Pangan (Kelompok Distribusi)

**Atasan langsung:** Kepala Bidang

**Prinsip regulasi:** JF tidak memiliki bawahan dan tidak mendisposisi tugas kepada Pelaksana.

**Tugas dan fungsi:**
- Menganalisis dan memverifikasi secara teknis seluruh dokumen dari 5 Pelaksana Kelompok Distribusi
- Menganalisis arus distribusi pangan antar wilayah kabupaten/kota di Maluku Utara
- Menganalisis tren harga komoditas strategis dan merekomendasikan stabilisasi
- Memverifikasi laporan koordinasi TPID dan rekomendasi operasi pasar
- Memverifikasi laporan sub-modul 3.1, 3.2, 3.3, dan 3.6 (bagian distribusi dan harga)
- Menyetujui atau mengembalikan dokumen untuk perbaikan
- Melaporkan hasil kerja kepada Kepala Bidang

### 2.3 JF 2 — Analis Ketahanan Pangan (Kelompok Cadangan)

**Atasan langsung:** Kepala Bidang

**Prinsip regulasi:** Sama dengan JF 1 — tidak memiliki bawahan.

**Tugas dan fungsi:**
- Menganalisis dan memverifikasi secara teknis seluruh dokumen dari 5 Pelaksana Kelompok Cadangan
- Menganalisis kebutuhan, posisi, dan kondisi Cadangan Pangan Pemerintah Daerah (CPPD)
- Menganalisis kelayakan penyaluran CPPD dalam kondisi darurat
- Memverifikasi laporan Gerakan Pangan Murah (GPM) dan bimbingan teknis
- Memverifikasi laporan sub-modul 3.4, 3.5, dan 3.6 (bagian cadangan dan CPPD)
- Menyetujui atau mengembalikan dokumen untuk perbaikan
- Melaporkan hasil kerja kepada Kepala Bidang

### 2.4 PPTK 1 — Pelaksana merangkap PPTK DPA Distribusi

**Dua peran yang dijalankan bersamaan:**

**Peran sebagai Pelaksana:**
- Menerima tugas harian dari Kepala Bidang
- Mengerjakan dan melaporkan hasil kerja
- Wajib membuat SPJ sendiri untuk pengeluaran atas namanya

**Peran sebagai PPTK (berdasarkan SK KPA):**
- Mengendalikan dan melaporkan perkembangan pelaksanaan teknis kegiatan DPA Distribusi
- Menyiapkan dokumen dalam rangka pelaksanaan anggaran DPA Distribusi
- Menyiapkan dokumen pengadaan barang/jasa untuk kegiatan DPA Distribusi
- Melaporkan progres DPA kepada Kepala Bidang secara berkala

**Batasan PPTK:** Tidak berwenang menandatangani kontrak dan tidak berwenang melakukan pembayaran.

### 2.5 PPTK 2 — Pelaksana merangkap PPTK DPA Cadangan

Sama dengan PPTK 1 namun untuk DPA Cadangan Pangan.

### 2.6 Pelaksana (10 orang — di luar 2 PPTK)

**Tugas dan fungsi umum:**
- Mengumpulkan data lapangan sesuai sub-modul yang ditugaskan
- Menginput data ke dalam SIGAP-MALUT
- Mengajukan dokumen ke JF untuk dianalisis dan diverifikasi
- Wajib membuat SPJ sendiri untuk pengeluaran atas namanya
- Dapat membantu pembuatan draft SPJ atas nama pejabat (Kepala Bidang, JF) — mengikuti mekanisme Dokumen 38

---

## BAGIAN III — ALUR KERJA DAN PROSES VERIFIKASI

### 3.1 Prinsip Umum

> **"Kinerja 12 Pelaksana + 2 PPTK adalah kinerja 2 JF. Kinerja 2 JF adalah kinerja Kepala Bidang. Kinerja Kepala Bidang adalah kinerja Kepala Dinas."**

Seluruh alur kerja bersifat **hierarkis dan berjenjang**. Tidak ada dokumen yang dapat langsung naik ke Kepala Dinas tanpa melalui Kepala Bidang. Tidak ada dokumen yang dapat langsung naik ke Kepala Bidang tanpa melalui JF.

---

### 3.2 Jalur 1 — Alur Dokumen Distribusi Pangan

```
Pelaksana Distribusi (5 orang)
    │
    │  Input data dan laporan:
    │  Kebijakan distribusi pangan daerah
    │  Arus distribusi dari gudang ke kabupaten/kota
    │  Pemantauan ketersediaan di pasar
    │  Identifikasi hambatan distribusi
    │  Pemantauan harga komoditas strategis harian/mingguan
    │  Analisis fluktuasi harga dan rekomendasi stabilisasi
    │  Koordinasi TPID dan realisasi operasi pasar
    │  Laporan Gerakan Pangan Murah (GPM)
    │  Laporan sub-modul 3.1 Kebijakan
    │  Laporan sub-modul 3.2 Pengendalian & Kelancaran Distribusi
    │  Laporan sub-modul 3.3 Stabilisasi Harga
    │  Laporan sub-modul 3.6 Monev (bagian distribusi dan harga)
    ▼
JF 1 — Analis Ketahanan Pangan (Kelompok Distribusi)
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

### 3.3 Jalur 2 — Alur Dokumen Cadangan Pangan

```
Pelaksana Cadangan (5 orang)
    │
    │  Input data dan laporan:
    │  Perencanaan kebutuhan CPPD (Cadangan Pangan Pemerintah Daerah)
    │  Pengadaan dan penerimaan cadangan pangan
    │  Pengelolaan stok cadangan (posisi, kondisi, rotasi)
    │  Penyaluran CPPD dalam kondisi darurat
    │  Evaluasi pemanfaatan CPPD
    │  Pelaksanaan bimbingan teknis distribusi dan cadangan
    │  Supervisi lapangan dan pendampingan
    │  Laporan sub-modul 3.4 Pengelolaan CPPD
    │  Laporan sub-modul 3.5 Bimbingan Teknis
    │  Laporan sub-modul 3.6 Monev (bagian cadangan dan CPPD)
    ▼
JF 2 — Analis Ketahanan Pangan (Kelompok Cadangan)
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

### 3.4 Jalur 3 — Alur Sub-Modul 3.6 Monitoring dan Evaluasi (Bersama)

Sub-modul 3.6 dikerjakan bersama oleh kedua kelompok dengan pembagian yang jelas:

```
Pelaksana Distribusi                    Pelaksana Cadangan
    │  Evaluasi distribusi                   │  Evaluasi CPPD
    │  Evaluasi stabilisasi harga            │  Laporan kinerja cadangan
    ▼                                        ▼
JF 1 — verifikasi bagian distribusi    JF 2 — verifikasi bagian cadangan
    │                                        │
    └──────────────┬─────────────────────────┘
                   ▼
           Kepala Bidang
               │
               │  Menggabungkan evaluasi distribusi + cadangan
               │  Menjadi Laporan Monev Terpadu Bidang
               ▼
    Kepala Dinas (dengan CC Sekretaris)
```

---

### 3.5 Jalur 4 — Alur SPJ dan Pelaksanaan DPA

```
PPTK 1 (DPA Distribusi)               PPTK 2 (DPA Cadangan)
    │                                      │
    │  Buat SPJ kegiatan Distribusi         │  Buat SPJ kegiatan Cadangan
    │  Siapkan dokumen pelaksanaan DPA      │  Siapkan dokumen pelaksanaan DPA
    │  Kendalikan progres kegiatan          │  Kendalikan progres kegiatan
    │  Laporan kemajuan kegiatan            │  Laporan kemajuan kegiatan
    ▼                                      ▼
                  Kepala Bidang
                      │
                      │  Terima laporan PPTK 1 dan PPTK 2
                      │  Review progres DPA Distribusi dan DPA Cadangan
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

> **Catatan penting:** Bidang Distribusi **tidak memiliki** Bendahara, PPK-SKPD, atau PPK sendiri. Seluruh proses verifikasi dan pengesahan keuangan dilakukan di Sekretariat.

---

### 3.6 Jalur 5 — Alur SPJ Seluruh ASN Bidang

Seluruh ASN di Bidang Distribusi dan Cadangan Pangan **wajib membuat SPJ** ketika menerima honor, melakukan perjalanan dinas, atau pengeluaran lainnya atas namanya. Mekanisme mengikuti **Dokumen 38 SIGAP-MALUT**:

**SPJ Mandiri (Kondisi A)** — berlaku untuk seluruh 12 Pelaksana dan 2 PPTK:

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

### 3.7 Jalur 6 — Pelaporan Gabungan ke Kepala Dinas

```
Kepala Bidang
    │
    │  Menggabungkan:
    │  → Laporan Distribusi Pangan (dari JF 1)
    │  → Laporan Cadangan Pangan / CPPD (dari JF 2)
    │  → Laporan Monev Terpadu (sub-modul 3.6 — gabungan)
    │  → Laporan Progres DPA Distribusi (dari PPTK 1)
    │  → Laporan Progres DPA Cadangan (dari PPTK 2)
    │  → Laporan koordinasi TPID dan GPM
    │
    │  Menambahkan rekomendasi strategis:
    │  → Wilayah yang mengalami hambatan distribusi
    │  → Komoditas yang memerlukan operasi pasar segera
    │  → Kebutuhan penyaluran CPPD darurat
    │  → Rekomendasi koordinasi dengan BULOG dan Disperindag
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

## BAGIAN IV — KOORDINASI LINTAS UNIT DAN INSTANSI

### 4.1 Koordinasi dengan Bidang Ketersediaan dan Kerawanan Pangan

Data ketersediaan dan peta kerawanan dari Bidang Ketersediaan menjadi **dasar perencanaan distribusi** bagi Bidang ini:

```
Bidang Ketersediaan
    │  Kirim data stok dan peta kerawanan
    │  (melalui SIGAP-MALUT — CC Sekretaris)
    ▼
Bidang Distribusi dan Cadangan
    │  Gunakan sebagai dasar:
    │  → Rencana rute distribusi ke wilayah rawan
    │  → Kebutuhan penyaluran CPPD darurat
```

### 4.2 Koordinasi dengan UPTD Balai PMKP

Sebelum distribusi dilakukan, Bidang Distribusi dapat berkoordinasi dengan UPTD untuk memastikan mutu pangan yang akan didistribusikan:

```
Bidang Distribusi
    │  Kirim permintaan pengujian sampel pangan
    │  (melalui SIGAP-MALUT — CC Sekretaris)
    ▼
Kepala UPTD
    │  Lakukan pengujian → kirim hasil ke Bidang Distribusi
```

### 4.3 Koordinasi dengan Bidang Konsumsi dan Keamanan Pangan

Data distribusi dan harga komoditas menjadi referensi bagi Bidang Konsumsi dalam pemantauan keamanan pangan di pasar.

### 4.4 Koordinasi dengan Instansi Eksternal

| Instansi | Bentuk Koordinasi | Mekanisme di SIGAP-MALUT |
|----------|------------------|--------------------------|
| TPID (Tim Pengendalian Inflasi Daerah) | Sinkronisasi data harga dan rekomendasi stabilisasi | Laporan koordinasi diinput Pelaksana → diverifikasi JF 1 → Kepala Bidang |
| Perum BULOG Cabang Ternate | Data stok CBP dan distribusi beras SPHP | Referensi data diinput Pelaksana Cadangan → diverifikasi JF 2 |
| Disperindag Provinsi | Data harga pasar dan distribusi komoditas | Referensi data diinput Pelaksana Distribusi → diverifikasi JF 1 |
| PT PELNI / Pelindo | Jadwal dan kapasitas angkutan logistik antar pulau | Referensi data untuk perencanaan rute distribusi |

> **Prinsip koordinasi eksternal:** Seluruh komunikasi dengan instansi eksternal yang menghasilkan dokumen atau kesepakatan wajib diinput ke SIGAP-MALUT dan melalui alur verifikasi JF → Kepala Bidang → CC Sekretaris.

---

## BAGIAN V — PRINSIP KINERJA BERJENJANG

### 5.1 Rantai Pertanggungjawaban Kinerja

```
KINERJA 5 PELAKSANA DISTRIBUSI + PPTK 1
        ↓ merupakan bagian dari
KINERJA JF 1 (Analis Ketahanan Pangan — Distribusi)

KINERJA 5 PELAKSANA CADANGAN + PPTK 2
        ↓ merupakan bagian dari
KINERJA JF 2 (Analis Ketahanan Pangan — Cadangan)

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
| Kepala Bidang | JF 1, JF 2, PPTK 1, PPTK 2, seluruh 10 Pelaksana | Isi penilaian + lihat nilai |
| JF 1 dan JF 2 | Tidak ada bawahan | Tidak menilai |
| PPTK 1 dan PPTK 2 | Tidak ada bawahan | Tidak menilai |
| Pelaksana | Diri sendiri | Hanya lihat nilai sendiri (read-only) |

> **Catatan:** Penilaian kinerja seluruh Pelaksana menjadi kewenangan Kepala Bidang — bukan JF. Sesama Pelaksana tidak dapat saling melihat nilai kinerja masing-masing (PP 30/2019).

---

## BAGIAN VI — IMPLEMENTASI DALAM SIGAP-MALUT

### 6.1 Konfigurasi Role Database

| Jabatan | Role DB | Atribut Tambahan |
|---------|---------|-----------------|
| Kepala Bidang | `KEPALA_BIDANG_DISTRIBUSI` | — |
| JF 1 | `PEJABAT_FUNGSIONAL` | `unit_kerja = Bidang-Distribusi`, `sub_fungsi = Distribusi` |
| JF 2 | `PEJABAT_FUNGSIONAL` | `unit_kerja = Bidang-Distribusi`, `sub_fungsi = Cadangan` |
| PPTK 1 | `PELAKSANA` | `unit_kerja = Bidang-Distribusi`, `jenis = PPTK`, `dpa = Distribusi` |
| PPTK 2 | `PELAKSANA` | `unit_kerja = Bidang-Distribusi`, `jenis = PPTK`, `dpa = Cadangan` |
| Pelaksana Distribusi | `PELAKSANA` | `unit_kerja = Bidang-Distribusi`, `sub_fungsi = Distribusi` |
| Pelaksana Cadangan | `PELAKSANA` | `unit_kerja = Bidang-Distribusi`, `sub_fungsi = Cadangan` |

> Seluruh role mengacu pada 15 role terkunci dalam Dokumen 33 SIGAP-MALUT. Tidak ada penambahan role baru.

### 6.2 Status Workflow Dokumen Teknis

```
draft
    → submitted (oleh Pelaksana)
    → verified_jf (oleh JF 1 atau JF 2)
    → approved_kabid (oleh Kepala Bidang)
    → forwarded_to_sekretariat (jika dokumen keuangan/DPA)
    → forwarded_to_kadin (jika laporan strategis)
    → closed
    → returned (jika dikembalikan untuk perbaikan)
```

### 6.3 Aturan Sistem yang Tidak Bisa Dilangkahi

1. Dokumen dari Pelaksana yang **belum diverifikasi JF** tidak bisa naik ke Kepala Bidang
2. Laporan Kepala Bidang ke Kepala Dinas **wajib ada CC Sekretaris** — sistem memblokir jika tidak ada CC
3. SPJ atas nama Kepala Bidang atau JF yang **belum dikonfirmasi pejabat** tidak bisa diproses (Dokumen 38)
4. Dokumen koordinasi TPID dan GPM **wajib diinput** ke SIGAP-MALUT dan tidak bisa langsung ke Kepala Dinas
5. Pelaksana Distribusi **tidak bisa** melihat tugas Pelaksana Cadangan, dan sebaliknya
6. Laporan Sub-Modul 3.6 dari kedua kelompok **harus digabungkan oleh Kepala Bidang** — tidak bisa salah satu kelompok yang meneruskan langsung

### 6.4 Fitur Dashboard Kepala Bidang

| Komponen | Deskripsi |
|----------|-----------|
| Antrian verifikasi JF 1 | Dokumen Distribusi yang sudah diverifikasi JF 1 |
| Antrian verifikasi JF 2 | Dokumen Cadangan yang sudah diverifikasi JF 2 |
| Status DPA Distribusi | Progres realisasi anggaran DPA Distribusi (dari PPTK 1) |
| Status DPA Cadangan | Progres realisasi anggaran DPA Cadangan (dari PPTK 2) |
| Peta distribusi real-time | Visualisasi arus distribusi per kabupaten/kota Maluku Utara |
| Monitoring harga komoditas | Tren harga harian/mingguan per komoditas strategis |
| Status CPPD | Posisi stok CPPD saat ini vs kebutuhan cadangan minimal |
| Alert harga | Peringatan jika harga komoditas melebihi ambang batas |
| Koordinasi TPID | Status tindak lanjut rekomendasi stabilisasi harga |
| Dokumen menunggu konfirmasi | SPJ atas nama Kepala Bidang yang menunggu persetujuan digital |

### 6.5 Data yang Wajib Diinput Rutin

| Data | Frekuensi | Penanggung Jawab |
|------|-----------|-----------------|
| Harga komoditas strategis di pasar | Harian | Pelaksana Distribusi |
| Arus distribusi antar wilayah | Mingguan | Pelaksana Distribusi |
| Posisi stok CPPD | Bulanan | Pelaksana Cadangan |
| Realisasi operasi pasar / GPM | Setiap kegiatan | Pelaksana Distribusi |
| Laporan koordinasi TPID | Bulanan | Pelaksana Distribusi |
| Laporan bimbingan teknis | Setiap kegiatan | Pelaksana Cadangan |
| Evaluasi pemanfaatan CPPD | Triwulan | Pelaksana Cadangan |
| Laporan Monev terpadu | Triwulan | Kedua kelompok |
| Penyaluran CPPD darurat | Insidental | Pelaksana Cadangan |

---

## CATATAN AKHIR

Dokumen ini merupakan pedoman, syarat, dan panduan alur kerja di lingkungan Bidang Distribusi dan Cadangan Pangan Dinas Pangan Provinsi Maluku Utara yang berlaku dalam sistem SIGAP-MALUT. Seluruh ketentuan dalam dokumen ini bersifat mengikat dan wajib diimplementasikan dalam konfigurasi sistem.

Dokumen pedoman alur kerja ini merupakan satu kesatuan dengan:
- **Dokumen 37** — Pedoman Alur Kerja Sekretariat
- **Dokumen 38** — Pedoman Mekanisme SPJ Mandiri dan Delegasi
- **Dokumen 39** — Pedoman Alur Kerja Bidang Ketersediaan dan Kerawanan Pangan
- **Dokumen 41** — Pedoman Alur Kerja Bidang Konsumsi dan Keamanan Pangan *(akan disusun)*
- **Dokumen 42** — Pedoman Alur Kerja UPTD Balai Pengawasan Mutu dan Keamanan Pangan *(akan disusun)*

---

*Dokumen 40 — SIGAP-MALUT — Dinas Pangan Provinsi Maluku Utara — 5 April 2026*
