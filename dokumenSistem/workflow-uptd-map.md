# Workflow UPTD Map — SIGAP-MALUT v2.7

Tanggal: 6 April 2026

## Canonical UPTD Workflow

```
PELAKSANA UPTD (TU / Mutu / Teknis)
     │
     ▼ submit
  submitted
     │
     ├── verify ──────────────► verified   [oleh kepala_uptd / kepala_seksi_uptd / kasubag_uptd]
     │                              │
     └── verify_reject ──► returned_to_pelaksana  (kepala seksi tolak)
              ▼
         in_progress → re-submit
                    verified
                        │
                        ▼ review (Sekretaris)
              approved_by_secretary
                        │
                        ├── forward ──► forwarded_to_kadin
                        │
                      close
                        │
                      closed ✓
```

## Role UPTD yang Aktif di Transitions (v2.7)

```javascript
const UPTD_ROLES = [
  "kepala_uptd",
  "kasubag_uptd",
  "kepala_seksi_uptd",
  "kepala_seksi",
];
```

| Transition | UPTD Role Berwenang |
|---|---|
| `assign` | kepala_uptd, kasubag_uptd, kepala_seksi_uptd |
| `verify` | kepala_uptd, kasubag_uptd, kepala_seksi_uptd, kepala_seksi |
| `verify_reject` | kepala_uptd, kasubag_uptd, kepala_seksi_uptd, kepala_seksi |
| `close` | kepala_uptd, kasubag_uptd |
| `reject` / `escalate` | kepala_uptd |

## Route UPTD yang Di-mount (v2.7)

| Path | Route File |
|---|---|
| `/api/uptd/*` | `backend/routes/uptd.js` |
| `/api/uptd-ops/*` | `backend/routes/uptdOps.js` |

## Catatan

UPTD tidak memerlukan lapisan JF → Kabid karena struktur organisasi UPTD lebih flat:
- Kepala Seksi langsung memverifikasi pelaksana
- Kasubag TU mengurus administrasi
- Kepala UPTD menjadi puncak approval internal sebelum Sekretaris
