# Week 04 Execution Sheet

- Phase: Phase 1 (CRITICAL (Week 1-4))
- Week: 4
- Date Range: 2026-04-13 to 2026-04-19
- Focus: Super Admin, Sekretariat, UPTD + partial bidang routing
- Target: Tutup isu KRITIS prioritas dan stabilkan akses inti lintas role kunci
- Exit Criteria: Gate 1 lulus

## Monday Prioritization (10-15 item)

| No | Priority Item | Role | Module/Endpoint | Owner | Status |
|---|---|---|---|---|---|
| 1 | [#15] Dashboard tidak menampilkan 12 modul lengkap | SEKRETARIAT | Dashboard/Routing | FE Lead | Planned |
| 2 | [#23] Dashboard tidak terpasang (no route /module/:moduleId untuk modul Ketersediaan) | BIDANG KETERSEDIAAN PANGAN | Dashboard/Routing | FE Lead | Planned |
| 3 | [#45] Frontend endpoint mismatch (/sertifikasi_prima vs /api/upt-tkn) | UPTD BALAI PENGAWASAN MUTU ... | API/Contract | FE Lead | Planned |
| 4 | [#2] Session timeout tidak enforced | SUPER ADMIN | Core Workflow | Squad Lead | Planned |
| 5 | [#57] Data classification policy tidak ada | MASYARAKAT / PENELITI / PUBLIK | Data Integrity | Squad Lead | Planned |
| 6 | [#24] Stok monitoring tidak real-time | BIDANG KETERSEDIAAN PANGAN | API/Contract | FE Lead | Planned |
| 7 | [#49] Master-data layanan count internal mismatch | UPTD BALAI PENGAWASAN MUTU ... | Data Integrity | FE Lead | Planned |
| 8 | [#20] Approval workflow UI incomplete (no approve/reject buttons) | SEKRETARIAT | API/Contract | FE Lead | Planned |
| 9 | [#27] Bidang-level data scope not enforced | BIDANG KETERSEDIAAN PANGAN | Auth/RBAC | Squad Lead | Planned |
| 10 | [#50] Field mapping path convention (FIELDS_UPTD/ vs FIELDS/) | UPTD BALAI PENGAWASAN MUTU ... | Data Integrity | FE Lead | Planned |
| 11 | [#17] Field mapping path mismatch (FIELDS_SEKRETARIAT/SEK-\*.csv) | SEKRETARIAT | Data Integrity | FE Lead | Planned |
| 12 | [#4] API rate limiting partial | SUPER ADMIN | API/Contract | BE Lead | Planned |

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
