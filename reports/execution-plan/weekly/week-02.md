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
| 1 | [#48][BUILD] Implementasi perbaikan: Role routing missing (kepala_uptd → /dashboard/uptd not ... | UPTD BALAI PENGAWASAN MUTU ... | Auth/RBAC | FE Lead | Planned |
| 2 | [#2][BUILD] Implementasi perbaikan: Session timeout tidak enforced | SUPER ADMIN | Core Workflow | Squad Lead | Planned |
| 3 | [#15][BUILD] Implementasi perbaikan: Dashboard tidak menampilkan 12 modul lengkap | SEKRETARIAT | Dashboard/Routing | FE Lead | Planned |
| 4 | [#16][BUILD] Implementasi perbaikan: BaseTable fallback dummy data (bukan real Sekretariat data) | SEKRETARIAT | API/Contract | FE Lead | Planned |
| 5 | [#23][BUILD] Implementasi perbaikan: Dashboard tidak terpasang (no route /module/:moduleId un... | BIDANG KETERSEDIAAN PANGAN | Dashboard/Routing | FE Lead | Planned |
| 6 | [#30][BUILD] Implementasi perbaikan: Dashboard routing orphaned | BIDANG DISTRIBUSI PANGAN | Dashboard/Routing | FE Lead | Planned |
| 7 | [#45][BUILD] Implementasi perbaikan: Frontend endpoint mismatch (/sertifikasi_prima vs /api/u... | UPTD BALAI PENGAWASAN MUTU ... | API/Contract | FE Lead | Planned |
| 8 | [#46][BUILD] Implementasi perbaikan: BaseTable fallback dummy data (not real UPTD test result) | UPTD BALAI PENGAWASAN MUTU ... | API/Contract | FE Lead | Planned |
| 9 | [#44][TEST] Uji integrasi dan regresi: Dashboard sidebar route orphaned (/uptd/:id not in rou... | UPTD BALAI PENGAWASAN MUTU ... | Dashboard/Routing | FE Lead | Planned |
| 10 | [#47][TEST] Uji integrasi dan regresi: Profile endpoint mismatch (/auth/profile vs /api/auth/me) | UPTD BALAI PENGAWASAN MUTU ... | API/Contract | BE Lead | Planned |
| 11 | [#48][TEST] Uji integrasi dan regresi: Role routing missing (kepala_uptd → /dashboard/uptd no... | UPTD BALAI PENGAWASAN MUTU ... | Auth/RBAC | FE Lead | Planned |
| 12 | [#24][PLAN] Analisis acceptance criteria: Stok monitoring tidak real-time | BIDANG KETERSEDIAAN PANGAN | API/Contract | FE Lead | Planned |

## Tuesday-Thursday Delivery

### Tuesday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Implement: Implementasi perbaikan: Role routing missing (kepala_uptd ... | Implement | FE Lead | PR/Commit | Planned |
| 2 | Implement: Implementasi perbaikan: Session timeout tidak enforced | Implement | Squad Lead | PR/Commit | Planned |
| 3 | Implement: Implementasi perbaikan: Dashboard tidak menampilkan 12 mod... | Implement | FE Lead | PR/Commit | Planned |

### Wednesday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Test: Implementasi perbaikan: BaseTable fallback dummy data (bukan re... | Test | FE Lead | Test log | Planned |
| 2 | Test: Implementasi perbaikan: Dashboard tidak terpasang (no route /mo... | Test | FE Lead | Test log | Planned |
| 3 | Test: Implementasi perbaikan: Dashboard routing orphaned | Test | FE Lead | Test log | Planned |

### Thursday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Review: Implementasi perbaikan: Frontend endpoint mismatch (/sertifik... | Review | FE Lead | Review note | Planned |
| 2 | Review: Implementasi perbaikan: BaseTable fallback dummy data (not re... | Review | FE Lead | Review note | Planned |
| 3 | Review: Uji integrasi dan regresi: Dashboard sidebar route orphaned (... | Review | FE Lead | Review note | Planned |

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
