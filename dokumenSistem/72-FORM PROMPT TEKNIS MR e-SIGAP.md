# FORM PROMPT TEKNIS MR e-SIGAP
# ENTERPRISE OPERATIONAL RISK GOVERNANCE PROMPT
## Prompt Super Teknis Implementasi MR e-SIGAP
UPDATE PROMPT TEKNIS — Cross-System Guard & Continuity State e-SIGAP

---

# 1. SOURCE OF TRUTH WAJIB

Selama implementasi berlangsung, WAJIB menjadikan dokumen berikut sebagai source of truth utama.

---

## 1.1 FORM BLUEPRINT MR e-SIGAP.md

Sebagai:

- source of truth governance operasional;
- source of truth workflow organisasi;
- source of truth monitoring operasional;
- source of truth koordinasi;
- source of truth operational governance.

Blueprint hanya membahas:

- governance;
- struktur organisasi;
- workflow operasional;
- monitoring operasional;
- koordinasi;
- keterlambatan;
- monitoring ASN;
- monitoring distribusi;
- monitoring inflasi.
Menambahkan guard agar e-SIGAP tidak menduplikasi planning governance e-Pelara.

Blueprint bukan dokumen coding teknis.

---

## 1.2 FORM ROADMAP MR e-SIGAP.md

Sebagai:

- source of truth implementasi sistem;
- source of truth backend;
- source of truth frontend;
- source of truth database;
- source of truth audit;
- source of truth dashboard;
- source of truth event monitoring.

Semua implementasi teknis wajib mengacu ke Roadmap.

---

# 2. TUJUAN UTAMA IMPLEMENTASI

Tujuan implementasi bukan:

- membuat CRUD biasa;
- membuat form biasa;
- membuat dashboard biasa.

Tetapi membangun:

```text
ENTERPRISE OPERATIONAL CONTROL SYSTEM
```

yang:

- memonitor workflow;
- memonitor overdue;
- memonitor approval;
- memonitor escalation;
- memonitor koordinasi;
- memonitor distribusi;
- memonitor inflasi;
- memonitor monitoring ASN;
- memonitor operational event;
- dan mendukung pengambilan keputusan realtime.

Agar implementasi MR e-SIGAP tidak menduplikasi planning governance e-Pelara dan memiliki state teknis yang jelas.

---

# 3. POSISI SISTEM

## 3.1 e-SIGAP

e-SIGAP adalah:

- sistem workflow;
- sistem task;
- sistem monitoring operasional;
- sistem koordinasi;
- sistem monitoring ASN;
- sistem monitoring distribusi;
- sistem monitoring inflasi.

---

## 3.2 MR e-SIGAP

MR e-SIGAP adalah:

- operational governance layer;
- operational monitoring layer;
- operational analytics layer;
- enterprise operational control layer.

MR membaca:

- workflow;
- task;
- overdue;
- escalation;
- approval;
- monitoring ASN;
- distribusi;
- inflasi.

---

# 4. STRUKTUR PROJECT YANG SUDAH DITETAPKAN

## 4.1 Lokasi Project

```text
E:\sigap-malut
```

---

## 4.2 Lokasi Modul MR

```text
E:\sigap-malut\manajemen-risiko
```

---

## 4.3 Struktur Existing

```text
manajemen-risiko/
├── risiko-operasional/
├── workflow-task/
├── koordinasi/
├── keterlambatan/
├── monitoring-asn/
├── distribusi/
├── inflasi/
├── docs/
└── README.md
```

Implementasi wajib mengikuti struktur ini.

## 4.4 Guard Struktur Folder MR e-SIGAP

Folder resmi dokumen e-SIGAP berada di:

E:\sigap-malut\dokumenSistem

Folder modul MR berada di:

E:\sigap-malut\manajemen-risiko

DILARANG menganggap docs/ di modul MR sebagai pengganti dokumenSistem.

docs-index/ di modul MR hanya berfungsi sebagai index, changelog, ERD, migration notes, dan pointer ke dokumen resmi.

e-SIGAP wajib memiliki folder integrasi:

07-integrasi-e-pelara-planning/

Folder ini hanya untuk membaca konteks planning dari e-Pelara, bukan membuat planning governance baru.

Subfolder wajib:

- planning-context-reader
- rpjmd-renstra-context
- rkpd-renja-context
- lakip-lk-context
- planning-risk-linkage
- verified-output-to-epelara

DILARANG:
- membuat indikator Renstra di e-SIGAP;
- membuat target/pagu governance di e-SIGAP;
- membuat LAKIP/LK governance di e-SIGAP;
- membuat evidence baru di e-Pelara yang menduplikasi SPIP.

Dampak:

Developer:
- batas domain e-Pelara dan e-SIGAP tetap jelas.

Database:
- SPIP tetap memakai tabel existing.

Workflow:
- e-SIGAP mengirim output verified, bukan raw planning governance.

Cross-system:
- integrasi tetap API/linkage, bukan duplikasi database.

---

# 5. DATABASE SPIP AKTIF YANG WAJIB DIINGAT

## 5.1 Database Aktif

```text
DB_NAME=sigap
DB_USER=sekretaris
```

---

## 5.2 Tabel SPIP Existing

```text
spip_risk_register
spip_rtp
spip_monitoring
spip_evidence_link
```

---

## 5.3 Rule Wajib

DILARANG:

- membuat ulang tabel SPIP;
- membuat risk register baru;
- membuat RTP baru;
- membuat monitoring SPIP baru;
- membuat evidence system baru.

MR e-SIGAP wajib memperkuat fondasi SPIP existing.

---

## 5.4 Status FK SPIP

Foreign key SPIP telah berhasil diverifikasi aktif.

FK aktif:

```text
fk_spip_rtp_risk
spip_rtp.risk_id → spip_risk_register.id

fk_spip_monitoring_risk
spip_monitoring.risk_id → spip_risk_register.id
```

---

## 5.5 Rule FK SPIP

DILARANG:

- menghapus FK;
- bypass relation;
- membuat RTP tanpa risk register;
- membuat monitoring tanpa risk register.

---

## 5.6 Polymorphic Evidence Governance

```text
spip_evidence_link
```

menggunakan:

```text
polymorphic reference
```

Validasi wajib dilakukan di:

```text
service/controller
```

---

## 5.7 Prinsip SPIP Governance

SPIP e-SIGAP ditetapkan sebagai:

```text
CORE OPERATIONAL GOVERNANCE FOUNDATION
```

untuk:

- operational monitoring;
- operational evidence;
- workflow governance;
- escalation governance;
- operational audit.

---

# 6. INTEGRASI LINTAS SISTEM

MR e-SIGAP wajib dapat terhubung dengan:

```text
e-Pelara
SPIP
LAKIP
LK
workflow operasional
evidence
dashboard governance
```

---

## 6.1 Prinsip Integrasi

Tidak boleh ada:

- isolated risk;
- isolated audit;
- isolated evidence;
- isolated workflow;
- isolated dashboard.

---

## 6.2 Cross Reference Wajib

```text
source_system
source_module
source_table
source_id
linked_risk_id
linked_event_id
linked_evidence_id
```

## 6.3 Enterprise Cross-System Guard e-SIGAP ↔ e-Pelara

Sebelum membuat migration, model, helper, service, controller, routes, atau frontend MR e-SIGAP, wajib menjaga kontrak lintas sistem berikut.

1. Source of Truth

e-SIGAP adalah source of truth untuk:

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

e-Pelara adalah source of truth untuk:

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
- planning monitoring.

2. Larangan e-SIGAP

MR e-SIGAP DILARANG:

- membuat planning risk master;
- membuat indikator Renstra;
- membuat target/pagu governance;
- membuat LAKIP/LK governance;
- mengubah langsung tabel planning e-Pelara;
- membuat duplicate planning dashboard;
- membuat duplicate audit planning;
- membuat duplicate approval planning;
- membuat integration tanpa audit trail.

3. Kewajiban e-SIGAP

MR e-SIGAP WAJIB:

- menjaga SPIP existing;
- memakai spip_risk_register;
- memakai spip_rtp;
- memakai spip_monitoring;
- memakai spip_evidence_link;
- menjaga FK SPIP;
- validasi polymorphic evidence di service/controller;
- mengirim verified output jika berhubungan dengan e-Pelara;
- memakai audit trail lintas sistem.

4. Cross-System Code Standard

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

