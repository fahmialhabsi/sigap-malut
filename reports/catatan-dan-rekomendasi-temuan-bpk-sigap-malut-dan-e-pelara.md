# Catatan dan Rekomendasi Penguatan SIGAP-MALUT dan e-Pelara atas Konsep Temuan BPK

## Dasar Penilaian

Penilaian ini disusun berdasarkan:

- konsep temuan BPK yang sebelumnya sudah dibaca dari dokumen tahun 2020 s.d. 2025;
- laporan awal `catatan-dan-rekomendasi-temuan-bpk-sigap-malut.md`;
- kondisi source code SIGAP-MALUT pada repo `e:\sigap-malut`;
- kondisi source code e-Pelara pada repo `e:\sigap-malut\e-pelara`.

Catatan penting:

- Penilaian ini berbasis source code, route, model, service, form, dan dashboard yang ada di repo saat ini.
- Penilaian ini belum membuktikan kondisi instance produksi dan isi database produksi yang sedang berjalan.
- Untuk integrasi operasional langsung ke sistem nasional yang disebut BPK, yaitu `FSVA interaktif`, `SKPG`, `SINBM`, `Simonstok`, `Sigapnas`, dan `SIPSAT`, saat ini diasumsikan belum dapat ditindaklanjuti penuh karena kendala efisiensi anggaran Pemerintah Daerah Provinsi Maluku Utara.
- Karena itu, rekomendasi pada dokumen ini diarahkan pada dua tahap:
  - tahap realistis sekarang: adopsi output utama sistem nasional ke dalam SIGAP-MALUT dan e-Pelara tanpa integrasi API penuh;
  - tahap lanjutan: integrasi operasional langsung jika anggaran dan kesiapan teknis memungkinkan.

## Simpulan Singkat

Secara gabungan, `SIGAP-MALUT` dan `e-Pelara` sudah mempunyai pondasi yang bisa diarahkan untuk menjawab temuan BPK, tetapi saat ini `belum sepenuhnya memadai`.

Pembacaan paling tepat terhadap dua aplikasi saat ini adalah:

- `SIGAP-MALUT` lebih cocok dijadikan sistem input, verifikasi, audit trail, dashboard teknis, dan data operasional pangan.
- `e-Pelara` lebih cocok dijadikan sistem indikator kinerja, monev, LPK, LK, LAKIP, dan laporan resmi dinas.
- Dengan kondisi anggaran sekarang, strategi terbaik bukan memaksakan integrasi langsung ke semua sistem nasional, melainkan membangun `output adoption layer`, yaitu keluaran utama tiap sistem nasional direplikasi secara fungsional ke modul internal yang bisa diinput oleh pelaksana sesuai tugas dan kewenangannya.

## Pembagian Peran Dua Aplikasi

| Sistem | Peran utama yang disarankan | Jenis data |
| --- | --- | --- |
| SIGAP-MALUT | Input rinci, verifikasi berjenjang, audit trail, dashboard teknis, pemetaan, monitoring lapangan | Data operasional harian, mingguan, bulanan |
| e-Pelara | Penetapan indikator, target, realisasi, evaluasi, rekomendasi, monev, LPK, LK, LAKIP, ekspor laporan resmi | Data kinerja resmi dan narasi manajerial |

Prinsip implementasi yang disarankan:

- Data detail cukup diinput satu kali di `SIGAP-MALUT`.
- Data yang naik ke `e-Pelara` harus berupa data yang sudah diverifikasi dan dikunci per periode.
- `e-Pelara` tidak perlu menjadi tempat input data mentah harga, stok, distribusi, atau inspeksi lapangan secara rinci.
- `e-Pelara` dipakai untuk menarik ringkasan resmi, indikator, realisasi, evaluasi, kendala, dan rekomendasi dari data yang berasal dari SIGAP-MALUT.

## Kondisi e-Pelara Saat Ini

### Kekuatan e-Pelara

