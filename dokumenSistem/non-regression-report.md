# Non-Regression Report — SIGAP-MALUT v2.7

Tanggal: 6 April 2026
Scope: Memastikan v2.6 tidak rusak setelah penambahan Bidang & UPTD workflow

## R-01 — Submit Validation Unification (v2.6)

| Check | Before | After v2.7 | Status |
|---|---|---|---|
| submitValidation.js shared utility | ✅ ada | ✅ tidak diubah | PASS |
| taskController.js import | ✅ ada | ✅ masih ada | PASS |
| pelaksana/tugasController.js import | ✅ ada | ✅ masih ada | PASS |
| Bidang submit (submit_to_jf) | N/A | ✅ bisa pakai shared validator | PASS |

## R-02 — Close from Verified Blocked (v2.6)

| Check | Expected | Actual | Status |
|---|---|---|---|
| close.from contains "approved_by_secretary" | yes | yes | PASS |
| close.from contains "forwarded_to_kadin" | yes | yes | PASS |
| close.from contains "verified" | NO | NO | PASS |
| Number of entries in close.from | 2 | 2 | PASS |

Verified directly: Lines 224-227 taskController.js:
```javascript
from: [
  "approved_by_secretary",
  "forwarded_to_kadin",
],
```

## R-03 — chainOfCommandGuard No Body Trust (v2.6)

| Check | Expected | Actual | Status |
|---|---|---|---|
| Live lines trusting req.body.sekretaris_disetujui | 0 | 0 | PASS |
| Live lines trusting req.body.jf_diverifikasi | 0 | 0 | PASS |
| requireSekretarisBeforeKadin uses Task.findByPk | yes | yes | PASS |
| requireJFBeforeKabid uses Task.findByPk | yes | yes | PASS |
| requireKabidBeforeSekretaris (NEW) uses Task.findByPk | N/A | yes | PASS |

## Sekretariat Flow Integrity

Trace: `draft → assigned → accepted → in_progress → submitted → verified → approved_by_secretary → closed`

All transitions dalam jalur ini:
- `assign`: PRESENT ✅
- `accept`: PRESENT ✅
- `start`: PRESENT ✅
- `submit`: PRESENT ✅
- `verify`: PRESENT ✅
- `review`: PRESENT ✅
- `close`: PRESENT ✅

**Tidak ada breaking change pada Sekretariat flow.**

## Verdict: ✅ ZERO REGRESSION

v2.6 Sekretariat hardening tetap utuh. Semua penambahan v2.7 bersifat additive.