5. Cross-System Link Field Standard

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

Jika linkage ke SPIP, gunakan field:

- linked_spip_risk_id
- linked_spip_rtp_id
- linked_spip_monitoring_id
- linked_spip_evidence_id

Field lama seperti:

- linked_risk_id
- linked_event_id
- linked_evidence_id

hanya boleh dipahami sebagai istilah konseptual, bukan field teknis utama jika model memakai field spesifik.

6. Verified Output Rule

e-SIGAP hanya boleh mengirim output verified ke e-Pelara.

Output verified dapat berupa:

- status RTP;
- status monitoring SPIP;
- evidence verified;
- operational risk status;
- escalation status;
- rekomendasi pengendalian;
- status tindak lanjut operasional.

e-SIGAP tidak boleh mengambil alih planning governance ketika mengirim output tersebut.

7. Planning Context Reader Rule

Folder:

07-integrasi-e-pelara-planning/

hanya boleh digunakan untuk:

- membaca context planning;
- membaca reference planning;
- membaca planning risk linkage;
- membaca LAKIP/LK context;
- mengirim verified output.

DILARANG digunakan untuk:

- membuat planning master;
- membuat indikator;
- membuat target;
- membuat pagu;
- membuat LAKIP/LK governance baru.

Dampak:

Backend:
- Service/controller e-SIGAP tetap fokus operational/SPIP.

Database:
- Tidak ada perubahan struktur.

Workflow:
- e-SIGAP hanya membaca context planning dan mengirim output verified.

Governance:
- Tidak ada duplikasi domain e-Pelara.

## 6.4 Continuity State Implementasi MR e-SIGAP

State implementasi MR e-SIGAP saat ini:

PHASE 1 — FOUNDATION ANALYSIS
🟡 perlu audit lanjutan

Yang sudah tersedia:
- Blueprint MR e-SIGAP
- Roadmap MR e-SIGAP
- Prompt Teknis MR e-SIGAP
- Database aktif:
  DB_NAME=sigap
  DB_USER=sekretaris

PHASE 2 — MR FOUNDATION DESIGN
🟡 sebagian tersedia

Yang sudah tersedia:
- operational governance domain;
- SPIP governance domain;
- e-Pelara sebagai planning context/source;
- struktur folder integrasi e-Pelara planning.

Yang belum dikunci:
- ERD detail MR operational;
- governance relation detail MR operational;
- migration foundation MR operational.

PHASE 3 — DATABASE FOUNDATION
🟡 sebagian tersedia

Yang sudah tersedia:
- spip_risk_register;
- spip_rtp;
- spip_monitoring;
- spip_evidence_link;
- FK spip_rtp.risk_id → spip_risk_register.id;
- FK spip_monitoring.risk_id → spip_risk_register.id.

Yang belum dibuat:
- tabel MR operational enterprise setara e-Pelara;
- operational risk history;
- operational dashboard summary;
- operational warning;
- operational escalation;
- operational snapshot jika diperlukan.

PHASE 4 — BACKEND FOUNDATION
⏳ belum dimulai

Yang belum dibuat:
- model MR operational;
- association MR operational;
- reusable helper;
- reusable service;
- controller;
- routes.

Guard:
- Jangan menganggap e-SIGAP sudah setara implementasi dengan e-Pelara.
- Jika mulai implementasi e-SIGAP, wajib mulai dari audit existing database/model terlebih dahulu.
- Gunakan pola e-Pelara sebagai referensi reusable jika cocok, tetapi jangan copy domain planning ke e-SIGAP.

---

# 7. PRINSIP IMPLEMENTASI WAJIB

WAJIB:

- menjaga workflow governance;
- menjaga approval chain;
- menjaga traceability;
- menjaga auditability;
- menjaga event monitoring;
- menjaga realtime monitoring;
- menjaga konsistensi workflow;
- menjaga ownership;
- menjaga escalation monitoring.

---

# 8. DILARANG KERAS

DILARANG:

- bypass workflow;
- bypass approval;
- bypass escalation;
- hard delete history;
- duplicate monitoring;
- membuat dashboard langsung dari raw table besar;
- membuat aggregation besar di frontend;
- membuat endpoint tanpa audit trail;
- membuat perubahan tanpa update dokumen;
- membuat struktur baru tanpa update roadmap.