- Sudah ada jembatan SSO dan translasi role SIGAP ke e-Pelara melalui:
  - `e-pelara/backend/middlewares/verifyToken.js`;
  - `e-pelara/backend/middlewares/allowRoles.js`;
  - `e-pelara/frontend/src/contexts/AuthProvider.jsx`.
- Sudah ada model indikator yang memuat unsur penting untuk laporan resmi, seperti:
  - `sumber_data`;
  - `penanggung_jawab`;
  - `target_tahun_1` s.d. `target_tahun_5`;
  - `jenis_iku`;
  - `tipe_indikator`.
- Sudah ada modul backend untuk:
  - `Monev`;
  - `LpkDispang`;
  - `LkDispang`;
  - `Lakip`;
  - `RealisasiIndikator`;
  - ekspor laporan CSV, PDF, dan Excel.

### Kelemahan e-Pelara Saat Ini

- Beberapa dashboard masih placeholder atau dummy:
  - `e-pelara/backend/controllers/dashboardController.js` masih menghasilkan `realisasi_terbaru` acak;
  - `e-pelara/frontend/src/features/lk-dispang/services/lkApi.js` masih memakai `Promise.resolve(...)`;
  - `e-pelara/frontend/src/features/lpk-dispang/pages/LpkDispangDashboard.jsx` masih berupa placeholder.
- Beberapa form/front-end belum operasional penuh:
  - `e-pelara/frontend/src/features/lpk-dispang/components/LpkDispangForm.jsx` belum berisi implementasi form;
  - `e-pelara/frontend/src/features/lakip/components/LakipForm.jsx` masih sangat sederhana.
- Ada ketidaksinkronan antara controller dan model:
  - `lpkDispangController.js` meminta field seperti `program`, `sub_kegiatan`, `indikator`, `target`, `realisasi`, `evaluasi`, tetapi `lpkDispangModel.js` tidak memuat sebagian besar field tersebut;
  - `monevController.js` meminta field seperti `program`, `sub_kegiatan`, `indikator`, `target`, dan `rekomendasi`, tetapi `monevModel.js` memakai struktur lain seperti `lokasi`, `capaian_kinerja`, `kendala`, dan `tindak_lanjut`;
  - `lkDispangController.js` menerima beberapa field yang tidak seluruhnya tersedia pada `lkDispangModel.js`.
- Route `e-pelara/backend/routes/realisasiIndikatorRoutes.js` pada method `POST` masih memanggil `db.realisasi_indikator.create(...)`, padahal `db` tidak terlihat didefinisikan di file itu. Ini berisiko membuat input realisasi gagal.

Kesimpulan khusus untuk e-Pelara:

- e-Pelara `sudah tepat` sebagai rumah laporan kinerja resmi.
- Namun e-Pelara `belum siap` menjadi sink laporan otomatis yang andal sebelum placeholder, mismatch model-controller, dan route yang bermasalah diperbaiki.

## Ringkasan Status Gabungan per Temuan BPK

| No | Temuan BPK | Status SIGAP-MALUT | Nilai tambah e-Pelara | Status gabungan saat ini |
| --- | --- | --- | --- | --- |
| 1.2.01 | Penerapan sistem informasi pangan belum memadai | Menjawab sebagian | Dapat menampung indikator dan laporan resmi | Menjawab sebagian |
| 1.2.02 | Neraca pangan belum didukung data valid | Belum menjawab | Dapat menampung indikator hasil akhir, tetapi tidak memvalidasi data mentah | Belum menjawab |
| 1.2.14 | CPPD belum memadai | Belum menjawab | Dapat menampung evaluasi dan laporan CPPD jika data operasional sudah valid | Belum menjawab |
| 1.2.15 | Regulasi dan pengawasan SPHP belum optimal | Menjawab sebagian | Dapat menjadi media monev dan laporan resmi SPHP | Menjawab sebagian |
| 1.2.18 | Pola distribusi belum dipetakan | Menjawab sebagian | Dapat menampung hasil kajian, monev, dan rekomendasi kebijakan | Menjawab sebagian |
| 1.2.19 | Sarpras distribusi belum dipetakan | Belum menjawab | Dapat menampung gap analysis dan target kinerja sarpras | Belum menjawab |
| 1.2.20 | Lembaga distribusi pangan masyarakat belum dipetakan/dioptimalkan | Belum menjawab | Dapat menampung indikator kinerja kelembagaan | Belum menjawab |

