# 16 - Audit Gap Resmi SIGAP-MALUT

Versi: 2026-03-20
Status: Resmi untuk baseline revisi dokumen
Scope: Seluruh folder dokumenSistem

## 1. Tujuan

Dokumen ini merangkum kekurangan pedoman yang masih ada pada dokumenSistem dan menetapkan prioritas revisi agar SIGAP-MALUT siap dibangun, diuji, dioperasikan, dan diaudit sebagai sistem aplikasi pemerintahan daerah.

Dokumen ini juga menyelaraskan kebutuhan integrasi e-Pelara, terutama untuk penguatan domain perencanaan yang diidentifikasi lemah pada dokumen kondisi dinas.

## 2. Dasar Temuan

Temuan utama diambil dari:

- 01-kondisi-dinas-pangan.md
- 12-IT-Governance-SPBE-SPIP-Alignment.md
- 13-System-Architecture-Document.md
- openapi.yaml
- 14-Role-Service-Requirements-Matrix.md
- 15-e-pelara-integration-guide-for-sigap-malut.md

## 3. Ringkasan Gap Kritis

| Kode   | Domain              | Kondisi Saat Ini                                                     | Dampak                                              | Prioritas |
| ------ | ------------------- | -------------------------------------------------------------------- | --------------------------------------------------- | --------- |
| GAP-01 | Keamanan informasi  | Masih high-level, belum jadi kontrol operasional rinci               | Risiko akses tidak sah, kebocoran data, gagal audit | P0        |
| GAP-02 | Deployment produksi | Belum ada panduan deployment end-to-end lintas env                   | Risiko downtime dan rollback gagal                  | P0        |
| GAP-03 | Operasional dan DR  | Belum ada runbook, RTO/RPO, prosedur incident                        | Risiko gangguan layanan berkepanjangan              | P0        |
| GAP-04 | Strategi testing    | Belum ada coverage target dan test gate resmi                        | Risiko regresi dan kualitas rendah                  | P0        |
| GAP-05 | Compliance matrix   | Belum ada matriks evidence lintas domain yang siap audit             | Risiko klaim kepatuhan tanpa bukti                  | P0        |
| GAP-06 | Kontrak API         | openapi.yaml belum merepresentasikan endpoint strategis lintas modul | Risiko integrasi gagal dan mismatch implementasi    | P1        |
| GAP-07 | Modul perencanaan   | Domain perencanaan masih belum terstruktur setara domain lain        | Masalah inti perencanaan belum tertutup             | P0        |

## 4. Kesesuaian Terhadap Masalah Inti Dinas

Mengacu masalah inti pada 01-kondisi-dinas-pangan.md:

- Peran sekretariat: sebagian besar sudah dipetakan, tetapi butuh enforcement teknis dan audit kontrol.
- Perencanaan: belum cukup detail pada aturan data-driven planning, linkage RPJMD/RPJPD, dan sinkronisasi lintas OPD.
- Penatausahaan keuangan: workflow ada, namun kontrol bukti pertanggungjawaban per pelaksana belum cukup rinci.
- Kepegawaian: relatif paling matang.
- Aset: struktur ada, namun kontrol operasional dan siklus audit fisik belum kuat.
- Koordinasi antar bidang: konsep single source of truth kuat, implementasi dan API contract belum lengkap.

## 5. Prioritas Revisi Resmi

### P0 (Wajib sebelum target produksi)

1. Finalisasi dokumen keamanan informasi operasional.
2. Finalisasi panduan deployment produksi.
3. Finalisasi operations runbook dan disaster recovery.
4. Finalisasi strategi testing dan quality gate.
5. Finalisasi compliance matrix berbasis bukti.
6. Perkuat dokumen modul perencanaan dan integrasi e-Pelara untuk masalah perencanaan.

### P1 (Wajib sebelum rollout lintas role)

1. Lengkapi OpenAPI untuk endpoint lintas modul prioritas.
2. Tambah kebijakan observability, alerting, dan SLI/SLO.
3. Tambah SOP integrasi eksternal antar instansi.

### P2 (Peningkatan berkelanjutan)

1. Optimasi performa dan kapasitas.
2. Hardening keamanan lanjutan.
3. Maturity uplift berkala berbasis audit triwulanan.

## 6. Rencana Revisi Dokumen

| Dokumen                           | Aksi                                     | Owner Rekomendasi          | Target   |
| --------------------------------- | ---------------------------------------- | -------------------------- | -------- |
| 17-Keamanan-Informasi-Lengkap.md  | Tambah dan jadikan acuan utama keamanan  | Security + BE Lead         | Minggu 1 |
| 18-Deployment-Production-Guide.md | Tambah dan jadikan standar rilis         | DevOps + BE Lead           | Minggu 1 |
| 19-Operations-Runbook.md          | Tambah dan jadikan SOP operasional       | Ops/SRE + QA               | Minggu 2 |
| 20-Testing-Strategy.md            | Tambah dan jadikan quality gate          | QA Lead + Squad Lead       | Minggu 2 |
| 21-Compliance-Matrix-SPBE-SPIP.md | Tambah dan jadikan matriks audit bukti   | PMO/QA/Inspektorat liaison | Minggu 2 |
| openapi.yaml                      | Lengkapi endpoint prioritas lintas modul | BE/API Team                | Minggu 2 |

## 7. Gate Keberhasilan Revisi Dokumen

Dokumen dianggap siap jika seluruh syarat berikut terpenuhi:

- Semua dokumen P0 tersedia dan terisi lengkap.
- Tidak ada status "Belum Ada" pada domain governance kritis.
- Matriks compliance memiliki evidence per kontrol.
- Testing strategy memiliki target coverage dan test gate yang terukur.
- Deployment dan runbook memiliki prosedur rollback dan recovery yang dapat diuji.

## 8. Catatan Integrasi e-Pelara

Integrasi e-Pelara diposisikan sebagai akselerator untuk menutup gap perencanaan yang lemah. Integrasi harus mengikuti prinsip:

- Loose coupling sebagai fase awal.
- API contract yang terdokumentasi.
- Tidak ada akses tulis langsung dari SIGAP ke DB e-Pelara.
- Sinkronisasi role dan workflow approval dengan kontrol audit.

## 9. Pernyataan Resmi

Dokumen ini menjadi baseline resmi untuk prioritas revisi dokumenSistem. Seluruh eksekusi pengembangan dan validasi generator harus merujuk pada baseline ini.
