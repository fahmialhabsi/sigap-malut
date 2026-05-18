# API CONSISTENCY FIX LOG — SIGAP-MALUT

**Tanggal:** 2026-04-06
**Scope:** Penghapusan phantom endpoint Super Admin dari OpenAPI
**Tipe:** DOC-ONLY CHANGE (tidak ada perubahan backend/route)

---

## File yang Diubah

### 1. `dokumenSistem/openapi.yaml`

**Tipe perubahan:** Penghapusan + penambahan catatan

| # | Aksi | Konten | Lines (before) |
|---|------|--------|----------------|
| 1 | HAPUS | Komentar section header `# ─── SUPER ADMIN ENDPOINTS ───` | 1889 |
| 2 | HAPUS | Path `/api/tasks/{id}/force-close` beserta `post`, `summary`, `description`, `tags`, `security`, `parameters`, `requestBody`, `responses` | 1890–1921 |
| 3 | HAPUS | Path `/api/tasks/{id}/reassign` beserta seluruh field | 1923–1950 |
| 4 | TAMBAH | Blok komentar `# ─── CATATAN SUPER ADMIN ───` dengan penjelasan jalur kanonik dan referensi ke `taskController.js` | (baru, menggantikan lines 1889–1951) |

**Old state:**
```yaml
# ─── SUPER ADMIN ENDPOINTS ────────────────────────────────────────────────────
/api/tasks/{id}/force-close:
  post:
    summary: Super Admin — force close task dengan audit reason
    ...
/api/tasks/{id}/reassign:
  post:
    summary: Super Admin — reassign task ke user lain lintas role
    ...
```

**New state:**
```yaml
# ─── CATATAN SUPER ADMIN ──────────────────────────────────────────────────────
# Tidak ada endpoint force-close atau reassign yang aktif.
# Jalur kanonik untuk super_admin:
#   - Gunakan aksi reject (dengan reason) + assign ulang + close setelah approval
#   - Semua aksi tetap melalui governance chain normal dan tercatat di audit log
# Referensi: backend/controllers/taskController.js — TRANSITIONS (writeAudit)
```

---

### 2. `dokumenSistem/v28-system-completion-report.md`

**Tipe perubahan:** Update referensi

| # | Aksi | Old | New |
|---|------|-----|-----|
| 1 | PERBARUI | `### Super Admin override yang terdokumentasi di OpenAPI` + daftar 2 phantom endpoint | `### Super Admin — jalur kanonik audit` + penjelasan `reject → close` |
| 2 | PERBARUI | `**Super Admin (2 endpoints):** - POST /api/tasks/{id}/force-close - POST /api/tasks/{id}/reassign` | `**Super Admin (jalur kanonik, bukan endpoint terpisah):** ...` |

---

## Referensi yang Dihapus

| Referensi | File | Alasan Dihapus |
|-----------|------|----------------|
| `POST /api/tasks/{id}/force-close` | openapi.yaml | Phantom — tidak ada route backend |
| `POST /api/tasks/{id}/reassign` | openapi.yaml | Phantom — tidak ada route backend |
| Daftar endpoint di v28-report | v28-system-completion-report.md | Merujuk phantom endpoint |

---

## Referensi yang Ditambahkan / Diperbarui

| Referensi | File | Konten |
|-----------|------|--------|
| Catatan kanonik super_admin | openapi.yaml | Jalur `reject → assign → close` via governance chain |
| Penjelasan jalur kanonik | v28-system-completion-report.md | Menggantikan daftar phantom dengan penjelasan alur audit |

---

## File Backend (TIDAK BERUBAH)

| File | Status |
|------|--------|
| `backend/controllers/taskController.js` | Tidak diubah |
| `backend/middleware/chainOfCommandGuard.js` | Tidak diubah |
| `backend/routes/gubernur.js` | Tidak diubah |
| `backend/routes/kadin.js` | Tidak diubah |
| `backend/server.js` | Tidak diubah |

---

## Ringkasan Delta

```
Perubahan kode backend : 0 file
Perubahan dokumen      : 2 file
Endpoint dihapus       : 2 phantom (force-close, reassign)
Endpoint ditambah      : 0
Catatan kanonik baru   : 2 (openapi.yaml + v28-report)
Regresi               : 0
```

---

**Log dibuat oleh:** AI API Consistency Enforcer — PHANTOM ENDPOINT RESOLUTION MODE
**Referensi laporan:** `phantom-endpoint-resolution-report.md`
