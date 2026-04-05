# Updated Risk Register — SIGAP-MALUT v2.2

**Tanggal:** 2026-04-05  
**Branch:** `audit/pilot-hardening-release`  
**Baseline:** `risk-register.md` v2.1

Skala: Likelihood (1–5), Impact (1–5), Risk Score = L × I

---

## Risiko Aktif

| ID | Risiko | L | I | Skor | Status | Mitigasi | Owner |
|----|--------|---|---|------|--------|----------|-------|
| R-01 | UserHierarchy kosong → delegasi ke orang yang salah | 4 | 4 | 16 | 🔴 OPEN | Isi data sebelum pilot; fallback same_unit ada | Admin/DBA |
| R-02 | `trust proxy` tidak dikonfigurasi → rate limit di-spoof | 3 | 3 | 9 | 🟡 MITIGATED | Tambah `app.set('trust proxy',1)` jika deploy di belakang nginx | DevOps |
| R-03 | MFA flow belum diverifikasi → bypass 2FA | 2 | 4 | 8 | 🟡 OPEN | Test MFA end-to-end sebelum pilot live | Tim Backend |
| R-04 | Migration di staging tidak diverifikasi → data corrupt | 2 | 5 | 10 | 🔴 OPEN | Jalankan `db:migrate:status` di staging | DBA |
| R-05 | `NODE_ENV` tidak `production` → error detail expose ke user | 3 | 3 | 9 | 🟡 OPEN | Verifikasi env var di server deploy | DevOps |
| R-06 | CORS origin tidak dikonfigurasi untuk domain pilot | 3 | 3 | 9 | 🟡 OPEN | Set CORS_ORIGIN di .env staging | DevOps |
| R-07 | Tidak ada runbook rollback → recovery lambat jika incident | 2 | 4 | 8 | 🟡 OPEN | Buat runbook sebelum pilot aktif | PM/DevOps |
| R-08 | Frontend build tidak divalidasi di CI → UI crash tidak terdeteksi | 2 | 3 | 6 | 🟡 OPEN | Tambah `npm run build` gate di ci.yml | Frontend Lead |
| R-09 | OpenAPI masih belum sinkron ~15 endpoint P1 | 2 | 2 | 4 | 🟢 LOW | Lanjutkan sinkronisasi pasca pilot v1 | Tim Backend |
| R-10 | Jest coverage threshold belum dikonfigurasi | 2 | 2 | 4 | 🟢 LOW | Tambah coverageThreshold di jest.config | QA Lead |

---

## Risiko Tertutup (v2.1 → v2.2)

| ID | Risiko | Status Sebelum | Status Setelah | Cara Ditutup |
|----|--------|---------------|----------------|--------------|
| R-BL002 | Submit validation bypass via direct API | 🔴 OPEN | ✅ CLOSED | `OUTPUT_TOO_SHORT` + `URL_REQUIRED` guard di taskController.js |
| R-BL011 | Tidak ada rate limiting → brute force | 🔴 OPEN | ✅ CLOSED | express-rate-limit: authLimiter + submitLimiter + generalApiLimiter |
| R-BL001 | Secretary flow missing → workflow stuck | 🔴 OPEN | ✅ CLOSED | Endpoint + controller + UI ReviewTugasVerifiedPanel |
| R-NOCI | Tidak ada CI anti-regression | 🔴 OPEN | ✅ CLOSED | p0p1-regression-guard.yml |
| R-NOVERIFY | Tidak ada repeatable verification | 🔴 OPEN | ✅ CLOSED | verify-pilot-readiness.mjs |
| R-OPENAPI | 6 endpoint kritikal tidak terdokumentasi | 🔴 OPEN | ✅ CLOSED | OpenAPI sync v2.2 |

---

## Prioritas Tindakan Segera (sebelum pilot)

1. **R-01** (Skor 16) — Isi UserHierarchy untuk Sekretariat — deadline 2026-04-08
2. **R-04** (Skor 10) — Verifikasi migration di staging — deadline 2026-04-09
3. **R-02** (Skor 9) — Konfigurasi trust proxy — deadline 2026-04-10
4. **R-05** (Skor 9) — Verifikasi NODE_ENV=production — deadline 2026-04-10
5. **R-06** (Skor 9) — Set CORS origin — deadline 2026-04-10
