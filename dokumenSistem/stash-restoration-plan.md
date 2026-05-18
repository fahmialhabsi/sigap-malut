# Stash Restoration Plan — SIGAP-MALUT

**Tanggal:** 2026-04-05  
**Stash ref:** `stash@{0}`  
**Label:** `chore(isolation): feat/next-change backend+frontend work - isolate from audit/pilot-hardening-release`

---

## ⚠️ PERINGATAN KRITIS

**JANGAN** apply stash ini ke branch `audit/pilot-hardening-release`.  
**JANGAN** apply stash sebelum merge selesai.  
**SELALU** verifikasi branch aktif sebelum apply stash.

---

## Isi Stash

Stash berisi pekerjaan **feat/next-change** yang sedang berjalan, terdiri dari:

### Backend Modified (28 file):
- `executionThreadController.js` + 6 execution thread services
- `gubernur/instruksiController.js` — +128 baris (instruksi tindak lanjut flow)
- `sekretaris/dashboardSummaryController.js` — refactored
- `kasubag/timController.js` — +53 baris (tim management)
- `routes/gubernur.js` — +38 baris (route instruksi baru)
- Scripts, models, middleware, dan routes lainnya

### Backend Untracked (8 file — BARU, belum pernah committed):
- `controllers/instruksiTindakLanjutController.js` ← **PENTING**
- `controllers/kasubag/taskAssignmentUtils.js`
- `migrations/20260411-create-instruksi-tindak-lanjut-pesan.cjs` ← **PENTING**
- `models/InstruksiTindakLanjutPesan.js` ← **PENTING**
- `models/TaskDiscussion.js` ← **PENTING**
- `routes/taskDiscussion.js`
- `scripts/postgresRetireLegacyKadin.mjs`
- `scripts/simulasi-alur-api.mjs`

### Frontend Modified + Untracked (11 file):
- `DashboardGubernur.jsx` — +593 baris (significant refactor)
- `DashboardKepalaDinas.jsx` — +253 baris
- `DashboardPelaksana.jsx` — +269 baris
- `DashboardKasubag.jsx` — +92 baris
- `frontend/src/api/axiosInstance.js` ← **BARU**
- `frontend/src/components/kasubag/SuratTugasKePelaksanaForm.jsx` ← **BARU**
- `frontend/src/components/tasks/TaskDiscussionPanel.jsx` ← **BARU**

---

## Langkah Aman Restore (SETELAH merge audit branch)

### Prasyarat
```bash
# Verifikasi dulu bahwa merge sudah selesai
git log --oneline main | head -5
# Pastikan 4d63265 sudah ada di main

# Verifikasi stash masih ada
git stash list
# Harus tampil: stash@{0}: ...feat/next-change...
```

### Langkah Restore

```bash
# 1. Pindah ke branch feat/next-change
git checkout feat/next-change

# 2. Update dari main (untuk mengambil perubahan dari merge audit)
git merge main

# 3. Apply stash (TANPA drop dulu — aman untuk recovery jika ada konflik)
git stash apply "stash@{0}"

# 4. Jika ada konflik, selesaikan secara manual
# Fokus pada file yang mungkin konflik:
# - backend/routes/gubernur.js (audit branch menambah route instruksi)
# - backend/middleware/workflowEnforcement.js

# 5. Setelah konflik selesai, buat commit per tema
git add backend/controllers/instruksiTindakLanjutController.js \
        backend/models/InstruksiTindakLanjutPesan.js \
        backend/migrations/20260411-create-instruksi-tindak-lanjut-pesan.cjs \
        backend/routes/taskDiscussion.js \
        backend/models/TaskDiscussion.js
git commit -m "feat(instruksi): add instruksi tindak lanjut + task discussion models"

git add frontend/src/api/axiosInstance.js \
        frontend/src/components/kasubag/SuratTugasKePelaksanaForm.jsx \
        frontend/src/components/tasks/TaskDiscussionPanel.jsx
git commit -m "feat(ui): add kasubag form + task discussion panel"

git add frontend/src/ui/dashboards/DashboardGubernur.jsx \
        frontend/src/ui/dashboards/DashboardKepalaDinas.jsx \
        frontend/src/ui/dashboards/DashboardPelaksana.jsx \
        frontend/src/ui/dashboards/DashboardKasubag.jsx
git commit -m "feat(dashboard): enhance Gubernur, Kadis, Pelaksana, Kasubag dashboards"

# 6. Setelah semua committed, drop stash
git stash drop "stash@{0}"
```

---

## Apa yang Tidak Boleh Dilakukan

| DILARANG | Alasan |
|----------|--------|
| `git stash apply` di branch `audit/pilot-hardening-release` | Akan mencemari branch yang sudah clean |
| `git stash pop` tanpa verifikasi branch aktif | Risiko apply ke branch yang salah |
| Commit stash content langsung tanpa review per tema | Akan mencampur fitur berbeda dalam satu commit |
| Drop stash sebelum semua file baru committed | 8 file untracked tidak bisa direcovery dari git |

---

## Peta PR yang Harus Dibuat dari Stash

| PR | Tema | File Utama |
|----|------|-----------|
| PR-1 | feat(instruksi): instruksi tindak lanjut flow | instruksiTindakLanjutController.js, InstruksiTindakLanjutPesan.js, migration |
| PR-2 | feat(task): task discussion dan assignment utils | TaskDiscussion.js, TaskDiscussionPanel.jsx, taskAssignmentUtils.js |
| PR-3 | feat(dashboard): revisi dashboard eksekutif | DashboardGubernur.jsx, DashboardKepalaDinas.jsx |
| PR-4 | feat(ui): SuratTugasKePelaksanaForm + axiosInstance | SuratTugasKePelaksanaForm.jsx, axiosInstance.js |
