# Widget & endpoint dashboard koordinasi horizontal per peran

Status & transisi API: `status-koordinasi-horizontal.md`. UAT/QA: `horizontal-coordination-qa-uat.md`.

## Endpoint ringkasan

| Peran | Method & path | Akses token |
|-------|----------------|------------|
| Sekretaris | `GET /api/coordination/horizontal/dashboard/sekretaris` | Sekretaris, super_admin |
| Kabid | `GET /api/coordination/horizontal/dashboard/kabid` | Kepala bidang / kabid, super_admin |
| UPTD | `GET /api/coordination/horizontal/dashboard/uptd` | Kepala UPTD, super_admin |
| Eksekutif | `GET /api/coordination/horizontal/dashboard/executive` | Gubernur, kepala_dinas, super_admin |

Query opsional (semua dashboard): `status`, `level`, `unit`, `sla=overdue`.

## Komponen UI (frontend)

| Lokasi | Komponen |
|--------|-----------|
| `DashboardSekretariat` | `HorizontalCoordinationRoleDashboard` variant `sekretaris` |
| `DashboardKabid*` (3 bidang) | variant `kabid` |
| `DashboardUPTD` | variant `uptd` |
| `DashboardGubernur` / `DashboardKepalaDinas` | `ExecutiveHorizontalCoordinationPanel` |

## Contoh respons — Sekretaris (cuplikan)

```json
{
  "success": true,
  "data": {
    "role_lens": "sekretaris",
    "summary": {
      "coordination_active": 12,
      "coordination_overdue": 3,
      "awaiting_response": 5,
      "threads_with_overdue_sla": 2,
      "cross_bidang_open": 7
    },
    "priority_queue": [
      {
        "id": 1,
        "execution_thread_id": "550e8400-e29b-41d4-a716-446655440000",
        "subject": "Sinkron data stok",
        "status": "diproses",
        "from_unit": "Sekretariat",
        "to_unit": "Bidang Ketersediaan",
        "from_user_label": "User A",
        "to_user_label": "User B"
      }
    ],
    "field_tasks_linked": [],
    "insights": {
      "slowest_responding_units": [{ "label": "Unit X", "avg_response_hours": 18.2, "sample_count": 4 }],
      "threads_blocked_by_overdue_coordination": ["550e8400-e29b-41d4-a716-446655440000"]
    },
    "generated_at": "2026-04-03T12:00:00.000Z"
  }
}
```

## Contoh respons — Eksekutif (cuplikan)

```json
{
  "success": true,
  "data": {
    "role_lens": "executive",
    "summary": {
      "total_open_horizontal": 20,
      "overdue_horizontal": 4,
      "distinct_threads_touched": 15,
      "top_slow_units": [{ "label": "Bidang X", "avg_response_hours": 12, "sample_count": 3 }]
    },
    "high_risk_threads": ["uuid-…"],
    "sample_critical": []
  }
}
```

## Auth client kanonik

- Gunakan `frontend/src/services/api.js` sebagai sumber axios + interceptor.
- `frontend/src/utils/api.js` re-export `default`, `setAuthToken`, `ensureAuthApiDefaults`.
- Dashboard utama eksekutif & koordinasi di atas sudah mengimpor `services/api` secara langsung.

## Uji end-to-end (ringkas)

1. Migrasi DB termasuk tabel `horizontal_coordination_requests` (jika belum).
2. Login sebagai Sekretaris → buka dashboard Sekretariat → pastikan widget koordinasi terisi atau error 403 jelas.
3. `POST /api/coordination/horizontal` dengan `execution_thread_id` valid → cek `GET .../thread/:id`.
4. `PATCH .../status` lalu `PATCH .../respond`.
5. Buka `/dashboard/execution-thread/:uuid` — pastikan entri `koordinasi_horizontal` di timeline.
6. Setelah cron policy jalan (atau panggil internal `runPolicyExecutionLogJob` dari REPL), cek `execution_thread_events` untuk `policy_rule_logged`.
