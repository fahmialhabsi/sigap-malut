# Dev Backlog — Audit dokumenSistem SIGAP-MALUT

**Branch:** `audit/dokumen-enterprise-2026-04-05`  
**Tanggal:** 2026-04-05  
**Metodologi:** Gap ditemukan dari audit 8-layer → dikonversi ke task actionable

---

## Format

```
Task:
File:
Problem:
Action:
Priority:
Owner:
Status:
```

---

## DOMAIN: WORKFLOW & PROSES

---

### BL-001

**Task:** Tambah endpoint & UI trigger `approved_by_secretary` setelah verifikasi Kasubag  
**File:** `backend/controllers/sekretaris/`, `frontend/src/ui/dashboards/DashboardSekretariat.jsx`  
**Problem:** Alur `verified → approved_by_secretary → forwarded_to_kadin` tidak punya trigger UI di dashboard Sekretaris. Setelah Kasubag klik "Verifikasi OK", tugas berhenti di status `verified` tanpa eskalasi otomatis ke Sekretaris.  
**Action:**
1. Buat endpoint `POST /api/sekretaris/tugas/:id/setujui` yang mengubah status ke `approved_by_secretary`.
2. Tambah panel "Perlu Persetujuan" di DashboardSekretariat menampilkan tugas status `verified`.
3. Tombol "Setujui" dan "Teruskan ke Kadis" di panel tersebut.
4. Update `08-spesifikasi-workflow-bisnis.md` dengan langkah ini.

**Priority:** P1  
**Owner:** Backend Lead + Frontend Lead  
**Status:** Open

---

### BL-002

**Task:** Validasi submit tugas di endpoint umum `POST /tasks/:id/submit` (bypass prevention)  
**File:** `backend/controllers/taskController.js`  
**Problem:** Validasi output (min. 50 karakter ringkasan, URL wajib untuk ASN) hanya ada di `pelaksanaSekretariat/tugasController.js`. Endpoint umum `taskController.js` tidak punya validasi — bisa di-bypass dengan request langsung.  
**Action:**
1. Tambah middleware/guard di `taskController.js` `submitTask` yang memanggil validasi yang sama.
2. Atau pindahkan validasi ke level middleware terpisah yang reusable.
3. Test: `POST /api/tasks/:id/submit` dengan body kosong dari Pelaksana → harus 400.

**Priority:** P0 (keamanan + integritas data)  
**Owner:** Backend Lead  
**Status:** Open

---

### BL-003

**Task:** Implementasi substitusi tugas sesuai dokumen 14 §5  
**File:** `backend/models/TaskAssignment.js`, `backend/migrations/`, `dokumenSistem/10-erd-model-database.md`  
**Problem:** ERD dokumen mendefinisikan `assignee_id_primer`, `assignee_id_aktual`, `adalah_substitusi`, `alasan_substitusi` di `task_assignments` — tidak ada di model DB nyata. Fitur substitusi (pegawai berhalangan → tugas dialihkan) belum terimplementasi.  
**Action:**
1. Buat migrasi `20260405-add-substitution-fields-task-assignments.cjs`.
2. Update model `TaskAssignment.js` dengan field baru.
3. Buat endpoint `POST /api/tasks/:id/substitute`.
4. Update `10-erd-model-database.md` jika skema berubah dari draft.

**Priority:** P2  
**Owner:** Backend Lead + DBA  
**Status:** Open

---

## DOMAIN: DOKUMEN & TERMINOLOGI

---

### BL-004

**Task:** Konsolidasi 10 pasang dokumen duplikat  
**File:** Semua pasangan nomor ganda (03, 04, 05, 07, 08, 09, 10, 11, 12, 13)  
**Problem:** `03-dashboard-uiux.md` dan `03-spesifikasi-uiux-dashboard.md` berisi konten identik/hampir identik. Developer tidak tahu mana yang jadi referensi resmi.  
**Action:**
1. Tetapkan satu file per nomor sebagai "master" (biasanya versi dengan konten lebih lengkap).
2. Tambahkan header `**DEPRECATED — Gunakan [nama-file-master].md**` di versi lama.
3. Update semua referensi silang dari file lama ke file master.
4. Jangan hapus file lama (ada di git history) — cukup deprecated flag.

**Priority:** P2  
**Owner:** Tech Lead / Doc Maintainer  
**Status:** Open

---

### BL-005

**Task:** Pindahkan 9 file `Master Prompt*.md` ke folder terpisah  
**File:** `dokumenSistem/Master Prompt*.md` (9 file)  
**Problem:** File AI prompt bercampur dengan dokumentasi teknis sistem; `ls *.md` menghasilkan campuran yang membingungkan.  
**Action:**
1. Buat folder `dokumenSistem/master-prompts/`.
2. Pindahkan semua `Master Prompt*.md` ke sana.
3. Update README indeks jika ada.

**Priority:** P3  
**Owner:** Doc Maintainer  
**Status:** Open

---

### BL-006

**Task:** Perbaiki header nomor di `56-matriks-traceability-fitur-dokumen.md`  
**File:** `dokumenSistem/56-matriks-traceability-fitur-dokumen.md`  
**Problem:** Header berisi `# 43 — Matriks traceability…` padahal nama file adalah `56-…`.  
**Action:** Ubah `# 43` menjadi `# 56` di baris pertama file. *(Dilakukan dalam audit ini — lihat CL-005)*  
**Priority:** P1  
**Owner:** Audit Agent  
**Status:** Done (CL-005)

---

### BL-007

