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
| S-01 | Approval queue | Sekretaris | Buka approval → proses satu item | Status berubah, log tercatat | Sesuai task/thread | Ada | Queue berkurang | | |
| S-02 | Koordinasi horizontal | Sekretaris | Buat request horizontal pada thread UUID valid | Record `horizontal_coordination_requests` | Wajib UUID | Ada | Panel koordinasi | | |
| S-03 | Inbox Ka.Dinas | Sekretaris | Buka inbox | Daftar load / kosong jujur | Opsional | — | Inbox | | |

## 2. Bidang (Ketersediaan / Distribusi / Konsumsi)

| ID | Skenario | Role | Langkah | Expected | Thread | Audit | Dashboard | Hasil | Catatan |
|----|----------|------|---------|----------|--------|-------|-----------|-------|---------|
| B-01 | Task bidang | Kabid | Buka task terkait bidang | State sesuai workflow | Task terikat | history | Dashboard bidang | | |
| B-02 | Respons koordinasi | Kabid | Terima horizontal → respons | Status terminal / sesuai mesin | Sama thread | Ada | Panel horizontal | | |

## 3. UPTD

| ID | Skenario | Role | Langkah | Expected | Thread | Audit | Dashboard | Hasil | Catatan |
|----|----------|------|---------|----------|--------|-------|-----------|-------|---------|
| U-01 | Task UPTD | Kepala UPTD / Kasi | Update task lapangan | Status naik | Task | — | UPTD | | |

## 4. Bendahara (terpisah)

| ID | Skenario | Role | Langkah | Expected | Thread | Audit | Dashboard | Hasil | Catatan |
|----|----------|------|---------|----------|--------|-------|-----------|-------|---------|
| BD-01 | SPJ pengeluaran | bendahara_pengeluaran | Akses modul keuangan sek/upt sesuai matrix | Tidak akses KGB mentah jika bukan gaji | Opsional | fieldMask | /dashboard/bendahara | | |
| BD-02 | KGB | bendahara_gaji | Buka data KGB | Field sensitif tidak bocor ke pengeluaran | — | kgb mask | idem | | |
| BD-03 | Barang/aset | bendahara_barang | Akses upt-adm/upt-keu sesuai | Tidak override kgb finalize | — | — | idem | | |

## 5. Negatif (wajib beberapa)

| ID | Skenario | Expected |
|----|----------|----------|
| N-01 | User tanpa permission memanggil API sek-keu:create | 403 |
| N-02 | Koordinasi horizontal tanpa `execution_thread_id` UUID | 400 |
| N-03 | Dashboard produksi tanpa `VITE_DEMO_DATA` | Tidak menampilkan KPI statis palsu (Sekretaris, Komoditas, Keuangan, Inflasi, Kepegawaian) |

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
