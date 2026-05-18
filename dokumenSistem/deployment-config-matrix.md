# Deployment Config Matrix — SIGAP-MALUT

**Tanggal:** 2026-04-06 | **Versi:** v3.0

---

## 1. Environment Variables — Full Matrix

| Variable | Mandatory | Default | Nilai Aman | Risiko jika Salah |
|----------|-----------|---------|-----------|-------------------|
| `NODE_ENV` | ✅ MANDATORY | — | `production` di prod | `development` di prod: CORS longgar, logging verbose |
| `JWT_SECRET` | ✅ MANDATORY | — | String acak ≥32 karakter | Token dapat dipalsukan |
| `JWT_REFRESH_SECRET` | ✅ MANDATORY | — | String acak ≥32 karakter (berbeda dari JWT_SECRET) | Refresh token dapat dipalsukan |
| `JWT_EXPIRES_IN` | Optional | `7d` | `1d` atau `8h` di prod | Token terlalu panjang masa berlakunya |
| `DB_HOST` | ✅ MANDATORY | — | IP/hostname PostgreSQL | Koneksi gagal |
| `DB_PORT` | Optional | `5432` | `5432` | Port salah = koneksi gagal |
| `DB_NAME` | ✅ MANDATORY | — | Nama database | Koneksi ke DB salah |
| `DB_USER` | ✅ MANDATORY | — | User PostgreSQL | Auth DB gagal |
| `DB_PASSWORD` | ✅ MANDATORY | — | Password kuat | Auth DB gagal |
| `DB_DIALECT` | Optional | `postgres` | `postgres` | SQLite fallback tidak aman untuk prod |
| `DB_STORAGE` | Only SQLite | — | Hanya untuk dev/testing | Jangan set di prod |
| `PORT` | Optional | `5000` | `5000` atau sesuai load balancer | Port conflict |
| `FRONTEND_URL` | ✅ MANDATORY | — | URL frontend (CORS) | CORS error — frontend tidak bisa akses API |
| `TRUST_PROXY` | Conditional | `0` | `1` jika di belakang reverse proxy (Nginx/Caddy) | Rate limit IP tidak akurat |
| `LOG_LEVEL` | Optional | `info` | `warn` di prod | Terlalu verbose atau terlalu sunyi |
| `INFLASI_CRON_DISABLED` | Optional | `false` | `true` jika tidak perlu cron | Cron berjalan tidak perlu |
| `SEQUELIZE_LOGGING` | Optional | `false` | `false` di prod | SQL queries terleak ke log |

---

## 2. Startup Assumptions

| Assumption | Requirement |
|------------|-------------|
| PostgreSQL tersedia sebelum server start | ✅ MANDATORY |
| Redis tersedia untuk caching (opsional) | Optional — server berjalan tanpa Redis |
| File `backend/.env` atau env vars di-set | ✅ MANDATORY |
| Port tidak digunakan proses lain | ✅ MANDATORY |
| `SequelizeMeta` tabel ada (migration pernah dijalankan) | MANDATORY di production |

---

## 3. CORS Configuration

```
FRONTEND_URL=https://sigap-malut.example.go.id
```

Di `server.js`:
```javascript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
})
```

⚠️ **Jangan set `FRONTEND_URL=*`** di production — akan membuka CORS untuk semua origin.

---

## 4. Rate Limit Settings

| Endpoint | Limit | Window | File |
|----------|-------|--------|------|
| `/api/auth` | 20 request | 15 menit | server.js |
| `/api/tasks/:id/submit` | 10 request | 1 menit | server.js |
| `/api/*` (general) | 300 request | 1 menit | server.js |

---

## 5. Trust Proxy

```javascript
if (process.env.TRUST_PROXY === "1" || process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
```

**Wajib aktifkan** jika deploy di belakang Nginx/Caddy/load balancer — agar IP rate limit akurat.

---

## 6. Deployment Checklist

```
[ ] NODE_ENV=production
[ ] JWT_SECRET (≥32 chars, random)
[ ] JWT_REFRESH_SECRET (≥32 chars, berbeda dari JWT_SECRET)
[ ] DB_HOST / DB_NAME / DB_USER / DB_PASSWORD
[ ] FRONTEND_URL (URL spesifik, bukan wildcard)
[ ] TRUST_PROXY=1 (jika di belakang proxy)
[ ] PostgreSQL migrations dijalankan
[ ] Redis tersedia (untuk caching optimal)
[ ] SEQUELIZE_LOGGING tidak set (atau false)
[ ] DB_STORAGE tidak set (hanya untuk SQLite)
```

---

## 7. Contoh `.env.production`

```env
NODE_ENV=production
PORT=5000

JWT_SECRET=<random-string-min-32-chars>
JWT_REFRESH_SECRET=<different-random-string>
JWT_EXPIRES_IN=1d

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sigap_malut_prod
DB_USER=sigap_user
DB_PASSWORD=<strong-password>
DB_DIALECT=postgres

FRONTEND_URL=https://sigap-malut.example.go.id
TRUST_PROXY=1
LOG_LEVEL=warn
```
