# Catatan dan Rekomendasi atas Konsep Temuan BPK terhadap SIGAP-MALUT

## Dasar Penilaian

Penilaian ini disusun dengan dasar:

- Konsep temuan BPK yang diekstrak dari 7 dokumen PDF:
  - `1.2.01 Penerapan Sistem Informasi Pangan oleh Pemerintah Daerah Belum Memadai`
  - `1.2.02 Penyusunan dan Pemanfaatan Neraca Pangan Belum Sepenuhnya Didukung Data yang Valid`
  - `1.2.14 Penyelenggaraan Cadangan Pangan Pemerintah Daerah Belum Memadai`
  - `1.2.15 Regulasi dan Pengawasan atas Pelaksanaan SPHP`
  - `1.2.18 Pola Distribusi Barang Kebutuhan Pokok`
  - `1.2.19 Sarana dan Prasarana Distribusi Pangan`
  - `1.2.20 Lembaga Distribusi Pangan Masyarakat`
- Kondisi source code SIGAP-MALUT yang ada saat ini pada repo `e:\sigap-malut`.

Catatan penting:

- Penilaian ini berbasis source code, route, model, form, service, dan dokumentasi teknis yang ada di repo saat ini.
- Penilaian ini belum membuktikan kondisi instance produksi yang sedang berjalan atau isi database produksi yang aktual.
- Karena itu, kesimpulan di bawah dibaca sebagai: “apakah sistem yang saat ini ada di repo sudah cukup menjawab temuan BPK secara fungsional dan teknis”.

## Ringkasan Status

| No | Temuan BPK | Status terhadap SIGAP-MALUT saat ini | Ringkasan |
| --- | --- | --- | --- |
| 1.2.01 | Sistem Informasi Pangan belum memadai | Menjawab sebagian | Sudah ada pondasi harga pangan, inflasi, stok, kerawanan, dan audit; tetapi integrasi resmi ke SiPangan/Bapanas, FSVA, SKPG, SINBM, Simonstok, Sigapnas, dan SIPSAT belum terlihat operasional. |
| 1.2.02 | Neraca pangan belum didukung data valid | Belum menjawab | Struktur data ketersediaan sudah mulai ada, tetapi proses validasi lintas sektor, stok awal/akhir berantai, pangan masuk/keluar, dan pemanfaatan neraca untuk keputusan belum tampak operasional. |
| 1.2.14 | CPPD belum memadai | Belum menjawab | Desain data CPPD sudah disiapkan, tetapi workflow inti pengadaan, stok, target minimal, dan penyaluran CPPD belum solid; sebagian endpoint masih dummy atau salah terhubung. |
| 1.2.15 | Regulasi dan pengawasan SPHP belum optimal | Menjawab sebagian | Pemantauan harga, verifikasi, anomaly detection, inflasi proxy, dan TPID sudah mulai ada; tetapi mekanisme SPHP berbasis ambang gejolak harga dan laporan monev resmi belum utuh. |
| 1.2.18 | Pola distribusi belum dipetakan | Menjawab sebagian | Sudah ada rancangan modul kebijakan dan monitoring distribusi, tetapi belum menjadi sistem peta arus distribusi yang benar-benar operasional dan analitis. |
| 1.2.19 | Sarpras distribusi belum dipetakan | Belum menjawab | Sistem baru menyentuh stok gudang/CPPD, belum menjadi inventaris sarpras distribusi pangan provinsi-kabupaten/kota. |
| 1.2.20 | Lembaga distribusi pangan masyarakat belum dipetakan/diupayakan | Belum menjawab | Belum ditemukan modul operasional untuk LDPM, TTI/TTIC, atau Kios Pangan yang lengkap. |

## 1.2.01 Penerapan Sistem Informasi Pangan Belum Memadai

**Status:** Menjawab sebagian

**Catatan**

- SIGAP-MALUT sudah memiliki komponen operasional yang cukup baik untuk **harga pangan**:
  - input harga pasar oleh pelaksana;
  - verifikasi oleh JF;
  - deteksi anomali;
  - audit trail;
  - perhitungan inflasi harian internal;
  - publikasi tren harga.
- Ini berarti sebagian kebutuhan BPK terkait validasi, jejak audit, dan penyajian data harga **sudah mulai dijawab**.
- SIGAP-MALUT juga sudah menyiapkan modul domain pangan lain secara desain, misalnya:
  - `BKT-PGD` untuk pemantauan produksi/pasokan/neraca/early warning;
  - `BKT-KRW` untuk kerawanan pangan;
  - `BDS-MON` untuk monitoring distribusi;
  - `BDS-CPD` untuk CPPD.
