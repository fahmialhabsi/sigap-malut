# FORM ROADMAP MR e-SIGAP
# ENTERPRISE OPERATIONAL RISK IMPLEMENTATION ROADMAP
## Roadmap Implementasi Manajemen Risiko Operasional e-SIGAP
UPDATE ROADMAP — Cross-System Contract & Implementation State e-SIGAP

---

# 1. TUJUAN DOKUMEN

Dokumen ini menjadi:

```text
SOURCE OF TRUTH IMPLEMENTASI SISTEM MR e-SIGAP
```

untuk pembangunan:

- operational risk governance;
- workflow monitoring;
- operational monitoring;
- operational dashboard;
- event monitoring;
- audit operasional;
- dan operational control system pada e-SIGAP.

Dokumen ini berisi:

- roadmap implementasi;
- struktur teknis;
- standar backend;
- standar frontend;
- struktur database;
- workflow teknis;
- event monitoring;
- dashboard;
- audit;
- cache;
- performance;
- dan enterprise architecture.
Menambahkan struktur folder integrasi e-SIGAP agar tetap terhubung ke planning governance e-Pelara.
Mengunci kontrak lintas sistem dan menambahkan state implementasi e-SIGAP agar sejajar dengan e-Pelara.

Dokumen ini merupakan turunan teknis dari:

```text
FORM BLUEPRINT MR e-SIGAP.md
```

---

# 2. POSISI ROADMAP DALAM EKOSISTEM DOKUMEN

```text
Blueprint MR e-SIGAP
↓
governance operasional

Roadmap MR e-SIGAP
↓
implementasi teknis

Prompt Teknis MR e-SIGAP
↓
guard kontinuitas implementasi
```

---

# 3. TUJUAN IMPLEMENTASI SISTEM

MR e-SIGAP dibangun untuk:

- membaca workflow;
- membaca task;
- membaca approval;
- membaca escalation;
- membaca monitoring ASN;
- membaca monitoring distribusi;
- membaca monitoring inflasi;
- menghasilkan realtime operational risk monitoring.

Target utama:

```text
ENTERPRISE OPERATIONAL CONTROL SYSTEM
```

---

# 4. STRUKTUR PROJECT MR e-SIGAP

## 4.1 Lokasi Modul

```text
E:\sigap-malut\manajemen-risiko
```

---

## 4.2 Struktur Folder Enterprise MR e-SIGAP

Lokasi modul MR:

E:\sigap-malut\manajemen-risiko

Lokasi dokumen resmi e-SIGAP:

E:\sigap-malut\dokumenSistem

Struktur folder MR e-SIGAP:

manajemen-risiko/
├── 01-governance-foundation/
│   ├── source-of-truth/
│   ├── role-ownership/
│   ├── approval-governance/
│   ├── audit-governance/
│   └── history-governance/
│
├── 02-risiko-operasional/
│   ├── operational-risk-register/
│   ├── operational-risk-history/
│   ├── operational-risk-approval/
│   ├── operational-risk-monitoring/
│   └── operational-risk-warning/
│
├── 03-workflow-task/
│   ├── task-event-monitoring/
│   ├── overdue-task-monitoring/
│   ├── approval-bypass-monitoring/
│   ├── escalation-monitoring/
│   └── workflow-chain-audit/
│
├── 04-koordinasi/
│   ├── coordination-event-monitoring/
│   ├── bidang-cross-check/
│   ├── sekretariat-integration/
│   └── coordination-warning/
│
├── 05-operational-domain/
│   ├── monitoring-asn/
│   ├── distribusi/
│   ├── inflasi/
│   ├── stok-pangan/
│   └── layanan-operasional/
│
├── 06-spip-governance/
│   ├── spip-risk-register-linkage/
│   ├── spip-rtp-linkage/
│   ├── spip-monitoring-linkage/
│   ├── spip-evidence-linkage/
│   └── spip-fk-hardening-monitoring/
│
├── 07-integrasi-e-pelara-planning/
│   ├── planning-context-reader/
│   ├── rpjmd-renstra-context/
│   ├── rkpd-renja-context/
│   ├── lakip-lk-context/
│   ├── planning-risk-linkage/
│   └── verified-output-to-epelara/
│
├── 08-periodic-monitoring/
│   ├── monitoring-bulanan/
│   ├── monitoring-triwulan/
│   ├── monitoring-semester/
│   ├── monitoring-tahunan/
│   └── monitoring-adhoc/
│
├── 09-snapshot-summary/
│   ├── operational-risk-snapshot/
│   ├── spip-snapshot/
│   ├── dashboard-summary/
│   ├── approval-summary/
│   └── warning-summary/
│
├── 10-dashboard-analytics/
│   ├── executive-dashboard/
│   ├── operational-risk-dashboard/
│   ├── spip-dashboard/
│   ├── escalation-dashboard/
│   └── ai-ready-analytics/
│
└── docs-index/
    ├── source-map-to-dokumenSistem/
    ├── blueprint-index/
    ├── roadmap-index/
    ├── prompt-teknis-index/
    ├── erd/
    ├── migration-notes/
    └── changelog/

