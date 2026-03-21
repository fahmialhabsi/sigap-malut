# Week 05 Execution Sheet

- Phase: Phase 2 (HIGH (Week 5-8))
- Week: 5
- Date Range: 2026-04-20 to 2026-04-26
- Focus: Bidang Ketersediaan, Bidang Distribusi + penguatan UPTD
- Target: Kendalikan isu TINGGI pada dashboard, integrasi, dan data scope
- Exit Criteria: Gate 2 lulus

## Monday Prioritization (10-15 item)

| No | Priority Item | Role | Module/Endpoint | Owner | Status |
|---|---|---|---|---|---|
| 1 | [#49][PLAN] Analisis acceptance criteria: Master-data layanan count internal mismatch | UPTD BALAI PENGAWASAN MUTU ... | Data Integrity | FE Lead | Planned |
| 2 | [#17][PLAN] Analisis acceptance criteria: Field mapping path mismatch (FIELDS_SEKRETARIAT/SEK... | SEKRETARIAT | Data Integrity | FE Lead | Planned |
| 3 | [#20][PLAN] Analisis acceptance criteria: Approval workflow UI incomplete (no approve/reject ... | SEKRETARIAT | API/Contract | FE Lead | Planned |
| 4 | [#27][PLAN] Analisis acceptance criteria: Bidang-level data scope not enforced | BIDANG KETERSEDIAAN PANGAN | Auth/RBAC | Squad Lead | Planned |
| 5 | [#50][PLAN] Analisis acceptance criteria: Field mapping path convention (FIELDS_UPTD/ vs FIEL... | UPTD BALAI PENGAWASAN MUTU ... | Data Integrity | FE Lead | Planned |
| 6 | [#3][PLAN] Analisis acceptance criteria: IP whitelisting tidak enforced | SUPER ADMIN | Auth/RBAC | BE Lead | Planned |
| 7 | [#4][PLAN] Analisis acceptance criteria: API rate limiting partial | SUPER ADMIN | API/Contract | BE Lead | Planned |
| 8 | [#9][PLAN] Analisis acceptance criteria: Historical KPI trend missing | KEPALA DINAS / GUBERNUR | Data Integrity | FE Lead | Planned |
| 9 | [#18][PLAN] Analisis acceptance criteria: Cross-modul validation rules missing | SEKRETARIAT | Core Workflow | BE Lead | Planned |
| 10 | [#19][PLAN] Analisis acceptance criteria: Data masking untuk salary belum ada | SEKRETARIAT | Data Integrity | Squad Lead | Planned |
| 11 | [#25][PLAN] Analisis acceptance criteria: Kerawanan index formula tidak dokumentasi | BIDANG KETERSEDIAAN PANGAN | Core Workflow | FE Lead | Planned |
| 12 | [#39][PLAN] Analisis acceptance criteria: Survey data model underspecified | BIDANG KONSUMSI & KEAMANAN ... | Data Integrity | Squad Lead | Planned |

## Tuesday-Thursday Delivery

### Tuesday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Implement: Analisis acceptance criteria: Master-data layanan count in... | Implement | FE Lead | PR/Commit | Planned |
| 2 | Implement: Analisis acceptance criteria: Field mapping path mismatch ... | Implement | FE Lead | PR/Commit | Planned |
| 3 | Implement: Analisis acceptance criteria: Approval workflow UI incompl... | Implement | FE Lead | PR/Commit | Planned |

### Wednesday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Test: Analisis acceptance criteria: Bidang-level data scope not enforced | Test | Squad Lead | Test log | Planned |
| 2 | Test: Analisis acceptance criteria: Field mapping path convention (FI... | Test | FE Lead | Test log | Planned |
| 3 | Test: Analisis acceptance criteria: IP whitelisting tidak enforced | Test | BE Lead | Test log | Planned |

### Thursday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Review: Analisis acceptance criteria: API rate limiting partial | Review | BE Lead | Review note | Planned |
| 2 | Review: Analisis acceptance criteria: Historical KPI trend missing | Review | FE Lead | Review note | Planned |
| 3 | Review: Analisis acceptance criteria: Cross-modul validation rules mi... | Review | BE Lead | Review note | Planned |

## Friday 3-Hour Audit Session

| No | Slot | Focus | Output | Done |
|---|---|---|---|---|
| 1 | 00:00-01:00 | Akses, login lintas role, routing, RBAC | Bukti login, route pass, dan hasil uji akses terlarang | [ ] |
| 2 | 01:00-02:00 | Workflow Draft-Submit-Approve, integritas data, audit log | Jejak status workflow, validasi data, dan evidence audit log | [ ] |
| 3 | 02:00-03:00 | Validasi endpoint prioritas, klasifikasi temuan, keputusan gate | Rekap temuan KRITIS/TINGGI/SEDANG dan keputusan Pass/Conditional/Fail | [ ] |

## Gate Decision

| Decision | Check |
|---|---|
| Pass | [ ] |
| Conditional | [ ] |
| Fail | [ ] |

## Findings Summary

| Severity | Count | Notes |
|---|---|---|
| KRITIS | 0 | |
| TINGGI | 0 | |
| SEDANG | 0 | |

## Follow Up Commitments

| Item | Owner | Due Date | Status |
|---|---|---|---|
| TBD | TBD | TBD | Open |