## Catatan dan Rekomendasi per Temuan

## 1.2.01 Penerapan Sistem Informasi Pangan Belum Memadai

**Catatan**

- SIGAP-MALUT sudah lebih maju pada domain `harga pangan`, verifikasi, anomaly detection, audit trail, dan inflasi harian internal.
- SIGAP-MALUT belum menunjukkan integrasi operasional penuh ke `FSVA`, `SKPG`, `SINBM`, `Simonstok`, `Sigapnas`, dan `SIPSAT`.
- e-Pelara dapat membantu agar output dari sistem-sistem tersebut tidak berhenti sebagai pelaporan ke pusat, tetapi ditarik menjadi indikator, realisasi, evaluasi, dan narasi laporan kinerja daerah.
- Kendala anggaran membuat integrasi API langsung ke sistem nasional belum realistis pada tahap sekarang.

**Rekomendasi**

1. Bentuk `lapisan adopsi output nasional` di SIGAP-MALUT, bukan integrasi API penuh. Setiap sistem nasional dibuatkan form, template impor, dan dashboard ringkas sesuai output utamanya.
2. Tambahkan menu khusus pada SIGAP-MALUT untuk `Output Nasional/SiPangan`, berisi:
   - FSVA;
   - SKPG;
   - SINBM;
   - Simonstok;
   - Sigapnas;
   - SIPSAT.
3. Setiap output yang sudah diverifikasi per periode dikirim ke e-Pelara sebagai:
   - `sumber_data = SIGAP-MALUT`;
   - `penanggung_jawab = bidang terkait`;
   - `realisasi indikator`;
   - `evaluasi`;
   - `rekomendasi`.
4. e-Pelara perlu menambahkan kelompok indikator khusus `Kinerja Pangan Daerah` yang eksplisit mengaitkan sumber data dengan modul SIGAP-MALUT.

## 1.2.02 Neraca Pangan Belum Sepenuhnya Didukung Data yang Valid

**Catatan**

- SIGAP-MALUT masih belum memadai untuk `carry over stok awal`, `stok akhir`, `pangan masuk`, `pangan keluar`, `dokumen sumber`, dan validasi lintas sektor.
- BPK menekankan bahwa kelemahan utama neraca pangan ada pada validitas dan kelengkapan data, bukan sekadar penyajian dashboard.
- e-Pelara belum menyelesaikan masalah ini, karena ia hanya bisa menampung hasil akhirnya sebagai indikator dan laporan.

**Rekomendasi**

1. Di SIGAP-MALUT, bangun modul neraca pangan operasional yang wajib memuat:
   - komoditas;
   - stok awal;
   - produksi;
   - pangan masuk;
   - pangan keluar;
   - stok akhir;
   - konsumsi;
   - kebutuhan non-konsumsi;
   - surplus/defisit;
   - dokumen sumber;
   - status validasi.
2. Terapkan validasi berantai:
   - pelaksana input;
   - JF verifikasi;
   - Kabid validasi;
   - finalisasi periode oleh Sekretariat/Tim data.
3. Hasil final neraca pangan per bulan atau triwulan menjadi sumber resmi ke e-Pelara untuk indikator:
   - rasio ketersediaan pangan daerah;
   - stok hari aman;
   - surplus/defisit komoditas strategis;
   - kebutuhan intervensi wilayah.
4. e-Pelara harus menampung narasi evaluasi atas perubahan data, penyebab revisi, dan tindak lanjut kebijakan, bukan data mentah neraca per transaksi.

