# 56 — Matriks traceability fitur ↔ pasal dokumen

**Versi:** 1.1.0  
**Tanggal:** 2026-04-05  
**Status:** Hidup — diperbarui saat fitur atau dokumen referensi berubah  
**Tujuan:** Menautkan implementasi di codebase SIGAP-MALUT ke bagian dokumen di folder `dokumenSistem/`, untuk audit, review, dan onboarding.

---

## Cara membaca matriks

| Kolom | Arti |
|--------|------|
| **Fitur / perilaku** | Apa yang terlihat atau dipanggil di sistem |
| **Lokasi implementasi** | File / route / komponen utama (relatif ke root repo) |
| **Dokumen** | File di `dokumenSistem/` |
| **Rujukan (pasal / bagian)** | Heading, nomor section, atau istilah yang menjadi dasar |
| **Status** | **Lengkap** = selaras; **Sebagian** = cocok dengan batasan; **Gap** = dokumen minta lebih dari yang ada; **N/A** = belum ditinjau |

---

## A. Jalur perintah / tugas (Sekretariat, Kasubag, Pelaksana)

| ID | Fitur / perilaku | Lokasi implementasi | Dokumen | Rujukan | Status | Catatan |
|----|------------------|---------------------|---------|---------|--------|---------|
| T-01 | Inbox surat tugas Sekretaris ke Kasubag | `backend/controllers/kasubag/inboxSekretarisController.js` (`GET …/inbox-sekretaris`); `frontend/src/ui/dashboards/DashboardKasubag.jsx` | `14-alur-kerja-sekretariat-bidang-uptd.md` | §2 lifecycle (Assigned); §3 hak Sekretaris / Kasubag | Sebagian | Sinkron query assignment dengan ringkasan via `distinct` task (util bersama) |
| T-02 | Form delegasi «Surat tugas ke pelaksana» (satu layar dengan workspace Sekretariat) | `frontend/src/components/kasubag/SuratTugasKePelaksanaForm.jsx`; `frontend/src/components/coordination/SekretariatSubordinateWorkspace.jsx`; `POST /tasks/:id/assign` | `14-alur-kerja-sekretariat-bidang-uptd.md` | §3 Kasubag: *assign ke Pelaksana*; §2 *Open/Assigned* | Sebagian | Skema substitusi / `assignee_id_primer` di dokumen §1 belum di model DB penuh |
| T-03 | Penugasan: catat `tanggal_penugasan`, `due_date`, metadata delegasi | `backend/controllers/taskController.js` (assign); isian form Kasubag | `14-alur-kerja-sekretariat-bidang-uptd.md` | §1 entitas `tasks` (*due_date*, *metadata JSON*) | Sebagian | `audit_log` snapshot — pastikan kebijakan tim terpenuhi per §1 catatan |
| T-04 | Daftar calon pelaksana (hierarki + fallback satu `unit_kerja`) | `backend/controllers/kasubag/timController.js` (`GET …/bawahan`); route `backend/routes/kasubag.js` | `14-alur-kerja-sekretariat-bidang-uptd.md` | §3 Kasubag: distribusi ke pelaksana | Sebagian | Fallback bukan pengganti struktur `UserHierarchy` resmi |
| T-05 | Antrean «Berkas menunggu pemeriksaan» + badge ringkasan | `backend/controllers/kasubag/verifikasiQueueController.js`; `dashboardController.js`; tab verifikasi di `DashboardKasubag.jsx` | `14-alur-kerja-sekretariat-bidang-uptd.md` | §2 *Submitted* → *Verified*; §3 monitoring | Sebagian | Verifikator di dokumen «JF / Kepala Subbid»; implementasi: verifikasi Kasubag (`verified`) |
| T-06 | Pengembalian ke pelaksana dengan catatan | `POST …/verifikasi/:id/kembalikan` | `14-alur-kerja-sekretariat-bidang-uptd.md` | §2 *reject to pelaksana with note* | Lengkap | Status: `returned_to_pelaksana` + metadata revisi |
| T-07 | Konfirmasi verifikasi OK | `POST …/verifikasi/:id/ok` | `14-alur-kerja-sekretariat-bidang-uptd.md` | §2 *Verified* | Sebagian | Langkah *Secretary review* / `approved_by_secretary` belum otomatis menyusul |
| T-08 | Distinct `task_id` assignment (konsistensi list vs ringkasan) | `backend/controllers/kasubag/taskAssignmentUtils.js`; dipakai inbox, verifikasi, summary | `08-spesifikasi-workflow-bisnis.md` / `14-alur-…` | Integritas alur & data tugas | Lengkap | Menghindari badge tidak selaras daftar |

