# Governance Enforcement Bidang — SIGAP-MALUT v2.7

Tanggal: 6 April 2026

## Guard Baru: requireKabidBeforeSekretaris

File: `backend/middleware/chainOfCommandGuard.js`

```
OLD: Tidak ada guard untuk Kabid → Sekretaris transition
NEW: requireKabidBeforeSekretaris (DB-backed, ZERO TRUST)
```

**Logika:**
```javascript
const KABID_APPROVED_STATUSES = ["approved_kabid", "verified", "approved_by_secretary", "forwarded_to_kadin", "closed"];
if (!KABID_APPROVED_STATUSES.includes(task.status)) → 422 BYPASS_KABID
```

## Guard Aktif: requireJFBeforeKabid

**Diterapkan di:**

| Route File | Endpoint |
|---|---|
| `kabid-ketersediaan.js` | `POST /approval-queue/:id/setujui` |
| `kabid-ketersediaan.js` | `POST /approval-queue/:id/kembalikan` |
| `kabid-distribusi.js` | `POST /approval-queue/:id/setujui` |
| `kabid-distribusi.js` | `POST /approval-queue/:id/kembalikan` |
| `kabid-konsumsi.js` | `POST /approval-queue/:id/setujui` |
| `kabid-konsumsi.js` | `POST /approval-queue/:id/kembalikan` |

**Sebelum v2.7:** Guard sudah ada di `chainOfCommandGuard.js` tapi TIDAK terpasang di route manapun.
**Sesudah v2.7:** Guard terpasang di semua 6 endpoint approval Kabid dari 3 Bidang.

## Seluruh Guard Chain (Terintegrasi v2.6 + v2.7)

```
Pelaksana Bidang
   │
   │ [blockDirectSubmitToKabid — role-based]
   │ Pelaksana tidak bisa skip JF
   ▼
JF (Jabatan Fungsional)
   │
   │ [requireJFBeforeKabid — DB task.status]
   │ Kabid tidak bisa approve jika JF belum verifikasi
   ▼
Kepala Bidang
   │
   │ [requireKabidBeforeSekretaris — DB task.status]
   │ Sekretaris tidak bisa proses jika Kabid belum approve
   ▼
Sekretaris
   │
   │ [requireSekretarisBeforeKadin — DB task.status]
   │ Kadin tidak bisa proses jika Sekretaris belum approve
   ▼
Kepala Dinas
```

## Error Codes

| Guard | HTTP | Code |
|---|---|---|
| requireJFBeforeKabid | 422 | BYPASS_JF |
| requireKabidBeforeSekretaris | 422 | BYPASS_KABID |
| requireSekretarisBeforeKadin | 422 | BYPASS_SEKRETARIS |
| blockDirectSubmitToKabid | 403 | CHAIN_OF_COMMAND_VIOLATION |
