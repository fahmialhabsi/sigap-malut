# Change Log — Audit dokumenSistem SIGAP-MALUT

**Branch:** `audit/dokumen-enterprise-2026-04-05`  
**Auditor:** Enterprise AI Audit Agent (A+B+C)  
**Tanggal:** 2026-04-05

---

## Format

```
File:
Jenis perubahan:
Sebelum:
Sesudah:
Alasan:
Layer:
Dampak:
```

---

## CL-001

**File:** `dokumenSistem/16-audit-gap-resmi-prioritas-revisi.md`  
**Jenis perubahan:** docs — tambah catatan status penutupan gap pasca implementasi  
**Sebelum:** Tidak ada kolom status penutupan; semua gap masih terbuka  
**Sesudah:** Ditambahkan §10 "Status Penutupan Gap (Update 2026-04-05)" dengan tabel yang mencatat mana gap sudah partial-close  
**Alasan:** Dokumen gap bersifat hidup; tanpa update, tim mengira semua gap masih 100% terbuka  
**Layer:** 2 (Requirement), 8 (Implementation Readiness)  
**Dampak:** Referensi audit lebih akurat; devs tahu mana yang sudah ditangani

---

## CL-002

**File:** `dokumenSistem/21-matriks-kepatuhan-spbe-spip.md`  
**Jenis perubahan:** docs — perbarui status CMP-07 dan CMP-08  
**Sebelum:** CMP-07 status PARTIAL tanpa evidence; CMP-08 status PARTIAL tanpa evidence  
**Sesudah:** Ditambahkan catatan evidence di kolom Evidence Wajib untuk CMP-07 (kasubag verifikasiQueueController distinctAssignedTaskIds, workflow states) dan CMP-08 (task_logs, metadata delegasi, audit_log snapshot)  
**Alasan:** Evidence nyata sudah ada di codebase — dokumen harus mencerminkan kenyataan  
**Layer:** 6 (Role & Authorization), 7 (Integration)  
**Dampak:** Klaim kepatuhan SPIP tidak lagi bare claim; ada pointer ke kode

---

## CL-003

**File:** `dokumenSistem/55-terminology-canonical.md`  
**Jenis perubahan:** fix — tambah role yang hilang, perbaiki path yang berpotensi konflik  
**Sebelum:** Tidak ada entri `kasubag_umum_kepegawaian`; path `pelaksana_sekretariat → /dashboard/kasubag` ambigu  
**Sesudah:** Ditambahkan baris `kasubag_umum_kepegawaian → Kasubag Umum & Kepegawaian`; path diklarifikasi dengan note bahwa `/dashboard/kasubag` adalah alias untuk pelaksana sekretariat  
**Alasan:** Role sudah digunakan di DB dan UI; tidak ada di terminology canonical = inkonsistensi label  
**Layer:** 6 (Role & Authorization)  
**Dampak:** Onboarding developer lebih mudah; label UI konsisten

---

## CL-004

**File:** `dokumenSistem/57-matriks-uat-jalur-kerja.md`  
**Jenis perubahan:** docs — tambah hasil UAT otomatis dari simulasi API  
**Sebelum:** Kolom Hasil dan Catatan seluruhnya kosong  
**Sesudah:** Diisi berdasarkan `59-CATATAN-SIMULASI-API.md` (simulasi otomatis 2026-04-04): S-01 PASS (approval queue ok via API), B-01 PASS (task bidang state), N-02 PASS (koordinasi tanpa UUID → 400), dst.  
**Alasan:** UAT matrix yang kosong tidak berguna; simulasi otomatis sudah menghasilkan data valid  
**Layer:** 8 (Implementation Readiness)  
**Dampak:** QA punya baseline pengisian; tidak mulai dari nol

---

## CL-005

**File:** `dokumenSistem/56-matriks-traceability-fitur-dokumen.md`  
**Jenis perubahan:** fix — koreksi nomor dokumen di header  
**Sebelum:** Header: `# 43 — Matriks traceability fitur ↔ pasal dokumen`  
**Sesudah:** Header: `# 56 — Matriks traceability fitur ↔ pasal dokumen`  
**Alasan:** Nomor di konten (43) ≠ nama file (56-…); menyebabkan kebingungan saat cross-referencing  
**Layer:** 1 (Context)  
**Dampak:** Cross-reference dokumen jadi konsisten

---

## CL-006

**File:** `dokumenSistem/audit-report.md` (FILE BARU)  
**Jenis perubahan:** audit — laporan audit enterprise 8-layer  
**Sebelum:** Tidak ada  
**Sesudah:** Dibuat — executive summary, analisis per file, integration analysis, gap analysis, failure simulation  
**Alasan:** Output wajib audit enterprise  
**Layer:** Semua  
**Dampak:** Manajemen dan tim dev punya satu referensi audit komprehensif

---

## CL-007

**File:** `dokumenSistem/change-log.md` (FILE INI)  
**Jenis perubahan:** audit — change log otomatis  
**Sebelum:** Tidak ada  
**Sesudah:** Dibuat  
**Alasan:** Output wajib devops audit  
**Layer:** Semua  
**Dampak:** Traceability perubahan dokumentasi

---

## CL-008

**File:** `dokumenSistem/kpi-score.md` (FILE BARU)  
**Jenis perubahan:** audit — tabel KPI score per layer  
**Sebelum:** Tidak ada  
**Sesudah:** Dibuat dengan before/after/delta per layer  
**Layer:** Semua  
**Dampak:** KPI terukur untuk management reporting

---

## CL-009

**File:** `dokumenSistem/dev-backlog.md` (FILE BARU)  
**Jenis perubahan:** audit — backlog pengembangan dari gap yang ditemukan  
**Sebelum:** Gap tersebar di berbagai dokumen tanpa pengelompokan actionable  
**Sesudah:** Dibuat — format task/file/problem/action/priority  
**Layer:** Semua  
**Dampak:** Dev team punya backlog siap sprint

---

## CL-010

**File:** `dokumenSistem/management-summary.md` (FILE BARU)  
**Jenis perubahan:** audit — ringkasan eksekutif untuk manajemen  
**Sebelum:** Tidak ada dokumen khusus untuk manajemen  
**Sesudah:** Dibuat — status sistem, skor total, risiko, perubahan utama, rekomendasi  
**Layer:** Semua  
**Dampak:** Manajemen dapat membaca status tanpa harus membaca dokumen teknis
