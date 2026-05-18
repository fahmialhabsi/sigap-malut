# Documentation Parity Audit — SIGAP-MALUT

**Tanggal:** 2026-04-06 | **Scope:** Routes, OpenAPI, ENUM, Role Codes, Env Vars

---

## 1. Routes vs OpenAPI

### MATCH ✅
| Prefix OpenAPI | Server Mount | Via |
|---|---|---|
| `/api/auth/*` | `app.use("/api/auth", authRoutes)` | server.js direct |
| `/api/tasks/*` | `app.use("/api/tasks", taskRoutes)` | server.js direct |
| `/api/gubernur/*` | `app.use("/api/gubernur", gubernurRoutes)` | server.js direct |
| `/api/kadin/*` | `app.use("/api/kadin", kadinRoutes)` | server.js direct |
| `/api/sekretaris/*` | `app.use("/api/sekretaris", sekretarisRoutes)` | server.js direct |
| `/api/public/*` | `app.use("/api/public", publicRoutes)` | server.js direct |
| `/api/coordination/*` | `app.use("/api/coordination", coordinationRoutes)` | server.js direct |
| `/api/approvalworkflow/*` | `app.use("/api/approvalworkflow", ...)` | registerRoutes(app) |
| `/api/auditlog/*` | `app.use("/api/auditlog", ...)` | registerRoutes(app) |
| `/api/layanan/*` | `app.use("/api/layanan", ...)` | registerRoutes(app) |
| `/api/workflow/*` | `app.use("/api/workflow", ...)` | registerRoutes(app) |
| `/api/jf/ketersediaan/*` | `app.use("/api/jf/ketersediaan", ...)` | server.js direct |
| `/api/kabid/ketersediaan/*` | `app.use("/api/kabid/ketersediaan", ...)` | server.js direct |
| `/api/pelaksana-bidang/*` | `app.use("/api/pelaksana-bidang", ...)` | server.js direct |
| `/api/uptd/*` | `app.use("/api/uptd", ...)` | server.js direct |
| `/api/kasubag/*` | `app.use("/api/kasubag", ...)` | registerRoutes(app) |
| `/api/dashboard/*` | `app.use("/api/dashboard", dashboardRoutes)` | server.js direct |

### DUAL-MOUNT FINDING ⚠️ (non-breaking)
| Route File | server.js prefix | index.js prefix |
|---|---|---|
| `jf-ketersediaan.js` | `/api/jf/ketersediaan` | `/api/jf-ketersediaan` |
| `jf-distribusi.js` | `/api/jf/distribusi` | `/api/jf-distribusi` |
| `jf-konsumsi.js` | `/api/jf/konsumsi` | `/api/jf-konsumsi` |
| `kabid-ketersediaan.js` | `/api/kabid/ketersediaan` | `/api/kabid-ketersediaan` |
| `kabid-distribusi.js` | `/api/kabid/distribusi` | `/api/kabid-distribusi` |
| `kabid-konsumsi.js` | `/api/kabid/konsumsi` | `/api/kabid-konsumsi` |
| `pelaksana-bidang.js` | `/api/pelaksana-bidang` | `/api/pelaksana` |
| `uptd.js` | `/api/uptd` | `/api/uptd` (same - OK) |
| `gubernur.js` | `/api/gubernur` | `/api/gubernur` (same - OK) |
| `kadin.js` | `/api/kadin` | `/api/kadin` (same - OK) |

**Verdict:** Dual-mount tidak breaking (request ke kedua prefix akan berhasil). OpenAPI mendokumentasikan prefix `/api/jf/ketersediaan` (slash) yang sesuai dengan server.js direct mount. Prefix hyphenated dari index.js adalah legacy mount.

**Action:** Dokumentasikan dual-mount sebagai known behavior. Tidak perlu hapus karena bisa breaking.

---

## 2. Task Status ENUM vs TRANSITIONS vs OpenAPI

