# CI/CD Minimum Plan — SIGAP-MALUT Pilot

**Branch:** `audit/pilot-hardening-release`  
**Tanggal:** 2026-04-05

---

## Pipeline yang Ada + Baru

| File | Trigger | Fungsi | Status |
|------|---------|--------|--------|
| `.github/workflows/ci.yml` | Push/PR ke main | Install + test + build (legacy, minimal) | Ada sebelumnya |
| `.github/workflows/pilot-rollout-gate.yml` | PR ke main | Auth schema guard + UPTD pilot tests | Ada sebelumnya |
| `.github/workflows/compare-docs.yml` | PR ke main | Perbandingan dokumen | Ada sebelumnya |
| **`.github/workflows/p0p1-regression-guard.yml`** | **Push ke main/feat/audit + PR** | **Anti-regresi P0/P1 (BL-001/002/011)** | **BARU** |

---

## Detail: `p0p1-regression-guard.yml`

### Tujuan
Memastikan fix kritikal BL-001, BL-002, BL-011 tidak hilang/regresi akibat perubahan code berikutnya.

### Trigger
```yaml
on:
  push:
    branches: [main, "feat/**", "audit/**"]
  pull_request:
    branches: [main]
```

### Jobs

#### Job 1: `static-check` (±2 menit)
Tidak membutuhkan DB atau server running. Verifikasi via `grep` bahwa:
- `OUTPUT_TOO_SHORT` ada di `taskController.js` (BL-002)
- `authLimiter` + `submitLimiter` ada di `server.js` (BL-011)
- Route `tugas-terverifikasi` ada di `sekretarisIndex.js` (BL-001)
- `ReviewTugasVerifiedPanel` terimport di `DashboardSekretariat.jsx` (BL-001 UI)

**Fail condition:** Jika salah satu check tidak ditemukan → exit 1 → PR/push diblokir

#### Job 2: `submit-validation-unit` (±3 menit)
Node.js inline test (tidak perlu jest/mocha). Memeriksa source code:
- BL-002: 6 validation checks di `taskController.js`
- BL-011: 7 rate limit config checks di `server.js`
- BL-001: 5 route/controller checks di `sekretarisIndex.js` + `tugasVerifiedController.js`

**Fail condition:** Jika test count tidak sesuai → exit 1

### Limitasi
- Tidak menjalankan live server → tidak bisa verifikasi HTTP 429 real
- Tidak bisa verifikasi race condition nyata
- MFA flow tidak diuji
- Frontend build tidak diverifikasi

### Coverage
| Fix | Static Check | Inline Test | Live Server |
|-----|-------------|-------------|-------------|
| BL-002 (submit validation) | ✅ | ✅ | Via `verify-pilot-readiness.mjs` |
| BL-011 (rate limit) | ✅ | ✅ | Via `verify-pilot-readiness.mjs` |
| BL-001 (sekretaris panel) | ✅ | ✅ | Via `verify-pilot-readiness.mjs` |

---

## Script Verifikasi Manual: `verify-pilot-readiness.mjs`

```bash
# Requires: backend running (npm run dev)
cd backend
npm run verify:pilot

# Atau langsung:
node scripts/verify-pilot-readiness.mjs
```

**Precondition:**
- Backend running di port 5000
- DB tersedia dengan user demo (`sekretaris@dinpangan.go.id`, `pelaksana.a@example.com`)
- Password: `Password123` (atau set `SIM_DEMO_PASSWORD`)

**Coverage:** 6 seksi, 18+ test case, exit code 0/1

---

## Langkah Berikutnya untuk CI Full

| Langkah | Waktu | Owner |
|---------|-------|-------|
| Tambah jest coverage threshold di `jest.config.js` | 1 hari | QA Lead |
| Integrasikan `verify-pilot-readiness.mjs` ke pipeline dengan live DB | 2 hari | DevOps |
| Frontend lint + build gate | 1 hari | Frontend Lead |
| Database migration check di CI | 1 hari | DBA |
