# Repo Cleanup Report — SIGAP-MALUT

**Branch:** `audit/pilot-hardening-release`  
**Tanggal:** 2026-04-05  
**Status akhir:** Working tree BERSIH

---

## Kondisi Repo Sebelum Cleanup

| Aspek | Status |
|-------|--------|
| Working tree bersih? | ❌ TIDAK — 75+ file modified/deleted/untracked |
| Branch scope tercampur? | ✅ YA — feat/next-change bercampur dengan v2.2 |
| Perubahan liar? | ✅ YA — 28 file feat/next-change unstaged |
| Rename/delete valid? | ✅ YA (tapi belum direkonsiliasi) |

---

## Kondisi Repo Sesudah Cleanup

| Aspek | Status |
|-------|--------|
| Working tree bersih? | ✅ BERSIH |
| Branch scope tercampur? | ✅ TERISOLASI |
| Stash tersedia? | ✅ stash@{0} — feat/next-change work |
| Commit tambahan? | ✅ 1 commit rename reconciliation |

---

## Inventaris Perubahan Asli (Pre-Cleanup)

### Unstaged Modified Files (28 file):

**Backend (19 file):**
- `backend/controllers/executionThreadController.js`
- `backend/controllers/gubernur/dashboardController.js`
- `backend/controllers/gubernur/instruksiController.js`
- `backend/controllers/gubernur/rantaiPerintahController.js`
- `backend/controllers/kadin/dashboardController.js`
- `backend/controllers/kadin/inboxGubernurController.js`
- `backend/controllers/kasubag/dashboardController.js`
- `backend/controllers/kasubag/inboxSekretarisController.js`
- `backend/controllers/kasubag/timController.js`
- `backend/controllers/kasubag/verifikasiQueueController.js`
- `backend/controllers/pelaksanaSekretariat/tugasController.js`
- `backend/controllers/sekretaris/dashboardSummaryController.js`
- `backend/middleware/workflowEnforcement.js`
- `backend/models/index.js`
- `backend/routes/gubernur.js`
- `backend/routes/kadin.js`
- `backend/routes/kasubag.js`
- `backend/scripts/checkUserPassword.js`, `createTestUser.js`, `testLogin.js`, `testRegisterAndLogin.js`
- `backend/services/executionThread*.js` (6 service files)

**Frontend (10 file):**
- `frontend/src/components/coordination/` (3 file)
- `frontend/src/components/execution/` (3 file)
- `frontend/src/components/executive/ExecutiveFormModal.jsx`
- `frontend/src/components/panel/KomunikasiPanel.jsx`
- `frontend/src/components/sekretaris/` (2 file)
- `frontend/src/components/ui/MapLayerPanel.jsx`
- `frontend/src/config/appMode.js`
- `frontend/src/i18n/locales/id.json`
- `frontend/src/layouts/DashboardLayout.jsx`
- `frontend/src/pages/` (2 file)
- `frontend/src/services/api.js`
- `frontend/src/ui/dashboards/` (10 file)
- `frontend/vite.config.js`

### Untracked Files:

**Backend (6 file — feat/next-change):**
- `backend/controllers/instruksiTindakLanjutController.js`
- `backend/controllers/kasubag/taskAssignmentUtils.js`
- `backend/migrations/20260411-create-instruksi-tindak-lanjut-pesan.cjs`
- `backend/models/InstruksiTindakLanjutPesan.js`
- `backend/models/TaskDiscussion.js`
- `backend/routes/taskDiscussion.js`
- `backend/scripts/postgresRetireLegacyKadin.mjs`
- `backend/scripts/simulasi-alur-api.mjs`

**Frontend (3 item — feat/next-change):**
- `frontend/src/api/axiosInstance.js`
- `frontend/src/components/kasubag/SuratTugasKePelaksanaForm.jsx`
- `frontend/src/components/tasks/TaskDiscussionPanel.jsx`

**DokumenSistem (31 file — user rename/new canonical):**
- 3 renamed (R prefix) + 11 add (new canonical) + 14 replacement dari delete

---

## Hasil Klasifikasi

### GROUP A — Aman di branch ini (sudah committed)
Semua 3 commit v2.2 + 1 commit rename reconciliation — CLEAN

### GROUP B — Di-stash
`stash@{0}` berisi 28 modified + 11 untracked feat/next-change files  
Label: `chore(isolation): feat/next-change backend+frontend work - isolate from audit/pilot-hardening-release`

### GROUP C — N/A
Tidak ada perubahan yang dipindah ke branch lain (stash cukup untuk menunggu)

### GROUP D — Direkonsiliasi
31 perubahan dokumenSistem: 13 rename + 2 delete sah + 16 file baru canonical

---

## Masalah Utama Yang Ditemukan

1. **Kontaminasi feat/next-change** — 28 file `M` dan 11 `??` dari pekerjaan fitur
2. **Instruksi tindak lanjut** — controller+model+migration+route baru, belum ada di branch manapun
3. **TaskDiscussion** — model+route baru, belum ada di branch manapun
4. **Rename tidak di-stage** — 15 dokumenSistem rename valid menunggu rekonsiliasi

---

## Keputusan Cleanup

✅ **EXECUTED** — Stash feat/next-change + commit rename reconciliation  
✅ **Working tree bersih** setelah cleanup
