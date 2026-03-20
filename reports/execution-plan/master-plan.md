# Execution Plan Generator Output

Generated at: 2026-03-20T12:21:31.674Z  
Output directory: E:\sigap-malut\reports\execution-plan

## Runtime Configuration

- Start date: 2026-03-23
- Total weeks: 16
- Monday priority items per week: 12
- Friday audit duration: 3 jam
- Monday autofill from matrix: enabled
- Matrix source path: E:\sigap-malut\dokumenSistem\14-Role-Service-Requirements-Matrix.md

## Baseline Role Readiness

| Role | Compliance Saat Ini | Target Readiness |
|---|---|---|
| Sekretariat | 85% | Siap operasional inti (Phase 1) |
| UPTD | 80% | Siap operasional terbatas (Phase 1) |
| Bidang Ketersediaan | 40% | Target operasional akhir Phase 2 |
| Bidang Distribusi | 35% | Target operasional akhir Phase 2 |
| Bidang Konsumsi | 25% | Target operasional akhir Phase 3 |
| Public Portal | 20% | Target operasional akhir Phase 3 |

## Phase Mapping

| Phase | Range | Focus | Target | Exit Criteria |
|---|---|---|---|---|
| Phase 1 | Week 1-4 | Super Admin, Sekretariat, UPTD + partial bidang routing | Tutup isu KRITIS prioritas dan stabilkan akses inti lintas role kunci | Gate 1 lulus |
| Phase 2 | Week 5-8 | Bidang Ketersediaan, Bidang Distribusi + penguatan UPTD | Kendalikan isu TINGGI pada dashboard, integrasi, dan data scope | Gate 2 lulus |
| Phase 3 | Week 9-16 | Bidang Konsumsi, Public Portal, privacy hardening | Selesaikan data classification, anonymization, dan readiness publik | Gate 3 lulus |

## Auto Backlog Summary (KRITIS/TINGGI)

| Phase | Total Item | KRITIS | TINGGI |
|---|---|---|---|
| Phase 1 | 30 | 12 | 18 |
| Phase 2 | 12 | 5 | 7 |
| Phase 3 | 0 | 0 | 0 |

## Weekly Plan Index

| Week | Phase | Start Date | End Date | Rhythm |
|---|---|---|---|---|
| 1 | Phase 1 | 2026-03-23 | 2026-03-29 | Monday: 10-12 items, Friday: 3h audit |
| 2 | Phase 1 | 2026-03-30 | 2026-04-05 | Monday: 10-12 items, Friday: 3h audit |
| 3 | Phase 1 | 2026-04-06 | 2026-04-12 | Monday: 10-12 items, Friday: 3h audit |
| 4 | Phase 1 | 2026-04-13 | 2026-04-19 | Monday: 10-12 items, Friday: 3h audit |
| 5 | Phase 2 | 2026-04-20 | 2026-04-26 | Monday: 10-12 items, Friday: 3h audit |
| 6 | Phase 2 | 2026-04-27 | 2026-05-03 | Monday: 10-12 items, Friday: 3h audit |
| 7 | Phase 2 | 2026-05-04 | 2026-05-10 | Monday: 10-12 items, Friday: 3h audit |
| 8 | Phase 2 | 2026-05-11 | 2026-05-17 | Monday: 10-12 items, Friday: 3h audit |
| 9 | Phase 3 | 2026-05-18 | 2026-05-24 | Monday: 10-12 items, Friday: 3h audit |
| 10 | Phase 3 | 2026-05-25 | 2026-05-31 | Monday: 10-12 items, Friday: 3h audit |
| 11 | Phase 3 | 2026-06-01 | 2026-06-07 | Monday: 10-12 items, Friday: 3h audit |
| 12 | Phase 3 | 2026-06-08 | 2026-06-14 | Monday: 10-12 items, Friday: 3h audit |
| 13 | Phase 3 | 2026-06-15 | 2026-06-21 | Monday: 10-12 items, Friday: 3h audit |
| 14 | Phase 3 | 2026-06-22 | 2026-06-28 | Monday: 10-12 items, Friday: 3h audit |
| 15 | Phase 3 | 2026-06-29 | 2026-07-05 | Monday: 10-12 items, Friday: 3h audit |
| 16 | Phase 3 | 2026-07-06 | 2026-07-12 | Monday: 10-12 items, Friday: 3h audit |

## Suggested Command

`node scripts/generate-execution-plan.js --start-date 2026-03-23 --weeks 16 --items 12 --hours 3`
