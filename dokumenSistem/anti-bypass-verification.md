# Anti-Bypass Verification — SIGAP-MALUT v2.6

**Tanggal:** 2026-04-05  
**Script:** `npm run verify:hardening` (18/18 PASS)

---

## Skenario 1: Close from verified (R-02)

### Sebelum v2.6

```
TRANSITIONS.close.from = ["approved_by_secretary", "forwarded_to_kadin", "verified"]

Attack:
  POST /api/tasks/123/close
  task.status = "verified"
  user.role = "sekretaris"
  → canTransition("close", "verified", "sekretaris") = { ok: true }  ← BYPASS
  → Task closed WITHOUT approved_by_secretary
  → Governance chain broken
```

### Sesudah v2.6

```
TRANSITIONS.close.from = ["approved_by_secretary", "forwarded_to_kadin"]

Attack (sama):
  POST /api/tasks/123/close
  task.status = "verified"
  user.role = "sekretaris"
  → canTransition("close", "verified", "sekretaris")
  = { ok: false, reason: "Status 'verified' tidak dapat diubah dengan aksi 'close'" }
  → 403 Forbidden
  → Bypass BLOCKED ✓
```

**Test coverage:** T-07, T-08, N-04 di `57-matriks-uat-jalur-kerja.md`

---

## Skenario 2: Body spoofing chainOfCommandGuard (R-03)

### Sebelum v2.6

```javascript
// OLD CODE (spoofable):
const { sekretaris_disetujui, sekretaris_id } = req.body || {};
if (!sekretaris_disetujui || !sekretaris_id) return 422;

Attack:
  POST /api/some-route/123/forward-to-kadin
  body: { sekretaris_disetujui: true, sekretaris_id: 1 }
  task.status = "in_progress"  ← NOT approved by anyone
  → Guard reads body → sekretaris_disetujui = true → PASSES
  → Governance completely bypassed
```

### Sesudah v2.6

```javascript
// NEW CODE (DB-backed, zero trust):
const task = await Task.findByPk(req.params.id, { attributes: ["id", "status"] });
const SEKRETARIS_APPROVED_STATUSES = ["approved_by_secretary", "forwarded_to_kadin", "closed"];
if (!SEKRETARIS_APPROVED_STATUSES.includes(task.status)) return 422;

Attack (sama):
  POST /api/some-route/123/forward-to-kadin
  body: { sekretaris_disetujui: true, sekretaris_id: 1 }  ← IGNORED
  task.status (from DB) = "in_progress"
  → Guard queries DB → "in_progress" NOT in approved statuses
  → 422 chain_of_command_violation
  → Attack BLOCKED ✓
```

**Test coverage:** T-09, T-10, T-11, T-12, T-13

---

## Skenario 3: URL validation bypass via mismatched handler (R-01)

### Sebelum v2.6

```
Handler A (taskController): URL check via title regex
Handler B (pelaksana): URL check via module field

Attack:
  Task: { module: "kepegawaian", title: "Laporan Umum Bulanan" }
  Target endpoint: POST /api/tasks/123/submit (Handler A)
  body: { output_ringkas: "..." (50+ chars), output_url: "" }
  
  Handler A: title "Laporan Umum" does NOT match /asn|kepegawaian/i
  → URL tidak required → BYPASS module-based URL requirement ✓ (attack success)
```

### Sesudah v2.6

```
Both handlers call: validateSubmitPayload(task, output_ringkas, output_url)
which calls: requiresOutputUrl(task) → task.module.includes("kepegawaian") = TRUE

Attack (sama):
  Handler A (canonical):
  → validateSubmitPayload({ module:"kepegawaian" }, "...", "")
  → requiresOutputUrl = TRUE (module-based)
  → { ok: false, code: "OUTPUT_URL_REQUIRED" }
  → 400 Bad Request → Attack BLOCKED ✓

  Handler B (pelaksana):
  → validateSubmitPayload({ module:"kepegawaian" }, "...", "")
  → Same result → Attack BLOCKED ✓
```

**Test coverage:** T-15, T-18

---

## Semua Test Passed

```
18/18 ✓ ALL CHECKS PASSED — Production Hardening VERIFIED
R-01: URL validation unified ✓
R-02: Close from verified blocked ✓
R-03: Body spoofing on chainOfCommandGuard blocked ✓
```

Jalankan kapanpun untuk re-verify:
```bash
cd backend
npm run verify:hardening
```
