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
| 1 | [#46][TEST] Uji integrasi dan regresi: BaseTable fallback dummy data (not real UPTD test result) | UPTD BALAI PENGAWASAN MUTU ... | API/Contract | FE Lead | Planned |
| 2 | [#44][REVIEW] Review hasil dan evidence: Dashboard sidebar route orphaned (/uptd/:id not in r... | UPTD BALAI PENGAWASAN MUTU ... | Dashboard/Routing | FE Lead | Planned |
| 3 | [#47][REVIEW] Review hasil dan evidence: Profile endpoint mismatch (/auth/profile vs /api/aut... | UPTD BALAI PENGAWASAN MUTU ... | API/Contract | BE Lead | Planned |
| 4 | [#48][REVIEW] Review hasil dan evidence: Role routing missing (kepala_uptd → /dashboard/uptd ... | UPTD BALAI PENGAWASAN MUTU ... | Auth/RBAC | FE Lead | Planned |
| 5 | [#24][BUILD] Implementasi perbaikan: Stok monitoring tidak real-time | BIDANG KETERSEDIAAN PANGAN | API/Contract | FE Lead | Planned |
| 6 | [#57][BUILD] Implementasi perbaikan: Data classification policy tidak ada | MASYARAKAT / PENELITI / PUBLIK | Data Integrity | Squad Lead | Planned |
| 7 | [#1][BUILD] Implementasi perbaikan: MFA tidak implemented | SUPER ADMIN | Core Workflow | Squad Lead | Planned |
| 8 | [#31][BUILD] Implementasi perbaikan: Real-time shipment tracking missing | BIDANG DISTRIBUSI PANGAN | API/Contract | FE Lead | Planned |
| 9 | [#38][BUILD] Implementasi perbaikan: Data privacy/GDPR compliance missing | BIDANG KONSUMSI & KEAMANAN ... | Data Integrity | BE+QA | Planned |
| 10 | [#56][BUILD] Implementasi perbaikan: Public portal tidak ada | MASYARAKAT / PENELITI / PUBLIK | Dashboard/Routing | FE Lead | Planned |
| 11 | [#37][BUILD] Implementasi perbaikan: Dashboard tidak ada (modul belum fully implemented) | BIDANG KONSUMSI & KEAMANAN ... | API/Contract | FE Lead | Planned |
| 12 | [#24][TEST] Uji integrasi dan regresi: Stok monitoring tidak real-time | BIDANG KETERSEDIAAN PANGAN | API/Contract | FE Lead | Planned |

## Tuesday-Thursday Delivery

### Tuesday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Implement: Uji integrasi dan regresi: BaseTable fallback dummy data (... | Implement | FE Lead | PR/Commit | Planned |
| 2 | Implement: Review hasil dan evidence: Dashboard sidebar route orphane... | Implement | FE Lead | PR/Commit | Planned |
| 3 | Implement: Review hasil dan evidence: Profile endpoint mismatch (/aut... | Implement | BE Lead | PR/Commit | Planned |

### Wednesday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Test: Review hasil dan evidence: Role routing missing (kepala_uptd → ... | Test | FE Lead | Test log | Planned |
| 2 | Test: Implementasi perbaikan: Stok monitoring tidak real-time | Test | FE Lead | Test log | Planned |
| 3 | Test: Implementasi perbaikan: Data classification policy tidak ada | Test | Squad Lead | Test log | Planned |

### Thursday

| No | Task | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Review: Implementasi perbaikan: MFA tidak implemented | Review | Squad Lead | Review note | Planned |
| 2 | Review: Implementasi perbaikan: Real-time shipment tracking missing | Review | FE Lead | Review note | Planned |
| 3 | Review: Implementasi perbaikan: Data privacy/GDPR compliance missing | Review | BE+QA | Review note | Planned |

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
