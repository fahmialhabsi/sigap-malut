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
| 1 | [#57][PLAN] Analisis acceptance criteria: Data classification policy tidak ada | MASYARAKAT / PENELITI / PUBLIK | Data Integrity | Squad Lead | Planned |
| 2 | [#1][PLAN] Analisis acceptance criteria: MFA tidak implemented | SUPER ADMIN | Core Workflow | Squad Lead | Planned |
| 3 | [#31][PLAN] Analisis acceptance criteria: Real-time shipment tracking missing | BIDANG DISTRIBUSI PANGAN | API/Contract | FE Lead | Planned |
| 4 | [#38][PLAN] Analisis acceptance criteria: Data privacy/GDPR compliance missing | BIDANG KONSUMSI & KEAMANAN ... | Data Integrity | BE+QA | Planned |
| 5 | [#56][PLAN] Analisis acceptance criteria: Public portal tidak ada | MASYARAKAT / PENELITI / PUBLIK | Dashboard/Routing | FE Lead | Planned |
| 6 | [#37][PLAN] Analisis acceptance criteria: Dashboard tidak ada (modul belum fully implemented) | BIDANG KONSUMSI & KEAMANAN ... | API/Contract | FE Lead | Planned |
| 7 | [#2][TEST] Uji integrasi dan regresi: Session timeout tidak enforced | SUPER ADMIN | Core Workflow | Squad Lead | Planned |
| 8 | [#15][TEST] Uji integrasi dan regresi: Dashboard tidak menampilkan 12 modul lengkap | SEKRETARIAT | Dashboard/Routing | FE Lead | Planned |
| 9 | [#16][TEST] Uji integrasi dan regresi: BaseTable fallback dummy data (bukan real Sekretariat ... | SEKRETARIAT | API/Contract | FE Lead | Planned |
| 10 | [#23][TEST] Uji integrasi dan regresi: Dashboard tidak terpasang (no route /module/:moduleId ... | BIDANG KETERSEDIAAN PANGAN | Dashboard/Routing | FE Lead | Planned |
| 11 | [#30][TEST] Uji integrasi dan regresi: Dashboard routing orphaned | BIDANG DISTRIBUSI PANGAN | Dashboard/Routing | FE Lead | Planned |
| 12 | [#45][TEST] Uji integrasi dan regresi: Frontend endpoint mismatch (/sertifikasi_prima vs /api... | UPTD BALAI PENGAWASAN MUTU ... | API/Contract | FE Lead | Planned |

## Tuesday-Thursday Delivery

### Tuesday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Implement: Analisis acceptance criteria: Data classification policy t... | Implement | Squad Lead | PR/Commit | Planned |
| 2 | Implement: Analisis acceptance criteria: MFA tidak implemented | Implement | Squad Lead | PR/Commit | Planned |
| 3 | Implement: Analisis acceptance criteria: Real-time shipment tracking ... | Implement | FE Lead | PR/Commit | Planned |

### Wednesday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Test: Analisis acceptance criteria: Data privacy/GDPR compliance missing | Test | BE+QA | Test log | Planned |
| 2 | Test: Analisis acceptance criteria: Public portal tidak ada | Test | FE Lead | Test log | Planned |
| 3 | Test: Analisis acceptance criteria: Dashboard tidak ada (modul belum ... | Test | FE Lead | Test log | Planned |

### Thursday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Review: Uji integrasi dan regresi: Session timeout tidak enforced | Review | Squad Lead | Review note | Planned |
| 2 | Review: Uji integrasi dan regresi: Dashboard tidak menampilkan 12 mod... | Review | FE Lead | Review note | Planned |
| 3 | Review: Uji integrasi dan regresi: BaseTable fallback dummy data (buk... | Review | FE Lead | Review note | Planned |

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
