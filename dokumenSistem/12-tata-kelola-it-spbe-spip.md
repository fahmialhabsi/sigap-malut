# 12 - IT Governance: SPBE ↔ SPIP Alignment (SIGAP‑MALUT ⟷ e‑Pelara)

Versi: 2026-03-21
Penulis: Sistem / Tim Integrasi
Tujuan: Melengkapi dan memperjelas peta keterkaitan antara domain regulasi SPBE (Arsitektur Layanan Pemerintah Elektronik) dan SPIP (Sistem Pengendalian Intern Pemerintah) terhadap artefak yang ada di repositori SIGAP‑MALUT dan e‑Pelara, status saat ini, gap utama, serta rekomendasi tindakan operasional agar integrasi antar-sistem berjalan aman, auditable, dan dapat dideploy.

## Petunjuk Penggunaan Dokumen

- Dokumen ini dimaksudkan sebagai panduan kerja untuk developer, DevOps, dan auditor teknis.
- Gunakan kolom "Rekomendasi/Tindakan" sebagai checklist kerja (issues/PR) dan isi "Pemilik" saat ditugaskan.
- Setelah tindakan selesai, perbarui kolom "Status" dan "Keterangan Gap".

## Ringkasan

Status umum: banyak artefak fungsional (API, controllers, DB dump, docker-compose) tersedia; dokumen arsitektur sistem, security design, dan beberapa kontrol SPIP formal belum lengkap atau belum terdokumentasi di repo. Perlu prioritas pada Arsitektur, Keamanan Informasi, IAM, dan Proses Migrasi DB agar integrasi produksi aman.

## Tabel Alignment Detail

