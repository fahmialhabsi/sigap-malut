# Matriks UAT — jalur kerja (SIGAP Malut)

**Cara pakai:** QA mengisi kolom **Hasil** dengan `PASS` / `FAIL` / `SKIP` dan **Catatan**.  
**Environment:** staging / UAT dengan DB migrasi terbaru, `VITE_DEMO_DATA=0`, user per role tersedia.

## Legenda

| Kolom | Arti |
|-------|------|
| **Thread** | `execution_thread_id` terisi / konsisten dengan skenario |
| **Audit** | jejak approval / log / timeline terlihat |
| **Dashboard** | widget terkait memperbarui / tidak error |

---

## 1. Sekretariat

| ID | Skenario | Role | Langkah | Expected | Thread | Audit | Dashboard | Hasil | Catatan |
|----|----------|------|---------|----------|--------|-------|-----------|-------|---------|
| S-01 | Approval queue | Sekretaris | Buka approval → proses satu item | Status berubah, log tercatat | Sesuai task/thread | Ada | Queue berkurang | PASS (API) | Terverifikasi via simulasi otomatis 2026-04-04; UI belum diuji manual |
| S-02 | Koordinasi horizontal | Sekretaris | Buat request horizontal pada thread UUID valid | Record `horizontal_coordination_requests` | Wajib UUID | Ada | Panel koordinasi | | Perlu uji manual; N-02 (negatif tanpa UUID) → PASS |
| S-03 | Inbox Ka.Dinas | Sekretaris | Buka inbox | Daftar load / kosong jujur | Opsional | — | Inbox | PASS (API) | `GET /sekretaris/dashboard/summary` HTTP 200 verified |

## 2. Alur Perintah Gubernur → Pelaksana

| ID | Skenario | Role | Langkah | Expected | Thread | Audit | Dashboard | Hasil | Catatan |
|----|----------|------|---------|----------|--------|-------|-----------|-------|---------|
| A-01 | Gubernur buat instruksi | Gubernur | POST /gubernur/instruksi (draf) → terbitkan | HTTP 200, id instruksi tercipta | — | — | Dashboard Gubernur | PASS (API) | Instruksi id=8 (simulasi 2026-04-04) |
| A-02 | Kadis konfirmasi instruksi | Kepala Dinas | GET inbox-gubernur → POST konfirmasi | HTTP 200, status berubah terbaca | — | Ada | Inbox Kadis | PASS (API) | HTTP 200, 2 item inbox |
| A-03 | Kadis beri perintah ke Sekretaris | Kepala Dinas | POST /kadin/perintah | Task terbuat, assignee = Sekretaris | — | — | — | PASS (API) | Task id=27 (simulasi) |
| A-04 | Sekretaris delegasi ke Kasubag | Sekretaris | POST /tasks/:id/assign | HTTP 200, status = assigned | Sesuai | Ada | — | PASS (API) | Status delegasi tanpa accept dulu |
| A-05 | Kasubag terima + assign Pelaksana | Kasubag | POST accept → POST assign ke Pelaksana | HTTP 200, Pelaksana dapat tugas | Sesuai | Ada | Tim Saya | PASS (API) | |
| A-06 | Pelaksana accept, mulai, submit | Pelaksana | POST accept → start → submit | Status: in_progress → submitted | Sesuai | Ada | Kanban | PASS (API) | |
| A-07 | Kasubag verifikasi berkas | Kasubag | POST verifikasi/:id/ok | Status: verified | Sesuai | Ada | Badge berkurang | | Belum diuji manual; perlu cek setelah CL-004 |
| A-08 | Sekretaris setujui verified | Sekretaris | Panel "Perlu Persetujuan" → setujui | Status: approved_by_secretary | Sesuai | Ada | — | PASS (BL-001 FIXED) | Endpoint `GET /api/sekretaris/tugas-terverifikasi` + komponen `ReviewTugasVerifiedPanel.jsx` telah diimplementasi; diverifikasi via pilot-hardening-report.md |

## 3. Bidang (Ketersediaan / Distribusi / Konsumsi)

