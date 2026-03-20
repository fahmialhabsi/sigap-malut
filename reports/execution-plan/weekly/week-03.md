# Week 03 Execution Sheet

- Phase: Phase 1 (CRITICAL (Week 1-4))
- Week: 3
- Date Range: 2026-04-06 to 2026-04-12
- Focus: Super Admin, Sekretariat, UPTD + partial bidang routing
- Target: Tutup isu KRITIS prioritas dan stabilkan akses inti lintas role kunci
- Exit Criteria: Gate 1 lulus

## Monday Prioritization (10-15 item)

| No | Priority Item | Role | Module/Endpoint | Owner | Status |
|---|---|---|---|---|---|
| 1 | [#39] Survey data model underspecified | BIDANG KONSUMSI & KEAMANAN ... | Data Integrity | Squad Lead | Planned |
| 2 | [#32] Daily harga feed belum otomatis | BIDANG DISTRIBUSI PANGAN | Dashboard/Routing | FE Lead | Planned |
| 3 | [#8] Dashboard layout tidak customizable | KEPALA DINAS / GUBERNUR | API/Contract | FE Lead | Planned |
| 4 | [#40] Konsumsi & gizi scoring formula undocumented | BIDANG KONSUMSI & KEAMANAN ... | Core Workflow | FE Lead | Planned |
| 5 | [#61] OpenAPI spec incomplete (not cover public data endpoint) | MASYARAKAT / PENELITI / PUBLIK | API/Contract | FE Lead | Planned |
| 6 | [#60] Public API rate limiting missing | MASYARAKAT / PENELITI / PUBLIK | API/Contract | BE Lead | Planned |
| 7 | [#44] Dashboard sidebar route orphaned (/uptd/:id not in router) | UPTD BALAI PENGAWASAN MUTU ... | Dashboard/Routing | FE Lead | Planned |
| 8 | [#47] Profile endpoint mismatch (/auth/profile vs /api/auth/me) | UPTD BALAI PENGAWASAN MUTU ... | API/Contract | BE Lead | Planned |
| 9 | [#48] Role routing missing (kepala_uptd → /dashboard/uptd not in map) | UPTD BALAI PENGAWASAN MUTU ... | Auth/RBAC | FE Lead | Planned |
| 10 | [#16] BaseTable fallback dummy data (bukan real Sekretariat data) | SEKRETARIAT | API/Contract | FE Lead | Planned |
| 11 | [#46] BaseTable fallback dummy data (not real UPTD test result) | UPTD BALAI PENGAWASAN MUTU ... | API/Contract | FE Lead | Planned |
| 12 | [#30] Dashboard routing orphaned | BIDANG DISTRIBUSI PANGAN | Dashboard/Routing | FE Lead | Planned |

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
