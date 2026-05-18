# Critical Flow Observability Map — SIGAP-MALUT

**Tanggal:** 2026-04-06 | **Versi:** v3.0

---

## Alur Utama: Perintah Gubernur → Pelaksana → Close

```
[Gubernur]
  POST /api/gubernur/instruksi
    → auditExecutiveAction("TERBITKAN")
    → AuditLog ✅

[Kepala Dinas]
  GET /api/kadin/inbox-gubernur
  POST /api/kadin/inbox-gubernur/:id/konfirmasi
    → auditExecutiveAction("KONFIRMASI")
    → AuditLog ✅

[Sekretaris → Kasubag]
  POST /api/tasks (CREATE)
    → writeAudit("CREATE", taskId, null, taskData, actorId)
    → TaskLogs ✅

  POST /api/tasks/:id/assign
    → writeAudit("ASSIGN")
    → TaskLogs ✅

[Pelaksana]
  POST /api/tasks/:id/accept
    → writeAudit("ACCEPT")
    → TaskLogs ✅

  POST /api/tasks/:id/start
    → writeAudit("START")
    → TaskLogs ✅

  POST /api/tasks/:id/submit
    → validateSubmitPayload() → 400 jika invalid
    → writeAudit("SUBMIT")
    → TaskLogs ✅

[Kasubag — Verify]
  POST /api/tasks/:id/review
    → writeAudit("VERIFY")
    → TaskLogs ✅

[Sekretaris — Approve]
  POST /api/sekretaris/tugas-terverifikasi (view)
  POST /api/tasks/:id/approve (approve_by_secretary)
    → writeAudit("APPROVE")
    → TaskLogs ✅

[Kepala Dinas — Forward/Escalate]
  POST /api/kadin/approval/:id/putuskan
    → requireSekretarisBeforeKadin() → 422 if bypass ✅
    → auditExecutiveAction
    → AuditLog ✅

  POST /api/kadin/tasks/:id/escalate-to-governor
    → requireKadinBeforeGubernur() → 422 if bypass ✅
    → writeAudit("ESCALATE")
    → TaskLogs ✅

[Gubernur — Final Decision]
  POST /api/gubernur/tasks/:id/approve
    → requireKadinBeforeGubernur() ✅
    → writeAudit("GOVERNOR_APPROVE")
    → TaskLogs ✅

  POST /api/gubernur/tasks/:id/reject
    → requireKadinBeforeGubernur() ✅
    → writeAudit("GOVERNOR_REJECT")
    → TaskLogs ✅

[Close]
  POST /api/tasks/:id/close
    → TRANSITIONS.close.from check → 403 if invalid
    → writeAudit("CLOSE")
    → TaskLogs ✅
```

---

## Alur Bidang: Pelaksana Bidang → JF → Kabid → Sekretaris

```
[Pelaksana Bidang]
  POST /api/pelaksana-bidang/tugas/:id/submit
    → status: submitted_to_jf ✅

[JF Bidang Ketersediaan]
  POST /api/jf/ketersediaan/tugas-kabid/:id/submit
    → blockDirectSubmitToKabid() → 422 if bypass ✅
    → status: submitted_to_kabid ✅

[Kabid Ketersediaan]
  POST /api/kabid/ketersediaan/approval-queue/:id/setujui
    → requireJFBeforeKabid() → 422 if bypass ✅
    → status: approved_kabid ✅

  → requireKabidBeforeSekretaris() pada route Sekretaris ✅
    → status: approved_by_secretary ✅
```

---

## Chain of Command Guard Visibility

| Guard | Trigger | HTTP Response |
|-------|---------|---------------|
| `blockDirectSubmitToKabid` | Pelaksana langsung ke Kabid | 422 BYPASS_JF |
| `requireJFBeforeKabid` | Kabid approve tanpa JF | 422 BYPASS_JF |
| `requireKabidBeforeSekretaris` | Sekretaris approve tanpa Kabid | 422 BYPASS_KABID |
| `requireSekretarisBeforeKadin` | Kadis approve tanpa Sekretaris | 422 BYPASS_SEKRETARIS |
| `requireKadinBeforeGubernur` | Gubernur decide tanpa Kadis | 422 BYPASS_KADIN |

Semua guard: **DB-backed** (query task status dari DB, tidak trust req.body) ✅

---

## Error Code Registry

| Code | HTTP | Meaning |
|------|------|---------|
| `OUTPUT_TOO_SHORT` | 400 | output_ringkas < 50 chars |
| `OUTPUT_URL_REQUIRED` | 400 | URL wajib untuk task ASN/kepegawaian |
| `BYPASS_JF` | 422 | Chain of command violation |
| `BYPASS_KABID` | 422 | Chain of command violation |
| `BYPASS_SEKRETARIS` | 422 | Chain of command violation |
| `BYPASS_KADIN` | 422 | Chain of command violation |
| `chain_of_command_violation` | 422 | Generic CoC error |
| `TOKEN_EXPIRED` | 401 | JWT expired |
| `NOT_AUTHORIZED` | 403 | Role tidak diizinkan |