## 1.2.14 Penyelenggaraan Cadangan Pangan Pemerintah Daerah Belum Memadai

**Catatan**

- SIGAP-MALUT sudah memiliki rancangan data CPPD, tetapi implementasi saat ini belum memadai.
- `backend/controllers/BDS-CPD.js` masih salah terhubung ke `komoditasService`, sehingga modul CPPD belum bisa dipercaya sebagai workflow operasional.
- Form `frontend/src/pages/BDSCPDCreatePage.jsx` masih baru mencatat metadata dasar dan belum menangkap kebutuhan pokok audit CPPD.
- e-Pelara hanya akan berguna setelah data operasional CPPD di SIGAP-MALUT benar-benar valid dan final.

**Rekomendasi**

1. Perbaiki modul CPPD di SIGAP-MALUT sampai benar-benar memuat:
   - kebutuhan minimal CPPD;
   - target stok;
   - pengadaan;
   - sumber dana;
   - kualitas stok;
   - lokasi gudang;
   - mutasi stok;
   - penyaluran;
   - penerima manfaat;
   - berita acara;
   - evaluasi.
2. Tambahkan dashboard gap `target minimal vs realisasi stok` dan `stok aman dalam hari`.
3. Tambahkan rule penyaluran CPPD berdasarkan:
   - darurat bencana;
   - rawan pangan;
   - stabilisasi pasokan dan harga.
4. Di e-Pelara, bangun indikator CPPD yang menarik hasil final dari SIGAP-MALUT, misalnya:
   - persentase pemenuhan target CPPD;
   - jumlah penyaluran CPPD;
   - waktu respon penyaluran;
   - jumlah wilayah penerima.

## 1.2.15 Regulasi dan Pengawasan atas Pelaksanaan SPHP

**Catatan**

- SIGAP-MALUT sudah kuat pada pemantauan harga, verifikasi, anomali, inflasi harian internal, dan ringkasan data publik.
- Namun rule engine untuk SPHP, eskalasi gejolak harga, dan monev SPHP yang formal belum terlihat utuh.
- e-Pelara dapat berfungsi baik untuk monev SPHP, keputusan TPID, tindak lanjut, dan pelaporan resmi jika data trigger-nya sudah jelas dari SIGAP.

**Rekomendasi**

1. Di SIGAP-MALUT, tambahkan modul `SPHP/GPM/Stabilisasi` yang memuat:
   - ambang gejolak harga;
   - usul intervensi;
   - keputusan intervensi;
   - volume dan lokasi intervensi;
   - komoditas intervensi;
   - hasil evaluasi.
2. Hubungkan modul harga, stok CPPD, distribusi, dan intervensi dalam satu workflow.
3. Data hasil intervensi bulanan dikirim ke e-Pelara sebagai bahan:
   - monev;
   - LPK;
   - LAKIP;
   - laporan kinerja pangan.
4. e-Pelara perlu menyediakan format evaluasi SPHP yang memuat `target`, `realisasi`, `kendala`, `rekomendasi`, dan `tindak lanjut lintas instansi`.

## 1.2.18 Pola Distribusi Barang Kebutuhan Pokok Belum Dipetakan

**Catatan**

- SIGAP-MALUT sudah memiliki pondasi modul distribusi, tetapi form dan dashboardnya masih terlalu sederhana untuk membaca arus distribusi pangan yang riil.
- Belum terlihat peta origin-destination, volume, lead time, hambatan, dan konektivitas distribusi antarpulau yang dibutuhkan oleh temuan BPK.
- e-Pelara dapat dipakai untuk menampung hasil kajian, rekomendasi, dan evaluasi kebijakan distribusi, tetapi bukan sebagai sistem pemetaan arus.

**Rekomendasi**

