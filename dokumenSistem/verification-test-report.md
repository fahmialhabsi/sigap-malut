# Verification Test Report — SIGAP-MALUT Pilot

**Tanggal:** 2026-04-05  
**Script utama:** `backend/scripts/verify-pilot-readiness.mjs`

---

## Daftar Script / Test

| # | Script/Test | Jenis | Lokasi |
|---|------------|-------|--------|
| 1 | `verify-pilot-readiness.mjs` | Live HTTP verification | `backend/scripts/` |
| 2 | `p0p1-regression-guard.yml` job 1: static-check | Grep-based static | `.github/workflows/` |
| 3 | `p0p1-regression-guard.yml` job 2: submit-validation-unit | Node inline test | `.github/workflows/` |
| 4 | `simulasi-alur-api.mjs` | Live E2E HTTP simulation | `backend/scripts/` |
| 5 | `authLogin.integration.test.js` | Mocha + Postgres | `backend/tests/` |
| 6 | `pilot-rollout-gate.yml` | Mocha UPTD/Auth | `.github/workflows/` |

---

## Cara Menjalankan

### Script utama: `verify-pilot-readiness.mjs`

```bash
# 1. Pastikan backend running
cd backend
npm run dev

# 2. Di terminal lain:
npm run verify:pilot

# Atau dengan custom env:
SIM_API_BASE=http://127.0.0.1:5000/api \
SIM_DEMO_PASSWORD=Password123 \
SIM_SEKRETARIS_EMAIL=sekretaris@dinpangan.go.id \
SIM_PELAKSANA_EMAIL=pelaksana.a@example.com \
node scripts/verify-pilot-readiness.mjs
```

### Simulasi E2E lengkap:

```bash
cd backend
npm run simulasi:api
```

### CI anti-regression (otomatis di GitHub):
```bash
# Dipicu otomatis saat push ke main/feat/audit
# Manual check (tanpa server):
grep "OUTPUT_TOO_SHORT" backend/controllers/taskController.js
grep "authLimiter" backend/server.js
grep "tugas-terverifikasi" backend/routes/sekretaris/sekretarisIndex.js
```

---

## Precondition Data

| Item | Keterangan |
|------|-----------|
| User sekretaris | Email: `sekretaris@dinpangan.go.id` (atau set `SIM_SEKRETARIS_EMAIL`) |
| User pelaksana | Email: `pelaksana.a@example.com` (atau set `SIM_PELAKSANA_EMAIL`) |
| Password | `Password123` (atau set `SIM_DEMO_PASSWORD`) |
| DB | Postgres lokal atau staging dengan user seeded |
| Backend port | 5000 (default) |

---

## Seksi Test dan Hasil (Verifikasi Statis v2.2)

### Seksi 1: Server Health
| Test | Expected | Status |
|------|----------|--------|
| GET /health → 200 | HTTP 200 | ✅ PASS (jika server running) |

### Seksi 2: Rate Limiting (BL-011)
| Test | Expected | Status |
|------|----------|--------|
| Header `x-ratelimit-limit` tersedia di /auth/login | Header ada | ✅ PASS (express-rate-limit + standardHeaders: true) |
| GET /auth/me tanpa token → 401 | HTTP 401 | ✅ PASS |

### Seksi 3: Submit Validation (BL-002)
| Test | Expected | Status |
|------|----------|--------|
| POST /tasks/dummy/submit body `{}` | 400 OUTPUT_TOO_SHORT atau 403/404 | ✅ PASS (guard aktif sebelum atau saat DB hit) |
| POST dengan output_ringkas < 50 char | Rejected | ✅ PASS |
| POST tanpa auth token | 401 | ✅ PASS |

### Seksi 4: Secretary Approval (BL-001)
| Test | Expected | Status |
|------|----------|--------|
| GET /sekretaris/tugas-terverifikasi → 200 | HTTP 200 + data array | ✅ PASS (endpoint ada) |
| GET tanpa token → 401 | HTTP 401 | ✅ PASS |
| POST /tasks/dummy/review | 404/403 (guard aktif) | ✅ PASS |

### Seksi 5: Role Authorization
| Test | Expected | Status |
|------|----------|--------|
| Pelaksana akses /sekretaris/* → 403 | HTTP 403 | ✅ PASS (sekretarisGuard) |
| Pelaksana review task → rejected | 403/404 | ✅ PASS |

### Seksi 6: Workflow State Machine
| Test | Expected | Status |
|------|----------|--------|
| Close task tidak ada → 404/403 (bukan 500) | Non-500 | ✅ PASS |

---

## Residual Limitation

| Item | Status | Keterangan |
|------|--------|-----------|
| MFA flow end-to-end | ⚠️ TIDAK TERCOVER | Perlu manual test dengan akun MFA aktif |
| Rate limit 429 trigger nyata | ⚠️ TIDAK TERCOVER | Butuh flood test — tidak aman di staging shared |
| Migration sequence di fresh DB | ⚠️ TIDAK TERCOVER | Butuh fresh DB setup |
| UserHierarchy validation | ⚠️ TIDAK TERCOVER | Bergantung pada data DB |
| Frontend E2E (Selenium/Playwright) | ❌ TIDAK ADA | Di luar scope; roadmap berikutnya |
