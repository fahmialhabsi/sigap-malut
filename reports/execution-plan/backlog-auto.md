# Auto Backlog Extract (KRITIS/TINGGI/SEDANG)

- Source matrix: E:\sigap-malut\dokumenSistem\14-Role-Service-Requirements-Matrix.md
- Generated at: 2026-03-20T16:59:58.803Z
- Filter: Semua severity dari tabel issue per role

## Summary by Severity

| Severity | Total |
|---|---|
| KRITIS | 17 |
| TINGGI | 25 |
| SEDANG | 23 |
| TOTAL | 65 |

## Summary by Phase

| Phase | Total | KRITIS | TINGGI | SEDANG |
|---|---|---|---|---|
| Phase 1 | 17 | 17 | 0 | 0 |
| Phase 2 | 25 | 0 | 25 | 0 |
| Phase 3 | 23 | 0 | 0 | 23 |

## Detailed Backlog

| ID | Role | Severity | Issue | Timeline | Phase Key | Solution |
|---|---|---|---|---|---|---|
| 1 | SUPER ADMIN | KRITIS | MFA tidak implemented | Week 5-6 | PHASE_1 | Implement 2FA via SMS/email, store recovery codes |
| 2 | SUPER ADMIN | KRITIS | Session timeout tidak enforced | Week 2-3 | PHASE_1 | Add session tracker, auto-logout, show warning 2 min before expiry |
| 3 | SUPER ADMIN | TINGGI | IP whitelisting tidak enforced | Week 3-4 | PHASE_2 | Check req.ip, enforce whitelist di auth middleware |
| 4 | SUPER ADMIN | TINGGI | API rate limiting partial | Week 3 | PHASE_2 | Apply rate limiter ke semua public API endpoints |
| 5 | SUPER ADMIN | SEDANG | User audit trail incomplete | Week 2 | PHASE_3 | Add logAudit untuk login/logout/failed attempts |
| 6 | SUPER ADMIN | SEDANG | Master data export format limited | Week 4 | PHASE_3 | Add PDF export via pdf-lib atau similar |
| 7 | SUPER ADMIN | SEDANG | System health dashboard missing | Week 5-7 | PHASE_3 | Build admin dashboard dengan real-time metrics |
| 8 | KEPALA DINAS / GUBERNUR | TINGGI | Dashboard layout tidak customizable | Week 4-5 | PHASE_2 | Add dashboard_layout table, persist via API |
| 9 | KEPALA DINAS / GUBERNUR | TINGGI | Historical KPI trend missing | Week 3-4 | PHASE_2 | Create kpi_history table, backfill dengan existing data, daily job |
| 10 | KEPALA DINAS / GUBERNUR | TINGGI | Compliance scorecard belum auto-compute | Week 5 | PHASE_2 | Build compliance_score trigger dari audit_log count, data validation ... |
| 11 | KEPALA DINAS / GUBERNUR | SEDANG | Budget tracking tidak terintegrasi | Week 6 | PHASE_3 | Integrate finance API, join dengan DPA master data, compute realisasi % |
| 12 | KEPALA DINAS / GUBERNUR | SEDANG | Risk/Anomaly alert tidak real-time | Week 6-7 | PHASE_3 | Build alert rule engine, check nightly, trigger notification via emai... |
| 13 | KEPALA DINAS / GUBERNUR | SEDANG | Monthly report auto-generation missing | Week 7 | PHASE_3 | Build report generator (PDF/PPTX template), schedule monthly |
| 14 | KEPALA DINAS / GUBERNUR | SEDANG | Strategic initiative tracking tidak ada | Week 8+ | PHASE_3 | Add program/project tracking modul (future phase) |
| 15 | SEKRETARIAT | KRITIS | Dashboard tidak menampilkan 12 modul lengkap | Week 2 | PHASE_1 | Map 12 modul ke UI cards, add module detail links |
| 16 | SEKRETARIAT | KRITIS | BaseTable fallback dummy data (bukan real Sekretariat data) | Week 2-3 | PHASE_1 | Bind BaseTable ke /api/sekretariat/\* endpoint, schema-driven rendering |
| 17 | SEKRETARIAT | TINGGI | Field mapping path mismatch (FIELDS_SEKRETARIAT/SEK-\*.csv) | Week 2 | PHASE_2 | Fix path construction, scan FIELDS_SEKRETARIAT folder |
| 18 | SEKRETARIAT | TINGGI | Cross-modul validation rules missing | Week 3-4 | PHASE_2 | Define validation rules matrix, implement checks di controller |
| 19 | SEKRETARIAT | TINGGI | Data masking untuk salary belum ada | Week 3 | PHASE_2 | Add field-level permission, hide salary dari non-Bendahara |
| 20 | SEKRETARIAT | TINGGI | Approval workflow UI incomplete (no approve/reject buttons) | Week 2-3 | PHASE_2 | Add ActionBar component, wire approve/reject endpoints |
| 21 | SEKRETARIAT | SEDANG | KGB tracking SLA alerts missing | Week 4-5 | PHASE_3 | Build SLA monitor, alert jika pending >2 bulan |
| 22 | SEKRETARIAT | SEDANG | Laporan agregasi 3 bidang tidak auto-generate | Week 5-6 | PHASE_3 | Build aggregation query, schedule monthly report job |
| 23 | BIDANG KETERSEDIAAN PANGAN | KRITIS | Dashboard tidak terpasang (no route /module/:moduleId untuk modul Ket... | Week 2-3 | PHASE_1 | Add /bidang/ketersediaan/:id route, wire to ModulePage |
| 24 | BIDANG KETERSEDIAAN PANGAN | KRITIS | Stok monitoring tidak real-time | Week 4-5 | PHASE_1 | Build UPTD-to-Bidang API sync, websocket untuk updates |
| 25 | BIDANG KETERSEDIAAN PANGAN | TINGGI | Kerawanan index formula tidak dokumentasi | Week 3 | PHASE_2 | Define kerawanan formula, implement calculation query |
| 26 | BIDANG KETERSEDIAAN PANGAN | TINGGI | Geographic visualization (map) missing | Week 5-6 | PHASE_2 | Add leaflet/mapbox, kabupaten geojson data, color overlay |
| 27 | BIDANG KETERSEDIAAN PANGAN | TINGGI | Bidang-level data scope not enforced | Week 2 | PHASE_2 | Add WHERE bidang_id = auth.bidang_id di all queries |
| 28 | BIDANG KETERSEDIAAN PANGAN | SEDANG | Intervention tracking modul belum di-scope | Week 6-7 | PHASE_3 | Add intervention_programs table, status tracking, target metrics |
| 29 | BIDANG KETERSEDIAAN PANGAN | SEDANG | Population & price data integration missing | Week 7+ | PHASE_3 | Define data partnership, build integration API, scheduler untuk sync |
| 30 | BIDANG DISTRIBUSI PANGAN | KRITIS | Dashboard routing orphaned | Week 2-3 | PHASE_1 | Add route, wire to ModulePage |
| 31 | BIDANG DISTRIBUSI PANGAN | KRITIS | Real-time shipment tracking missing | Week 5-7 | PHASE_1 | Define data partner (fleet mgmt system), build sync API |
| 32 | BIDANG DISTRIBUSI PANGAN | TINGGI | Daily harga feed belum otomatis | Week 4-5 | PHASE_2 | Define price data source (market, stat center), build import job |
| 33 | BIDANG DISTRIBUSI PANGAN | TINGGI | CPPD system integration missing | Week 6-7 | PHASE_2 | Define CPPD data contract, build API connector, test sync |
| 34 | BIDANG DISTRIBUSI PANGAN | TINGGI | Geographic route visualization missing | Week 5-6 | PHASE_2 | Add map visualization, route optimization library |
| 35 | BIDANG DISTRIBUSI PANGAN | SEDANG | Distribution effectiveness metric unclear | Week 3 | PHASE_3 | Define KPI formula, implement calculated field |
| 36 | BIDANG DISTRIBUSI PANGAN | SEDANG | Price stability formula belum implement | Week 4 | PHASE_3 | Add price history table, compute volatility nightly |
| 37 | BIDANG KONSUMSI & KEAMANA... | KRITIS | Dashboard tidak ada (modul belum fully implemented) | Phase-2 | PHASE_1 | Build dashboard layout, wire to modul endpoints |
| 38 | BIDANG KONSUMSI & KEAMANA... | KRITIS | Data privacy/GDPR compliance missing | Week 6-8 | PHASE_1 | Implement field-level encryption, anonymization on import, privacy audit |
| 39 | BIDANG KONSUMSI & KEAMANA... | TINGGI | Survey data model underspecified | Week 3-4 | PHASE_2 | Define survey methodology, data schema, validation rules |
| 40 | BIDANG KONSUMSI & KEAMANA... | TINGGI | Konsumsi & gizi scoring formula undocumented | Week 4-5 | PHASE_2 | Define nutrition adequacy metric (e.g., FAO standard), implement calc... |
| 41 | BIDANG KONSUMSI & KEAMANA... | TINGGI | Keamanan pangan incident tracking belum ada | Week 5-6 | PHASE_2 | Build incident report form, tracking, categorization, alert rules |
| 42 | BIDANG KONSUMSI & KEAMANA... | SEDANG | Halal certification integration missing | Week 5-6 | PHASE_3 | Define halal cert authority data, build lookup/import |
| 43 | BIDANG KONSUMSI & KEAMANA... | SEDANG | Campaign tracking & engagement metric missing | Phase-2 | PHASE_3 | Add campaign master, participant tracking, engagement scoring |
| 44 | UPTD BALAI PENGAWASAN MUT... | KRITIS | Dashboard sidebar route orphaned (/uptd/:id not in router) | Week 1-2 | PHASE_1 | Add route to App.jsx, wire to ModulePage |
| 45 | UPTD BALAI PENGAWASAN MUT... | KRITIS | Frontend endpoint mismatch (/sertifikasi_prima vs /api/upt-tkn) | Week 2-3 | PHASE_1 | Consolidate taxonomy OR build adapter layer, test end-to-end |
| 46 | UPTD BALAI PENGAWASAN MUT... | KRITIS | BaseTable fallback dummy data (not real UPTD test result) | Week 2-3 | PHASE_1 | Rewrite BaseTable to real API fetch, schema-driven from CSV |
| 47 | UPTD BALAI PENGAWASAN MUT... | KRITIS | Profile endpoint mismatch (/auth/profile vs /api/auth/me) | Week 1 | PHASE_1 | Change to /api/auth/me, test in browser |
| 48 | UPTD BALAI PENGAWASAN MUT... | KRITIS | Role routing missing (kepala_uptd → /dashboard/uptd not in map) | Week 1 | PHASE_1 | Add KEPALA_UPTD: "/dashboard/uptd" to roleToDashboard |
| 49 | UPTD BALAI PENGAWASAN MUT... | TINGGI | Master-data layanan count internal mismatch | Week 1 | PHASE_2 | Recount & reconcile mapping CSV counts |
| 50 | UPTD BALAI PENGAWASAN MUT... | TINGGI | Field mapping path convention (FIELDS_UPTD/ vs FIELDS/) | Week 2 | PHASE_2 | Fix path construction or reorganize files |
| 51 | UPTD BALAI PENGAWASAN MUT... | TINGGI | OpenAPI spec tidak cover UPTD endpoint | Week 3-4 | PHASE_2 | Add 7 UPTD endpoint schemas, request/response spec |
| 52 | UPTD BALAI PENGAWASAN MUT... | SEDANG | Chain of custody tracking belum implemented | Week 4-5 | PHASE_3 | Add tracking_log table, record every movement, validation |
| 53 | UPTD BALAI PENGAWASAN MUT... | SEDANG | Certification auto-generation missing | Week 5-6 | PHASE_3 | Build cert template (PDF), auto-generate on pass result |
| 54 | UPTD BALAI PENGAWASAN MUT... | SEDANG | SOP compliance check missing | Week 5-6 | PHASE_3 | Define SOP checklist, implement validation form, track |
| 55 | UPTD BALAI PENGAWASAN MUT... | SEDANG | Equipment maintenance schedule not tracked | Week 4-5 | PHASE_3 | Add equipment_maintenance table, schedule tracking, alert jika due |
| 56 | MASYARAKAT / PENELITI / P... | KRITIS | Public portal tidak ada | Phase-2 (Week 8... | PHASE_1 | Build landing page, data catalog, visualization, download center |
| 57 | MASYARAKAT / PENELITI / P... | KRITIS | Data classification policy tidak ada | Week 4-5 | PHASE_1 | Define classification scheme, implement field-level masking |
| 58 | MASYARAKAT / PENELITI / P... | TINGGI | API key management missing | Week 5-6 | PHASE_2 | Build API key generation/revocation, rate limiter per key |
| 59 | MASYARAKAT / PENELITI / P... | TINGGI | Data anonymization pipeline missing | Week 5-6 | PHASE_2 | Build anonymization rule engine, run on export |
| 60 | MASYARAKAT / PENELITI / P... | TINGGI | Public API rate limiting missing | Week 4 | PHASE_2 | Implement rate limiter middleware |
| 61 | MASYARAKAT / PENELITI / P... | TINGGI | OpenAPI spec incomplete (not cover public data endpoint) | Week 4-5 | PHASE_2 | Extend spec untuk public API, publish via Swagger UI |
| 62 | MASYARAKAT / PENELITI / P... | SEDANG | Feedback/data request form missing | Week 6-7 | PHASE_3 | Build feedback form, route to admin, track response |
| 63 | MASYARAKAT / PENELITI / P... | SEDANG | Alert subscription service missing | Week 7-8 | PHASE_3 | Build subscription manager, email/SMS service integration |
| 64 | MASYARAKAT / PENELITI / P... | SEDANG | Data visualization library missing | Week 6-7 | PHASE_3 | Add chart library (Chart.js/D3), leaflet untuk map |
| 65 | MASYARAKAT / PENELITI / P... | SEDANG | Historical archive & versioning missing | Phase-2 | PHASE_3 | Build data versioning, archive storage, query historical |
