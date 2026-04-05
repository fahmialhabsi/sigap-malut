# Governance Enforcement Log — SIGAP-MALUT v2.6

**Branch:** `fix/production-hardening-governance`  
**Tanggal:** 2026-04-05

---

## Code Changes

| File | Old Behavior | New Behavior | Alasan |
|------|-------------|-------------|--------|
| `backend/utils/submitValidation.js` | *Tidak ada* | Shared validator: `validateSubmitPayload()` + `requiresOutputUrl()` | Single source of truth agar tidak ada dua logic berbeda |
| `backend/controllers/taskController.js` — submit handler | URL check via title regex `/asn\|kepegawaian/i.test(task.title)` | URL check via `validateSubmitPayload(task, ...)` (modul-based) | Title-based heuristic non-deterministic; modul field server-assigned |
| `backend/controllers/pelaksanaSekretariat/tugasController.js` — `submitHasil` | Inline 50-char check + inline `isAsnTask` modul check (duplicate logic) | `validateSubmitPayload()` dari shared util | DRY: satu titik perubahan jika policy berubah |
| `backend/controllers/taskController.js` — `TRANSITIONS.close.from` | `["approved_by_secretary", "forwarded_to_kadin", "verified"]` | `["approved_by_secretary", "forwarded_to_kadin"]` | `verified` → bypass mandatory secretary approval; dihapus |
| `backend/middleware/chainOfCommandGuard.js` — `requireJFBeforeKabid` | `const { jf_diverifikasi, jf_id } = req.body` | `Task.findByPk(taskId)` → check `task.status` di DB | Body params trivially spoofable; trusted state hanya di DB |
| `backend/middleware/chainOfCommandGuard.js` — `requireSekretarisBeforeKadin` | `const { sekretaris_disetujui, sekretaris_id } = req.body` | `Task.findByPk(taskId)` → check `task.status` di DB | Body params trivially spoofable; zero trust |

---

## Document Changes

| File | Perubahan | Alasan |
|------|-----------|--------|
| `dokumenSistem/57-matriks-uat-jalur-kerja.md` | Tambah N-04 s.d. N-07 (governance negative tests) | Mendokumentasikan skenario pengujian untuk perubahan v2.6 |
| `dokumenSistem/production-hardening-report.md` | *Baru* | Report komprehensif v2.6 |
| `dokumenSistem/governance-enforcement-log.md` | *Dokumen ini* | Audit trail perubahan |
| `dokumenSistem/validation-unification-log.md` | *Baru* | Detail R-01 |
| `dokumenSistem/anti-bypass-verification.md` | *Baru* | Detail R-02 + R-03 |
