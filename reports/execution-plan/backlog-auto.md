# Auto Backlog Extract (KRITIS/TINGGI)

- Source matrix: E:\sigap-malut\dokumenSistem\14-Role-Service-Requirements-Matrix.md
- Generated at: 2026-03-20T12:21:31.674Z
- Filter: Severity KRITIS + TINGGI

## Summary by Phase

| Phase | Total | KRITIS | TINGGI |
|---|---|---|---|
| Phase 1 | 30 | 12 | 18 |
| Phase 2 | 12 | 5 | 7 |
| Phase 3 | 0 | 0 | 0 |

## Detailed Backlog

| ID | Role | Severity | Issue | Timeline | Phase Key | Solution |
|---|---|---|---|---|---|---|
| 1 | SUPER ADMIN | KRITIS | MFA tidak implemented | Week 5-6 | PHASE_2 | Implement 2FA via SMS/email, store recovery codes |
| 2 | SUPER ADMIN | KRITIS | Session timeout tidak enforced | Week 2-3 | PHASE_1 | Add session tracker, auto-logout, show warning 2 min before expiry |
| 3 | SUPER ADMIN | TINGGI | IP whitelisting tidak enforced | Week 3-4 | PHASE_1 | Check req.ip, enforce whitelist di auth middleware |
| 4 | SUPER ADMIN | TINGGI | API rate limiting partial | Week 3 | PHASE_1 | Apply rate limiter ke semua public API endpoints |
| 8 | KEPALA DINAS / GUBERNUR | TINGGI | Dashboard layout tidak customizable | Week 4-5 | PHASE_1 | Add dashboard_layout table, persist via API |
| 9 | KEPALA DINAS / GUBERNUR | TINGGI | Historical KPI trend missing | Week 3-4 | PHASE_1 | Create kpi_history table, backfill dengan existing data, daily job |
| 10 | KEPALA DINAS / GUBERNUR | TINGGI | Compliance scorecard belum auto-compute | Week 5 | PHASE_2 | Build compliance_score trigger dari audit_log count, data validation ... |
| 15 | SEKRETARIAT | KRITIS | Dashboard tidak menampilkan 12 modul lengkap | Week 2 | PHASE_1 | Map 12 modul ke UI cards, add module detail links |
| 16 | SEKRETARIAT | KRITIS | BaseTable fallback dummy data (bukan real Sekretariat data) | Week 2-3 | PHASE_1 | Bind BaseTable ke /api/sekretariat/\* endpoint, schema-driven rendering |
| 17 | SEKRETARIAT | TINGGI | Field mapping path mismatch (FIELDS_SEKRETARIAT/SEK-\*.csv) | Week 2 | PHASE_1 | Fix path construction, scan FIELDS_SEKRETARIAT folder |
| 18 | SEKRETARIAT | TINGGI | Cross-modul validation rules missing | Week 3-4 | PHASE_1 | Define validation rules matrix, implement checks di controller |
| 19 | SEKRETARIAT | TINGGI | Data masking untuk salary belum ada | Week 3 | PHASE_1 | Add field-level permission, hide salary dari non-Bendahara |
| 20 | SEKRETARIAT | TINGGI | Approval workflow UI incomplete (no approve/reject buttons) | Week 2-3 | PHASE_1 | Add ActionBar component, wire approve/reject endpoints |
| 23 | BIDANG KETERSEDIAAN PANGAN | KRITIS | Dashboard tidak terpasang (no route /module/:moduleId untuk modul Ket... | Week 2-3 | PHASE_1 | Add /bidang/ketersediaan/:id route, wire to ModulePage |
| 24 | BIDANG KETERSEDIAAN PANGAN | KRITIS | Stok monitoring tidak real-time | Week 4-5 | PHASE_1 | Build UPTD-to-Bidang API sync, websocket untuk updates |
| 25 | BIDANG KETERSEDIAAN PANGAN | TINGGI | Kerawanan index formula tidak dokumentasi | Week 3 | PHASE_1 | Define kerawanan formula, implement calculation query |
| 26 | BIDANG KETERSEDIAAN PANGAN | TINGGI | Geographic visualization (map) missing | Week 5-6 | PHASE_2 | Add leaflet/mapbox, kabupaten geojson data, color overlay |
| 27 | BIDANG KETERSEDIAAN PANGAN | TINGGI | Bidang-level data scope not enforced | Week 2 | PHASE_1 | Add WHERE bidang_id = auth.bidang_id di all queries |
| 30 | BIDANG DISTRIBUSI PANGAN | KRITIS | Dashboard routing orphaned | Week 2-3 | PHASE_1 | Add route, wire to ModulePage |
| 31 | BIDANG DISTRIBUSI PANGAN | KRITIS | Real-time shipment tracking missing | Week 5-7 | PHASE_2 | Define data partner (fleet mgmt system), build sync API |
| 32 | BIDANG DISTRIBUSI PANGAN | TINGGI | Daily harga feed belum otomatis | Week 4-5 | PHASE_1 | Define price data source (market, stat center), build import job |
| 33 | BIDANG DISTRIBUSI PANGAN | TINGGI | CPPD system integration missing | Week 6-7 | PHASE_2 | Define CPPD data contract, build API connector, test sync |
| 34 | BIDANG DISTRIBUSI PANGAN | TINGGI | Geographic route visualization missing | Week 5-6 | PHASE_2 | Add map visualization, route optimization library |
| 37 | BIDANG KONSUMSI & KEAMANA... | KRITIS | Dashboard tidak ada (modul belum fully implemented) | Phase-2 | PHASE_2 | Build dashboard layout, wire to modul endpoints |
| 38 | BIDANG KONSUMSI & KEAMANA... | KRITIS | Data privacy/GDPR compliance missing | Week 6-8 | PHASE_2 | Implement field-level encryption, anonymization on import, privacy audit |
| 39 | BIDANG KONSUMSI & KEAMANA... | TINGGI | Survey data model underspecified | Week 3-4 | PHASE_1 | Define survey methodology, data schema, validation rules |
| 40 | BIDANG KONSUMSI & KEAMANA... | TINGGI | Konsumsi & gizi scoring formula undocumented | Week 4-5 | PHASE_1 | Define nutrition adequacy metric (e.g., FAO standard), implement calc... |
| 41 | BIDANG KONSUMSI & KEAMANA... | TINGGI | Keamanan pangan incident tracking belum ada | Week 5-6 | PHASE_2 | Build incident report form, tracking, categorization, alert rules |
| 44 | UPTD BALAI PENGAWASAN MUT... | KRITIS | Dashboard sidebar route orphaned (/uptd/:id not in router) | Week 1-2 | PHASE_1 | Add route to App.jsx, wire to ModulePage |
| 45 | UPTD BALAI PENGAWASAN MUT... | KRITIS | Frontend endpoint mismatch (/sertifikasi_prima vs /api/upt-tkn) | Week 2-3 | PHASE_1 | Consolidate taxonomy OR build adapter layer, test end-to-end |
| 46 | UPTD BALAI PENGAWASAN MUT... | KRITIS | BaseTable fallback dummy data (not real UPTD test result) | Week 2-3 | PHASE_1 | Rewrite BaseTable to real API fetch, schema-driven from CSV |
| 47 | UPTD BALAI PENGAWASAN MUT... | KRITIS | Profile endpoint mismatch (/auth/profile vs /api/auth/me) | Week 1 | PHASE_1 | Change to /api/auth/me, test in browser |
| 48 | UPTD BALAI PENGAWASAN MUT... | KRITIS | Role routing missing (kepala_uptd → /dashboard/uptd not in map) | Week 1 | PHASE_1 | Add KEPALA_UPTD: "/dashboard/uptd" to roleToDashboard |
| 49 | UPTD BALAI PENGAWASAN MUT... | TINGGI | Master-data layanan count internal mismatch | Week 1 | PHASE_1 | Recount & reconcile mapping CSV counts |
| 50 | UPTD BALAI PENGAWASAN MUT... | TINGGI | Field mapping path convention (FIELDS_UPTD/ vs FIELDS/) | Week 2 | PHASE_1 | Fix path construction or reorganize files |
| 51 | UPTD BALAI PENGAWASAN MUT... | TINGGI | OpenAPI spec tidak cover UPTD endpoint | Week 3-4 | PHASE_1 | Add 7 UPTD endpoint schemas, request/response spec |
| 56 | MASYARAKAT / PENELITI / P... | KRITIS | Public portal tidak ada | Phase-2 (Week 8... | PHASE_2 | Build landing page, data catalog, visualization, download center |
| 57 | MASYARAKAT / PENELITI / P... | KRITIS | Data classification policy tidak ada | Week 4-5 | PHASE_1 | Define classification scheme, implement field-level masking |
| 58 | MASYARAKAT / PENELITI / P... | TINGGI | API key management missing | Week 5-6 | PHASE_2 | Build API key generation/revocation, rate limiter per key |
| 59 | MASYARAKAT / PENELITI / P... | TINGGI | Data anonymization pipeline missing | Week 5-6 | PHASE_2 | Build anonymization rule engine, run on export |
| 60 | MASYARAKAT / PENELITI / P... | TINGGI | Public API rate limiting missing | Week 4 | PHASE_1 | Implement rate limiter middleware |
| 61 | MASYARAKAT / PENELITI / P... | TINGGI | OpenAPI spec incomplete (not cover public data endpoint) | Week 4-5 | PHASE_1 | Extend spec untuk public API, publish via Swagger UI |
