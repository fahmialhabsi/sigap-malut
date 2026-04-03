# Master Data — SPIP / Manajemen Risiko

Folder ini berisi hasil ekstraksi (OCR) dari formulir Excel SPIP/Manajemen Risiko yang dikirim via screenshot.

## Klasifikasi modul (Sekretariat vs Bidang vs UPTD)

Artefak yang ada di folder ini bersifat **governance** dan lintas-unit (kriteria, matriks, risk register, RTP, pemantauan), sehingga secara praktik organisasi **paling cocok dikelola oleh Sekretariat** (koordinasi & konsolidasi).

Jika nanti ada sheet yang spesifik bidang (Ketersediaan/Distribusi/Konsumsi) atau spesifik UPTD, data tersebut bisa dipisah menjadi folder baru, misalnya:

- `master-data/BIDANG_KETERSEDIAAN/SPIP/`
- `master-data/BIDANG_DISTRIBUSI/SPIP/`
- `master-data/BIDANG_KONSUMSI/SPIP/`
- `master-data/UPTD/SPIP/`

## File yang tersedia

- `01_KRITERIA_KEMUNGKINAN.csv`
- `02_KRITERIA_DAMPAK.csv`
- `03_MATRIKS_ANALISIS_RISIKO_5x5.csv` (format long: frekuensi×dampak → skor)
- `10_IDENTIFIKASI_RISIKO.csv`
- `11_ANALISIS_RISIKO.csv`
- `12_DAFTAR_RISIKO_PRIORITAS.csv`
- `13_ANALISIS_AKAR_MASALAH_5WHY.csv`
- `14_RENCANA_TINDAK_PENGENDALIAN_RTP.csv`
- `15_PEMANTAUAN_KEGIATAN_PENGENDALIAN.csv`
- `16_PEMANTAUAN_PERISTIWA_RISIKO.csv`
- `17_PEMANTAUAN_LEVEL_RISIKO.csv`
- `18_REVIU_USULAN_RISIKO_BARU.csv`
- `19_RENCANA_PENGENDALIAN_BELUM_TEREALISASI.csv`
- `20_PEMANTAUAN_EFEKTIVITAS_PENGENDALIAN.csv`

## Catatan kualitas data

Karena sumbernya screenshot, akurasi OCR untuk beberapa sel bisa tidak sempurna. File CSV di atas dibuat agar:

1) struktur kolom konsisten dan siap di-import,  
2) contoh baris awal (R1) sudah terbentuk,  
3) sisanya bisa diisi/dibenahi setelah file Excel asli bisa diunggah ke aplikasi.

