# Audit Report — SIGAP-MALUT dokumenSistem

**Tanggal:** 2026-04-05  
**Branch:** `audit/dokumen-enterprise-2026-04-05`  
**Metodologi:** 8-Layer Enterprise Audit (Context → Requirement → Process → System Design → Data → Role & Authorization → Integration → Implementation Readiness)  
**Dokumen diperiksa:** 74 file `.md` + `openapi.yaml` di `dokumenSistem/`

---

## 1. Executive Summary

Folder `dokumenSistem` SIGAP-MALUT berisi **dokumentasi yang lebih lengkap dari rata-rata proyek pemerintah daerah** — struktur organisasi, workflow bisnis, arsitektur teknis, dan konfigurasi keamanan hadir dalam dokumen tersendiri. Namun **ada kesenjangan kritis** antara isi dokumen dengan implementasi nyata di codebase, serta duplikasi dokumen yang belum dikonsolidasi.

**Skor before:** 59/100  
**Skor after (pasca remediasi):** 74/100 (estimasi — setelah perbaikan yang dieksekusi)  
**Delta:** +15 poin

**Verdict: BELUM LAYAK produksi penuh — layak staging/pilot dengan syarat perbaikan P0 ditutup.**

---

## 2. Klasifikasi Dokumen

### Kelompok A — Strategis / Arsitektur (sudah ada, sebagian baik)
| File | Kualitas | Catatan |
|------|----------|---------|
| `01-profil-dan-kondisi-dinas-pangan.md` | Baik | Fondasi konteks, 274KB — terlalu besar, perlu dipecah per domain |
| `02-dokumentasi-teknis-sistem-sigap.md` | Baik | 213KB — butuh TOC navigasi |
| `33-keputusan-arsitektur-final-*.md` | Baik | Keputusan arsitektur terdokumentasi |
| `14-alur-kerja-sekretariat-bidang-uptd.md` | Baik | Workflow detail dan lengkap |
| `31-panduan-standar-implementasi-wajib.md` | Baik | Standar teknis wajib — namun belum sepenuhnya dipatuhi di kode |

### Kelompok B — Operasional / Tata Kelola (ada tapi dangkal)
| File | Kualitas | Catatan |
|------|----------|---------|
| `17-keamanan-informasi-operasional.md` | Sedang | Kontrol ada, tetapi evidence belum terikat |
| `19-runbook-operasional-dan-sop.md` | Sedang | Struktur ada, prosedur rollback perlu detail |
| `20-strategi-testing-dan-quality-gate.md` | Sedang | Gate ada, coverage target belum terisi |
| `21-matriks-kepatuhan-spbe-spip.md` | Sedang | Semua item PARTIAL/GAP — belum ada satu pun COMPLETE |

### Kelompok C — Duplikat belum dikonsolidasi
| Pasangan | Masalah |
|----------|---------|
| `03-dashboard-uiux.md` ↔ `03-spesifikasi-uiux-dashboard.md` | Identik, belum ada yang jadi "master" |
| `04-…` (2 file) | Sama |
| `05-…` (2 file) | Sama |
| `07-…` (2 file) | Sama |
| `08-…` (2 file) | Sama |
| `09-…` (2 file) | Konten berbeda (versi lama vs baru) |
| `10-…` (2 file) | Sama |
| `11-…` (2 file) | Sama |
| `12-…` (2 file) | Konten berbeda |
| `13-…` (2 file) | Sama |

**Total duplikat yang teridentifikasi: ~10 pasang.** Risiko: developer membaca versi yang salah.

### Kelompok D — Master Prompt (bukan dokumentasi sistem)
9 file `Master Prompt*.md` — seharusnya tidak di dalam folder dokumentasi teknis; menyebabkan `ls *.md` mencampur panduan AI dengan dokumen arsitektur.

---

## 3. Per-File Analysis (file utama)

### `08-spesifikasi-workflow-bisnis.md` / `08-Workflow-Specification.md`
**KRITIS:** Hanya berisi tabel workflow KGB (satu contoh) dan tabel approval log umum. **Tidak merepresentasikan** workflow lengkap dari 14 modul utama. Semua endpoint dan status mesin yang ada di `14-alur-kerja-*` tidak dikaitkan ke sini.  
Gap: dokumen `21-matriks-kepatuhan-spbe-spip.md` CMP-07 merujuk ke sini sebagai kontrol utama — padahal isinya sangat terbatas.

### `10-erd-model-database.md` (versi baru, 7.7KB)
Lebih lengkap dengan skema `user_hierarchy`, `task_assignments` versi extended (dengan `assignee_id_primer`, `assignee_id_aktual`, substitusi). **Gap:** implementasi DB aktual (`backend/models/TaskAssignment.js`) tidak punya kolom `assignee_id_primer` / `assignee_id_aktual` — schema dokumen ≠ schema DB nyata.

### `55-terminology-canonical.md`
Ada tetapi tidak semua role terdaftar. Contoh: `pelaksana_sekretariat` ada, tetapi `kasubag_umum_kepegawaian` tidak ada. Dashboard path `pelaksana_sekretariat → /dashboard/kasubag` berpotensi konflik dengan path asli.

### `56-matriks-traceability-fitur-dokumen.md` (= `43-…` di konten, `56-…` sebagai nomor file)
Nomor file di header dokumen (`43`) ≠ nama file (`56-…`). Harus selaras.

