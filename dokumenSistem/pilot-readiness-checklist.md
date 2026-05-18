# Pilot Readiness Checklist — SIGAP-MALUT

**Tanggal:** 2026-04-05  
**Versi:** v2.2 (post pilot-hardening-release)  
**Scope:** Pilot terbatas unit Sekretariat

---

## A. SYSTEM CHECK

| # | Item | Status | Owner | Due Date | Catatan |
|---|------|--------|-------|----------|---------|
| A1 | Submit validation aman (BL-002) | ✅ READY | Tim Backend | — | `OUTPUT_TOO_SHORT` + `URL_REQUIRED` aktif |
| A2 | Rate limiting aktif (BL-011) | ✅ READY | Tim Backend | — | authLimiter + submitLimiter + generalApiLimiter |
| A3 | Auth protection semua endpoint sensitif | ✅ READY | Tim Backend | — | `protect` middleware di semua route |
| A4 | Secretary approval flow end-to-end (BL-001) | ✅ READY | Tim Backend | — | Endpoint + controller + UI panel |
| A5 | Error handling minimum (tidak expose stack di prod) | ⚠️ READY WITH CONDITION | Tim Backend | 2026-04-12 | Perlu verifikasi `NODE_ENV=production` di deployment |
| A6 | CORS dikonfigurasi untuk domain pilot | ⚠️ READY WITH CONDITION | DevOps | 2026-04-10 | Konfigurasi CORS origin untuk domain staging |
| A7 | trust proxy dikonfigurasi (jika di belakang nginx) | ⚠️ READY WITH CONDITION | DevOps | 2026-04-10 | `app.set('trust proxy', 1)` harus diverifikasi |
| A8 | State machine tidak bisa dilewati | ✅ READY | Tim Backend | — | canTransition() diverifikasi di semua endpoint |

---

## B. DATA CHECK

| # | Item | Status | Owner | Due Date | Catatan |
|---|------|--------|-------|----------|---------|
| B1 | User hierarchy untuk unit Sekretariat terisi | ⚠️ READY WITH CONDITION | Admin/DBA | **2026-04-08** | KRITIS: tanpa ini delegasi fallback ke same_unit |
| B2 | Akun role pilot tersedia (Sekretaris, Kasubag, Pelaksana) | ⚠️ READY WITH CONDITION | Admin | **2026-04-08** | Verifikasi akun aktif di DB staging |
| B3 | Data referensi minimum (unit_kerja, role) tersedia | ✅ READY | DBA | — | Seeder ada di `database/seeders/seed.js` |
| B4 | Password akun demo di-reset untuk pilot | ⚠️ READY WITH CONDITION | Admin | **2026-04-08** | `SIM_RESET_DEMO_PASSWORD=1` atau manual |

---

## C. RELEASE CHECK

| # | Item | Status | Owner | Due Date | Catatan |
|---|------|--------|-------|----------|---------|
| C1 | Migration aman di staging | ⚠️ READY WITH CONDITION | DBA | **2026-04-09** | Jalankan `npm run db:migrate:status` + verify |
| C2 | Staging deploy tervalidasi | ⚠️ READY WITH CONDITION | DevOps | **2026-04-09** | Deploy ke staging → cek tidak ada error startup |
| C3 | Smoke verification `verify-pilot-readiness.mjs` lulus | ⚠️ READY WITH CONDITION | DevOps | **2026-04-09** | `npm run verify:pilot` → semua PASS |
| C4 | CI/CD anti-regression aktif | ✅ READY | DevOps | — | `p0p1-regression-guard.yml` sudah ada |
| C5 | Legacy workflow pipeline masih hijau | ✅ READY | DevOps | — | ci.yml, pilot-rollout-gate.yml tidak diubah |
| C6 | Rollback plan tersedia | ⚠️ READY WITH CONDITION | DevOps | **2026-04-09** | Dokumentasi rollback: revert ke commit sebelumnya, restore DB dari backup |

---

## D. SECURITY CHECK

| # | Item | Status | Owner | Due Date | Catatan |
|---|------|--------|-------|----------|---------|
| D1 | Brute force login tertahan (rate limit 20/15min) | ✅ READY | Tim Backend | — | authLimiter aktif |
| D2 | Unauthorized access ditolak (401/403 bukan 200) | ✅ READY | Tim Backend | — | protect + sekretarisGuard |
| D3 | Endpoint sensitif terdokumentasi | ✅ READY | Tim Backend | — | OpenAPI sync v2.2 |
| D4 | JWT secret tidak hardcoded di code | ✅ READY | Tim Backend | — | dari process.env.JWT_SECRET |
| D5 | `.env` tidak ter-commit ke repository | ✅ READY | DevOps | — | .gitignore includes .env |
| D6 | MFA flow diverifikasi | ⚠️ READY WITH CONDITION | Tim Backend | **2026-04-10** | Endpoint ada; flow belum ditest end-to-end |

---

## E. OPERATIONAL CHECK

| # | Item | Status | Owner | Due Date | Catatan |
|---|------|--------|-------|----------|---------|
| E1 | Runbook deployment minimal tersedia | ⚠️ READY WITH CONDITION | DevOps | **2026-04-10** | Perlu dokumen: cara deploy, env vars wajib, health check |
| E2 | Rollback awareness terdokumentasi | ⚠️ READY WITH CONDITION | DevOps | **2026-04-10** | Langkah rollback jika pilot gagal |
| E3 | Residual risk terdokumentasi | ✅ READY | Tim Backend | — | `updated-risk-register.md` tersedia |
| E4 | Contact person pilot tersedia | ⚠️ READY WITH CONDITION | PM | **2026-04-08** | Tentukan PIC teknis dan operasional |
| E5 | Monitoring dasar aktif (health endpoint) | ✅ READY | Tim Backend | — | `/health` endpoint ada |
| E6 | Log cukup untuk debugging (tidak expose data sensitif) | ✅ READY | Tim Backend | — | AuditLog service aktif |

---

## Ringkasan Status

| Kategori | READY | READY WITH CONDITION | NOT READY |
|---------|-------|---------------------|-----------|
| System Check | 6 | 2 | 0 |
| Data Check | 1 | 3 | 0 |
| Release Check | 2 | 4 | 0 |
| Security Check | 5 | 1 | 0 |
| Operational Check | 3 | 3 | 0 |
| **TOTAL** | **17** | **13** | **0** |

---

## Keputusan

> **✅ READY FOR PILOT WITH CONDITIONS**

**Blocker yang harus diselesaikan sebelum pilot hari pertama:**
1. B1 — User hierarchy Sekretariat terisi (deadline: 2026-04-08)
2. B2 — Akun pilot tersedia di staging DB (deadline: 2026-04-08)
3. C3 — `verify-pilot-readiness.mjs` lulus di staging (deadline: 2026-04-09)

**Kondisi yang boleh diselesaikan paralel dengan pilot:**
- A5, A6, A7 — env/CORS/proxy config
- C1, C2, C6 — migration + staging + rollback plan
- D6 — MFA test
- E1, E2 — runbook
