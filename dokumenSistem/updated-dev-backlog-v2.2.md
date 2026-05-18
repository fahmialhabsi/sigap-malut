# Updated Dev Backlog v2.2 — SIGAP-MALUT

**Tanggal:** 2026-04-05  
**Branch:** `audit/pilot-hardening-release`  
**Baseline:** `updated-dev-backlog.md` v2.1

---

## Item yang CLOSED (v2.2)

| ID | Judul | Prioritas | Ditutup | Cara |
|----|-------|-----------|---------|------|
| BL-001 | Secretary approval flow (verified → approved_by_secretary) | P0 | ✅ v2.1 | Endpoint + controller + UI panel |
| BL-002 | Bypass submit validation | P0 | ✅ v2.1 | Guard di taskController.js |
| BL-011 | Rate limiting tidak aktif | P0 | ✅ v2.1 | express-rate-limit di server.js |
| BL-010 | CI/CD pipeline minimum | P1 | ✅ v2.2 | 3 pipeline lama + p0p1-regression-guard.yml baru |
| BL-013 | openapi.yaml out of sync | P1 | ✅ v2.2 | 6 endpoint kritikal disinkronkan |

---

## Backlog Tersisa

### P1 — Harus selesai sebelum produksi penuh

| ID | Judul | Estimasi | Owner | Target |
|----|-------|----------|-------|--------|
| BL-008 | Lengkapi UAT matrix dari hasil manual (seksi B, U, BD, N) | 2 hari | QA Lead | 2026-04-15 |
| BL-009 | Konfigurasi coverageThreshold di jest.config | 0.5 hari | QA Lead | 2026-04-15 |
| BL-012 | Verifikasi MFA flow end-to-end | 1 hari | Tim Backend | 2026-04-10 |
| BL-016 | Sinkronkan ~15 endpoint P1 yang masih belum di OpenAPI | 3 hari | Tim Backend | 2026-04-20 |
| BL-PROXY | Tambah `app.set('trust proxy', 1)` jika deployment di belakang proxy | 0.5 hari | DevOps | 2026-04-10 |
| BL-RUNBOOK | Buat runbook deployment + rollback minimum | 1 hari | PM/DevOps | 2026-04-10 |

### P2 — Boleh dilakukan pasca pilot

| ID | Judul | Estimasi | Owner | Target |
|----|-------|----------|-------|--------|
| BL-003 | Implementasi task substitution (DB model ≠ ERD) | 5 hari | Tim Backend | 2026-05-01 |
| BL-004 | Konsolidasi ~10 pasang dokumen duplikat | 2 hari | Tim Dok | 2026-05-01 |
| BL-014 | Sinkronkan data region map (MapLayerPanel) | 2 hari | Tim Frontend | 2026-05-01 |
| BL-015 | Refactor submit validation ke shared utility | 1 hari | Tim Backend | 2026-05-01 |
| BL-FE-CI | Tambah gate frontend build + lint ke ci.yml | 1 hari | Frontend Lead | 2026-04-20 |

### P3 — Defer post go-live penuh

| ID | Judul | Estimasi | Owner |
|----|-------|----------|-------|
| BL-005 | Pindahkan `Master Prompt*.md` ke subfolder | 0.5 hari | Tim Dok |
| BL-E2E | Frontend E2E test (Playwright/Selenium) | 5 hari | QA Lead |

---

## Statistik Backlog

| Prioritas | Total | Closed | Tersisa |
|-----------|-------|--------|---------|
| P0 | 3 | 3 | 0 |
| P1 | 8 | 5 | 3 |
| P2 | 5 | 0 | 5 |
| P3 | 2 | 0 | 2 |
| Baru (pilot-hardening) | 4 | 2 | 2 |
| **TOTAL** | **22** | **10** | **12** |

---

## Pilot Blocker Checklist

Harus CLOSED sebelum pilot aktif:

- [x] BL-001 Secretary approval flow
- [x] BL-002 Submit validation bypass
- [x] BL-011 Rate limiting
- [x] BL-010 CI/CD minimum
- [ ] BL-PROXY trust proxy (deadline 2026-04-10)
- [ ] BL-RUNBOOK runbook deployment (deadline 2026-04-10)
- [ ] BL-012 MFA flow verify (deadline 2026-04-10)
- [ ] Data: UserHierarchy Sekretariat (deadline 2026-04-08)