| ID | Skenario | Role | Langkah | Expected | Thread | Audit | Dashboard | Hasil | Catatan |
|----|----------|------|---------|----------|--------|-------|-----------|-------|---------|
| B-01 | Task bidang | Kabid | Buka task terkait bidang | State sesuai workflow | Task terikat | history | Dashboard bidang | | |
| B-02 | Respons koordinasi | Kabid | Terima horizontal → respons | Status terminal / sesuai mesin | Sama thread | Ada | Panel horizontal | | |

## 4. UPTD

| ID | Skenario | Role | Langkah | Expected | Thread | Audit | Dashboard | Hasil | Catatan |
|----|----------|------|---------|----------|--------|-------|-----------|-------|---------|
| U-01 | Task UPTD | Kepala UPTD / Kasi | Update task lapangan | Status naik | Task | — | UPTD | | |

## 5. Bendahara (terpisah)

| ID | Skenario | Role | Langkah | Expected | Thread | Audit | Dashboard | Hasil | Catatan |
|----|----------|------|---------|----------|--------|-------|-----------|-------|---------|
| BD-01 | SPJ pengeluaran | bendahara_pengeluaran | Akses modul keuangan sek/upt sesuai matrix | Tidak akses KGB mentah jika bukan gaji | Opsional | fieldMask | /dashboard/bendahara | | |
| BD-02 | KGB | bendahara_gaji | Buka data KGB | Field sensitif tidak bocor ke pengeluaran | — | kgb mask | idem | | |
| BD-03 | Barang/aset | bendahara_barang | Akses upt-adm/upt-keu sesuai | Tidak override kgb finalize | — | — | idem | | |

## 5. Bendahara (terpisah)

| ID | Skenario | Role | Langkah | Expected | Thread | Audit | Dashboard | Hasil | Catatan |
|----|----------|------|---------|----------|--------|-------|-----------|-------|---------|
| BD-01 | SPJ pengeluaran | bendahara_pengeluaran | Akses modul keuangan sek/upt sesuai matrix | Tidak akses KGB mentah jika bukan gaji | Opsional | fieldMask | /dashboard/bendahara | | |
| BD-02 | KGB | bendahara_gaji | Buka data KGB | Field sensitif tidak bocor ke pengeluaran | — | kgb mask | idem | | |
| BD-03 | Barang/aset | bendahara_barang | Akses upt-adm/upt-keu sesuai | Tidak override kgb finalize | — | — | idem | | |

## 6. Negatif (wajib beberapa)

| ID | Skenario | Expected | Hasil | Catatan |
|----|----------|----------|-------|---------|
| N-01 | User tanpa permission memanggil API sek-keu:create | 403 | | Perlu uji manual |
| N-02 | Koordinasi horizontal tanpa `execution_thread_id` UUID | 400 | PASS (API) | Terverifikasi simulasi 2026-04-04 |
| N-03 | Dashboard produksi tanpa `VITE_DEMO_DATA` | Tidak menampilkan KPI statis palsu (Sekretaris, Komoditas, Keuangan, Inflasi, Kepegawaian) | | Set `VITE_DEMO_DATA=0` di `.env.production` |
| N-04 | Close task dari status `verified` langsung | 403 — Transition tidak diizinkan | PASS (v2.6) | `verified` dihapus dari `close.from`; wajib melalui `approved_by_secretary` |
| N-05 | Submit task tanpa output_ringkas (< 50 char) | 400 `OUTPUT_TOO_SHORT` | PASS (v2.6) | Kedua submit handler memanggil `validateSubmitPayload` dari shared util |
| N-06 | Submit task modul kepegawaian tanpa output_url | 400 `OUTPUT_URL_REQUIRED` | PASS (v2.6) | Basis check: `task.module` field (bukan title regex) |
| N-07 | Kirim `{ sekretaris_disetujui: true }` di body ke `requireSekretarisBeforeKadin` | 422 jika task belum `approved_by_secretary` | PASS (v2.6) | Guard query DB, bukan percaya body client |

---

## Verifikasi otomatis (dev/staging)

```bash
cd backend
npm run verify:govtech-final
npm run verify:bendahara-roles
```

Build frontend produksi (opsional, set `VERIFY_FRONTEND_BUILD=1`):

```bash
VERIFY_FRONTEND_BUILD=1 npm run verify:govtech-final
```