- Namun, saya **belum menemukan integrasi operasional** ke sistem nasional yang disebut BPK, seperti:
  - FSVA interaktif;
  - SKPG;
  - SINBM;
  - Simonstok;
  - Sigapnas;
  - SIPSAT;
  - integrasi API resmi SiPangan/Bapanas untuk modul-modul tersebut.
- Pada sisi integrasi eksternal, service yang ada masih bersifat placeholder. Artinya, secara arsitektur sudah dibayangkan, tetapi belum benar-benar hidup di kode saat ini.
- Dashboard ketersediaan dan EWS juga masih menunjukkan pola data stub/demo, sehingga belum bisa dianggap sebagai jawaban penuh atas kebutuhan sistem informasi pangan yang komprehensif.
- Beberapa form master data penting masih menggunakan daftar hardcoded, sehingga berisiko menimbulkan inkonsistensi antar modul.

**Rekomendasi**

1. Bangun konektor resmi/ETL untuk sumber nasional yang menjadi objek temuan BPK: Panel Harga, FSVA, SKPG, SINBM, Simonstok, dan modul SiPangan lainnya.
2. Jadikan SIGAP-MALUT sebagai orkestrator data daerah, bukan sekadar kumpulan form per modul.
3. Aktifkan peta interaktif untuk kerawanan/FSVA dan tautkan dengan data kabupaten/kota serta komoditas.
4. Hilangkan master data hardcoded pada form dan ganti dengan referensi ke tabel master yang konsisten.
5. Tambahkan dashboard konsistensi data antar sumber, misalnya perbandingan harga Panel Harga vs SKPG.

## 1.2.02 Penyusunan dan Pemanfaatan Neraca Pangan Belum Sepenuhnya Didukung Data yang Valid

**Status:** Belum menjawab

**Catatan**

- SIGAP-MALUT sudah memiliki model dan skema awal untuk:
  - `ProduksiPangan`;
  - `StokPangan`;
  - `NeracaPangan`;
  - `KerawananPangan`.
- Pada level desain, `BKT-PGD` juga sudah memuat field yang mengarah ke neraca dan early warning, seperti:
  - stok awal;
  - stok akhir;
  - surplus/defisit;
  - status ketersediaan;
  - pasokan lokal/luar daerah/impor;
  - validitas data.
- Akan tetapi, implementasi form saat ini masih sangat sederhana. Form `BKTPGDCreatePage` baru menangkap data dasar produksi dan belum menangkap substansi utama neraca pangan yang menjadi temuan BPK, misalnya:
  - stok awal yang terbukti;
  - carry over otomatis dari periode sebelumnya;
  - data pangan masuk;
  - data pangan keluar;
  - sumber dokumen per angka;
  - mekanisme revisi jika data lintas sektor berubah.
- Di sisi dashboard, endpoint ketersediaan masih mengembalikan catatan bahwa tabel produksi, stok, dan neraca belum tersedia data. Ini menandakan fitur analitisnya belum operasional.
- Belum terlihat workflow validasi lintas sektor yang melibatkan Disperindag, Dishub, Bulog, BPS, Dinas Pertanian, atau sumber lain sebagaimana dibutuhkan dalam metodologi neraca pangan.
- Belum terlihat pemanfaatan otomatis neraca pangan sebagai early warning atau dasar rekomendasi kebijakan. Yang ada masih berupa pondasi model dan tampilan.

**Rekomendasi**

1. Lengkapi model neraca pangan agar memuat `pangan_masuk`, `pangan_keluar`, `stok_awal_referensi`, `stok_akhir_referensi`, `metode_estimasi`, dan `dokumen_sumber`.
2. Buat validasi berantai: stok awal bulan N harus otomatis berasal dari stok akhir bulan N-1, kecuali ada koreksi resmi yang tercatat.
3. Bangun workflow validasi lintas sektor dengan status: draft, diverifikasi OPD sumber, disahkan tim validasi, final.
4. Tambahkan fitur pembanding otomatis dengan sumber BPS/Bulog dan log perubahan data per periode.
5. Jadikan output neraca pangan sebagai input wajib untuk dashboard early warning dan rekomendasi pimpinan.

## 1.2.14 Penyelenggaraan Cadangan Pangan Pemerintah Daerah Belum Memadai

**Status:** Belum menjawab

**Catatan**

- Secara desain, SIGAP-MALUT sebenarnya sudah menyiapkan struktur CPPD yang cukup lengkap pada modul `BDS-CPD`, termasuk field untuk:
  - kebutuhan CPPD;
  - target stok;
  - lokasi penyimpanan;
  - kapasitas gudang;
  - pengadaan;
  - stok awal/akhir bulan;
  - jenis penyaluran;
  - wilayah dan penerima penyaluran;
  - evaluasi dan rekomendasi.
