SIGAP NATIONAL GOVTECH SOFTWARE FACTORY (NGSF)

Tujuan platform ini:

Generate 200+ modul layanan dinas otomatis

Generate dashboard SPBE

Generate API integrasi antar OPD

Generate workflow lintas instansi

Menjadikan SIGAP sebagai GovTech platform

Tetapi kita tidak menjalankan semuanya sekaligus.
Kita pecah menjadi 8 MODE kecil sehingga:

Copilot tidak overload

perubahan kecil dan aman

mudah rollback via git

waktu tunggu pendek

Biasanya tiap MODE 30 detik – 2 menit.

ARSITEKTUR EXECUTION NGSF

Urutan eksekusi:

MODE 1 — National Platform Scan
MODE 2 — Government Domain Mapping
MODE 3 — National Module Registry
MODE 4 — Service Module Auto Generation
MODE 5 — Cross-Agency Workflow Engine
MODE 6 — Inter-OPD API Integration
MODE 7 — SPBE Dashboard Generator
MODE 8 — National GovTech Factory Report

MODE 1
NATIONAL PLATFORM SCAN

Tujuan:

membaca seluruh arsitektur SIGAP

memverifikasi komponen factory

Tidak mengubah kode.

Prompt:

You are operating as the SIGAP NATIONAL GOVTECH SOFTWARE FACTORY.

All explanations MUST be written in Bahasa Indonesia.
All source code MUST remain in English.

---

EXECUTION MODE

NATIONAL PLATFORM SCAN

Do NOT modify any files.

---

Scan repository architecture.

Analyze directories:

backend/controllers
backend/models
backend/routes
backend/services
backend/services/modules
frontend/src/pages
frontend/src/services
docs/api
.github/agents

Detect existing modules using pattern:

<DOMAIN>-<CODE>

Examples:

SEK-ADM
SEK-KEU
BKT-KBJ
BDS-HRG
BKS-DVR

---

Validate existence of core engines:

workflowEngine.js
rbacMiddleware.js
dashboardService.js
moduleGeneratorService.js
generateOpenApi.js

---

OUTPUT

Produce report:

SIGAP NATIONAL PLATFORM ARCHITECTURE REPORT

Include:

modules detected
controllers
models
routes
frontend pages
services
factory engines

Durasi biasanya < 1 menit.

MODE 2
GOVERNMENT DOMAIN MAPPING

Tujuan:

membangun peta struktur OPD nasional.

Contoh domain:

SEK Sekretariat
BKT Ketersediaan
BKS Konsumsi
BDS Distribusi
UPT Unit Pelaksana Teknis

Prompt:

Continue operating as SIGAP NATIONAL GOVTECH SOFTWARE FACTORY.

EXECUTION MODE

GOVERNMENT DOMAIN MAPPING

Do NOT modify existing modules.

---

Analyze module prefixes.

Map domains:

SEK → Sekretariat
BKT → Ketersediaan
BKS → Konsumsi
BDS → Distribusi
UPT → Unit Pelaksana Teknis

---

Build domain registry containing:

domain
responsible agency
module count
services provided

---

OUTPUT

Produce report:

SIGAP GOVERNMENT DOMAIN REGISTRY

Durasi 30–60 detik.

MODE 3
NATIONAL MODULE REGISTRY

Tujuan:

membangun peta seluruh modul layanan.

Prompt:

Continue operating as SIGAP NATIONAL GOVTECH SOFTWARE FACTORY.

EXECUTION MODE

NATIONAL MODULE REGISTRY

---

Build module registry for all detected modules.

For each module record:

moduleKey
domain
controller
model
routes
service
frontend pages
workflow integration
RBAC integration

---

Mark modules missing components.

---

OUTPUT

SIGAP NATIONAL MODULE REGISTRY REPORT

Include:

total modules
modules complete
modules missing services
modules missing frontend
modules missing workflow
modules missing RBAC

Durasi 1 menit.

MODE 4
SERVICE MODULE AUTO GENERATION

Ini yang membuat 200+ layanan otomatis.

Tetapi incremental.

Prompt:

Continue operating as SIGAP NATIONAL GOVTECH SOFTWARE FACTORY.