---

## B. Pelaksana Sekretariat (terima, mulai, kirim hasil)

| ID | Fitur / perilaku | Lokasi implementasi | Dokumen | Rujukan | Status | Catatan |
|----|------------------|---------------------|---------|---------|--------|---------|
| P-01 | Label peran di header/sidebar (Sekretariat vs UPTD) | `frontend/src/ui/dashboards/DashboardPelaksana.jsx` (`pelaksanaUnitLabel`) | `03-spesifikasi-uiux-dashboard.md`; `05-template-standar-dashboard.md` | Konsistensi label pengguna | Lengkap | Urutan cek `isSekretariat` sebelum cabang UPTD |
| P-02 | Kanban tugas: Terima, Mulai, «Kirim ke atasan» | `DashboardPelaksana.jsx`; `backend/controllers/pelaksanaSekretariat/tugasController.js` | `14-alur-kerja-sekretariat-bidang-uptd.md` | §2 *Accepted* → *In Progress* → *Submitted* | Sebagian | Kirim hasil: modal + validasi panjang/URL ASN |
| P-03 | Validasi submit: hanya `in_progress`, ringkasan min., URL untuk tugas ASN/kepegawaian | `tugasController.js` `submitHasil` | `14-alur-kerja-sekretariat-bidang-uptd.md` | §2 *Submitted* + *file pendukung* | Sebagian | Bukan ganti `task_files` terstruktur |
| P-04 | Penjelasan UX: submitted ≠ selesai kinerja | Teks bantuan di `DashboardPelaksana.jsx` | `14-alur-kerja-sekretariat-bidang-uptd.md`; `11-definisi-kpi-indikator.md` | Tahap verifikasi / penutupan | Lengkap | Selaras gagasan *verified/closed* untuk KPI |

---

## C. Dashboard eksekutif & koordinasi horizontal

Ditinjau ulang dari kode (2026-04-05): setiap baris memuat **API atau perilaku UI** yang diverifikasi singkat terhadap dokumen referensi.