1. Di SIGAP-MALUT, ubah modul distribusi menjadi sistem arus distribusi yang memuat:
   - wilayah asal;
   - wilayah tujuan;
   - komoditas;
   - volume;
   - frekuensi pengiriman;
   - moda transportasi;
   - lead time;
   - biaya distribusi;
   - hambatan;
   - tindak lanjut fasilitasi.
2. Tambahkan peta distribusi antarpulau dan status kelancaran jalur.
3. Hubungkan distribusi dengan data:
   - harga;
   - neraca pangan;
   - kerawanan pangan;
   - stok CPPD.
4. Di e-Pelara, jadikan hasil final kajian distribusi sebagai:
   - indikator output kegiatan;
   - evaluasi kebijakan distribusi;
   - bahan naskah laporan kinerja pangan.

## 1.2.19 Sarana dan Prasarana Distribusi Pangan Belum Sepenuhnya Dipetakan

**Catatan**

- SIGAP-MALUT belum mempunyai modul operasional sarpras distribusi yang memadai.
- e-Pelara juga belum memiliki data sarpras sebagai dasar evaluasi kinerja distribusi.
- Temuan ini tidak cukup dijawab hanya dengan data gudang CPPD, karena BPK melihat sarpras distribusi secara lebih luas.

**Rekomendasi**

1. Di SIGAP-MALUT, bangun master sarpras distribusi pangan yang memuat:
   - gudang;
   - cold storage jika ada;
   - pelabuhan/titik bongkar;
   - armada angkut;
   - trayek distribusi;
   - fasilitas pasar penyangga;
   - kondisi sarpras;
   - kapasitas;
   - status operasional.
2. Tambahkan peta lokasi sarpras dan status kelayakannya.
3. Di e-Pelara, bangun indikator dan evaluasi untuk:
   - kecukupan sarpras;
   - kebutuhan rehabilitasi/pengadaan;
   - coverage wilayah distribusi;
   - gap layanan distribusi.
4. Jadikan sarpras sebagai komponen tetap dalam LPK, monev, dan laporan kinerja bidang distribusi.

## 1.2.20 Lembaga Distribusi Pangan Masyarakat Belum Dipetakan dan Diupayakan Optimal

**Catatan**

- SIGAP-MALUT belum menunjukkan modul operasional yang utuh untuk:
  - LDPM;
  - Kios Pangan;
  - TTI/TTIC;
  - kelembagaan distribusi berbasis masyarakat.
- e-Pelara belum bisa melaporkan kinerja kelembagaan distribusi secara memadai karena sumber datanya belum tersedia.

**Rekomendasi**

1. Di SIGAP-MALUT, bangun modul `Kelembagaan Distribusi Pangan` yang memuat:
   - nama lembaga;
   - tipe lembaga;
   - alamat dan wilayah layanan;
   - pengelola;
   - pemasok;
   - komoditas yang dikelola;
   - volume masuk/keluar;
   - harga layanan;
   - dukungan sarpras;
   - status aktif/tidak aktif;
   - kendala dan kebutuhan pembinaan.
2. Tambahkan fitur penilaian kinerja lembaga:
   - aktif atau tidak aktif;
   - frekuensi operasi;
   - volume distribusi;
   - jangkauan layanan;
   - kestabilan harga.
3. Di e-Pelara, lembaga tersebut harus muncul dalam indikator dan evaluasi kinerja bidang distribusi, misalnya:
   - jumlah lembaga aktif;
   - jumlah wilayah terlayani;
   - kontribusi lembaga terhadap stabilisasi pasokan/harga.

## Output Utama Sistem Nasional yang Perlu Diadopsi Internal

Bagian ini tidak dimaksudkan sebagai daftar spesifikasi resmi sistem nasional secara lengkap, melainkan `output utama yang relevan untuk diadopsi secara substantif` ke dalam SIGAP-MALUT dan e-Pelara agar temuan BPK bisa dijawab secara operasional di daerah.