Dampak:

e-SIGAP:
- struktur tetap fokus operasional/SPIP.

e-Pelara:
- planning context tetap dibaca dari e-Pelara, bukan dibuat ulang.

docs:
- docs-index tidak menggantikan dokumenSistem.
```

---

## 4.3 Fungsi Folder

| Folder | Fungsi |
|---|---|
| risiko-operasional | monitoring risiko operasional |
| workflow-task | monitoring workflow |
| koordinasi | monitoring koordinasi |
| keterlambatan | monitoring overdue |
| monitoring-asn | monitoring ASN |
| distribusi | monitoring distribusi |
| inflasi | monitoring inflasi |
| docs | source of truth dokumen |

---

# 5. ROADMAP IMPLEMENTASI ENTERPRISE

## 5.1 PHASE 1 — FOUNDATION

### Fokus

- struktur database;
- authentication;
- RBAC;
- ownership;
- workflow foundation;
- event foundation.

### Output

- tabel utama MR;
- event monitoring dasar;
- approval monitoring dasar;
- overdue monitoring dasar.

### Target

Sistem mampu:

- membaca workflow;
- membaca overdue;
- membaca approval;
- membaca escalation.

---

## 5.2 PHASE 2 — ENTERPRISE WORKFLOW

### Fokus

- audit trail;
- history;
- immutable history;
- event logging;
- approval timeline;
- escalation tracking.

### Output

- workflow audit;
- operational history;
- approval history;
- escalation monitoring;
- rebuild monitoring.

### Target

Semua aktivitas:

- dapat dimonitor;
- dapat diaudit;
- memiliki histori;
- memiliki timeline.

---

## 5.3 PHASE 3 — MONITORING & DASHBOARD

### Fokus

- operational dashboard;
- realtime monitoring;
- warning system;
- risk analytics;
- operational KPI.

### Output

- overdue dashboard;
- escalation dashboard;
- approval dashboard;
- operational risk summary;
- monitoring distribusi;
- monitoring inflasi.

### Target

Pimpinan dapat memonitor:

- operasional;
- keterlambatan;
- approval;
- workflow;
- koordinasi;
- distribusi;
- inflasi realtime.

---

## 5.4 PHASE 4 — EVENT GOVERNANCE

### Fokus

- operational event monitoring;
- anomaly detection;
- escalation monitoring;
- operational analytics.

### Output

- event risk engine;
- operational warning;
- operational analytics;
- operational audit.

### Target

Sistem mampu:

- mendeteksi event operasional;
- mendeteksi anomali workflow;
- mendeteksi approval bypass;
- mendeteksi keterlambatan.

---

## 5.5 PHASE 5 — SMART GOVERNANCE

### Fokus

- AI-assisted operational governance;
- predictive operational monitoring;
- smart escalation;
- smart workflow analytics.

### Output

- predictive monitoring;
- smart warning;
- AI-assisted governance;
- enterprise operational analytics.

---

# 6. ENTERPRISE DATABASE STRUCTURE

## 6.1 Tabel Utama

| Tabel | Fungsi |
|---|---|
| mr_operational_event | event operasional |
| mr_operational_risk | risiko operasional |
| mr_operational_monitoring | monitoring operasional |
| mr_operational_history | audit history |
| mr_operational_dashboard_summary | summary dashboard |
| mr_operational_warning | warning system |
| mr_operational_escalation | escalation monitoring |

---

## 6.2 Prinsip Database

### Wajib

- ownership;
- approval chain;
- audit history;
- referential integrity;
- event traceability.

### Dilarang

- orphan data;
- duplicate event;
- hard delete history;
- bypass workflow.

---

# 7. FONDASI SPIP DATABASE e-SIGAP

## 7.1 Database Aktif

```text
DB_NAME=sigap
DB_USER=sekretaris
```

---

## 7.2 Tabel SPIP Existing

```text
spip_risk_register
spip_rtp
spip_monitoring
spip_evidence_link
```

---

## 7.3 Struktur spip_risk_register

Field utama:

```text
id
unit_kerja
periode_tahun
kode_risiko
nama_risiko
kategori_risiko
sasaran_konteks
proses_bisnis_konteks
pemilik_risiko
status
created_at
updated_at
```

---

## 7.4 Struktur spip_rtp

Field utama:

```text
id
risk_id
uraian_rtp
penanggung_jawab
target_tanggal
status
realized_at
created_at
updated_at
```

---

## 7.5 Struktur spip_monitoring

Field utama:

```text
id
risk_id
jenis
tanggal
uraian
hasil
nilai
created_at
updated_at
```

Jenis monitoring:

```text
kegiatan_pengendalian
peristiwa_risiko
level_risiko
efektivitas_pengendalian
```

---

## 7.6 Struktur spip_evidence_link

Field utama:

```text
id
spip_ref_type
spip_ref_id
sumber_modul
sumber_tabel
sumber_id
judul
url
occurred_at
created_by
created_at
```

Ref type:

```text
risk
rtp
monitoring
```

---

## 7.7 Status Hardening SPIP

Hardening FK berhasil dijalankan:

```text
fk_spip_rtp_risk
fk_spip_monitoring_risk
```

Status:

```text
FK hardened
```

Dampak:

- orphan data dicegah;
- governance SPIP lebih aman;
- audit relation lebih stabil;
- integrasi lintas sistem lebih siap.

---

## 7.8 Prinsip Polymorphic Governance

```text
spip_evidence_link
```

menggunakan:

```text
polymorphic reference
```

dan wajib dijaga melalui validasi service/controller.

---

## 7.9 Prinsip Anti-Duplikasi

DILARANG membuat tabel baru yang menduplikasi:

```text
spip_risk_register
spip_rtp
spip_monitoring
spip_evidence_link
```

MR e-SIGAP wajib memperkuat fondasi SPIP existing.

---

# 8. ENTERPRISE EVENT MONITORING

Semua aktivitas operasional dapat menjadi event.

| Event | Risiko |
|---|---|
| task overdue | keterlambatan |
| approval bypass | tata kelola |
| escalation gagal | koordinasi |
| stok negatif | distribusi |
| monitoring terlambat | governance |
| data inflasi terlambat | inflasi |
| duplicate task | validitas workflow |

---

# 9. CROSS SYSTEM RISK LINKAGE

## 9.1 Tujuan

Agar:

- planning risk dapat ditelusuri ke operational risk;
- operational risk dapat ditelusuri ke planning risk;
- audit tidak terpecah;
- evidence dapat digunakan bersama.

---

## 9.2 Contoh Linkage

```text
Risiko Perencanaan
↓
realisasi terlambat
↓
workflow operasional terganggu
↓
SPIP evidence muncul
↓
monitoring lintas sistem
```

---

## 9.3 Cross Reference Wajib

```text
source_system
source_module
source_table
source_id
linked_risk_id
linked_event_id
linked_evidence_id
```

---

## 9.4 Prinsip Enterprise

Tidak boleh ada:

- isolated risk;
- isolated audit;
- isolated evidence;
- isolated monitoring.

## 9.5 Enterprise Cross-System Contract e-SIGAP ↔ e-Pelara

Hasil audit menunjukkan bahwa e-SIGAP dan e-Pelara sudah terhubung secara enterprise, tetapi perlu kontrak teknis agar tidak terjadi tumpang tindih domain.

1. Source of Truth

e-SIGAP master untuk:
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
- operational monitoring.

e-Pelara master untuk:
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
- planning monitoring.

2. Cross-System Code Standard

Kode sistem wajib:

- e_pelara
- e_sigap
- spip
- lakip
- lk

DILARANG memakai variasi:

- e-Pelara
- ePelara
- epelara
- E-PELARA
- e-SIGAP
- eSigap
- esigap
- E-SIGAP

3. Cross-System Link Field Standard

Field teknis wajib:

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

Jika linkage SPIP, gunakan:

- linked_spip_risk_id
- linked_spip_rtp_id
- linked_spip_monitoring_id
- linked_spip_evidence_id

4. Verified Output Rule

e-SIGAP hanya mengirim output verified ke e-Pelara.

Output verified:
- status RTP;
- status monitoring SPIP;
- evidence verified;
- operational risk status;
- escalation status;
- rekomendasi pengendalian;
- status tindak lanjut operasional.

5. Controller Guard

Controller e-SIGAP DILARANG:
- query langsung untuk mengubah planning table e-Pelara;
- membuat indikator Renstra;
- membuat target/pagu;
- membuat LAKIP/LK governance;
- membuat planning risk master;
- membuat integration tanpa audit.

Controller e-SIGAP WAJIB:
- memakai service layer;
- memakai verified output;
- memakai audit trail;
- memakai RBAC;
- menjaga SPIP FK governance;
- menjaga polymorphic evidence validation.

Dampak:

Backend:
- Integrasi planning tetap lewat service/linkage.

Database:
- Tidak ada perubahan struktur.

Workflow:
- e-SIGAP tetap operational/SPIP governance.

Governance:
- Tidak ada duplikasi planning governance.

## 9.6 Status Implementasi MR e-SIGAP Saat Ini

Status ini ditambahkan agar kontinuitas implementasi e-SIGAP tidak kalah jelas dibanding e-Pelara.

PHASE 1 — FOUNDATION ANALYSIS
🟡 perlu audit lanjutan

Status:
- Blueprint MR e-SIGAP tersedia.
- Roadmap MR e-SIGAP tersedia.
- Prompt Teknis MR e-SIGAP tersedia.
- Database aktif e-SIGAP telah diidentifikasi:
  DB_NAME=sigap
  DB_USER=sekretaris

PHASE 2 — MR FOUNDATION DESIGN
🟡 sebagian tersedia

Status:
- Domain operational governance sudah ditetapkan.
- Domain SPIP governance sudah ditetapkan.
- Domain planning tetap milik e-Pelara.
- Struktur folder integrasi e-Pelara planning sudah tersedia.
- ERD detail MR operational belum dikunci setara e-Pelara.

PHASE 3 — DATABASE FOUNDATION
🟡 sebagian tersedia

Status:
✅ SPIP existing tersedia:
- spip_risk_register
- spip_rtp
- spip_monitoring
- spip_evidence_link

✅ FK hardening SPIP tersedia:
- fk_spip_rtp_risk
- fk_spip_monitoring_risk

⏳ MR operational table foundation belum dikunci setara e-Pelara.

PHASE 4 — BACKEND FOUNDATION
⏳ belum dimulai untuk MR operational.

Yang belum dibuat:
- model MR operational;
- association MR operational;
- reusable helper MR operational;
- reusable service MR operational;
- controller MR operational;
- routes MR operational.

Rekomendasi penyetaraan berikutnya:

1. Audit database/model existing e-SIGAP.
2. Desain ERD MR operational.
3. Desain migration MR operational.
4. Validasi migration.
5. Buat model dan association.
6. Buat helper/service mengikuti pola e-Pelara jika sesuai.
7. Baru masuk controller/routes.

Dampak:

Developer:
- e-SIGAP memiliki state implementasi yang jelas.

Governance:
- e-SIGAP tidak dianggap sudah setara implementasi dengan e-Pelara.

Roadmap:
- pekerjaan lanjutan e-SIGAP lebih terukur.

---

# 10. STANDAR API ENTERPRISE

## 10.1 Endpoint Pattern

```text
GET    /api/mr-operational-risk
GET    /api/mr-operational-risk/:id
POST   /api/mr-operational-risk
PUT    /api/mr-operational-risk/:id

