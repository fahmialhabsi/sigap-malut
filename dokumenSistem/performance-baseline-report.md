# Performance Baseline Report — SIGAP-MALUT

**Tanggal:** 2026-04-06 | **Mode:** LOW-RISK ONLY

---

## 1. Endpoint Kritis yang Dianalisis

| Endpoint | Frekuensi | Risiko Bottleneck | Tindakan |
|----------|-----------|-------------------|----------|
| `POST /api/auth/login` | Tinggi | Brute force → sudah rate-limited (20/15min) | ✅ ADEQUATE |
| `GET /api/dashboard/sekretaris/summary` | Tinggi | Query agregat berulang | Cache ada via Redis ✅ |
| `GET /api/public/kpi` | Medium-Tinggi | Bisa N+1 komoditas | Cache via Redis ✅ |
| `POST /api/tasks/:id/submit` | Medium | Validator + writeAudit | ✅ ADEQUATE |
| `GET /api/gubernur/tasks/escalated` | Low | Simple WHERE query | ✅ ADEQUATE |
| `GET /api/tasks/:taskId/discussions` | Medium | JOIN 2 tabel | ✅ ADEQUATE — index ada |
| `GET /api/coordination/horizontal` | Medium | Thread-based query | ✅ ADEQUATE |

---

## 2. Potensi Bottleneck Teridentifikasi

### B-01: Dual-mount Route Registration
- `registerRoutes(app)` mendaftar 84+ routes sekali startup
- **Impact:** startup time saja, tidak mempengaruhi request runtime
- **Action:** No tuning needed

### B-02: `ensureTaskDiscussionsTable()` di startup
- CREATE TABLE IF NOT EXISTS dijalankan setiap boot
- **Impact:** 3–4 query DDL saat startup saja
- **Risk:** Very Low (PostgreSQL handles IF NOT EXISTS efficiently)
- **Action:** Acceptable untuk development; production harus gunakan migrations

### B-03: KPI Poll setiap 300 detik
- Broadcast via Socket.IO ke semua connected clients
- **Impact:** Low — hanya 1 query + 1 broadcast
- **Action:** ✅ Already acceptable

### B-04: Index pada task_discussions
- 3 index dibuat: `task_id`, `pengirim_id`, `penerima_id`
- **Status:** ✅ Already indexed

---

## 3. Tuning Low-Risk yang Diterapkan

### T-01: Route taskDiscussion dengan pagination default
File: `backend/routes/taskDiscussion.js`
```
GET /:taskId/discussions — ORDER BY created_at ASC
```
- Query sudah ordered, sudah ada index pada task_id ✅
- **No change needed**

### T-02: Rate limit terapkan
- Auth: 20 req/15min ✅
- Submit: 10 req/min ✅
- General API: 300 req/min ✅

---

## 4. Tuning yang Ditunda (Recommended, Not Applied)

| Tuning | Alasan Ditunda | Rekomendasi Sprint |
|--------|---------------|-------------------|
| Pagination pada `GET /api/gubernur/tasks/escalated` | Safe to add tapi perlu frontend change | Sprint 2 |
| Response field stripping di public endpoints | Already sanitized, no extra benefit now | Sprint 2 |
| DB connection pool size config | Perlu load testing data dulu | Sprint 3 |
| Redis TTL untuk KPI cache | Butuh benchmark data produksi | Sprint 3 |

---

## 5. Verdict

**Performance baseline: ADEQUATE for pilot/staging** ✅

Tidak ada N+1 query kritis ditemukan. Rate limiting aktif. Index kritis ada. Cache Redis aktif.
