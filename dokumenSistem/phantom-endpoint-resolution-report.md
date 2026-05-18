# PHANTOM ENDPOINT RESOLUTION REPORT — SIGAP-MALUT

**Tanggal:** 2026-04-06
**Versi Sistem:** v3.0 (post-certification)
**Branch:** feat/next-change

---

## 1. Executive Summary

**Mismatch awal:** Dua endpoint Super Admin terdaftar di `dokumenSistem/openapi.yaml` namun tidak memiliki implementasi backend nyata:
- `POST /api/tasks/{id}/force-close`
- `POST /api/tasks/{id}/reassign`

**Keputusan final:** REMOVE — kedua endpoint dihapus dari OpenAPI.

**Status akhir:** Tidak ada lagi phantom endpoint di SIGAP-MALUT. OpenAPI 100% mencerminkan route yang benar-benar aktif di backend.

---

## 2. Decision

**DECISION: REMOVE**

**Alasan:**

1. **Tidak ada use case sah yang belum terpenuhi.** Jalur kanonik yang sudah ada (`reject` → assign ulang → `accepted` → ... → `approved_by_secretary` → `closed`) sudah menutupi semua skenario kebutuhan super_admin, termasuk skenario darurat, dengan audit trail penuh via `writeAudit`.

2. **Desain sistem secara eksplisit menolak emergency path.** Komentar di `backend/controllers/taskController.js` (blok `close`) menyatakan: *"Tidak ada 'darurat' path yang diam-diam aktif."*

3. **Menambah endpoint baru berisiko lebih tinggi dari manfaatnya.** Setiap endpoint baru di governance chain harus divalidasi terhadap 5 guard berlapis. Risiko bypass tidak sebanding dengan kemudahan yang didapat.

4. **Prinsip Zero Mismatch.** Lebih aman menghapus dokumentasi phantom daripada mengimplementasikan endpoint yang tidak diuji di lingkungan nyata.

---

## 3. Perubahan yang Dilakukan

### 3a. OpenAPI (`dokumenSistem/openapi.yaml`)

| Perubahan | Detail |
|-----------|--------|
| **DIHAPUS** | Blok `# ─── SUPER ADMIN ENDPOINTS ────` (lines 1889–1951) |
| **DIHAPUS** | Path `/api/tasks/{id}/force-close` beserta seluruh schema |
| **DIHAPUS** | Path `/api/tasks/{id}/reassign` beserta seluruh schema |
| **DITAMBAHKAN** | Catatan kanonik: `# ─── CATATAN SUPER ADMIN ───` menjelaskan bahwa tidak ada endpoint terpisah, dan jalur kanonik tetap melalui governance chain normal |

### 3b. Dokumen Terkait (`dokumenSistem/v28-system-completion-report.md`)

| Perubahan | Detail |
|-----------|--------|
| **DIPERBARUI** | Seksi "Super Admin override" — referensi ke dua phantom endpoint diganti dengan penjelasan jalur kanonik |
| **DIPERBARUI** | Daftar endpoint di seksi "TAHAP 5 OpenAPI" — 2 phantom dihapus, diganti catatan jalur kanonik |

### 3c. Backend (tidak ada perubahan)

Tidak ada perubahan kode backend. Tidak ada route baru ditambahkan. Tidak ada guard yang dimodifikasi.

---

## 4. Verification Result

| Kriteria | Status | Bukti |
|----------|--------|-------|
| Path `/api/tasks/{id}/force-close` di OpenAPI | ✅ HILANG | `grep` tidak menemukan path entry |
| Path `/api/tasks/{id}/reassign` di OpenAPI | ✅ HILANG | `grep` tidak menemukan path entry |
| OpenAPI sinkron dengan backend | ✅ SINKRON | Tidak ada route aktif yang tidak terdokumentasi; tidak ada dokumentasi tanpa route |
| Catatan kanonik tersedia untuk QA | ✅ ADA | Comment blok di openapi.yaml + seksi di v28-report |
| QA confusion hilang | ✅ RESOLVED | Tidak ada endpoint fiktif yang bisa diuji salah |
| Integrator confusion hilang | ✅ RESOLVED | Dokumentasi eksplisit menjelaskan jalur kanonik super_admin |

---

## 5. Non-Regression Check

| Pemeriksaan | Status |
|-------------|--------|
| `verified` tidak ada di `close.from` (R-02 tetap aman) | ✅ PASS |
| 5 governance guard masih ter-export dan aktif | ✅ PASS |
| `writeAudit` masih dipanggil 11 kali di taskController | ✅ PASS |
| Public routes tetap read-only (0 `protect` calls) | ✅ PASS |
| Tidak ada bypass baru diperkenalkan | ✅ PASS |

Governance chain tetap utuh: Pelaksana → JF → Kabid → Sekretaris → Kadis → Gubernur.

---

## 6. Final Verdict

**✅ PHANTOM ENDPOINT RESOLVED**

Tidak ada lagi endpoint fiktif di SIGAP-MALUT.
OpenAPI = kenyataan backend. QA dan integrator tidak akan salah lagi.
