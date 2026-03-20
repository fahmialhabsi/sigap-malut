# 21 - Compliance Matrix SPBE-SPIP SIGAP-MALUT

Versi: 2026-03-21
Status: Baseline resmi kepatuhan dan evidence tracking
Scope: SIGAP-MALUT + integrasi e-Pelara

## 1. Tujuan

Dokumen ini menjadi matriks kepatuhan resmi untuk memetakan kontrol SPBE dan SPIP ke bukti implementasi SIGAP-MALUT.

Tujuan utama:

1. memastikan klaim kepatuhan berbasis bukti,
2. menyatukan referensi audit lintas dokumen,
3. memperjelas gap prioritas yang wajib ditutup,
4. mengaitkan kepatuhan dengan masalah inti pada 01-kondisi-dinas-pangan.

## 2. Ruang Lingkup

Matriks ini berlaku untuk:

- tata kelola dan arsitektur digital,
- layanan aplikasi dan interoperabilitas data,
- keamanan informasi dan kontrol akses,
- workflow dan audit trail,
- operasi layanan, backup, dan pemulihan,
- domain prioritas perencanaan serta integrasi e-Pelara.

## 3. Skema Status

- COMPLETE: kontrol terdokumentasi rinci dan evidence tersedia.
- PARTIAL: kontrol sudah ada sebagian, tetapi evidence atau detail operasional belum lengkap.
- GAP: kontrol belum tersedia atau belum dapat diverifikasi.

## 4. Matriks Kepatuhan Inti

| Kode   | Domain                  | Kontrol Utama                                                   | Evidence Wajib                                                       | Referensi Dokumen                                                                                                    | Status Baseline | Prioritas |
| ------ | ----------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| CMP-01 | SPBE Arsitektur         | Arsitektur layanan dan data lintas modul terdokumentasi         | diagram arsitektur, data flow, service map                           | 13-System-Architecture-Document.md, 04-Dokumen Integrasi Sistem & Mapping Modul SIGAP-MALUT.md                       | PARTIAL         | P0        |
| CMP-02 | SPBE Layanan            | Katalog layanan digital dan SLA tersedia                        | katalog layanan, SLA per layanan                                     | 06-Master-Data-Layanan.md                                                                                            | PARTIAL         | P0        |
| CMP-03 | SPBE Manajemen Data     | Single source of truth, referential integrity, data governance  | data dictionary, aturan referensi, validasi integritas               | 07-Data-Dictionary.md, 04-Dokumen Integrasi Sistem & Mapping Modul SIGAP-MALUT.md                                    | PARTIAL         | P0        |
| CMP-04 | SPBE Interoperabilitas  | Kontrak API terversi untuk integrasi internal/eksternal         | OpenAPI lengkap, endpoint versioning, error contract                 | openapi.yaml, 15-e-pelara-integration-guide-for-sigap-malut.md                                                       | GAP             | P0        |
| CMP-05 | SPBE Keamanan Informasi | Kontrol authn/authz, session, secret, encryption, audit log     | security baseline, config, bukti uji keamanan                        | 17-Keamanan-Informasi-Lengkap.md                                                                                     | PARTIAL         | P0        |
| CMP-06 | SPIP Risiko             | Risk register, treatment plan, dan owner risiko                 | risk register, mitigasi, review berkala                              | 16-Audit-Gap-Resmi-SIGAP-MALUT.md, 19-Operations-Runbook.md                                                          | PARTIAL         | P0        |
| CMP-07 | SPIP Kontrol Internal   | Segregation of duties dan kontrol workflow approval             | workflow matrix, role separation, evidence gate                      | 08-Workflow-Specification.md, 09-Role-Module-Matrix.md, 14-Role-Service-Requirements-Matrix.md                       | PARTIAL         | P0        |
| CMP-08 | SPIP Audit Trail        | Jejak audit before-after-user-action dapat ditelusuri           | sample audit log, retention policy, query evidence                   | 08-Workflow-Specification.md, 17-Keamanan-Informasi-Lengkap.md                                                       | PARTIAL         | P0        |
| CMP-09 | Operasional Layanan     | Monitoring, alerting, incident response, runbook                | dashboard operasional, alert policy, incident report                 | 19-Operations-Runbook.md                                                                                             | PARTIAL         | P0        |
| CMP-10 | Continuity & DR         | Backup, restore test, RTO/RPO tervalidasi                       | backup report, restore drill, DR checklist                           | 19-Operations-Runbook.md, 18-Deployment-Production-Guide.md                                                          | PARTIAL         | P0        |
| CMP-11 | Quality Assurance       | Testing strategy, quality gate, release criteria                | coverage report, test result, gate approval                          | 20-Testing-Strategy.md                                                                                               | PARTIAL         | P0        |
| CMP-12 | Domain Perencanaan      | Perencanaan data-driven terhubung dokumen daerah dan lintas OPD | requirement perencanaan, workflow perencanaan, evidence sinkronisasi | 01-kondisi-dinas-pangan.md, 14-Role-Service-Requirements-Matrix.md, 15-e-pelara-integration-guide-for-sigap-malut.md | PARTIAL         | P0        |