| Sistem nasional | Output utama yang perlu diadopsi | Implementasi di SIGAP-MALUT | Implementasi di e-Pelara | Penginput utama |
| --- | --- | --- | --- | --- |
| FSVA interaktif | status ketahanan/kerentanan pangan per wilayah, skor indikator, peta prioritas, daftar wilayah rentan | modul peta kerawanan, upload atau input indikator FSVA, penyimpanan layer peta dan periode | indikator `persentase kecamatan rawan pangan`, narasi evaluasi FSVA, lampiran laporan kinerja | Bidang Ketersediaan dan Kerawanan Pangan |
| SKPG | indikator bulanan aspek ketersediaan, keterjangkauan, pemanfaatan, status aman-waspada-rawan, rekomendasi peringatan dini | modul SKPG bulanan, pembanding otomatis dengan harga SIGAP, validasi lintas petugas | realisasi indikator kewaspadaan pangan, evaluasi bulanan/triwulan, bahan LPK dan LAKIP | Bidang Ketersediaan dan Kerawanan Pangan |
| SINBM | ketersediaan energi/protein/lemak per kapita, kontribusi kelompok pangan, kecukupan terhadap standar | modul NBM/SINBM tahunan atau semester, form sumber data dan revisi | indikator energi/protein per kapita, tabel resmi Renstra/Renja/Monev, narasi kecukupan pangan | Bidang Ketersediaan bersama Sekretariat/Perencanaan |
| Simonstok | stok awal, stok akhir, mutasi stok, lokasi gudang, stok hari aman, arus masuk/keluar komoditas strategis | modul stok strategis per komoditas dan gudang, termasuk Bulog dan gudang daerah | indikator kecukupan stok, evaluasi pemenuhan CPPD, bahan LPK/LAKIP | Bidang Distribusi dan Cadangan Pangan |
| Sigapnas | kejadian kerawanan atau gangguan pangan, lokasi, kronologi, jumlah terdampak, intervensi, status penanganan | modul kejadian dan tindak lanjut, upload bukti, status penanganan per kasus | evaluasi respon daerah, realisasi intervensi, rekomendasi kebijakan | Bidang Ketersediaan/Kerawanan Pangan |
| SIPSAT | registrasi pengawasan pangan segar, hasil inspeksi, hasil uji, temuan, tindak lanjut, lokasi pengawasan | modul inspeksi keamanan pangan oleh UPTD/BPMKP, checklist, hasil uji dan tindak lanjut | indikator `cakupan pengawasan keamanan pangan`, laporan pengawasan resmi | UPTD/BPMKP |

## Output Internal Tambahan yang Tetap Wajib

Walaupun pengguna meminta fokus pada sistem nasional yang disebut BPK, ada beberapa output internal yang tetap harus diperkuat karena justru menjadi inti jawaban temuan BPK di daerah.

| Output internal | Implementasi di SIGAP-MALUT | Implementasi di e-Pelara |
| --- | --- | --- |
| Panel harga daerah | input harian, verifikasi JF, audit log, anomaly detection, inflasi internal | indikator harga pangan strategis, evaluasi fluktuasi, monev stabilisasi |
| Neraca pangan daerah | produksi, stok, pangan masuk, pangan keluar, surplus-defisit, status validasi | rasio ketersediaan, stok hari aman, narasi kebijakan |
| CPPD | target minimal, pengadaan, mutu, stok, penyaluran, berita acara | indikator pemenuhan CPPD, evaluasi penyaluran |
| SPHP/GPM | trigger, keputusan, pelaksanaan, hasil intervensi | monev SPHP, tindak lanjut TPID, laporan kinerja |
| Peta distribusi | arus distribusi, hambatan, lead time, bottleneck | evaluasi kebijakan distribusi |
| Sarpras distribusi | registry aset distribusi dan kondisinya | gap analysis, prioritas pengadaan/rehabilitasi |
| Kelembagaan distribusi | registry LDPM/Kios/TTI/TTIC dan kinerjanya | indikator jumlah lembaga aktif dan wilayah layanan |

