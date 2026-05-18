# Updated Dev Backlog — Post Go-Live Remediation

**Tanggal:** 2026-04-05  
**Branch:** `audit/go-live-remediation`

---

## Status Ringkasan

| Status | Jumlah |
|--------|--------|
| ✅ CLOSED (dalam sesi ini) | 3 (BL-001, BL-002, BL-011) |
| ⚠️ PARTIAL | 2 (BL-010, BL-013) |
| 🔴 OPEN | 9 (BL-003, BL-004, BL-005, BL-006, BL-007, BL-008, BL-009, BL-012, BL-014) |
| ✅ Done sebelumnya | 2 (BL-006, BL-007) |

---

## CLOSED (sesi ini)

### BL-001 ✅ CLOSED
**Task:** Panel `approved_by_secretary` di Dashboard Sekretaris  
**Bukti:**
- `backend/controllers/sekretaris/tugasVerifiedController.js` (baru)
- `backend/routes/sekretaris/sekretarisIndex.js` (route baru)
- `frontend/src/components/sekretaris/ReviewTugasVerifiedPanel.jsx` (baru)
- `frontend/src/ui/dashboards/DashboardSekretariat.jsx` (integrasi + badge)

### BL-002 ✅ CLOSED
**Task:** Bypass validasi submit via `taskController.js`  
**Bukti:**
- `backend/controllers/taskController.js` — `POST /:id/submit` handler penuh dengan validasi

### BL-011 ✅ CLOSED
**Task:** Rate limiting tidak diterapkan  
**Bukti:**
- `backend/server.js` — 3 limiter aktif (auth/submit/general)

---

## PARTIAL (perlu tindak lanjut)

### BL-010 ⚠️ PARTIAL
**Task:** Setup CI/CD pipeline  
**File:** `.github/workflows/ci.yml` (belum ada)  
**Problem:** Tidak ada otomasi test/build/lint sebelum deploy  
**Action:**
1. Buat `.github/workflows/ci.yml` dengan step: install, lint, test, build
2. Tambah `coverageThreshold` di jest.config backend
3. Tambah threshold di vite test config frontend

**Priority:** P1  
**Owner:** DevOps  
**Status:** Open

---

### BL-013 ⚠️ PARTIAL
**Task:** Sinkronisasi `openapi.yaml`  
**File:** `openapi.yaml`  
**Problem:** Endpoint baru tidak terdokumentasi: `/api/sekretaris/tugas-terverifikasi`, `/api/kasubag/bawahan`, `/api/kasubag/verifikasi/:id/ok`, `/api/pelaksana/tugas/:id/submit`  
**Action:**
1. Identifikasi semua endpoint aktif dari route files
2. Tambahkan ke `openapi.yaml` dengan schema
3. Validasi dengan spectral/swagger-parser

**Priority:** P1  
**Owner:** Backend Lead  
**Status:** Open

---

## OPEN (belum dikerjakan)

### BL-003 — Substitusi tugas (model DB ≠ ERD)
**Priority:** P2 | **Owner:** Backend Lead + DBA | **Status:** Open  
Field `assignee_id_primer`, `assignee_id_aktual`, `adalah_substitusi` di ERD belum ada di DB.  
Perlu migrasi `20260405-add-substitution-fields-task-assignments.cjs`.

### BL-004 — Konsolidasi ~10 pasang dokumen duplikat
**Priority:** P2 | **Owner:** Doc Maintainer | **Status:** Open

### BL-005 — Pindahkan 9 file Master Prompt ke subfolder
**Priority:** P3 | **Owner:** Doc Maintainer | **Status:** Open

### BL-008 — Pengisian UAT matrix dari hasil manual
**Priority:** P1 | **Owner:** QA Lead | **Status:** Partial  
Seksi S-01 s.d. A-08 sudah terisi dari simulasi otomatis. Seksi B, U, BD, N perlu uji manual.

### BL-009 — Konfigurasi coverageThreshold di jest.config
**Priority:** P1 | **Owner:** QA Lead | **Status:** Open  
Dokumen 20 sudah punya target coverage (backend ≥ 80%, workflow ≥ 90%). Perlu dikonfigurasi di `jest.config.js`.

### BL-012 — Verifikasi MFA flow (bukan hanya scaffolding)
**Priority:** P1 | **Owner:** Backend Lead + Security | **Status:** Open

### BL-014 — Sinkronisasi data wilayah peta (MapLayerPanel)
**Priority:** P2 | **Owner:** Backend Lead + Frontend | **Status:** Open

---

## Task Baru (dari sesi ini)

### BL-015 — Refactor submit validation ke shared function
**Task:** Pindahkan validasi output dari `taskController.js` ke shared utility  
**File:** `backend/utils/submitValidation.js` (baru), `taskController.js`, `pelaksanaSekretariat/tugasController.js`  
**Problem:** Validasi duplikasi di dua tempat — perlu satu sumber kebenaran  
**Action:** Extract ke `validateSubmitOutput(body, task)` utility; gunakan di kedua controller  
**Priority:** P2  
**Owner:** Backend Lead  
**Status:** Open

### BL-016 — Tambah endpoint baru ke openapi.yaml
**Task:** Dokumentasikan `GET /sekretaris/tugas-terverifikasi` + `POST /tasks/:id/review` di openapi.yaml  
**Priority:** P1  
**Owner:** Backend Lead  
**Status:** Open (merge dengan BL-013)