## 5. Matrix Keterkaitan dengan Masalah Inti Dinas

| Masalah Inti (01-kondisi-dinas-pangan) | Kontrol Kepatuhan Terkait | Status  | Catatan                                                             |
| -------------------------------------- | ------------------------- | ------- | ------------------------------------------------------------------- |
| Peran sekretariat lemah                | CMP-07, CMP-08            | PARTIAL | perlu enforcement teknis dan bukti kontrol bypass                   |
| Perencanaan lemah                      | CMP-12, CMP-04            | PARTIAL | integrasi perencanaan lintas data dan API contract perlu dipertegas |
| Penatausahaan keuangan amburadul       | CMP-07, CMP-08, CMP-11    | PARTIAL | kontrol akuntabilitas bukti per pelaksana perlu diperinci           |
| Manajemen kepegawaian kacau            | CMP-02, CMP-03, CMP-11    | PARTIAL | fondasi cukup, perlu gate kualitas dan bukti konsistensi            |
| Aset/BMD tidak terkelola               | CMP-03, CMP-09, CMP-10    | PARTIAL | kontrol operasional dan recovery data aset harus diuji              |
| Koordinasi data antar bidang terputus  | CMP-03, CMP-04, CMP-12    | PARTIAL | perlu interoperabilitas endpoint dan sinkronisasi lintas layanan    |

## 6. Gate Kepatuhan per Fase

### Gate G1 (Phase 1)

- kontrol P0 keamanan minimum aktif,
- audit trail tersedia untuk workflow kritis,
- role enforcement lintas sekretariat, UPTD, super admin tervalidasi.

### Gate G2 (Phase 2)

- kontrak API internal kritis lengkap,
- integritas data lintas bidang tervalidasi,
- monitoring dan incident response berjalan.

### Gate G3 (Phase 3)

- kontrol privasi dan publikasi data siap audit,
- integrasi perencanaan dan domain publik stabil,
- bukti kepatuhan lintas domain dapat ditarik on-demand.

## 7. Aturan Evidence Audit

Setiap kontrol minimal memiliki:

1. dokumen kontrol,
2. bukti implementasi teknis,
3. bukti pengujian,
4. bukti operasional,
5. pemilik kontrol,
6. tanggal verifikasi terakhir.

Tanpa evidence lengkap, status kontrol tidak boleh dinyatakan COMPLETE.

## 8. Mekanisme Pemutakhiran

- Review matriks setiap bulan untuk fase aktif.
- Review matriks setiap triwulan untuk audit kesiapan regulasi.
- Perubahan status wajib disertai referensi bukti dan persetujuan owner domain.

## 9. Pernyataan Resmi

Dokumen ini menjadi rujukan matriks kepatuhan resmi SIGAP-MALUT untuk pelaksanaan validasi dokumen, quality gate, dan persiapan audit formal lintas domain SPBE/SPIP.