| ID | Fitur / perilaku | Lokasi implementasi | Dokumen | Rujukan | Status | Catatan |
|----|------------------|---------------------|---------|---------|--------|---------|
| E-01 | Panel dampak koordinasi lintas unit (eksekutif) | `frontend/src/components/coordination/ExecutiveHorizontalCoordinationPanel.jsx` — `GET /coordination/horizontal/dashboard/executive`; dipasang di `DashboardGubernur.jsx`, `DashboardKepalaDinas.jsx` | `dashboard-role-coordination-widgets.md`; `alur-koordinasi-horizontal.md` | Tabel endpoint eksekutif; prinsip observabilitas thread | Lengkap | Ringkasan + tautan ke `/dashboard/execution-thread/:id`; muat ulang manual |
| E-02 | Dashboard Gubernur: prioritas → tab «Ringkasan», filter instruksi, sorot kartu | `frontend/src/ui/dashboards/DashboardGubernur.jsx` (mis. aksi «Buka di monitor», `setGubernurTab`, `setFilterInstruksi`, `scrollToAnchor`) | `32-rekomendasi-arsitektur-dashboard-per-role.md`; `33-keputusan-arsitektur-final-dashboard-dan-desain-sistem.md` | Satu layar eksekutif, drill-down | Sebagian | Selaras fungsi; belum dinilai penuh terhadap § token / `AppSidebar` di dok. 31 |
| E-03 | Inbox instruksi Gubernur (Kadis sebagai `assigned_to`) + enrich tindak lanjut | `backend/controllers/kadin/inboxGubernurController.js` (`listInboxGubernur`, dll.); hubungan ke `InstruksiGubernur`, `Task` | `08-spesifikasi-workflow-bisnis.md`; `28-integrasi-data-workflow-approval.md` | Alur instruksi & persetujuan | Sebagian | Turunan tugas & batch tindak lanjut; pastikan selaras SOP terbaru di 08 |
| E-04 | Analitik «masalah sistemik» lintas thread | `frontend/src/components/execution/CrossThreadSystemicPanel.jsx` — `GET /execution-thread/analytics/cross` | `alur-koordinasi-horizontal.md`; `status-koordinasi-horizontal.md`; `13-arsitektur-sistem.md` | Thread / KPI agregat | Sebagian | Panel UI siap; backend dapat mengembalikan `ok: false` jika DB bukan PostgreSQL — catat di runbook |
| E-05 | Peta ketahanan (stok / distribusi / kerawanan) | `frontend/src/components/ui/MapLayerPanel.jsx` (Leaflet + `LayersControl`); dipakai di `DashboardGubernur.jsx` | `03-spesifikasi-uiux-dashboard.md`; `07-kamus-data-field.md` (data riil) | Widget peta | Sebagian | Masih data contoh (`WILAYAH_DATA`); integrasi master/wilayah = backlog |
| E-06 | Landing pemilihan peran → login / portal publik | `frontend/src/pages/LandingPage.jsx` (`navigate(/login?role=…)`, `/dashboard-publik`) | `03-dashboard-uiux.md`; `09-matriks-role-akses-modul.md` | Akses per peran | Sebagian | Alur entry jelas; styling `blue-600` belum menyelaraskan dok. 31 token |

---

## D. Standar implement wajib (teknis) — celah yang diketahui

Rujukan utama: **`31-panduan-standar-implementasi-wajib.md`**.

| ID | Topik dokumen | Pasal / bagian | Observasi di codebase terkait tugas koordinasi | Status |
|----|----------------|----------------|-----------------------------------------------|--------|
| S-01 | HTTP client | §1.2 / §3.1 axios | Frontend umumnya `services/api.js` — selaraskan dengan contoh dokumen jika tim menetapkan satu entrypoint | Sebagian |
| S-02 | Notifikasi UI | Toasts vs `alert` | Beberapa alur legacy memakai dialog native — utamakan `react-hot-toast` | Gap |
| S-03 | Design token warna | §2.1 | Banyak kelas Tailwind literal — harmonisasi bertahap ke token | Gap |
| S-04 | Sidebar `AppSidebar` | §2.4 | Dashboard peran (Gubernur, Kasubag, Pelaksana) sering layout kustom — pertimbangkan penyelarasan | Sebagian |

---

## Riwayat revisi dokumen ini

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0.0 | 2026-04-05 | Versi pertama: jalur Kasubag–Pelaksana, verifikasi, penugasan, gap standar 31; placeholder eksekutif/koordinasi. |
| 1.1.0 | 2026-04-05 | Bagian C: status E-01–E-06 setelah review kode (`ExecutiveHorizontalCoordinationPanel`, `DashboardGubernur`, `inboxGubernurController`, `CrossThreadSystemicPanel`, `MapLayerPanel`, `LandingPage`). |

---

## Pemeliharaan

1. Setiap PR fitur baru: tambahkan atau ubah baris, set **Status** dengan jujur.  
2. Jika dokumen `dokumenSistem` direvisi: cari baris dengan dokumen itu dan perbarui **Rujukan** / **Status**.  
3. UAT formal dapat mengacu **`41-matriks-uat-jalur-kerja.md`** dan **`horizontal-coordination-qa-uat.md`** selain matriks ini.
