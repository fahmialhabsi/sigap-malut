# FORM BLUEPRINT MR e-SIGAP
# ENTERPRISE OPERATIONAL RISK GOVERNANCE
## Sistem Manajemen Risiko Operasional e-SIGAP
UPDATE ENTERPRISE CROSS-SYSTEM CONTRACT e-SIGAP ↔ e-Pelara

---

# 1. PENDAHULUAN

## 1.1 Latar Belakang

e-SIGAP merupakan sistem operasional organisasi yang digunakan untuk:

- workflow tugas;
- koordinasi;
- monitoring operasional;
- monitoring ASN;
- monitoring distribusi;
- monitoring inflasi;
- monitoring disposisi;
- monitoring keterlambatan;
- serta pengendalian aktivitas organisasi secara realtime.

Seiring meningkatnya kompleksitas organisasi, diperlukan sistem Manajemen Risiko (MR) yang mampu memonitor:

- keterlambatan;
- approval bypass;
- broken workflow;
- broken coordination;
- duplicate data;
- overload tugas;
- dan risiko operasional lainnya.

MR pada e-SIGAP bukan sekadar sistem pelaporan risiko, tetapi menjadi:

```text
ENTERPRISE OPERATIONAL RISK GOVERNANCE SYSTEM
```

yang memonitor seluruh aktivitas operasional organisasi secara realtime.

---

## 1.2 Tujuan Blueprint

Blueprint ini disusun sebagai:

- source of truth governance MR e-SIGAP;
- pedoman pengendalian operasional organisasi;
- pedoman monitoring workflow;
- pedoman monitoring koordinasi;
- pedoman monitoring keterlambatan;
- pedoman monitoring task;
- pedoman monitoring ASN;
- pedoman monitoring distribusi;
- pedoman monitoring inflasi;
- pedoman penguatan audit operasional.
Menegaskan bahwa e-SIGAP tetap operational/SPIP governance, tetapi wajib punya linkage ke MR e-Pelara.
Mengunci batas domain e-SIGAP agar tetap menjadi operational/SPIP governance system dan tidak menduplikasi planning governance e-Pelara.

---

## 1.3 Ruang Lingkup

Blueprint ini mencakup:

- governance operasional;
- workflow organisasi;
- pola koordinasi;
- monitoring tugas;
- monitoring keterlambatan;
- monitoring ASN;
- monitoring distribusi;
- monitoring inflasi;
- risk governance operasional;
- event monitoring;
- operational control system.

Blueprint ini tidak membahas:

- API;
- database;
- backend;
- frontend;
- controller;
- Redis;
- migration;
- implementasi teknis aplikasi.

Seluruh implementasi teknis dipindahkan ke:

```text
FORM ROADMAP MR e-SIGAP.md
```

---

# 2. KONDISI RIIL ORGANISASI

## 2.1 Permasalahan Workflow

Permasalahan yang ditemukan:

- approval bypass;
- workflow tidak konsisten;
- task overdue;
- escalation tidak terdokumentasi;
- monitoring disposisi belum realtime;
- monitoring approval belum menyeluruh.

---

## 2.2 Permasalahan Koordinasi

Permasalahan yang ditemukan:

- koordinasi lintas bidang tidak sinkron;
- keterlambatan komunikasi;
- distribusi tugas tidak termonitor;
- monitoring tindak lanjut belum optimal.

---

## 2.3 Permasalahan Monitoring

Permasalahan yang ditemukan:

- dashboard belum sepenuhnya realtime;
- monitoring manual masih dominan;
- warning keterlambatan belum otomatis;
- monitoring distribusi belum terintegrasi penuh.

---

## 2.4 Permasalahan Audit

Permasalahan yang ditemukan:

- histori aktivitas sulit ditelusuri;
- monitoring approval belum lengkap;
- perubahan data belum seluruhnya termonitor;
- audit operasional belum realtime.

---

# 3. VISI TRANSFORMASI MR e-SIGAP

MR e-SIGAP dibangun sebagai:

```text
ENTERPRISE OPERATIONAL CONTROL SYSTEM
```

yang:

- memonitor workflow;
- memonitor koordinasi;
- memonitor keterlambatan;
- memonitor approval;
- memonitor aktivitas operasional;
- memonitor distribusi;
- memonitor ASN;
- memonitor inflasi;
- memonitor escalation;
- dan mendukung pengambilan keputusan pimpinan secara realtime.

---

# 4. POSISI MR DALAM EKOSISTEM PEMERINTAH DAERAH

## 4.1 Posisi e-SIGAP

e-SIGAP merupakan:

- sistem workflow;
- sistem monitoring operasional;
- sistem koordinasi organisasi;
- sistem monitoring ASN;
- sistem monitoring distribusi;
- sistem monitoring inflasi;
- sistem pengendalian operasional.

MR e-SIGAP menjadi:

- governance layer;
- operational monitoring layer;
- operational analytics layer;
- operational risk layer.

---

## 4.2 Posisi e-Pelara

Pemerintah Daerah telah memiliki e-Pelara sebagai:

```text
CORE PLANNING GOVERNANCE SYSTEM
```

yang mengelola:

- RPJMD;
- Renstra;
- RKPD;
- Renja;
- target;
- pagu;
- realisasi;
- LAKIP;
- dan laporan keuangan daerah.

---

## 4.3 Hubungan e-SIGAP dan e-Pelara

Arsitektur enterprise yang ditetapkan:

```text
e-SIGAP
=
CORE OPERATIONAL & SPIP GOVERNANCE SYSTEM

e-Pelara
=
CORE PLANNING GOVERNANCE SYSTEM
```

Hubungan utama:

```text
e-Pelara
↓
planning governance

e-SIGAP
↓
operational governance + SPIP

Keduanya:
↓
enterprise governance ecosystem
```

---

## 4.4 Prinsip Integrasi Enterprise

MR e-SIGAP wajib dapat terhubung dengan:

```text
RPJMD
Renstra
RKPD
Renja
LAKIP
LK
SPIP
workflow operasional
evidence
```

untuk mendukung:

- enterprise governance;
- enterprise audit;
- enterprise monitoring;
- dan enterprise risk management.

---

## 4.5 Prinsip Anti-Duplikasi

MR e-SIGAP DILARANG membuat ulang:

- planning governance;
- target governance;
- pagu governance;
- indikator governance;
- LAKIP governance;
- LK governance.

Karena seluruh domain tersebut menjadi kewenangan:

```text
e-Pelara
```

MR e-SIGAP hanya menjadi:

```text
operational governance layer
```

dan:

```text
SPIP governance layer
```

## 4.6 Cross System Linkage dengan MR e-Pelara

MR e-SIGAP wajib dapat membaca konteks planning dari e-Pelara, tetapi tidak boleh mengambil alih planning governance.

e-Pelara tetap menjadi master untuk:

- RPJMD
- Renstra
- RKPD
- Renja
- target
- pagu
- realisasi
- LAKIP
- LK
- planning governance

e-SIGAP tetap menjadi master untuk:

- workflow operasional
- SPIP
- RTP
- monitoring operasional
- evidence
- escalation
- operational governance

Jika risiko perencanaan di e-Pelara membutuhkan pengendalian formal SPIP, maka linkage diarahkan ke:

- spip_risk_register
- spip_rtp
- spip_monitoring
- spip_evidence_link

DILARANG:
- membuat planning risk master di e-SIGAP;
- membuat indikator Renstra di e-SIGAP;
- membuat target/pagu governance di e-SIGAP;
- membuat evidence baru di e-Pelara yang menduplikasi spip_evidence_link.

Dampak:

e-SIGAP:
- tetap fokus operational/SPIP.

e-Pelara:
- tetap fokus planning/accountability.

Cross-system:
- risiko dan evidence bisa saling tertaut tanpa duplikasi.

## 4.7 Enterprise Cross-System Contract e-SIGAP ↔ e-Pelara

Setelah audit keterhubungan Blueprint, Roadmap, dan Prompt Teknis MR e-Pelara serta MR e-SIGAP, ditetapkan kontrak lintas sistem enterprise agar kedua sistem tetap terhubung tetapi tidak saling tumpang tindih.

1. Source of Truth Domain

e-SIGAP menjadi source of truth untuk:

- operational workflow;
- task;
- disposisi;
- koordinasi;
- SPIP;
- RTP;
- monitoring SPIP;
- evidence;
- escalation;
- operational risk;
- operational monitoring;
- operational dashboard summary.

e-Pelara menjadi source of truth untuk:

- planning governance;
- RPJMD;
- Renstra;
- RKPD;
- Renja;
- target;
- pagu;
- realisasi;
- LAKIP;
- LK;
- planning risk;
- planning monitoring;
- planning dashboard summary.

2. Integration Rule

Integrasi lintas sistem wajib melalui:

- API;
- service layer;
- cross-system linkage;
- verified output;
- audit trail;
- RBAC;
- ownership governance.

DILARANG:

- direct database coupling liar;
- duplicate planning table di e-SIGAP;
- duplicate SPIP table di e-Pelara;
- duplicate evidence;
- duplicate RTP;
- duplicate indikator;
- duplicate pagu;
- duplicate target;
- duplicate approval;
- duplicate workflow;
- duplicate audit.

3. Cross-System Code Standard

Kode sistem lintas aplikasi wajib memakai standar backend-safe:

- e_pelara
- e_sigap
- spip
- lakip
- lk

DILARANG memakai variasi tidak standar:

- e-Pelara
- ePelara
- epelara
- E-PELARA
- e-SIGAP
- eSigap
- esigap
- E-SIGAP

4. Cross-System Link Field Standard

Field teknis cross-system wajib:

- source_system
- source_module
- source_table
- source_id
- target_system
- target_module
- target_table
- target_id
- link_type
- link_status
- is_verified
- verified_by
- verified_at
- created_by

Jika linkage terhubung ke SPIP, gunakan field spesifik:

- linked_spip_risk_id
- linked_spip_rtp_id
- linked_spip_monitoring_id
- linked_spip_evidence_id

Field konseptual lama seperti:

- linked_risk_id
- linked_event_id
- linked_evidence_id

hanya boleh dipakai sebagai istilah konseptual/dokumentasi, bukan sebagai standar field teknis utama.

5. Verified Output Rule

e-SIGAP hanya boleh mengirim output verified ke e-Pelara.

Output verified dapat berupa:

- status RTP;
- status monitoring SPIP;
- evidence verified;
- operational risk status;
- escalation status;
- rekomendasi pengendalian;
- status tindak lanjut operasional.

Output tersebut dikirim sebagai:

- context;
- reference;
- evidence status;
- operational control result;
- risk control result;

bukan sebagai pengambilalihan planning governance.

6. Controller Rule

Controller e-SIGAP DILARANG langsung memanipulasi tabel planning e-Pelara.

Controller e-Pelara DILARANG langsung memanipulasi tabel SPIP e-SIGAP.

Semua aksi lintas sistem wajib melalui:

- service layer;
- cross-system linkage service;
- audit trail;
- verified output;
- RBAC;
- ownership governance.

7. Planning Context Reader Rule

Folder:

07-integrasi-e-pelara-planning/

hanya boleh dipakai untuk:

- membaca context planning;
- membaca reference Renstra/RKPD/Renja/LAKIP/LK;
- membaca planning risk linkage;
- mengirim verified output ke e-Pelara.

DILARANG:

- membuat planning governance baru;
- membuat indikator Renstra baru;
- membuat target/pagu baru;
- membuat LAKIP/LK governance baru;
- membuat master planning baru di e-SIGAP.

8. Dampak

Backend:
- Service/controller e-SIGAP harus menjaga batas domain operational/SPIP.
- Integrasi planning hanya melalui service/linkage/verified output.

Database:
- Tidak ada perubahan struktur database.
- SPIP existing tetap menjadi core.

Frontend:
- UI e-SIGAP boleh menampilkan context planning, tetapi tidak boleh mengelola planning master.

Workflow:
- e-SIGAP tetap operational/SPIP governance system.

Governance:
- Mengurangi risiko duplicate planning, duplicate evidence, broken audit, dan isolated risk.

---

# 5. FONDASI SPIP e-SIGAP

## 5.1 Database Aktif

Berdasarkan hasil pengecekan PostgreSQL, database aktif e-SIGAP:

```text
DB_NAME=sigap
DB_USER=sekretaris
```

---

## 5.2 Tabel SPIP Existing

Tabel SPIP existing:

```text
spip_risk_register
spip_rtp
spip_monitoring
spip_evidence_link
```

Dengan demikian, e-SIGAP ditetapkan sebagai:

```text
CORE SPIP GOVERNANCE SYSTEM
```

---

## 5.3 Fungsi Tabel SPIP

| Tabel | Fungsi |
|---|---|
| spip_risk_register | daftar risiko SPIP |
| spip_rtp | rencana tindak pengendalian |
| spip_monitoring | monitoring pengendalian |
| spip_evidence_link | penghubung evidence lintas modul |

---

## 5.4 Prinsip Arsitektur SPIP

MR e-SIGAP tidak boleh membuat tabel SPIP baru yang menduplikasi tabel existing.

Seluruh pengembangan MR operasional wajib memperkuat fondasi SPIP existing.

---

## 5.5 Prinsip Evidence Governance

Relasi governance utama:

```text
spip_risk_register.id
↓
spip_rtp.risk_id
spip_monitoring.risk_id
```

Sedangkan:

```text
spip_evidence_link.spip_ref_type
+
spip_evidence_link.spip_ref_id
```

menjadi governance evidence lintas sistem.

---

## 5.6 Status Hardening FK SPIP

Hardening FK telah berhasil dijalankan:

```text
fk_spip_rtp_risk
fk_spip_monitoring_risk
```

Dengan demikian:

- orphan data dapat dicegah;
- governance SPIP lebih aman;
- integrasi lintas sistem lebih stabil.

---

## 5.7 Prinsip Polymorphic Governance

```text
spip_evidence_link
```

menggunakan:

```text
polymorphic reference
```

dan wajib dijaga melalui validasi service/controller.

---

# 6. SUMBER RISIKO OPERASIONAL

| Sumber Risiko | Contoh Risiko |
|---|---|
| Workflow | approval bypass |
| Task | overdue task |
| Koordinasi | bidang tidak sinkron |
| Monitoring | laporan terlambat |
| ASN | keterlambatan hak ASN |
| Distribusi | stok tidak valid |
| Inflasi | data terlambat |
| Dashboard | KPI tidak realtime |
| Approval | approval chain rusak |
| Audit | histori tidak lengkap |

---

# 7. STRUKTUR ORGANISASI & KEPEMILIKAN RISIKO

| Level | Tanggung Jawab |
|---|---|
| Kepala Dinas | monitoring strategis |
| Sekretaris | koordinasi pengendalian |
| Kabid | monitoring unit kerja |
| Kepala UPTD | monitoring operasional lapangan |
| JF | monitoring pelaksanaan |
| Pelaksana | pelaporan dan tindak lanjut |

---

# 8. POLA PENGENDALIAN OPERASIONAL

Tahapan pengendalian:

1. identifikasi event;
2. identifikasi risiko;
3. monitoring workflow;
4. monitoring keterlambatan;
5. monitoring approval;
6. monitoring koordinasi;
7. monitoring operasional;
8. monitoring tindak lanjut;
9. audit operasional.

---

# 9. ENTERPRISE EVENT MONITORING

Semua aktivitas operasional dapat menjadi risk event.

| Event | Risiko |
|---|---|
| task overdue | keterlambatan |
| approval bypass | tata kelola |
| duplicate task | validitas workflow |
| escalation gagal | koordinasi |
| stok negatif | distribusi |
| data inflasi terlambat | monitoring inflasi |
| approval terlambat | governance |
| disposisi tidak selesai | akuntabilitas |

---

# 10. TARGET TRANSFORMASI

## 10.1 Jangka Pendek

- monitoring task realtime;
- monitoring keterlambatan;
- monitoring approval;
- dashboard operasional;
- warning system.

---

## 10.2 Jangka Menengah

- integrasi monitoring lintas bidang;
- realtime operational analytics;
- audit operasional realtime;
- governance monitoring.

---

## 10.3 Jangka Panjang

- predictive operational monitoring;
- AI-assisted operational governance;
- smart workflow monitoring;
- enterprise operational control system.

---