EXECUTION MODE

SERVICE MODULE AUTO GENERATION

SAFE INCREMENTAL MODE.

Rules:

Do NOT overwrite existing modules.
Generate only missing components.

---

For each module ensure existence of:

model
controller
route
service

If missing generate using architecture pattern used in repository.

Service files must be placed in:

backend/services/modules/

Routes must follow:

/api/<module-key>

---

Generate modules gradually.

Do not regenerate modules already complete.

---

OUTPUT

SIGAP SERVICE MODULE GENERATION REPORT

Durasi 1–3 menit.

MODE 5
CROSS-AGENCY WORKFLOW ENGINE

Ini fitur lintas instansi.

Contoh:

UPT → BKT → BDS → SEK

Prompt:

Continue operating as SIGAP NATIONAL GOVTECH SOFTWARE FACTORY.

EXECUTION MODE

CROSS AGENCY WORKFLOW ENGINE

---

Extend workflowEngine to support cross-agency workflows.

States:

draft
submitted
review
approved
rejected

---

Allow transitions between domains.

Example:

UPT submission
→ BKT review
→ BDS verification
→ SEK approval

---

Persist workflow in:

WorkflowInstance
WorkflowHistory

---

Do not break existing workflows.

---

OUTPUT

SIGAP CROSS AGENCY WORKFLOW REPORT

Durasi 1–2 menit.

MODE 6
INTER-OPD API INTEGRATION

Ini membuat API antar dinas.

Prompt:

Continue operating as SIGAP NATIONAL GOVTECH SOFTWARE FACTORY.

EXECUTION MODE

INTER OPD API INTEGRATION

---

Generate integration endpoints allowing modules to share data.

Example:

/api/integration/bkt-kbj
/api/integration/bds-hrg
/api/integration/sek-keu

---

Ensure authentication using RBAC middleware.

---

Update OpenAPI specification:

docs/api/openapi.yaml

---

OUTPUT

SIGAP INTER OPD API REPORT

Durasi 1 menit.

MODE 7
SPBE DASHBOARD GENERATOR

Ini menghasilkan dashboard nasional SPBE.

Prompt:

Continue operating as SIGAP NATIONAL GOVTECH SOFTWARE FACTORY.

EXECUTION MODE

SPBE DASHBOARD GENERATOR

---

Extend dashboardService.

Aggregate metrics across modules.

Metrics:

total_records
active_workflows
approved_items
rejected_items

---

Generate aggregated endpoint:

/api/dashboard/spbe-summary

---

Frontend dashboards must display:

service performance
workflow performance
agency activity

---

OUTPUT

SIGAP SPBE DASHBOARD REPORT

Durasi 1 menit.

MODE 8
NATIONAL GOVTECH FACTORY REPORT

Prompt terakhir.

Continue operating as SIGAP NATIONAL GOVTECH SOFTWARE FACTORY.

EXECUTION MODE

FINAL NATIONAL GOVTECH FACTORY REPORT

---

Analyze repository after factory activation.

---

Measure:

total modules
modules generated
workflow integrations
RBAC integrations
OpenAPI endpoints
dashboard metrics
API integrations

---

OUTPUT

SIGAP NATIONAL GOVTECH SOFTWARE FACTORY REPORT

Include:

files created
files modified
files skipped

---

Estimate final score:

SIGAP GOVTECH PLATFORM READINESS (0–100)
URUTAN EKSEKUSI YANG DIREKOMENDASIKAN

Jalankan satu per satu:

MODE 1
MODE 2
MODE 3
MODE 4
MODE 5
MODE 6
MODE 7
MODE 8

Total waktu biasanya:

7 – 12 menit.

Dengan Struktur Repo Anda Saat Ini

Berdasarkan commit yang Anda kirim:

148 files changed
42k+ lines
workflow engine
RBAC
dashboard
module generator
OpenAPI
agents orchestration

Estimasi saya:

SIGAP GovTech readiness sekarang ≈ 78%

Jika seluruh MODE selesai:

SIGAP GovTech readiness ≈ 95–97%

Artinya SIGAP berubah dari:

aplikasi dinas → platform GovTech.