---

# 9. RULE IMPLEMENTASI

Setiap perubahan:

- WAJIB update Blueprint MR e-SIGAP;
- WAJIB update Roadmap MR e-SIGAP;
- WAJIB update Prompt Teknis MR e-SIGAP;
- WAJIB menjelaskan dampak perubahan;
- WAJIB menjaga backward compatibility jika memungkinkan.

---

# 10. FORMAT UPDATE DOKUMEN

Setiap update wajib menggunakan format:

```text
UPDATE [NAMA UPDATE]
```

---

## 10.1 Tujuan

Menjelaskan fungsi update.

---

## 10.2 Tempat Penempatan

```text
SETELAH bagian:
"..."

ATAU

SEBELUM bagian:
"..."
```

---

## 10.3 Isi Update

Bagian siap copy-paste.

---

## 10.4 Dampak

Wajib menjelaskan dampak terhadap:

- backend;
- frontend;
- database;
- workflow;
- dashboard.

---

# 11. STRATEGI IMPLEMENTASI WAJIB

Urutan implementasi wajib:

1. Blueprint governance;
2. Roadmap teknis;
3. Event monitoring structure;
4. Database structure;
5. Workflow monitoring;
6. Audit & history;
7. Backend foundation;
8. Frontend foundation;
9. Dashboard;
10. Warning system;
11. Hardening & UAT.

DILARANG langsung membuat dashboard besar sebelum foundation selesai.

---

# 12. STANDAR ENTERPRISE WAJIB

Semua modul MR e-SIGAP wajib memiliki:

- history;
- revisi;
- approval;
- audit trail;
- ownership;
- warning system;
- monitoring;
- event logging;
- escalation monitoring;
- dashboard monitoring.

---

# 13. ENTERPRISE EVENT MONITORING

Semua aktivitas operasional dapat menjadi risk event.

| Event | Risiko |
|---|---|
| overdue task | keterlambatan |
| approval bypass | tata kelola |
| escalation gagal | koordinasi |
| duplicate task | workflow |
| stok negatif | distribusi |
| data inflasi terlambat | monitoring |
| approval terlambat | governance |

---

## 13.1 Prinsip Event Governance

Implementasi wajib mempertahankan:

- event traceability;
- auditability;
- realtime monitoring.

---

# 14. STRATEGI AUDIT

Semua perubahan wajib:

- memiliki actor;
- memiliki timestamp;
- memiliki before_json;
- memiliki after_json;
- memiliki approval status;
- memiliki escalation note.

---

## 14.1 Unified Actor Governance

Semua audit lintas sistem wajib menggunakan actor identity yang konsisten.

Actor wajib:

```text
actor_user_id
actor_name
actor_role
actor_division
actor_system
actor_ip
actor_device
```

---

## 14.2 Prinsip Audit

Audit lintas:

- e-Pelara;
- e-SIGAP;
- SPIP;
- LAKIP;
- LK;
- workflow operasional;

harus dapat ditelusuri menggunakan actor yang sama.

---

## 14.3 Larangan Audit

DILARANG:

- actor anonim;
- actor tidak konsisten;
- audit tanpa ownership;
- audit tanpa timestamp.

---

# 15. STRATEGI KONTINUITAS

Jika pindah:

- chat;
- fase implementasi;
- developer;
- session AI;

maka:

- jangan mulai dari nol;
- lanjutkan dari Blueprint, Roadmap, dan Prompt terbaru;
- pertahankan seluruh guard implementasi.

---

# 16. TARGET AKHIR

Target akhir implementasi adalah membangun:

```text
SMART ENTERPRISE OPERATIONAL GOVERNANCE SYSTEM
```

yang:

- realtime;
- audit-ready;
- scalable;
- governance-ready;
- AI-ready;
- dan mampu memonitor operasional organisasi secara menyeluruh.

---

# 17. DEFINITION OF SUCCESS

Implementasi dianggap berhasil jika:

- workflow termonitor;
- overdue termonitor;
- escalation termonitor;
- approval termonitor;
- dashboard realtime;
- warning otomatis berjalan;
- audit trail lengkap;
- histori lengkap;
- pimpinan dapat memonitor operasional realtime;
- governance operasional menjadi terukur.