**Task:** Tambah role yang hilang di `55-terminology-canonical.md`  
**File:** `dokumenSistem/55-terminology-canonical.md`  
**Problem:** Role `kasubag_umum_kepegawaian` dipakai di DB dan UI, tetapi tidak ada di terminology canonical.  
**Action:** Tambahkan entri role, path dashboard, dan label resmi. *(Dilakukan dalam audit ini — lihat CL-003)*  
**Priority:** P1  
**Owner:** Audit Agent  
**Status:** Done (CL-003)

---

## DOMAIN: TESTING & QUALITY

---

### BL-008

**Task:** Isi UAT matrix dari hasil simulasi dan pengujian manual  
**File:** `dokumenSistem/57-matriks-uat-jalur-kerja.md`  
**Problem:** Seluruh kolom Hasil dan Catatan kosong. UAT matrix tidak berguna tanpa data.  
**Action:**
1. Isi kolom berdasarkan `59-CATATAN-SIMULASI-API.md` (otomatis).
2. Lakukan pengujian manual UI untuk skenario yang tidak bisa diuji via API.
3. Update berkala setiap sprint.

*(Pengisian parsial dilakukan dalam audit ini — lihat CL-004)*  
**Priority:** P1  
**Owner:** QA Lead  
**Status:** Partial (CL-004)

---

### BL-009

**Task:** Verifikasi dan terapkan target coverage dari `20-strategi-testing-dan-quality-gate.md`  
**File:** `jest.config.js` atau setara di `backend/` dan `frontend/`  
**Problem:** Dokumen 20 §4 sudah memiliki target coverage (backend ≥ 80%, frontend critical ≥ 70%, workflow approval ≥ 90%). Namun tidak ada konfigurasi `coverageThreshold` di `jest.config.js` yang mengunci nilai ini sebagai quality gate.  
**Action:**
1. Tambahkan `coverageThreshold` di `backend/jest.config.js` sesuai angka di dokumen 20.
2. Tambahkan threshold serupa di `frontend/jest.config.js` atau vite test config.
3. Pastikan CI/CD (BL-010) menjalankan coverage check dan gagal jika di bawah threshold.

**Priority:** P1  
**Owner:** QA Lead  
**Status:** Open

---

### BL-010

**Task:** Setup CI/CD pipeline config  
**File:** `.github/workflows/` atau `gitlab-ci.yml` (belum ada)  
**Problem:** Tidak ada file CI/CD pipeline di repo. Deployment masih manual.  
**Action:**
1. Buat `.github/workflows/ci.yml` minimal: install, lint, test, build.
2. Dokumentasikan di `18-panduan-deployment-production.md`.
3. Tambah quality gate: build gagal jika test coverage di bawah threshold.

**Priority:** P1  
**Owner:** DevOps  
**Status:** Open

---

## DOMAIN: KEAMANAN

---

### BL-011

**Task:** Tambah rate limiting di endpoint kritis  
**File:** `backend/server.js`, `backend/routes/`  
**Problem:** Dokumen 17 §4 mewajibkan rate limiting per endpoint kritis. Belum ada implementasi `express-rate-limit` atau serupa.  
**Action:**
1. Install `express-rate-limit`.
2. Terapkan di: `/api/auth/*`, `/api/gubernur/*`, `/api/tasks/:id/submit`.
3. Dokumentasikan di `17-keamanan-informasi-operasional.md`.

**Priority:** P0  
**Owner:** Backend Lead  
**Status:** Open

---

### BL-012

**Task:** Audit MFA — pastikan endpoint MFA terdaftar dan dapat digunakan  
**File:** `backend/routes/auth.js`, `frontend/src/components/auth/MFASetupModal.jsx`  
**Problem:** Dokumen 31 §3.5 menyebut endpoint MFA tersedia. Perlu verifikasi apakah `MFASetupModal.jsx` dan endpoint benar-benar terintegrasi (bukan hanya scaffolding).  
**Action:**
1. Test manual: login → aktifkan MFA → uji OTP flow.
2. Jika belum terintegrasi, buat task implementasi terpisah.

**Priority:** P1  
**Owner:** Backend Lead + Security  
**Status:** Open

---

## DOMAIN: INTEGRASI

---

### BL-013

**Task:** Lengkapi `openapi.yaml` untuk endpoint prioritas lintas modul  
**File:** `openapi.yaml` (root atau `backend/`)  
**Problem:** CMP-04 (SPBE Interoperabilitas) status GAP. OpenAPI tidak merepresentasikan endpoint seperti: `/api/kasubag/bawahan`, `/api/kasubag/verifikasi/:id/ok`, `/api/pelaksana/tugas/:id/submit`, `/coordination/horizontal/*`.  
**Action:**
1. Identifikasi semua endpoint aktif dari route files.
2. Tambahkan ke `openapi.yaml` dengan schema request/response.
3. Validasi dengan `swagger-parser` atau `spectral`.

**Priority:** P1  
**Owner:** Backend Lead + API Team  
**Status:** Open

---

### BL-014

**Task:** Sinkronisasi data wilayah peta (MapLayerPanel)  
**File:** `frontend/src/components/ui/MapLayerPanel.jsx`  
**Problem:** Peta masih menggunakan `WILAYAH_DATA` static/contoh. Integrasi dengan master data wilayah belum ada.  
**Action:**
1. Buat endpoint `/api/wilayah/stok-pangan` yang mengembalikan data per kecamatan.
2. Ganti `WILAYAH_DATA` static di `MapLayerPanel.jsx` dengan API call.
3. Dokumentasikan di `dokumenSistem/07-kamus-data-field.md`.

**Priority:** P2  
**Owner:** Backend Lead + Frontend  
**Status:** Open