| Domain Regulasi / Area                  | Dokumen / Artefak terkait (repo path atau catatan)                                                                                                                | Status saat ini                                                   | Keterangan gap (singkat)                                                                                                             | Rekomendasi / Tindakan prioritas                                                                                                                                                                                            | Pemilik                  | Prioritas |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | --------- |
| SPBE — Arsitektur Sistem                | dokumenSistem/13-System-Architecture-Document.md (sudah ada, perlu dilengkapi) — docker-compose.yml (e-pelara), deploy/nginx.conf (usulan), backend Dockerfile(s) | Partially (artefak teknis ada tapi belum lengkap terpusat)        | Dokumen arsitektur ada namun belum menjelaskan boundary lengkap, dependensi produk (SIGAP vs e‑Pelara), dan opsi deployment produksi | Lengkapi 13-System-Architecture-Document.md: tambahkan komponen (frontend, backend, DB, redis, proxy), network, ports, envs, dependensi antar-layanan, diagram deployment (dev/staging/prod), dan rencana high-availability | Arsitek / Lead Dev       | Tinggi    |
| SPBE — Layanan (Service Registry)       | config/serviceRegistry.json (sigap-malut), dokumenSistem/06-Master-Data-Layanan.md                                                                                | Sudah (serviceRegistry.json ada)                                  | Perlu sinkronisasi versi, owner service, SLA formal, API contracts                                                                   | Validasi dan publish service registry sebagai sumber kebenaran; tambahkan `apiBase`, `openapi_url`, `owner`, `contact`, `version`                                                                                           | Product Owner            | Sedang    |
| SPBE — Manajemen Data                   | dokumenSistem/07-Data-Dictionary.md                                                                                                                               | Sudah (tumpang tindih di e‑Pelara; SIGAP perlu adopsi)            | SIGAP pakai sqlite di config; schema tidak seragam antar layanan                                                                     | Konsolidasikan data dictionary: perbarui 07-Data-Dictionary.md yang memetakan tabel/field relevan (users, approval_log, workflow, layanan) dan versi                                                                        | DB Engineer              | Tinggi    |
| SPBE — Keamanan Informasi               | dokumenSistem/17-Keamanan-Informasi-Lengkap.md (sudah ada, perlu diperkuat)                                                                                       | Partially (security architecture ada tapi tidak lengkap)          | Belum ada threat model, penjelasan key rotation, dan CORS policy terperinci                                                          | Perkuat 17-Keamanan-Informasi-Lengkap.md: auth model (JWT), key rotation, RBAC, CORS, transport TLS, secret store rekomendasi                                                                                               | Security Lead / DevOps   | Tinggi    |
| SPIP — Risiko                           | dokumenSistem/16-Audit-Gap-Resmi-SIGAP-MALUT.md, dokumenSistem/19-Operations-Runbook.md                                                                           | Partially                                                         | Risiko integrasi (DB mismatch, data leak, downtime) belum semuanya teridentifikasi                                                   | Lakukan risk assessment integrasi dan perbarui register risiko (likelihood, impact, mitigasi)                                                                                                                               | PM / Risk Owner          | Tinggi    |
| SPIP — Kontrol Internal                 | dokumenSistem/08-Workflow-Specification.md, backend/controllers/\* (approvalLog, approvalWorkflow)                                                                | Sudah / Dalam Proses (beberapa controller & routes ada/untracked) | Perlu SOP pengendalian (who can approve, auditability) dan enforceable controls di API                                               | Finalisasi workflow spec, implement role checks, buat integration tests yang memverifikasi kontrol                                                                                                                          | Dev Lead                 | Tinggi    |
| SPIP — Audit Trail dan Auditability     | backend/controllers/approvalLog.js, backend/routes/approvalWorkflow.js, frontend/src/pages/ApprovalWorkflowPage.jsx                                               | Sudah (audit/approval log code exists)                            | Format log dan retention belum ditentukan; beberapa routes belum terdokumentasi                                                      | Standardisasi audit log format (timestamp, user, action, resource, before/after), konfigurasi retention, central logging (ELK/Loki), dan endpoint export untuk auditor                                                      | Dev / Ops                | Tinggi    |
| SPBE — Identitas & Akses (IAM)          | envs: AUTH_JWT_SECRET (usulan), auth middleware (backend/middleware/auth.js)                                                                                      | Partially                                                         | Tidak ada centralized IAM / SSO; role mapping present in serviceRegistry but not enforced cross-service                              | Pilih model IAM (OIDC/Keycloak) atau shared JWT strategy; dokumentasikan roles mapping dan enforce via middleware                                                                                                           | Security / Dev           | Tinggi    |
| SPBE — Ketersediaan & Continuity        | dokumenSistem/19-Operations-Runbook.md, dokumenSistem/18-Deployment-Production-Guide.md                                                                           | Partially (backup policy ada di runbook)                          | Tidak ada backup/restore process yang teruji untuk DB produksi; sqlite unsuitable for prod                                           | Lakukan backup drill, gunakan managed DB atau scheduled dump + offsite backup; validasi RTO/RPO yang sudah ditetapkan                                                                                                       | Ops                      | Tinggi    |
| SPBE — Observability (Logging, Metrics) | tidak ada central logging config, proposal ELK/Prometheus                                                                                                         | Belum Ada                                                         | No central logging/tracing; hard to audit cross-service flows                                                                        | Implement centralized logs (ELK/Loki), basic metrics + health endpoints, dan tracing (OpenTelemetry)                                                                                                                        | DevOps                   | Sedang    |
| SPBE — Change Management / Deployment   | dokumenSistem/18-Deployment-Production-Guide.md, migrations/ (Sequelize), docker/Dockerfile                                                                       | Partially (migrations exist, runbook ada)                         | Perlu checklist rollback dan migration window yang lebih ketat                                                                       | Perbarui deployment runbook: pre-migration backup, migration window, smoke tests, rollback steps                                                                                                                            | DevOps / Release Manager | Sedang    |
| SPIP — Kontrol Perubahan & Konfigurasi  | scripts/, migrations/, .env.example (absent)                                                                                                                      | Belum Lengkap                                                     | Tidak ada consistent configuration management practice (no .env.example, no secrets management)                                      | Add `.env.example`, document per-environment configs, dan gunakan secret manager di prod                                                                                                                                    | DevOps                   | Sedang    |
| SPIP — Kepatuhan Data Pribadi           | db_epelara.sql (contains data), privacy docs absent                                                                                                               | Belum Ada                                                         | Data dump in repo can contain sensitive data; no data handling policy                                                                | Remove sensitive dumps from repo atau mark `docs/private`; buat Data Protection policy dan sanitise dumps                                                                                                                   | Legal / PO               | Tinggi    |
| SPBE — API Contracts & Versioning       | dokumenSistem/openapi.yaml (sudah ada, perlu diperluas)                                                                                                           | Partially (1 path terdokumentasi)                                 | Belum ada coverage OpenAPI untuk endpoint integrasi kritis                                                                           | Perluas openapi.yaml untuk mencakup endpoint auth, workflow, audit log, approval, dan layanan                                                                                                                               | Dev                      | Tinggi    |
| SPBE — Service Level & SLA              | config/serviceRegistry.json (SLA field tersedia)                                                                                                                  | Partially                                                         | SLA present in registry but not monitored                                                                                            | Define monitoring/alerting untuk SLA dan tambahkan SLO/SLA dashboards                                                                                                                                                       | PO / Ops                 | Sedang    |

