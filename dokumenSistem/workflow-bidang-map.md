# Workflow Bidang Map — SIGAP-MALUT v2.7

Tanggal: 6 April 2026

## Canonical Bidang Workflow

Berlaku untuk 3 Bidang: Ketersediaan, Distribusi, Konsumsi.

```
PELAKSANA BIDANG
     │
     ▼ submit_to_jf
 submitted_to_jf  ◄──────────────────────────────────────────────────────┐
     │                                                                    │
     ├── verify_by_jf ──────────────► verified_by_jf                     │
     │                                    │                               │
     └── return_to_pelaksana_jf ──► returned_to_pelaksana                │
              ▼ start / submit_to_jf                                      │
          in_progress / submitted_to_jf (loop revisi)                    │
                                                                          │
                    verified_by_jf                                        │
                         │                                                │
                         ▼ submit_to_kabid                                │
                   submitted_to_kabid ◄── jf_resubmit ─── returned_to_jf │
                         │                                       ▲        │
                    ┌────┴──────────┐                            │        │
              kabid_review          │                    kabid_return     │
                    │          kabid_approve                               │
                    │               │                                     │
              review_kabid    approved_kabid                              │
                    │               │                                     │
                    ├── kabid_return ┘ (jika Kabid tolak)                 │
                    │                                                     │
              approved_kabid                                              │
                    │                                                     │
                    ▼ kabid_forward_sekretaris                            │
                  verified  ◄──────────────── (masuk rantai Sekretaris)  │
                    │
                    ▼ review (Sekretaris)
            approved_by_secretary
                    │
                    ├── forward ──► forwarded_to_kadin
                    │                      │
                    └─────── close ◄────────┘
                             │
                           closed ✓
```

## Transitions Baru (v2.7)

| Transition | From | To | Roles |
|---|---|---|---|
| `submit_to_jf` | in_progress, returned_to_pelaksana | submitted_to_jf | pelaksana_bidang, JF_ROLES |
| `verify_by_jf` | submitted_to_jf | verified_by_jf | JF_ROLES |
| `return_to_pelaksana_jf` | submitted_to_jf | returned_to_pelaksana | JF_ROLES |
| `submit_to_kabid` | verified_by_jf | submitted_to_kabid | JF_ROLES |
| `kabid_review` | submitted_to_kabid | review_kabid | kepala_bidang |
| `kabid_approve` | review_kabid, submitted_to_kabid | approved_kabid | kepala_bidang |
| `kabid_return` | review_kabid, submitted_to_kabid | returned_to_jf | kepala_bidang |
| `jf_resubmit` | returned_to_jf | submitted_to_kabid | JF_ROLES |
| `kabid_forward_sekretaris` | approved_kabid | verified | kepala_bidang |

## Guard Enforcement Aktif

```
POST /api/kabid/*/approval-queue/:id/setujui
  → requireJFBeforeKabid (DB-backed)
  → Tolak jika task.status bukan dalam JF_VERIFIED_STATUSES

POST /api/kabid/*/approval-queue/:id/kembalikan
  → requireJFBeforeKabid (DB-backed)
  → Tolak jika JF belum verifikasi
```

## Catatan: Tidak Ada Bypass

- Pelaksana Bidang tidak bisa langsung submit ke Kabid (blockDirectSubmitToKabid)
- Kabid tidak bisa approve jika JF belum verifikasi (requireJFBeforeKabid)
- Kabid tidak bisa forward ke Sekretaris jika belum `approved_kabid` (requireKabidBeforeSekretaris)
