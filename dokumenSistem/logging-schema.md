# Logging Schema — SIGAP-MALUT

**Tanggal:** 2026-04-06 | **Versi:** v3.0

---

## 1. TaskLogs (Audit Log Utama)

**Tabel:** `TaskLogs`
**File:** `backend/controllers/taskController.js` → `writeAudit()`

```
Field        | Type    | Keterangan
-------------|---------|---------------------------------------------
task_id      | INTEGER | ID task yang diaudit
actor_id     | INTEGER | ID user yang melakukan aksi
action       | STRING  | CREATE | ASSIGN | ACCEPT | SUBMIT | VERIFY |
             |         | APPROVE | CLOSE | REJECT | ESCALATE |
             |         | GOVERNOR_APPROVE | GOVERNOR_REJECT | RETURN
note         | TEXT    | Catatan opsional
data_old     | JSON    | State task sebelum transisi
data_new     | JSON    | State task setelah transisi
created_at   | DATE    | Timestamp aksi (UTC)
```

---

## 2. AuditLog (Executive Actions)

**Mekanisme:** `auditExecutiveAction()` — digunakan di gubernur dan kadin controllers

```
Field        | Type    | Keterangan
-------------|---------|---------------------------------------------
modul        | STRING  | instruksi_gubernur | kadin_approval | ...
entitas_id   | STRING  | ID record yang diaudit
aksi         | STRING  | TERBITKAN | PUTUSKAN | KONFIRMASI | ...
data_lama    | JSONB   | State sebelum
data_baru    | JSONB   | State sesudah
pegawai_id   | STRING  | ID actor (super_admin, gubernur, kepala_dinas)
created_at   | DATE    | Timestamp aksi
```

---

## 3. TaskDiscussions (Log Diskusi)

**Tabel:** `task_discussions`

```
Field        | Type    | Keterangan
-------------|---------|---------------------------------------------
task_id      | INTEGER | Relasi ke Tasks
pengirim_id  | INTEGER | User pengirim pesan
penerima_id  | INTEGER | User penerima pesan
pesan        | TEXT    | Isi pesan diskusi
created_at   | DATE    | Waktu pengiriman
deleted_at   | DATE    | Soft delete (paranoid)
```

---

## 4. InstruksiTindakLanjutPesan (Log Tindak Lanjut Gubernur)

**Tabel:** `instruksi_tindak_lanjut_pesan`

```
Field         | Type    | Keterangan
--------------|---------|---------------------------------------------
instruksi_id  | INTEGER | Relasi ke instruksi_gubernur
pengirim_id   | INTEGER | User pengirim
penerima_id   | INTEGER | User penerima (nullable — bisa broadcast)
pesan         | TEXT    | Isi pesan tindak lanjut
jenis         | ENUM    | tindak_lanjut | konfirmasi | klarifikasi | laporan
lampiran_url  | STRING  | URL lampiran (opsional)
created_at    | DATE    | Waktu
deleted_at    | DATE    | Soft delete (paranoid)
```

---

## 5. Operational Log (Console)

**Format:** `[MODULE] message @ HH.MM.SS`

```
[Cache] Redis connected ✓
[WS] Socket.IO initialized ✓
[KPI Poll] Broadcast selesai @ 10.34.52
[SLA Scheduler] ✅ Aktif
[DB] DB_DEV_SCHEMA_PATCH_ON_BOOT: menjalankan patch...
```

---

## 6. Log Level

Dikontrol via env var `LOG_LEVEL`:
- `info` (default) — operational messages
- `warn` — skip/warning messages
- `error` — critical failures
- `debug` — SQL queries (jika `SEQUELIZE_LOGGING=true`)

---

## 7. Aturan Keamanan Log

| Aturan | Status |
|--------|--------|
| Tidak expose stack trace ke client | ✅ |
| Tidak log JWT token / password | ✅ |
| Tidak log PII di TaskLogs | ✅ (hanya ID, bukan nama/email) |
| Rate limit violations tercatat di header | ✅ |
| Audit log immutable (no update/delete) | ✅ (TaskLogs timestamps only) |