## Penjelasan Kolom dan Aturan Penempatan Artefak

- **Dokumen/Artefak terkait**: letakkan path file bila sudah ada; jika belum ada, tetapkan nama file target di repo `sigap-malut/dokumenSistem/`.
- **Status** dapat bernilai: "Sudah", "Belum Ada", "Partially", "Planned".
- **Prioritas**: Tinggi (buat segera), Sedang (2–4 minggu), Rendah (backlog).

## Checklist Tindakan Segera (First 30 Days)

1. Lengkapi **13-System-Architecture-Document.md** di `dokumenSistem/` — sertakan diagram, komponen, ports, env, dependensi antar-repo.
2. Perkuat **17-Keamanan-Informasi-Lengkap.md** yang memuat auth model, TLS, secrets, RBAC mapping, dan threat model.
3. Perbarui **Data Dictionary** (`07-Data-Dictionary.md`) berdasarkan `db_epelara.sql` dan model SIGAP.
4. Perluas **OpenAPI** (`dokumenSistem/openapi.yaml`) untuk endpoint integrasi kritis — minimal 10 path.
5. Tambah `.env.example` di kedua repo dan document env yang wajib.
6. Pastikan audit logging standard (format) diterapkan di semua endpoint yang mengubah state (approval, workflow).
7. Hapus atau sanitasi dump DB sensitif dari repo publik; simpan contoh schema-only dumps jika perlu.

## Artefak yang Perlu Diperbarui atau Ditambahkan

- dokumenSistem/13-System-Architecture-Document.md (SUDAH ADA — lengkapi)
- dokumenSistem/17-Keamanan-Informasi-Lengkap.md (SUDAH ADA — perkuat)
- dokumenSistem/07-Data-Dictionary.md (SUDAH ADA — perbarui)
- dokumenSistem/openapi.yaml (SUDAH ADA — perluas ≥10 path)
- dokumenSistem/18-Deployment-Production-Guide.md (SUDAH ADA — tambah rollback checklist)
- .env.example (root of each repo — NEW)
- compliance/data-protection-policy.md (NEW)

## Panduan Singkat untuk Developer

- Selalu sertakan komentar tugas pada file sebelum memanggil Copilot, mis:
  - `// TASK: Implement epelara client submitForApproval(payload) -> POST /api/approvalworkflow`
  - Sertakan contoh payload dan nama file OpenAPI untuk referensi.
- Saat membuat migration, gunakan nama yang deskriptif dan include `down()` implementation.
- Untuk setiap endpoint integrasi, referensikan OpenAPI path dan expected response codes — simpan file OpenAPI di repo supaya Copilot dapat membaca context.
- Buat small focused commits: `feat(integration): add epelara client submitForApproval` dan PR dengan checklist testing/migration notes.

## Template Cepat untuk Issue/Task

```
Title: feat(integration): add e‑Pelara approval client to SIGAP
Body:
  - Summary: implement client wrapper to call e‑Pelara /api/approvalworkflow
  - Contract: refer dokumenSistem/openapi.yaml path /api/approvalworkflow (POST)
  - Payload example: { user: { username }, modulId, dataId, detail }
  - Tests: unit + integration (docker-compose.dev.yml smoke test)
  - Migration: none
  - Rollback: revert commit
  - Assignee: @...
```

## Penutup

- Integrasi dapat dilakukan secara bertahap: mulai dari dev environment bersama (docker-compose) → generate OpenAPI → implement client di SIGAP → run integration tests → deployment dengan runbook dan backups.
- Dokumentasi (arsitektur + security + data dictionary + OpenAPI) harus diselesaikan sebelum integrasi produksi untuk menghindari risiko operasional dan kepatuhan.
- Dokumen ini merupakan bagian dari matriks governance yang merujuk ke 21-Compliance-Matrix-SPBE-SPIP.md sebagai baseline kepatuhan resmi.

---

_Dokumen ini merupakan bagian dari rangkaian dokumen sistem SIGAP-MALUT (dokumen ke-12) dan berpasangan dengan 21-Compliance-Matrix-SPBE-SPIP.md._
