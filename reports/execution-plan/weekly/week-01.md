# Week 01 Execution Sheet

- Phase: Phase 1 (CRITICAL (Week 1-4))
- Week: 1
- Date Range: 2026-03-23 to 2026-03-29
- Focus: Super Admin, Sekretariat, UPTD + partial bidang routing
- Target: Tutup isu KRITIS prioritas dan stabilkan akses inti lintas role kunci
- Exit Criteria: Gate 1 lulus

## Monday Prioritization (10-15 item)

| No | Priority Item | Role | Module/Endpoint | Owner | Status |
|---|---|---|---|---|---|
| 1 | [#44][PLAN] Analisis acceptance criteria: Dashboard sidebar route orphaned (/uptd/:id not in ... | UPTD BALAI PENGAWASAN MUTU ... | Dashboard/Routing | FE Lead | Planned |
| 2 | [#47][PLAN] Analisis acceptance criteria: Profile endpoint mismatch (/auth/profile vs /api/au... | UPTD BALAI PENGAWASAN MUTU ... | API/Contract | BE Lead | Planned |
| 3 | [#48][PLAN] Analisis acceptance criteria: Role routing missing (kepala_uptd → /dashboard/uptd... | UPTD BALAI PENGAWASAN MUTU ... | Auth/RBAC | FE Lead | Planned |
| 4 | [#2][PLAN] Analisis acceptance criteria: Session timeout tidak enforced | SUPER ADMIN | Core Workflow | Squad Lead | Planned |
| 5 | [#15][PLAN] Analisis acceptance criteria: Dashboard tidak menampilkan 12 modul lengkap | SEKRETARIAT | Dashboard/Routing | FE Lead | Planned |
| 6 | [#16][PLAN] Analisis acceptance criteria: BaseTable fallback dummy data (bukan real Sekretari... | SEKRETARIAT | API/Contract | FE Lead | Planned |
| 7 | [#23][PLAN] Analisis acceptance criteria: Dashboard tidak terpasang (no route /module/:module... | BIDANG KETERSEDIAAN PANGAN | Dashboard/Routing | FE Lead | Planned |
| 8 | [#30][PLAN] Analisis acceptance criteria: Dashboard routing orphaned | BIDANG DISTRIBUSI PANGAN | Dashboard/Routing | FE Lead | Planned |
| 9 | [#45][PLAN] Analisis acceptance criteria: Frontend endpoint mismatch (/sertifikasi_prima vs /... | UPTD BALAI PENGAWASAN MUTU ... | API/Contract | FE Lead | Planned |
| 10 | [#46][PLAN] Analisis acceptance criteria: BaseTable fallback dummy data (not real UPTD test r... | UPTD BALAI PENGAWASAN MUTU ... | API/Contract | FE Lead | Planned |
| 11 | [#44][BUILD] Implementasi perbaikan: Dashboard sidebar route orphaned (/uptd/:id not in router) | UPTD BALAI PENGAWASAN MUTU ... | Dashboard/Routing | FE Lead | Planned |
| 12 | [#47][BUILD] Implementasi perbaikan: Profile endpoint mismatch (/auth/profile vs /api/auth/me) | UPTD BALAI PENGAWASAN MUTU ... | API/Contract | BE Lead | Planned |

## Tuesday-Thursday Delivery

### Tuesday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Implement: Analisis acceptance criteria: Dashboard sidebar route orph... | Implement | FE Lead | PR/Commit | Planned |
| 2 | Implement: Analisis acceptance criteria: Profile endpoint mismatch (/... | Implement | BE Lead | PR/Commit | Planned |
| 3 | Implement: Analisis acceptance criteria: Role routing missing (kepala... | Implement | FE Lead | PR/Commit | Planned |

### Wednesday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Test: Analisis acceptance criteria: Session timeout tidak enforced | Test | Squad Lead | Test log | Planned |
| 2 | Test: Analisis acceptance criteria: Dashboard tidak menampilkan 12 mo... | Test | FE Lead | Test log | Planned |
| 3 | Test: Analisis acceptance criteria: BaseTable fallback dummy data (bu... | Test | FE Lead | Test log | Planned |

### Thursday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Review: Analisis acceptance criteria: Dashboard tidak terpasang (no r... | Review | FE Lead | Review note | Planned |
| 2 | Review: Analisis acceptance criteria: Dashboard routing orphaned | Review | FE Lead | Review note | Planned |
| 3 | Review: Analisis acceptance criteria: Frontend endpoint mismatch (/se... | Review | FE Lead | Review note | Planned |

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
