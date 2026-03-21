# Week 07 Execution Sheet

- Phase: Phase 2 (HIGH (Week 5-8))
- Week: 7
- Date Range: 2026-05-04 to 2026-05-10
- Focus: Bidang Ketersediaan, Bidang Distribusi + penguatan UPTD
- Target: Kendalikan isu TINGGI pada dashboard, integrasi, dan data scope
- Exit Criteria: Gate 2 lulus

## Monday Prioritization (10-15 item)

| No | Priority Item | Role | Module/Endpoint | Owner | Status |
|---|---|---|---|---|---|
| 1 | [#33][PLAN] Analisis acceptance criteria: CPPD system integration missing | BIDANG DISTRIBUSI PANGAN | API/Contract | FE Lead | Planned |
| 2 | [#49][BUILD] Implementasi perbaikan: Master-data layanan count internal mismatch | UPTD BALAI PENGAWASAN MUTU ... | Data Integrity | FE Lead | Planned |
| 3 | [#17][BUILD] Implementasi perbaikan: Field mapping path mismatch (FIELDS_SEKRETARIAT/SEK-\*.csv) | SEKRETARIAT | Data Integrity | FE Lead | Planned |
| 4 | [#20][BUILD] Implementasi perbaikan: Approval workflow UI incomplete (no approve/reject buttons) | SEKRETARIAT | API/Contract | FE Lead | Planned |
| 5 | [#27][BUILD] Implementasi perbaikan: Bidang-level data scope not enforced | BIDANG KETERSEDIAAN PANGAN | Auth/RBAC | Squad Lead | Planned |
| 6 | [#50][BUILD] Implementasi perbaikan: Field mapping path convention (FIELDS_UPTD/ vs FIELDS/) | UPTD BALAI PENGAWASAN MUTU ... | Data Integrity | FE Lead | Planned |
| 7 | [#3][BUILD] Implementasi perbaikan: IP whitelisting tidak enforced | SUPER ADMIN | Auth/RBAC | BE Lead | Planned |
| 8 | [#4][BUILD] Implementasi perbaikan: API rate limiting partial | SUPER ADMIN | API/Contract | BE Lead | Planned |
| 9 | [#9][BUILD] Implementasi perbaikan: Historical KPI trend missing | KEPALA DINAS / GUBERNUR | Data Integrity | FE Lead | Planned |
| 10 | [#18][BUILD] Implementasi perbaikan: Cross-modul validation rules missing | SEKRETARIAT | Core Workflow | BE Lead | Planned |
| 11 | [#19][BUILD] Implementasi perbaikan: Data masking untuk salary belum ada | SEKRETARIAT | Data Integrity | Squad Lead | Planned |
| 12 | [#25][BUILD] Implementasi perbaikan: Kerawanan index formula tidak dokumentasi | BIDANG KETERSEDIAAN PANGAN | Core Workflow | FE Lead | Planned |

## Tuesday-Thursday Delivery

### Tuesday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Implement: Analisis acceptance criteria: CPPD system integration missing | Implement | FE Lead | PR/Commit | Planned |
| 2 | Implement: Implementasi perbaikan: Master-data layanan count internal... | Implement | FE Lead | PR/Commit | Planned |
| 3 | Implement: Implementasi perbaikan: Field mapping path mismatch (FIELD... | Implement | FE Lead | PR/Commit | Planned |

### Wednesday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Test: Implementasi perbaikan: Approval workflow UI incomplete (no app... | Test | FE Lead | Test log | Planned |
| 2 | Test: Implementasi perbaikan: Bidang-level data scope not enforced | Test | Squad Lead | Test log | Planned |
| 3 | Test: Implementasi perbaikan: Field mapping path convention (FIELDS_U... | Test | FE Lead | Test log | Planned |

### Thursday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Review: Implementasi perbaikan: IP whitelisting tidak enforced | Review | BE Lead | Review note | Planned |
| 2 | Review: Implementasi perbaikan: API rate limiting partial | Review | BE Lead | Review note | Planned |
| 3 | Review: Implementasi perbaikan: Historical KPI trend missing | Review | FE Lead | Review note | Planned |

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
