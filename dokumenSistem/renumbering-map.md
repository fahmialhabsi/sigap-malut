# Renumbering Map — DOKUMENSISTEM SIGAP-MALUT

**Tanggal:** 5–6 April 2026  
**Branch:** `docs/structural-fix-dokumensistem`

---

## Penjelasan

Dokumen ini mencatat semua perubahan penamaan/penomoran yang dilakukan selama structural fix. Tidak ada file yang dipindahkan ke nomor baru secara paksa — prinsip utama adalah minimal disruption terhadap rantai utama 01–68.

---

## Perubahan Nama File

| Nama Lama | Nama Baru | Tipe Perubahan | Alasan |
|-----------|-----------|----------------|--------|
| `14-matriks-kebutuhan-layanan-per-role.md` | `14b-matriks-kebutuhan-layanan-per-role.md` | RENAME (suffix) | Nomor 14 sudah digunakan oleh `14-alur-kerja-sekretariat-bidang-uptd.md` dengan konten berbeda. Suffix `b` menandai posisi companion tanpa menggeser rantai utama. |

---

## Perubahan Heading Internal

| File | Heading Lama | Heading Baru | Alasan |
|------|-------------|-------------|--------|
| `09-matriks-role-akses-modul.md` | `# 07-Role-Module-Matrix` | `# 09 — Matriks Role Akses Modul SIGAP-MALUT` | Heading mewarisi nomor dari versi lama `09-Role-Module-Matrix.md` yang hanya memiliki 5 role (sebelum revisi ke dokumen 33). |
| `41-pedoman-mekanisme-spj-mandiri-dan-delegasi.md` | `# 38 — Pedoman Mekanisme SPJ: ...` | `# 41 — Pedoman Mekanisme SPJ: ...` | File renumbered dari 38 → 41 saat penyusunan pedoman seri ini, tetapi heading internal tidak diperbarui. |
| `45-pedoman-alur-kerja-struktur-organisasi-sekretariat.md` | `# 37 — Pedoman Alur Kerja, ...` | `# 45 — Pedoman Alur Kerja, ...` | File renumbered dari 37 → 45 saat reorganisasi folder, tetapi heading internal tidak diperbarui. |
| `48-pedoman-alur-kerja-bidang-ketersediaan-dan-kerawanan-pangan.md` | `# 39 — Pedoman Alur Kerja, ...` | `# 48 — Pedoman Alur Kerja, ...` | File renumbered dari 39 → 48, heading tidak diperbarui. |
| `50-pedoman-alur-kerja-bidang-distribusi-dan-cadangan-pangan.md` | `# 40 — Pedoman Alur Kerja, ...` | `# 50 — Pedoman Alur Kerja, ...` | File renumbered dari 40 → 50, heading tidak diperbarui. |
| `52-pedoman-alur-kerja-bidang-konsumsi-dan-keamanan-pangan.md` | `# 41 — Pedoman Alur Kerja, ...` | `# 52 — Pedoman Alur Kerja, ...` | File renumbered dari 41 → 52, heading tidak diperbarui. |
| `54-pedoman-alur-kerja-uptd-balai-pmkp_1.md` | `# 42 — Pedoman Alur Kerja, ...` | `# 54 — Pedoman Alur Kerja, ...` | File renumbered dari 42 → 54, heading tidak diperbarui. |
| `40-alur-koordinasi-horizontal.md` | `# Alur koordinasi horizontal berbasis execution thread` | `# 40 — Alur Koordinasi Horizontal Berbasis Execution Thread` | File tidak memiliki nomor dokumen di heading — ditambahkan agar konsisten dengan konvensi dokumenSistem. |
| `50.1-alur-koordinasi-bidang-distribusi.md` | `# Alur koordinasi — Bidang Distribusi ...` | `# 50.1 — Alur Koordinasi Bidang Distribusi ...` | File tidak memiliki nomor dokumen di heading — ditambahkan. |
| `14b-matriks-kebutuhan-layanan-per-role.md` | `# 14 - Role-Based Service Requirements ...` | `# 14b — Role-Based Service Requirements ...` | Menyesuaikan dengan nama file baru (14b). |

