# Validation Unification Log — Submit Rules SIGAP-MALUT

**Versi:** v2.6  
**Tanggal:** 2026-04-05

---

## Submit Entry Points (Semua Path)

| Entry Point | Route | Handler | Status v2.6 |
|-------------|-------|---------|-------------|
| POST `/api/tasks/:id/submit` | `backend/controllers/taskController.js` | Canonical handler | ✅ Menggunakan `validateSubmitPayload` |
| POST `/api/pelaksana/tugas/:id/submit` | `backend/controllers/pelaksanaSekretariat/tugasController.js` `submitHasil` | Pelaksana-specific | ✅ Menggunakan `validateSubmitPayload` |

---

## Rule Lama vs Rule Final

| Rule | Handler A (taskController) Sebelum | Handler B (pelaksana) Sebelum | Rule Final (v2.6) |
|------|-----------------------------------|------------------------------|-------------------|
| Min konten | `ringkas.length < 50` ✓ | `ringkas.length < 50` ✓ | `validateSubmitPayload`: min 50 char |
| URL wajib basis | `title.match(/asn\|kepegawaian/)` ← TITLE HEURISTIC | `task.module.includes(k)` ← MODULE FIELD | `task.module \|\| task.modul_id` — MODULE FIELD ONLY |
| URL wajib modules | `asn`, `data asn`, `kepegawaian` (via regex) | `kepegawaian`, `asn`, `kgb`, `absensi` | `kepegawaian`, `asn`, `kgb`, `absensi` — canonical constant |
| Status check | Tidak ada di A; ada di B (`VALID_FROM`) | `in_progress`, `returned_to_pelaksana` | Masing-masing handler tetap punya status check sendiri (scope berbeda) |

---

## File Canonical Rule

**`backend/utils/submitValidation.js`** — Single source of truth:

```
URL_REQUIRED_MODULES = ["kepegawaian", "asn", "kgb", "absensi"]

requiresOutputUrl(task):
  modul = task.module || task.modul_id (lowercase)
  return URL_REQUIRED_MODULES.some(k => modul.includes(k))

validateSubmitPayload(task, output_ringkas, output_url):
  IF ringkas.length < 50 → { ok: false, code: "OUTPUT_TOO_SHORT" }
  IF requiresOutputUrl(task) AND !output_url → { ok: false, code: "OUTPUT_URL_REQUIRED" }
  ELSE → { ok: true }
```

---

## Bukti Unifikasi (Test T-14 s.d. T-18)

| Test | Input | Expected | Hasil |
|------|-------|----------|-------|
| T-14 | `ringkas="pendek"` | OUTPUT_TOO_SHORT | ✅ PASS |
| T-15 | `module="kepegawaian"`, no URL | OUTPUT_URL_REQUIRED | ✅ PASS |
| T-16 | `module="distribusi"`, no URL | ok: true | ✅ PASS |
| T-17 | `module="kepegawaian"`, valid URL + ringkas | ok: true | ✅ PASS |
| T-18 | `module="distribusi"`, `title="Data ASN"`, no URL | ok: true (title NOT basis) | ✅ PASS |

---

## Impact: Kasus Yang Sebelumnya Tidak Konsisten

| Skenario | Handler A (sebelum) | Handler B (sebelum) | Handler A & B (v2.6) |
|----------|--------------------|--------------------|----------------------|
| `module="kepegawaian"`, `title="Laporan Umum"`, no URL | ✅ LOLOS (title tidak match regex) | ❌ GAGAL (modul match) | ❌ GAGAL — konsisten |
| `module="distribusi"`, `title="Data ASN Dinas"`, no URL | ❌ GAGAL (title match regex) | ✅ LOLOS (modul tidak match) | ✅ LOLOS — konsisten |
