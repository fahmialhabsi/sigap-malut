# Week 02 Execution Sheet

- Phase: Phase 1 (CRITICAL (Week 1-4))
- Week: 2
- Date Range: 2026-03-30 to 2026-04-05
- Focus: Super Admin, Sekretariat, UPTD + partial bidang routing
- Target: Tutup isu KRITIS prioritas dan stabilkan akses inti lintas role kunci
- Exit Criteria: Gate 1 lulus

## Monday Prioritization (10-15 item)

| No | Priority Item | Role | Module/Endpoint | Owner | Status |
|---|---|---|---|---|---|
| 1 | [#49] Master-data layanan count internal mismatch | UPTD BALAI PENGAWASAN MUTU ... | Data Integrity | FE Lead | Planned |
| 2 | [#20] Approval workflow UI incomplete (no approve/reject buttons) | SEKRETARIAT | API/Contract | FE Lead | Planned |
| 3 | [#27] Bidang-level data scope not enforced | BIDANG KETERSEDIAAN PANGAN | Auth/RBAC | Squad Lead | Planned |
| 4 | [#50] Field mapping path convention (FIELDS_UPTD/ vs FIELDS/) | UPTD BALAI PENGAWASAN MUTU ... | Data Integrity | FE Lead | Planned |
| 5 | [#17] Field mapping path mismatch (FIELDS_SEKRETARIAT/SEK-\*.csv) | SEKRETARIAT | Data Integrity | FE Lead | Planned |
| 6 | [#4] API rate limiting partial | SUPER ADMIN | API/Contract | BE Lead | Planned |
| 7 | [#18] Cross-modul validation rules missing | SEKRETARIAT | Core Workflow | BE Lead | Planned |
| 8 | [#19] Data masking untuk salary belum ada | SEKRETARIAT | Data Integrity | Squad Lead | Planned |
| 9 | [#9] Historical KPI trend missing | KEPALA DINAS / GUBERNUR | Data Integrity | FE Lead | Planned |
| 10 | [#3] IP whitelisting tidak enforced | SUPER ADMIN | Auth/RBAC | BE Lead | Planned |
| 11 | [#25] Kerawanan index formula tidak dokumentasi | BIDANG KETERSEDIAAN PANGAN | Core Workflow | FE Lead | Planned |
| 12 | [#51] OpenAPI spec tidak cover UPTD endpoint | UPTD BALAI PENGAWASAN MUTU ... | API/Contract | BE Lead | Planned |

## Tuesday-Thursday Delivery

### Tuesday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | TBD | Implement | TBD | PR/Commit | Not Started |
| 2 | TBD | Test | TBD | Test log | Not Started |
| 3 | TBD | Review | TBD | Review note | Not Started |

### Wednesday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | TBD | Implement | TBD | PR/Commit | Not Started |
| 2 | TBD | Test | TBD | Test log | Not Started |
| 3 | TBD | Review | TBD | Review note | Not Started |

### Thursday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | TBD | Implement | TBD | PR/Commit | Not Started |
| 2 | TBD | Test | TBD | Test log | Not Started |
| 3 | TBD | Review | TBD | Review note | Not Started |

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