---

## File yang Dihapus (Bukan Renumber)

| File Dihapus | Alasan | Lihat Detail |
|-------------|--------|-------------|
| `03-dashboard-uiux.md` | Near-identical dengan versi kanonik | `duplicate-resolution-log.md` |
| `04-Dokumen Integrasi Sistem & Mapping Modul SIGAP-MALUT.md` | Identik MD5 | `duplicate-resolution-log.md` |
| `05-Dashboard-Template-Standar.md` | Near-identical dengan versi kanonik | `duplicate-resolution-log.md` |
| `07-Data-Dictionary.md` | Identik MD5 | `duplicate-resolution-log.md` |
| `08-Workflow-Specification.md` | Identik MD5 | `duplicate-resolution-log.md` |
| `09-Role-Module-Matrix.md` | Stub outdated, 5 role vs 16 | `duplicate-resolution-log.md` |
| `10-ERD-Logical-Model.md` | Stub 384B vs ERD 7857B | `duplicate-resolution-log.md` |
| `11-KPI-Definition-Sheet.md` | Identik MD5 | `duplicate-resolution-log.md` |
| `12-IT-Governance-SPBE-SPIP-Alignment.md` | Versi lama 2391B vs 16142B | `duplicate-resolution-log.md` |
| `13-System-Architecture-Document.md` | Identik MD5 | `duplicate-resolution-log.md` |
| `64-laporan-modul.md` | Identik MD5 dengan 24 | `duplicate-resolution-log.md` |

---

## Repositori Master Prompt

| File Lama | Lokasi Baru | Tipe |
|-----------|-------------|------|
| `MASTER PROMPT - SIGAP MALUT DEVELOPMENT.md` | `prompts/MASTER PROMPT - SIGAP MALUT DEVELOPMENT.md` | ARCHIVE |
| `Master Prompt - System Construction Mode.md` | `prompts/Master Prompt - System Construction Mode.md` | ARCHIVE |
| `Master Prompt Audit Pemerintah.md` | `prompts/Master Prompt Audit Pemerintah.md` | ARCHIVE |
| `Master Prompt Full Forensic Audit.md` | `prompts/Master Prompt Full Forensic Audit.md` | ARCHIVE |
| `Master Prompt Sesuai Roadmap.md` | `prompts/Master Prompt Sesuai Roadmap.md` | ARCHIVE |
| `Master Prompt siap audit formal pemerintah.md` | `prompts/Master Prompt siap audit formal pemerintah.md` | ARCHIVE |
| `Master Prompt Terjadwal.md` | `prompts/Master Prompt Terjadwal.md` | ARCHIVE |
| `Master Prompt-Otomatis Memperbaiki Dokumen.md` | `prompts/Master Prompt-Otomatis Memperbaiki Dokumen.md` | ARCHIVE |
| `Master PROMPT-SYSTEM-BUILD-ENGINE.md` | `prompts/Master PROMPT-SYSTEM-BUILD-ENGINE.md` | ARCHIVE |

---

## Prinsip Penomoran yang Diterapkan

1. **Tidak ada geser massal** — Nomor 01–68 tidak digeser karena akan merusak seluruh referensi silang yang sudah ada.
2. **Suffix `b`** untuk companion document dengan nomor sama — konvensi ini jelas dan tidak mengganggu pembaca.
3. **Hapus duplikat, bukan rename ulang** — File yang identik dihapus, bukan diberi nomor baru untuk menghindari kebingungan.
4. **Arsip ke subfolder** — Master Prompt tidak dihapus, hanya diarsipkan ke `prompts/` karena masih memiliki nilai referensi historis.
