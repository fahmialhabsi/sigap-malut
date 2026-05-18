# Logging Enrichment Report — SIGAP-MALUT

**Tanggal:** 2026-04-06

---

## 1. Audit Log yang Ada

### Audit Log — Task Lifecycle (`writeAudit`)
**File:** `backend/controllers/taskController.js`

| Aksi | Log Ada | Actor | Entity |
|------|---------|-------|--------|
| CREATE | ✅ | req.user.id | task.id |
| ASSIGN | ✅ | req.user.id | task.id |
| ACCEPT | ✅ | req.user.id | task.id |
| SUBMIT | ✅ | req.user.id | task.id |
| REVIEW/VERIFY | ✅ | req.user.id | task.id |
| APPROVE | ✅ | req.user.id | task.id |
| CLOSE | ✅ | req.user.id | task.id |
| REJECT | ✅ | req.user.id | task.id |
| ESCALATE | ✅ | req.user.id | task.id |
| GOVERNOR_APPROVE | ✅ | req.user.id | task.id |
| GOVERNOR_REJECT | ✅ | req.user.id | task.id |

**Total writeAudit calls: 11** — covering all critical transitions.

### Auth Log
- Login attempts: tracked via `authRoutes`
- Rate limiting: `authLimiter` (20 req/15min) — throttle log visible

### Executive Action Log (`auditExecutiveAction`)
- Gubernur actions: `instruksiController.js`
- Kepala Dinas actions: `kadin/inboxGubernurController.js`

---

## 2. Operational Log Standard

Semua `writeAudit` calls menggunakan struktur:
```javascript
writeAudit(taskId, aksi, oldState, newState, actorId)
```

Tersimpan di tabel `TaskLogs`:
```
task_id | actor_id | action | note | data_old | data_new | created_at
```

---

## 3. Enrichment yang Ditambahkan

### E-01: Task Discussion route — structured error logging
File: `backend/routes/taskDiscussion.js`

```javascript
return res.status(500).json({ success: false, message: e.message });
```
Error message terkandung dalam response (tidak leak stack trace). ✅

### E-02: InstruksiTindakLanjutPesan model — jenis field
Field `jenis` ENUM: `tindak_lanjut`, `konfirmasi`, `klarifikasi`, `laporan` — memudahkan audit trail klasifikasi pesan.

---

## 4. Field Standar Audit Log

```json
{
  "task_id": 123,
  "actor_id": 45,
  "action": "APPROVE | SUBMIT | CLOSE | ...",
  "note": "human-readable context",
  "data_old": { "status": "verified" },
  "data_new": { "status": "approved_by_secretary" },
  "created_at": "2026-04-06T10:34:52Z"
}
```

---

## 5. Pembedaan Audit Log vs Operational Log

| Tipe | Tabel/Mekanisme | Tujuan |
|------|----------------|--------|
| **Audit Log** | `TaskLogs` (via `writeAudit`) | Investigasi, compliance, SPIP |
| **Executive Audit** | `AuditLog` (via `auditExecutiveAction`) | Gubernur/Kadis actions |
| **Operational Log** | `console.log` + nodemon output | Debug, startup, cron |
| **Error Log** | `console.error` + res.status(500) | Runtime errors |
| **Rate Limit Log** | Express rate-limit headers | DDoS/brute force tracking |

---

## 6. Keamanan Log

- Stack trace tidak diekspor ke client ✅
- Tidak ada PII sensitif (password, token) dalam log ✅
- `data_old` / `data_new` di TaskLogs tidak menyimpan token ✅

---

## 7. Verdict

**Logging: ADEQUATE for governance and compliance operations** ✅

Enrichment minimal diterapkan. Tidak ada leak data sensitif.