- Namun implementasi operasionalnya belum memadai:
  - form `BDSCPDCreatePage` hanya menangkap metadata dasar, belum substansi CPPD;
  - dashboard status CPPD masih menggunakan data hardcoded/dummy;
  - belum terlihat mesin hitung target minimal CBPP/CPPD dan gap terhadap realisasi;
  - belum terlihat workflow penyaluran berdasarkan bencana, kerawanan, atau stabilisasi harga.
- Lebih serius lagi, controller `BDS-CPD` saat ini masih salah mengarah ke `komoditasService`, bukan mengelola entitas CPPD. Ini menunjukkan modul CPPD belum stabil secara teknis.
- Ringkasan publik CPPD memang sudah ada, tetapi masih mengandalkan agregasi dari `stok_pangan` berdasarkan kata kunci lokasi gudang. Ini belum cukup untuk menjawab kebutuhan tata kelola CPPD secara formal.

**Rekomendasi**

1. Perbaiki controller dan route CPPD agar benar-benar CRUD ke tabel `bds_cpd`, bukan ke master komoditas.
2. Perluas form CPPD agar memuat perhitungan kebutuhan minimal, target stok, pengadaan, kualitas, lokasi gudang, dan penyaluran.
3. Tambahkan dashboard gap antara target minimum CBPP/CPPD dan realisasi stok per periode.
4. Tambahkan workflow penyaluran CPPD sesuai kategori:
   - darurat bencana;
   - kerawanan pangan;
   - stabilisasi harga.
5. Tambahkan lampiran dokumen hukum dan kebijakan, misalnya Pergub/Juknis penyaluran, agar jejak audit keputusan lebih kuat.

## 1.2.15 Regulasi dan Pengawasan atas Pelaksanaan SPHP

**Status:** Menjawab sebagian

**Catatan**

- Pada sisi teknis pemantauan harga, SIGAP-MALUT sudah cukup maju:
  - pelaksana mengirim batch harga pasar;
  - JF memverifikasi;
  - sistem menandai anomali;
  - ada audit log;
  - ada perhitungan inflasi harian proxy;
  - ada data publik harga dan ringkasan inflasi.
- Model `BDS-HRG` juga sudah memuat field untuk:
  - operasi pasar;
  - rekomendasi stabilisasi;
  - rapat TPID;
  - tindak lanjut TPID.
- Ini berarti sebagian kebutuhan pengawasan harga pangan dan dukungan rapat TPID sudah ada pondasinya.
- Tetapi untuk menjawab temuan BPK terkait SPHP, sistem belum lengkap karena:
  - belum ada rule engine gejolak harga berbasis ambang regulasi;
  - belum ada workflow baku “harga naik sekian persen selama sekian hari -> usul SPHP/CPPD/CBP”;
  - belum ada generator laporan monev SPHP resmi ke Bapanas;
  - belum ada pengaitan formal antara hasil monitoring harga dengan penyaluran CPPD untuk SPHP;
  - form `BDSHRGCreatePage` masih memakai master komoditas dan pasar yang hardcoded.

**Rekomendasi**

1. Tambahkan rule engine SPHP berbasis ambang gejolak harga sesuai regulasi.
2. Buat alur keputusan otomatis dari data harga ke rekomendasi intervensi:
   - operasi pasar;
   - pelepasan CPPD;
   - koordinasi Bulog/CBP;
   - rapat TPID.
3. Tambahkan modul laporan monev SPHP yang bisa diekspor resmi per periode.
4. Integrasikan harga terverifikasi dengan status stok CPPD dan CBP agar pengambilan keputusan tidak terpisah.
5. Ganti daftar komoditas/pasar hardcoded dengan master data resmi dan sinkron.

## 1.2.18 Pola Distribusi Barang Kebutuhan Pokok Belum Dipetakan

**Status:** Menjawab sebagian

**Catatan**

- SIGAP-MALUT sudah menyiapkan dua pondasi penting:
  - `BDS-KBJ` untuk kebijakan/peta/jalur distribusi;
  - `BDS-MON` untuk monitoring arus distribusi, stok pasar, hambatan, fasilitasi, dan koordinasi wilayah.
- Pada level field, modul tersebut bahkan sudah memuat:
  - wilayah asal dan tujuan;
  - moda transportasi;
  - stok pasar;
  - jenis hambatan;
  - lokasi hambatan;
  - hasil koordinasi;
  - peta distribusi dan GIS data.