POST   /api/mr-operational-risk/:id/revisi

GET    /api/mr-operational-risk/:id/history

PATCH  /api/mr-operational-risk/history/:id/verifikasi
PATCH  /api/mr-operational-risk/history/:id/approve
PATCH  /api/mr-operational-risk/history/:id/tolak

POST   /api/mr-operational-risk/:id/rebuild-active-from-history
```

---

## 10.2 Rule API

Semua endpoint wajib:

- verifyToken;
- RBAC;
- validation;
- audit trail;
- standardized response.

---

# 11. STANDAR BACKEND

## 11.1 Struktur Backend

```text
backend/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── services/
├── helpers/
├── validations/
└── utils/
```

---

## 11.2 Rule Backend

Semua controller wajib:

- async/await;
- transaction;
- audit logging;
- rollback safety;
- reusable helper.

---

## 11.3 Service Layer

Semua business logic wajib dipisahkan ke:

```text
services/
```

---

# 12. STANDAR FRONTEND

## 12.1 Struktur Frontend

```text
src/
├── pages/
├── components/
├── services/
├── contexts/
├── hooks/
├── routes/
└── utils/
```

---

## 12.2 Reusable Component Wajib

| Component | Fungsi |
|---|---|
| OperationalRiskForm | form reusable |
| OperationalHistoryModal | histori |
| OperationalApprovalPanel | approval |
| OperationalDashboardCard | dashboard |
| OperationalWarningBadge | warning |
| OperationalEventViewer | event monitoring |

---

## 12.3 Rule Frontend

Semua form wajib:

- readonly approved data;
- memiliki histori;
- memiliki approval visibility;
- memiliki warning visibility.

---

# 13. STRATEGI CACHE & PERFORMANCE

## 13.1 Prinsip

Dashboard tidak boleh:

- membaca raw table besar;
- melakukan aggregation realtime berat;
- melakukan query berulang.

---

## 13.2 Solusi

Menggunakan:

```text
summary table + incremental sync
```

---

## 13.3 Summary Table

```text
mr_operational_dashboard_summary
```

Field utama:

- overdue total;
- escalation total;
- approval pending;
- operational risk total;
- warning total.

---

# 14. STRATEGI AUDIT ENTERPRISE

## 14.1 Workflow Audit

```text
draft
↓
verifikasi
↓
approved
↓
revisi
↓
history
↓
rebuild
```

---

## 14.2 Rule Audit

Data approved:

- tidak boleh diubah langsung;
- wajib revisi;
- wajib approval;
- wajib histori.

---

# 15. DASHBOARD ENTERPRISE

## 15.1 Dashboard Pimpinan

Menampilkan:

- overdue monitoring;
- escalation monitoring;
- approval monitoring;
- operational warning;
- operational KPI.

---

## 15.2 Dashboard Operasional

Menampilkan:

- task monitoring;
- workflow monitoring;
- monitoring distribusi;
- monitoring inflasi;
- monitoring ASN.

---

# 16. ANTI-PATTERN IMPLEMENTASI

DILARANG:

- bypass workflow;
- bypass approval;
- hard delete history;
- duplicate monitoring;
- monitoring manual di luar sistem;
- query dashboard langsung dari raw table.

---

# 17. DEFINITION OF DONE

Modul dianggap selesai jika:

- workflow monitoring selesai;
- overdue monitoring selesai;
- escalation monitoring selesai;
- audit selesai;
- dashboard selesai;
- warning system selesai;
- history selesai;
- approval selesai;
- UAT selesai.

---

# 18. CHANGELOG IMPLEMENTASI

Semua perubahan wajib:

- update Blueprint MR e-SIGAP;
- update Roadmap MR e-SIGAP;
- update Prompt Teknis MR e-SIGAP.

---

# 19. PENUTUP

Roadmap ini menjadi:

```text
SOURCE OF TRUTH IMPLEMENTASI MR e-SIGAP
```

untuk pembangunan:

- operational governance;
- operational monitoring;
- workflow governance;
- operational analytics;
- operational dashboard;
- dan enterprise operational control system.