## Rancangan Tata Kelola Input Berdasarkan Tugas dan Kewenangan

| Unit kerja | Input utama di SIGAP-MALUT | Input utama di e-Pelara | Output resmi yang dihasilkan |
| --- | --- | --- | --- |
| Bidang Ketersediaan dan Kerawanan Pangan | produksi, pasokan, neraca, SKPG, FSVA, Sigapnas, wilayah rentan | realisasi indikator ketersediaan/kerawanan, evaluasi, rekomendasi | monev, LPK, LAKIP, laporan kinerja pangan |
| Bidang Distribusi dan Cadangan Pangan | harga pangan, stok strategis, CPPD, SPHP/GPM, distribusi, sarpras, kelembagaan distribusi | realisasi indikator distribusi/cadangan, kendala, tindak lanjut | monev, LPK, LAKIP, laporan kinerja pangan |
| UPTD/BPMKP | inspeksi PSAT, hasil uji, pengawasan keamanan pangan | indikator cakupan pengawasan, evaluasi temuan dan tindak lanjut | laporan pengawasan dan bagian keamanan pangan pada laporan kinerja |
| Sekretariat/Perencanaan | validasi periode, penguncian data final, konsolidasi lintas bidang | finalisasi indikator, LPK, LK, LAKIP, ekspor laporan resmi | dokumen resmi kinerja pangan dinas |

Prinsip kerja yang disarankan:

1. Pelaksana bidang menginput data rinci di SIGAP-MALUT.
2. JF melakukan verifikasi teknis dan koreksi.
3. Kabid melakukan validasi dan finalisasi periodik.
4. Data periode yang sudah final dikunci di SIGAP-MALUT.
5. Ringkasan final, indikator, evaluasi, dan rekomendasi dikirim ke e-Pelara.
6. Sekretariat menyusun laporan resmi dengan sumber data yang jelas dari SIGAP-MALUT.

## Rekomendasi Teknis Khusus untuk e-Pelara

Sebelum e-Pelara dipakai sebagai rumah laporan resmi yang bersumber dari SIGAP-MALUT, ada beberapa perbaikan teknis yang perlu diprioritaskan:

1. Perbaiki mismatch antara controller, schema validasi, dan model pada modul:
   - `Monev`;
   - `LpkDispang`;
   - `LkDispang`;
   - `Lakip`.
2. Perbaiki route `POST /api/realisasi-indikator` agar benar-benar menggunakan model Sequelize yang aktif, bukan `db` yang belum jelas didefinisikan.
3. Ganti dashboard dummy atau random menjadi dashboard yang menarik data realisasi sebenarnya.
4. Lengkapi form LPK, LK, dan LAKIP agar mampu menerima:
   - sumber data SIGAP;
   - target;
   - realisasi;
   - kendala;
   - evaluasi;
   - rekomendasi;
   - lampiran pendukung.
5. Tambahkan status data:
   - draft;
   - terverifikasi;
   - final;
   - terkunci.

## Prioritas Implementasi yang Realistis dengan Kondisi Anggaran Saat Ini

### Prioritas 1: Tanpa Integrasi Nasional Langsung

- Rapikan modul e-Pelara yang masih placeholder dan mismatch.
- Tambahkan `lapisan adopsi output nasional` di SIGAP-MALUT.
- Bangun master data resmi yang konsisten untuk komoditas, wilayah, pasar, gudang, sarpras, dan kelembagaan.
- Tetapkan workflow `input - verifikasi - validasi - final - kirim ke e-Pelara`.

### Prioritas 2: Penguatan Modul Inti Temuan BPK

- Lengkapi neraca pangan.
- Perbaiki CPPD.
- Bangun modul SPHP/GPM.
- Bangun peta distribusi.
- Bangun registry sarpras dan kelembagaan distribusi.

### Prioritas 3: Jika Anggaran Sudah Memungkinkan