- Namun secara operasional, form yang ada masih minimal dan belum menangkap data arus distribusi secara utuh. Form `BDSMONCreatePage` misalnya baru menangkap metadata dasar, bukan data distribusi origin-destination yang sesungguhnya.
- Belum terlihat analitik untuk:
  - arus distribusi antarpulau;
  - pengiriman dari wilayah surplus ke wilayah defisit/rawan;
  - rekomendasi mobilisasi cadangan berdasarkan neraca dan kerawanan;
  - bottleneck distribusi di pelabuhan/kapal/jalur.
- Dengan demikian, secara desain sudah diarahkan ke sana, tetapi secara fungsional masih belum cukup untuk menutup temuan BPK.

**Rekomendasi**

1. Ubah modul distribusi dari sekadar pencatatan metadata menjadi peta arus distribusi yang nyata.
2. Tambahkan data origin-destination, volume, frekuensi, lead time, biaya, moda, dan hambatan untuk setiap aliran pangan.
3. Hubungkan modul distribusi dengan:
   - neraca pangan;
   - status kerawanan;
   - stok gudang/CPPD;
   - data harga.
4. Tambahkan dashboard “wilayah surplus -> wilayah rawan/defisit” sebagai bahan intervensi.
5. Tambahkan ekspor laporan kebijakan distribusi dan fasilitasi distribusi pangan.

## 1.2.19 Sarana dan Prasarana Distribusi Pangan Belum Sepenuhnya Dipetakan

**Status:** Belum menjawab

**Catatan**

- SIGAP-MALUT baru memiliki elemen yang menyentuh gudang dan stok, misalnya:
  - `StokPangan` dengan `lokasi_gudang`;
  - field lokasi penyimpanan dan kapasitas gudang pada desain CPPD.
- Namun belum ditemukan modul operasional khusus untuk memetakan sarpras distribusi pangan secara menyeluruh, seperti:
  - gudang bahan pokok;
  - gudang cadangan pangan;
  - pelabuhan/logistik;
  - armada angkut;
  - lintasan distribusi;
  - kapasitas dan kondisi sarpras per kabupaten/kota.
- Belum ada dashboard yang menunjukkan coverage gudang, gap sarpras, atau keterbatasan konektivitas distribusi.
- Belum terlihat integrasi data dengan Disperindag atau Dishub sebagai sumber sarpras distribusi.

**Rekomendasi**

1. Tambahkan modul master sarpras distribusi pangan.
2. Minimal data yang harus dicatat:
   - jenis sarpras;
   - lokasi;
   - kapasitas;
   - kondisi;
   - pengelola;
   - status operasional;
   - kebutuhan rehabilitasi/pengadaan.
3. Tambahkan layer peta untuk gudang, pelabuhan, trayek, dan wilayah blank spot distribusi.
4. Integrasikan data antar-OPD dengan Dishub, Disperindag, dan kabupaten/kota.
5. Tautkan sarpras distribusi dengan modul CPPD, distribusi pangan, dan monitoring harga.

## 1.2.20 Lembaga Distribusi Pangan Masyarakat Belum Dipetakan dan Diupayakan Optimal

**Status:** Belum menjawab

**Catatan**

- Pada dokumentasi sistem memang ada gagasan mengenai Kios Pangan dan model operasionalnya.
- Tetapi pada source code backend dan frontend, saya tidak menemukan modul operasional yang utuh untuk:
  - LDPM;
  - TTI/TTIC;
  - Kios Pangan;
  - kemitraan dengan distributor/poktan/gapoktan;
  - stok dan transaksi kelembagaan distribusi pangan.
- Artinya, kebutuhan kelembagaan distribusi pangan masyarakat masih belum dijawab oleh sistem operasional saat ini.
- Tidak ada registry lembaga, status aktif/tidak aktif, wilayah layanan, dukungan sarpras, anggaran operasional, atau kinerja distribusi kelembagaan.

**Rekomendasi**

1. Bangun modul khusus kelembagaan distribusi pangan masyarakat.
2. Entitas minimal yang perlu ada:
   - nama lembaga/kios;
   - tipe lembaga;
   - lokasi;
   - mitra/distributor pemasok;
   - komoditas yang dikelola;
   - jadwal operasi;
   - biaya operasional;
   - volume distribusi dan penjualan;
   - status aktif/tidak aktif.
3. Tambahkan dashboard kinerja lembaga distribusi pangan.
4. Tambahkan fitur pemetaan wilayah yang belum terlayani oleh lembaga distribusi.
5. Jika Kios Pangan ingin dijadikan jawaban atas temuan BPK, maka modulnya harus dibuat nyata, bukan hanya konsep di dokumentasi.

