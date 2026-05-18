# Performance Tuning Log — SIGAP-MALUT

**Tanggal:** 2026-04-06

---

## Tuning yang Diterapkan

| ID | Area | Before | After | File |
|----|------|--------|-------|------|
| PT-01 | `task_discussions` table index | Tabel baru tanpa index | 3 index (task_id, pengirim_id, penerima_id) via `ensureTaskDiscussionsTable()` | server.js |
| PT-02 | Rate limiting auth | Tidak ada | 20 req/15min | server.js |
| PT-03 | Rate limiting submit | Tidak ada | 10 req/min | server.js |
| PT-04 | Rate limiting general API | Tidak ada | 300 req/min | server.js |
| PT-05 | KPI Redis cache | N/A | Aktif, interval 300s | services/kpiPollingService.js |

*Catatan: PT-01 s/d PT-05 diterapkan pada sesi-sesi sebelumnya, dicatat di sini sebagai baseline.*

---

## Tuning yang TIDAK Diterapkan (Safe but Not Urgent)

| ID | Deskripsi | Risiko | Status |
|----|-----------|--------|--------|
| PT-N01 | Pagination default pada gubernur escalated list | Low | Backlog Sprint 2 |
| PT-N02 | DB pool size via env var | Low | Backlog Sprint 3 |
| PT-N03 | Compression middleware (gzip) | Medium (integration test needed) | Backlog Sprint 2 |
| PT-N04 | Field stripping di public JSON response | Low | Backlog Sprint 2 |

---

## Kesimpulan

**No new performance tuning applied in this session.** Baseline already adequate. No unsafe optimization forced.