### `57-matriks-uat-jalur-kerja.md`
UAT matrix ada namun kolom **Hasil** dan **Catatan** seluruhnya kosong — belum pernah diisi dari hasil uji nyata.

---

## 4. Integration Analysis

### 4.1 Konsistensi terminologi lintas dokumen
- `task_assignments` di `10-erd-model-database.md` memakai `assignee_id_primer` / `assignee_id_aktual`.
- Implementasi di `backend/models/TaskAssignment.js`: hanya `assignee_user_id`, `assignee_role`, `assigned_by`.
- **Gap:** Dokumen menyebut substitusi tugas sebagai fitur wajib (§5 dokumen 14) — tidak ada di model DB.

### 4.2 Alur Gubernur → Kadis → Sekretaris → Kasubag → Pelaksana
- Alur API terverifikasi (lihat `59-CATATAN-SIMULASI-API.md`): **semua endpoint HTTP 200**.
- **UI belum diuji sepenuhnya** (catatan simulasi sendiri mengakui bukan pengujian UI).

### 4.3 Koordinasi horizontal
- Model `horizontal_coordination_requests` ada, endpoint API ada.
- Dokumen `63-horizontal-coordination-qa-uat.md` berisi checklist UAT tapi belum ada hasil pengisian.

### 4.4 Duplikasi nomor dokumen
- File `56-matriks-traceability-fitur-dokumen.md` berisi header `# 43 — Matriks traceability` → inkonsistensi nomor.

---

## 5. End-to-End Flow Analysis

```
Gubernur [instruksi] → Kadis [konfirmasi + perintah] → Sekretaris [delegasi]
    ↓
Kasubag [terima + form surat tugas ke pelaksana] → Pelaksana [terima + mulai + kirim hasil]
    ↓
Kasubag [verifikasi berkas] → [verified]
    ↓
Sekretaris [review + approved_by_secretary] (PARTIAL: langkah ini belum dieksekusi otomatis)
    ↓
Kepala Dinas [optional forward] → [closed]
```

**Tahap hilang di implementasi:**
1. `approved_by_secretary` → tidak ada tombol/endpoint di dashboard Sekretaris setelah `verified` dari Kasubag.
2. `forwarded_to_kadin` → endpoint ada di state machine (`taskController.js`) tapi tidak ada UI trigger di Sekretaris.
3. `closed` → hanya bisa dari role `sekretaris`/`kepala_dinas`/`super_admin` via `close` action — tidak ada panel khusus.

---

## 6. Gap Analysis (8 Layer)

| Layer | Skor Before | Temuan Utama |
|-------|-------------|--------------|
| 1. Context | 80 | Profil dinas dan kondisi masalah sangat kaya |
| 2. Requirement | 65 | Kebutuhan per role ada, beberapa module belum punya requirement tertulis |
| 3. Process | 60 | Workflow Sekretariat bagus; Perencanaan, Aset, Keuangan lanjutan lemah |
| 4. System Design | 55 | Arsitektur ada, gap antara skema dokumen ≠ skema DB nyata |
| 5. Data | 55 | ERD ada, field substitusi di dokumen tidak di model |
| 6. Role & Authorization | 70 | Matriks role lengkap; RBAC middleware ada; hardening matrix ada |
| 7. Integration | 50 | API terverifikasi, horizontal coordination ada; koordinasi lintas OPD lemah |
| 8. Implementation Readiness | 45 | UAT kosong; coverage test tidak ada; OpenAPI tidak lengkap |

**Rata-rata: 60/100 → dibulatkan 59/100 (penalti duplikat)**

---

## 7. Failure Simulation

### Skenario 1: Pelaksana submit tanpa lampiran pada tugas ASN
- **Sebelum perbaikan:** Tombol Submit langsung bisa diklik; status `submitted`; dihitung selesai secara teknis.
- **Setelah perbaikan:** Backend menolak jika ringkasan < 50 karakter dan URL kosong untuk judul ASN/kepegawaian.
- **Residual risk:** Validasi ada di `pelaksanaSekretariat/tugasController.js`; tidak ada di endpoint `POST /api/tasks/:id/submit` (taskController umum) — **celah bypass**.

### Skenario 2: Kasubag lihat badge verifikasi > 0 tapi list kosong
- **Sebelum perbaikan:** Query assignment limit 1000 baris; assignment lama tidak masuk daftar.
- **Setelah perbaikan:** `DISTINCT task_id` dari semua baris → konsisten.

### Skenario 3: Pelaksana Sekretariat tampil sebagai "Pelaksana Teknis UPTD"
- **Sebelum perbaikan:** Urutan kondisi header tidak cek `isSekretariat` dulu.
- **Setelah perbaikan:** `pelaksanaUnitLabel` dengan urutan benar.

### Skenario 4: Hierarki kosong → form delegasi tidak muncul
- **Sebelum perbaikan:** Form disembunyikan jika `staff.length === 0`.
- **Setelah perbaikan:** Form selalu tampil; fallback ke staf satu unit.

### Skenario 5: Verifikasi selesai di Kasubag → tidak lanjut ke Sekretaris
- **Status:** BELUM diperbaiki. Gap arsitektur: tidak ada tombol atau endpoint yang otomatis membawa tugas ke tahap `approved_by_secretary` setelah Kasubag klik "Verifikasi OK".