**ENUM count: 21 statuses** (Task.js)

| Status | ENUM | TRANSITIONS | OpenAPI Schema |
|--------|------|-------------|----------------|
| draft | ✅ | ✅ | ✅ |
| assigned | ✅ | ✅ | ✅ |
| accepted | ✅ | ✅ | ✅ |
| in_progress | ✅ | ✅ | ✅ |
| submitted | ✅ | ✅ | ✅ |
| verified | ✅ | ✅ | ✅ |
| review_kabid | ✅ | ✅ | ✅ |
| submitted_to_kabid | ✅ | ✅ | ✅ |
| approved_kabid | ✅ | ✅ | ✅ |
| returned_to_jf | ✅ | ✅ | ✅ |
| submitted_to_jf | ✅ | ✅ | ✅ |
| verified_by_jf | ✅ | ✅ | ✅ |
| returned_to_pelaksana | ✅ | ✅ | ✅ |
| approved_by_secretary | ✅ | ✅ | ✅ |
| forwarded_to_kadin | ✅ | ✅ | ✅ |
| escalated_to_governor | ✅ | ✅ | ✅ |
| approved_by_governor | ✅ | ✅ | ✅ |
| rejected_by_governor | ✅ | ✅ | ✅ |
| closed | ✅ | ✅ | ✅ |
| rejected | ✅ | ✅ | ✅ |
| escalated | ✅ | ✅ | ✅ |

**Result: FULL MATCH 21/21** ✅

---

## 3. Role Codes: 55-terminology vs Code

**55-terminology-canonical.md** mendefinisikan 23 role codes. Semua digunakan secara konsisten di middleware, controller, dan OpenAPI.

**No drift found.** ✅

---

## 4. ENV Vars Catalog

17 env vars teridentifikasi:

| Var | Required | Used In |
|-----|----------|---------|
| `NODE_ENV` | MANDATORY | server.js, config |
| `JWT_SECRET` | MANDATORY | middleware/auth.js |
| `JWT_REFRESH_SECRET` | MANDATORY | middleware/auth.js |
| `JWT_EXPIRES_IN` | optional | middleware/auth.js |
| `DB_HOST` | MANDATORY | config/database.js |
| `DB_PORT` | optional (default 5432) | config/database.js |
| `DB_NAME` | MANDATORY | config/database.js |
| `DB_USER` | MANDATORY | config/database.js |
| `DB_PASSWORD` | MANDATORY | config/database.js |
| `DB_DIALECT` | optional (default postgres) | config/database.js |
| `DB_STORAGE` | only SQLite | config/database.js |
| `PORT` | optional (default 5000) | server.js |
| `FRONTEND_URL` | MANDATORY (CORS) | server.js |
| `TRUST_PROXY` | optional | server.js |
| `LOG_LEVEL` | optional | server.js |
| `INFLASI_CRON_DISABLED` | optional | jobs/ |
| `SEQUELIZE_LOGGING` | optional (dev) | config/database.js |

---

## 5. Phantom Endpoint Check

**Result:** 0 phantom endpoints setelah penghapusan `force-close` dan `reassign` pada sesi sebelumnya. ✅

---

## 6. Stale Reference Check

**Checked files:** `v28-system-completion-report.md`, `reviewer-notes.md`, `55-terminology-canonical.md`, `openapi.yaml`

**No stale references found.** ✅

---

## Final Parity Verdict

| Area | Status |
|------|--------|
| Routes vs OpenAPI | ✅ MATCH (dual-mount documented) |
| Status ENUM vs TRANSITIONS vs OpenAPI | ✅ FULL MATCH 21/21 |
| Role codes | ✅ CONSISTENT |
| ENV vars | ✅ CATALOGED |
| Phantom endpoints | ✅ ZERO |
| Stale references | ✅ ZERO |

**DOCUMENTATION PARITY: 10/10** ✅
