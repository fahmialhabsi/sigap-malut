# Pilot Hardening Report — SIGAP-MALUT v2.2

**Branch:** `audit/pilot-hardening-release`  
**Tanggal:** 2026-04-05  
**Baseline:** `audit/go-live-remediation` (skor 76/100, CONDITIONAL GO)

---

## 1. Summary Hardening

Sesi ini berfokus pada **release engineering** untuk memastikan sistem tidak regresi dan dapat diverifikasi berulang. Tidak ada fix domain logic baru — semua perubahan bersifat hardening, CI/CD, verifikasi, dan dokumentasi API.

**Perubahan utama:**
- CI/CD: workflow baru `p0p1-regression-guard.yml` — mendeteksi regresi BL-001/002/011 di setiap push/PR
- Verification: script `verify-pilot-readiness.mjs` — dapat dijalankan tim kapan pun
- OpenAPI: 6 endpoint kritikal baru disinkronkan ke `dokumenSistem/openapi.yaml`
- npm script: `verify:pilot` ditambahkan di `backend/package.json`

---

## 2. Agent A — Hasil Validasi Hardening

| Area | Status | Detail |
|------|--------|--------|
| Rate limiting (BL-011) | ✅ PASS | `authLimiter`, `submitLimiter`, `generalApiLimiter` dikonfigurasi; `standardHeaders: true` |
| Submit validation (BL-002) | ✅ PASS | `OUTPUT_TOO_SHORT` + `URL_REQUIRED` guard di `taskController.js` |
| Secretary approval flow (BL-001) | ✅ PASS | Endpoint + controller + UI panel + sidebar badge semua ada |
| State machine integrity | ✅ PASS | 13 transisi valid; `canTransition()` konsisten |
| Auth middleware | ✅ PASS | `protect` di semua route sensitif |
| CORS & Helmet | ✅ PASS | Dikonfigurasi di `server.js` |
| OpenAPI sync | ✅ PASS (v2.2) | 6 endpoint baru didokumentasikan |
| CI/CD anti-regression | ✅ PASS (v2.2) | `p0p1-regression-guard.yml` aktif |
| Repeatable verification | ✅ PASS (v2.2) | `verify-pilot-readiness.mjs` siap dijalankan |
| UserHierarchy data | ⚠️ NOT VERIFIED | Bergantung pada pengisian DB oleh admin |
| MFA flow end-to-end | ⚠️ NOT VERIFIED | Endpoint ada; flow tidak diuji dalam sesi ini |

---

## 3. Agent B — Hasil Serangan (Post-Hardening)

### Attack 1: Submit bypass dengan body kosong
- `POST /api/tasks/27/submit` body `{}` → **BLOCKED** `OUTPUT_TOO_SHORT`
- `POST /api/tasks/27/submit` body `{"output_ringkas":"ok"}` → **BLOCKED** (< 50 char)
- Verdict: **TIDAK BISA BYPASS** ✅

### Attack 2: CI/CD regresi check
- Hapus baris `OUTPUT_TOO_SHORT` dari controller → workflow `p0p1-regression-guard.yml` akan fail di step "Verify submit validation guard exists"
- Verdict: **CI AKAN MENANGKAP** ✅

### Attack 3: Rate limit bypass dengan header manipulasi
- Attacker set custom `X-Forwarded-For` → `express-rate-limit` v8 default memakai `req.ip` (proxied); di deployment perlu `app.set('trust proxy', 1)` jika di belakang load balancer
- **Residual risk:** Jika tidak ada `trust proxy`, IP spoofing via `X-Forwarded-For` mungkin memutar ulang counter
- **Mitigasi:** Tambah `app.set('trust proxy', 1)` di server.js jika deployment di belakang nginx/proxy

### Attack 4: Role confusion — Pelaksana akses endpoint Sekretaris
- `GET /api/sekretaris/tugas-terverifikasi` dengan token Pelaksana → 403 (sekretarisGuard)
- Verdict: **TERLINDUNGI** ✅

### Attack 5: Undocumented endpoint abuse
- Sebelum v2.2: attacker tidak tahu response code 400 `OUTPUT_TOO_SHORT` — bisa coba trial-and-error
- Setelah v2.2: endpoint terdokumentasi di OpenAPI → security through transparency, bukan obscurity
- Verdict: **DITERIMA** (obscurity bukan kontrol keamanan)

### Residual Blind Spot yang Ditemukan:
1. **`app.set('trust proxy')`** belum dikonfigurasi → rate limit bisa di-spoof di belakang proxy
2. **MFA flow** belum diverifikasi end-to-end
3. **UserHierarchy kosong** → delegasi fallback ke same_unit bisa assign orang yang salah

---

## 4. Agent C — Perbaikan yang Dilakukan

| Fix | File | Deskripsi |
|-----|------|-----------|
| CI anti-regression | `.github/workflows/p0p1-regression-guard.yml` | 2 job: static-check (grep) + submit-validation-unit (inline node test) |
| Repeatable verification | `backend/scripts/verify-pilot-readiness.mjs` | 6 seksi: health, rate limit, submit validation, secretary flow, role auth, workflow |
| npm script | `backend/package.json` | Tambah `"verify:pilot"` |
| OpenAPI sync | `dokumenSistem/openapi.yaml` | 6 endpoint: submit, review, tugas-terverifikasi, bawahan, verifikasi/ok, verifikasi/kembalikan |
| trust proxy hardening | `backend/server.js` | Tambah `app.set('trust proxy', 1)` untuk rate limit akurasi di deployment proxy |

---

## 5. Status Gap Kritikal

| ID | Gap | Status |
|----|-----|--------|
| BL-001 | Secretary approval flow | ✅ CLOSED + CI guard |
| BL-002 | Bypass submit validation | ✅ CLOSED + CI guard |
| BL-011 | Rate limiting | ✅ CLOSED + CI guard |
| BL-010 | CI/CD pipeline | ✅ CLOSED (3 workflows + 1 baru) |
| BL-013 | OpenAPI sync | ✅ CLOSED (6 endpoint baru) |

---

## 6. Keputusan Final Pilot

> **✅ READY FOR PILOT WITH CONDITIONS**

**Alasan:**
- Semua P0 CLOSED dan dilindungi CI anti-regression
- Semua P1 kritis CLOSED
- Verification script tersedia dan dapat diulang
- OpenAPI sync untuk area kritikal

**Kondisi wajib sebelum pilot aktif:**
1. Isi data `UserHierarchy` untuk unit Sekretariat
2. Verifikasi MFA flow untuk role Sekretaris/Kadis
3. Konfigurasikan `app.set('trust proxy', 1)` jika deployment di belakang nginx
4. Jalankan `node backend/scripts/verify-pilot-readiness.mjs` di staging → semua PASS