## Catatan Umum atas Kondisi SIGAP-MALUT Saat Ini

Ada beberapa isu lintas-temuan yang perlu diperhatikan:

- **Masih ada fitur stub/dummy/placeholder.**
  - EWS ketersediaan dan status CPPD pada dashboard masih memakai data contoh.
- **Masih ada ketidaksinkronan antar lapisan sistem.**
  - Model/field sudah lengkap, tetapi form input sering hanya menangkap sebagian kecil field.
- **Masih ada route dan layar yang berpotensi tidak nyambung.**
  - Beberapa list page memakai endpoint legacy seperti `/neraca_pangan`, `/stok_pangan`, `/cppd`, `/harga_pangan`, padahal route aktif di backend memakai pola modul lain.
- **Masih ada dualisme domain data.**
  - Harga pangan operasional berjalan lewat `harga_pangan`, sementara modul manajerial memakai `bds_hrg`; ini berisiko menimbulkan duplikasi dan kebingungan.
- **Integrasi eksternal belum nyata.**
  - Service integrasi ke Bapanas/BPS/BPOM masih placeholder.

## Bukti Teknis Utama di Repo

- `backend/services/hargaPanganService.js`: sudah ada validasi keras/lunak, deteksi anomali, verifikasi JF, dan audit log untuk data harga pangan.
- `backend/services/integrationService.js`: integrasi ke Bapanas, BPOM, dan BPS masih placeholder.
- `backend/controllers/kabidKetersediaanController.js`: panel EWS dan endpoint produksi/stok/neraca masih menunjukkan pola stub atau data kosong.
- `backend/controllers/kabidDistribusiController.js`: status CPPD dashboard masih hardcoded, belum berasal dari workflow CPPD yang utuh.
- `backend/controllers/BDS-CPD.js`: controller CPPD masih salah terhubung ke `komoditasService`, sehingga belum merepresentasikan modul CPPD yang semestinya.
- `frontend/src/pages/BDSCPDCreatePage.jsx`: form CPPD masih terlalu minimal untuk menjawab kebutuhan audit CPPD.
- `frontend/src/pages/BDSMONCreatePage.jsx`: form monitoring distribusi masih metadata dasar dan belum menangkap arus distribusi riil.
- `frontend/src/pages/BKTPGDCreatePage.jsx` dan `frontend/src/pages/BDSHRGCreatePage.jsx`: masih memakai master data hardcoded pada beberapa bagian penting.
- `frontend/src/pages/bidangKetersediaan/M035ListPage.jsx`, `frontend/src/pages/bidangDistribusi/M048ListPage.jsx`, dan `backend/routes/index.js`: menunjukkan risiko ketidaksinkronan endpoint frontend-backend pada sebagian layar modul.

## Prioritas Rekomendasi Implementasi

### Prioritas 1

- Rapikan domain data pangan agar tidak ganda.
- Perbaiki modul CPPD yang saat ini belum stabil.
- Aktifkan dashboard yang masih dummy dengan data riil dari tabel operasional.
- Selesaikan sinkronisasi route frontend-backend untuk list dan detail modul.

### Prioritas 2

- Bangun validasi neraca pangan lintas sektor.
- Bangun rule engine gejolak harga dan SPHP.
- Bangun peta arus distribusi pangan dan analisis surplus-defisit.

### Prioritas 3

- Bangun modul sarpras distribusi pangan.
- Bangun modul kelembagaan distribusi pangan masyarakat/Kios Pangan/LDPM.
- Bangun integrasi resmi ke sumber eksternal SiPangan/Bapanas.

## Kesimpulan Akhir

Secara umum, SIGAP-MALUT **belum sepenuhnya menjawab konsep temuan BPK**. Sistem ini sudah memiliki pondasi yang cukup baik pada area:

- input dan verifikasi harga pangan;
- audit trail;
- inflasi harian internal;
- rancangan modul ketersediaan, distribusi, dan CPPD.

Namun untuk isu yang menjadi inti temuan BPK, yaitu:

- integrasi sistem informasi pangan nasional-daerah;
- validitas neraca pangan lintas sektor;
- pengelolaan CPPD;
- SPHP berbasis gejolak harga;
- peta arus distribusi;
- sarpras distribusi;
- kelembagaan distribusi pangan masyarakat;

SIGAP-MALUT **masih berada pada tahap pondasi dan desain parsial**, belum pada kondisi operasional penuh yang bisa dipakai sebagai jawaban audit secara kuat.