- Integrasi API atau ETL resmi dengan sistem nasional.
- Sinkronisasi data otomatis dua arah jika diizinkan tata kelola nasional.
- Peta interaktif penuh untuk FSVA, distribusi, dan sarpras.

## Bukti Teknis Utama di Repo

### SIGAP-MALUT

- `backend/services/hargaPanganService.js`, `backend/services/hargaPanganRepository.js`, dan `backend/jobs/inflasiHarianCron.js` menunjukkan bahwa domain harga pangan sudah relatif paling matang.
- `backend/services/integrationService.js` menunjukkan integrasi eksternal masih dominan placeholder.
- `backend/controllers/kabidKetersediaanController.js` masih memuat panel EWS dan ringkasan yang bercampur data stub atau demo.
- `backend/controllers/kabidDistribusiController.js` sudah kuat pada inflasi dan alert harga, tetapi status CPPD masih hardcoded.
- `backend/controllers/BDS-CPD.js` menunjukkan modul CPPD belum stabil karena masih mengarah ke `komoditasService`.
- `frontend/src/pages/BKTPGDCreatePage.jsx`, `frontend/src/pages/BDSMONCreatePage.jsx`, `frontend/src/pages/BDSCPDCreatePage.jsx`, dan `frontend/src/pages/BDSHRGCreatePage.jsx` menunjukkan sebagian form masih sederhana atau memakai master data hardcoded.

### e-Pelara

- `e-pelara/backend/middlewares/verifyToken.js`, `e-pelara/backend/middlewares/allowRoles.js`, dan `e-pelara/frontend/src/contexts/AuthProvider.jsx` menunjukkan pondasi SSO SIGAP ke e-Pelara sudah ada.
- `e-pelara/backend/models/indikatorModel.js` menunjukkan e-Pelara memang diarahkan untuk indikator, sumber data, dan penanggung jawab.
- `e-pelara/backend/controllers/monevController.js`, `e-pelara/backend/controllers/lpkDispangController.js`, `e-pelara/backend/controllers/lkDispangController.js`, dan `e-pelara/backend/controllers/lakipController.js` menunjukkan kerangka laporan resmi sudah tersedia.
- `e-pelara/backend/controllers/dashboardController.js`, `e-pelara/frontend/src/features/lk-dispang/services/lkApi.js`, dan `e-pelara/frontend/src/features/lpk-dispang/components/LpkDispangForm.jsx` menunjukkan masih ada placeholder dan dummy yang harus dirapikan.
- `e-pelara/backend/routes/realisasiIndikatorRoutes.js` menunjukkan masih ada route input realisasi yang berisiko gagal karena implementasinya belum rapi sepenuhnya.

## Kesimpulan Akhir

Jika dilihat `saat ini`, kombinasi SIGAP-MALUT dan e-Pelara masih `belum sepenuhnya menjawab` temuan BPK, karena:

- SIGAP-MALUT belum lengkap pada neraca pangan, CPPD, sarpras, dan kelembagaan distribusi;
- e-Pelara masih kuat di level kerangka dokumen kinerja, tetapi belum stabil sepenuhnya sebagai mesin laporan otomatis berbasis data SIGAP-MALUT;
- integrasi operasional langsung ke sistem nasional belum realistis untuk segera dilakukan karena kendala anggaran.

Namun jika rekomendasi pada dokumen ini dijalankan, maka arah yang paling masuk akal adalah:

- `SIGAP-MALUT` menjadi sumber data operasional pangan daerah yang resmi, terverifikasi, dan audit-friendly;
- `e-Pelara` menjadi rumah indikator, evaluasi, dan laporan resmi kinerja pangan;
- output utama dari `FSVA`, `SKPG`, `SINBM`, `Simonstok`, `Sigapnas`, dan `SIPSAT` tetap dapat dimanfaatkan secara nyata dalam laporan kinerja pangan daerah, walaupun sementara belum melalui integrasi nasional langsung.