# 11. AI GOVERNANCE LAYER

Seluruh arsitektur MR wajib disiapkan agar:

- AI-readable;
- analytics-ready;
- anomaly-detection-ready;
- governance-intelligence-ready.

---

## 11.1 Tujuan

Agar ke depan sistem mampu:

- mendeteksi deviasi otomatis;
- mendeteksi approval bypass;
- mendeteksi broken workflow;
- memberikan rekomendasi pengendalian otomatis.

---

## 11.2 Prinsip Wajib

Seluruh:

- audit;
- histori;
- warning;
- approval;
- monitoring;
- evidence;

harus:

- terstruktur;
- konsisten;
- dapat ditelusuri;
- dan dapat dibaca engine analytics.

---

# 12. DASHBOARD OPERASIONAL

Dashboard wajib mampu menampilkan:

- overdue task;
- approval monitoring;
- escalation monitoring;
- distribusi monitoring;
- monitoring ASN;
- monitoring inflasi;
- warning operasional;
- operational KPI;
- operational risk summary.

---

# 13. ENTERPRISE NOTIFICATION GOVERNANCE

Seluruh warning, approval, overdue, deviasi, dan escalation wajib menggunakan governance notifikasi terintegrasi.

---

## 13.1 Jenis Notifikasi

Minimal mendukung:

- warning;
- approval;
- overdue;
- escalation;
- revisi;
- deviasi;
- monitoring;
- audit alert.

---

## 13.2 Prinsip Enterprise

Notifikasi:

- tidak boleh duplicate;
- tidak boleh hilang;
- wajib memiliki ownership;
- wajib memiliki status baca;
- wajib memiliki timestamp.

---

# 14. ENTERPRISE MASTER DATA GOVERNANCE

Seluruh ekosistem MR wajib menggunakan prinsip:

```text
single source of truth
```

untuk mencegah:

- duplicate data;
- duplicate actor;
- duplicate approval;
- duplicate monitoring;
- duplicate evidence.

---

## 14.1 Master Data Utama

```text
users
divisions
roles
notifications
```

---

## 14.2 Prinsip Kepemilikan Data

### e-SIGAP

Menjadi master untuk:

- workflow operasional;
- SPIP;
- monitoring operasional;
- evidence;
- RTP;
- operational governance.

### e-Pelara

Menjadi master untuk:

- perencanaan;
- target;
- pagu;
- realisasi;
- Renstra;
- RKPD;
- Renja;
- LAKIP;
- LK;
- planning governance.

---

## 14.3 Larangan

DILARANG:

- duplicate master user;
- duplicate approval actor;
- duplicate notification system;
- duplicate monitoring system.

---

# 15. PRINSIP UTAMA IMPLEMENTASI

## 15.1 Wajib

- menjaga workflow governance;
- menjaga approval chain;
- menjaga traceability;
- menjaga auditability;
- menjaga monitoring realtime;
- menjaga koordinasi organisasi;
- menjaga konsistensi workflow.

---

## 15.2 Dilarang

- bypass approval;
- bypass workflow;
- monitoring manual tanpa sistem;
- duplicate workflow;
- perubahan tanpa audit;
- manipulasi monitoring;
- hard delete histori operasional.

---

# 16. INTEGRASI SISTEM

MR e-SIGAP wajib:

- terintegrasi dengan dashboard operasional;
- terintegrasi dengan workflow task;
- terintegrasi dengan monitoring ASN;
- terintegrasi dengan monitoring distribusi;
- terintegrasi dengan monitoring inflasi;
- terintegrasi dengan SPIP;
- terintegrasi dengan e-Pelara.

---

# 17. PENUTUP

Blueprint ini menjadi:

```text
SOURCE OF TRUTH GOVERNANCE MR e-SIGAP
```

dalam pembangunan:

- operational monitoring;
- workflow governance;
- operational risk management;
- operational control system;
- dan enterprise operational governance pada e-SIGAP.

Posisi final e-SIGAP:

```text
ENTERPRISE OPERATIONAL & SPIP GOVERNANCE SYSTEM
```

yang fokus pada:

- workflow;
- SPIP;
- operational monitoring;
- evidence;
- escalation;
- dan operational governance.