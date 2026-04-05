# OpenAPI Sync Report — SIGAP-MALUT v2.2

**Tanggal:** 2026-04-05  
**File:** `dokumenSistem/openapi.yaml`  
**Sebelum sync:** 1576 baris, tanpa endpoint Tasks/Sekretaris baru  
**Setelah sync:** ~1830 baris, 6 endpoint baru ditambahkan

---

## Endpoint yang Ditinjau

| Endpoint | Status Sebelum | Status Setelah | Catatan |
|----------|---------------|----------------|---------|
| `POST /api/tasks/{id}/submit` | ❌ Tidak ada | ✅ Tersinkron | Validasi BL-002 didokumentasikan lengkap |
| `POST /api/tasks/{id}/review` | ❌ Tidak ada | ✅ Tersinkron | 3 decision: approve/back/forward |
| `GET /api/sekretaris/tugas-terverifikasi` | ❌ Tidak ada | ✅ Tersinkron | Pagination, include assignees + metadata |
| `GET /api/kasubag/bawahan` | ❌ Tidak ada | ✅ Tersinkron | meta.source: hierarchy/same_unit/none |
| `POST /api/kasubag/verifikasi/{id}/ok` | ❌ Tidak ada | ✅ Tersinkron | Status transition submitted → verified |
| `POST /api/kasubag/verifikasi/{id}/kembalikan` | ❌ Tidak ada | ✅ Tersinkron | Status transition submitted → returned |

---

## Mismatch yang Ditemukan dan Diperbaiki

### Mismatch 1: Submit endpoint tidak ada sama sekali
- **Sebelum:** Tidak ada entry `/api/tasks/{id}/submit` di paths
- **Sesudah:** Ditambahkan dengan request body schema, response 200/400/401/403/404/429
- **Detail error codes:** `OUTPUT_TOO_SHORT`, `URL_REQUIRED` didokumentasikan sebagai enum

### Mismatch 2: Secretary review endpoint tidak terdokumentasi
- **Sebelum:** `POST /api/tasks/{id}/review` tidak ada
- **Sesudah:** Ditambahkan dengan decision enum dan status transition yang jelas

### Mismatch 3: Endpoint sekretaris baru tidak ada di openapi
- **Sebelum:** Semua endpoint `/api/sekretaris/` tidak ada di paths
- **Sesudah:** `tugas-terverifikasi` ditambahkan dengan response schema lengkap

### Mismatch 4: Kasubag endpoints hilang
- **Sebelum:** Tidak ada endpoint `/api/kasubag/*` di paths
- **Sesudah:** 3 endpoint kasubag ditambahkan

---

## Endpoint yang MASIH BELUM Sinkron

| Endpoint | Prioritas | Alasan Defer |
|----------|-----------|--------------|
| `POST /api/tasks/{id}/verify` | P1 | Dipakai Kasubag/JF untuk verifikasi |
| `POST /api/tasks/{id}/accept` | P1 | Dipakai Pelaksana untuk terima tugas |
| `POST /api/tasks/{id}/start` | P2 | Dipakai Pelaksana untuk mulai tugas |
| `GET /api/kasubag/inbox-sekretaris` | P1 | Inbox tugas dari Sekretaris |
| `GET /api/pelaksana/tugas` | P1 | List tugas Pelaksana |
| `POST /api/pelaksana/tugas/{id}/submit` | P1 | Submit via controller Pelaksana (vs generic) |
| `GET /api/kasubag/dashboard/summary` | P2 | Summary Kasubag |
| `GET /api/sekretaris/approval` | P2 | ApprovalSekretariat queue |
| `POST /api/gubernur/instruksi` | P2 | Instruksi Gubernur |
| Semua endpoint bidang (BDS/BKS/BKT) | P3 | Ratusan endpoint, scope terpisah |

---

## Dampak

**Sebelum sync:**
- 6 endpoint kritikal tidak terdokumentasi → tools API testing (Postman/Swagger UI) tidak bisa menggunakannya
- QA tidak tahu response code 400 yang valid → manual error coba-coba
- Integrasi tools eksternal tidak tahu endpoint baru ada

**Setelah sync:**
- Semua endpoint P0/P1 kritikal terdokumentasi lengkap
- Response code dan error code tersedia di Swagger UI
- CI/CD bisa validate openapi.yaml dengan spectral (langkah selanjutnya: BL-013 ext)
