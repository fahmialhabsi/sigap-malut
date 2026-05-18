# Deployment Hardening Report — SIGAP-MALUT

**Tanggal:** 2026-04-06 | **Versi:** v3.0

---

## 1. Security Headers

**Helmet.js** aktif di `server.js` — menyediakan:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (saat HTTPS)
- `Content-Security-Policy` (default)

**Status:** ✅ ACTIVE

---

## 2. Rate Limiting

| Target | Limit | Window | Status |
|--------|-------|--------|--------|
| Auth endpoints | 20 req | 15 min | ✅ ACTIVE |
| Submit endpoint | 10 req | 1 min | ✅ ACTIVE |
| General API | 300 req | 1 min | ✅ ACTIVE |

---

## 3. CORS

- Origin dibatasi via `FRONTEND_URL` env var ✅
- Credentials: `true` ✅
- Tidak ada wildcard origin ✅

---

## 4. Trust Proxy

- Aktif secara otomatis jika `NODE_ENV=production` ✅
- Bisa dioverride via `TRUST_PROXY=1` ✅

---

## 5. Database

- Connection via environment variables (tidak hardcoded) ✅
- PostgreSQL dialect default ✅
- SQLite hanya untuk testing (`DB_STORAGE` env) ✅
- `DB_SYNC_ON_BOOT=disabled` di production ✅

---

## 6. JWT

- Secret via env vars (tidak hardcoded) ✅
- Refresh token terpisah dari access token ✅
- Expiry configurable (`JWT_EXPIRES_IN`) ✅

---

## 7. Temuan Hardening yang Perlu Perhatian di Production

| Issue | Severity | Action |
|-------|----------|--------|
| `ensureTask*` DDL tables dijalankan setiap boot | LOW | Gunakan migrations di production (set `DB_MIGRATION_REQUIRED=1`) |
| `SEQUELIZE_LOGGING` default verbose di dev | LOW | Pastikan `false`/tidak di-set di production |
| Redis optional — tidak ada fallback alert | LOW | Tambahkan health check Redis di monitoring |
| `task_discussions` dan `instruksi_tindak_lanjut_pesan` tabel baru | MEDIUM | Jalankan migration sebelum deploy ke production |

---

## 8. Verdict

**Deployment config: HARDENED for pilot/staging** ✅

Semua config kritikal terdokumentasi. Tidak ada hardcoded secrets. Rate limiting aktif. CORS aman.
