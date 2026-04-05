# Branch Isolation Plan — SIGAP-MALUT

**Branch:** `audit/pilot-hardening-release`  
**Tanggal:** 2026-04-05  
**Status:** EXECUTED

---

## Perubahan yang Tetap di Branch Ini

### Committed (4 commits di branch):

| Commit | Hash | Tema | Scope |
|--------|------|------|-------|
| audit(dokumenSistem): 8-layer audit | d0562d1 | Audit | v2.1 |
| fix(security+workflow): BL-001/002/011 | a0fefe5 | Remediation | v2.1 |
| hardening(pilot): CI/OpenAPI/verify | 3054e3c | Hardening | v2.2 |
| rename(docs): dokumenSistem renumber | 1296fbf | Cleanup | v2.3 |

**File utama v2.2 di branch:**
- `backend/scripts/verify-pilot-readiness.mjs` ✅
- `backend/server.js` (rate limit + trust proxy) ✅
- `backend/controllers/taskController.js` (BL-002) ✅
- `backend/controllers/sekretaris/tugasVerifiedController.js` ✅
- `backend/routes/sekretaris/sekretarisIndex.js` ✅
- `backend/package.json` (verify:pilot script) ✅
- `.github/workflows/p0p1-regression-guard.yml` ✅
- `dokumenSistem/openapi.yaml` (6 endpoint baru) ✅
- `frontend/src/components/sekretaris/ReviewTugasVerifiedPanel.jsx` ✅
- `frontend/src/ui/dashboards/DashboardSekretariat.jsx` ✅
- 8 dokumenSistem output files (pilot-hardening-report, dll.) ✅
- 31 dokumenSistem rename/new canonical files ✅

---

## Perubahan yang Di-Stash (Group B)

**Stash label:** `chore(isolation): feat/next-change backend+frontend work`  
**Stash ref:** `stash@{0}`

Berisi pekerjaan `feat/next-change` yang sedang berjalan:

### Backend Modified (tersimpan dalam stash):
- `executionThreadController.js`, 6 execution thread services
- `gubernur/dashboardController.js`, `instruksiController.js`, `rantaiPerintahController.js`
- `kadin/dashboardController.js`, `inboxGubernurController.js`
- `kasubag/dashboardController.js`, `inboxSekretarisController.js`, `timController.js`, `verifikasiQueueController.js`
- `pelaksanaSekretariat/tugasController.js`
- `sekretaris/dashboardSummaryController.js`
- `middleware/workflowEnforcement.js`, `models/index.js`
- `routes/gubernur.js`, `routes/kadin.js`, `routes/kasubag.js`
- `scripts/checkUserPassword.js`, `createTestUser.js`, `testLogin.js`, `testRegisterAndLogin.js`
- `services/gubernurUserService.js`

### Backend Untracked (tersimpan dalam stash):
- `controllers/instruksiTindakLanjutController.js` ← BARU, belum di branch manapun
- `controllers/kasubag/taskAssignmentUtils.js`
- `migrations/20260411-create-instruksi-tindak-lanjut-pesan.cjs` ← BARU
- `models/InstruksiTindakLanjutPesan.js` ← BARU
- `models/TaskDiscussion.js` ← BARU
- `routes/taskDiscussion.js` ← BARU
- `scripts/postgresRetireLegacyKadin.mjs`
- `scripts/simulasi-alur-api.mjs`

### Frontend Modified + Untracked (tersimpan dalam stash):
- Semua dashboard, koordinasi, execution, layout, page files
- `frontend/src/api/axiosInstance.js` ← BARU
- `frontend/src/components/kasubag/SuratTugasKePelaksanaForm.jsx` ← BARU
- `frontend/src/components/tasks/TaskDiscussionPanel.jsx` ← BARU

---

## Cara Memulihkan Stash ke feat/next-change

```bash
# Pindah ke branch feat/next-change
git checkout feat/next-change

# Apply stash (tidak drop stash dulu, untuk keamanan)
git stash pop stash@{0}

# Atau jika ingin preserve stash:
git stash apply stash@{0}

# Kemudian stage + commit pekerjaan fitur
git add backend/controllers/instruksiTindakLanjutController.js ...
git commit -m "feat(instruksi): add instruksi tindak lanjut controller + model + migration"
```

---

## Perubahan yang Harus Dipindah ke Branch Lain

Tidak ada — semua pekerjaan fitur sudah ada di stash dan akan di-apply ke `feat/next-change`.

---

## Urutan Langkah Isolasi (Sudah Executed)

1. ✅ `git add dokumenSistem/` — stage semua rename/delete/new dokumen
2. ✅ `git stash push --include-untracked --keep-index -m "chore(isolation): ..."` — isolate feat/next-change
3. ✅ `git commit -m "rename(docs): reconcile canonical dokumenSistem renumbering"`
4. ✅ Verifikasi: working tree bersih
