# QA / UAT — koordinasi horizontal

## Peran vs endpoint

| Aksi | Sekretaris | Kabid / UPTD | Gubernur / Kadis | Super admin |
|------|------------|--------------|------------------|-------------|
| `POST /horizontal` pada thread | Ya (akses thread) | Ya | Bila akses thread | Ya |
| `PATCH .../status` | Ya jika pihak terkait atau `to_user_id` null | Pihak terkait | Pihak terkait | Ya |
| `PATCH .../respond` | Penerima / admin | Penerima / admin | Penerima / admin | Ya |
| Dashboard sekretaris/kabid/uptd | Sesuai route | Sesuai route | — | Ya |
| Dashboard executive | — | — | Ya | Ya |

## Skenario normal

1. User A membuat koordinasi pada thread valid → status `diajukan`, event timeline tercatat.
2. Penerima `PATCH .../status` `{ "status": "diterima" }` → 200.
3. `diproses` → `menunggu_balasan` → `diproses` → `PATCH .../respond` `{ "status": "selesai", "response_body": "..." }` → terminal.

**Harus gagal (negatif):**

- Dari `diajukan` langsung `{ "status": "diproses" }` → 400, `HCOORD_INVALID_TRANSITION`.
- `PATCH .../status` `{ "status": "selesai" }` → 400, `HCOORD_USE_RESPOND_ENDPOINT`.

## Skenario macet / SLA

1. Alur sampai `terlambat` (manual atau disiplin `sla_due_at` di UI/operasi).
2. Dari `terlambat`, `PATCH .../status` `{ "status": "gagal_koordinasi" }` → 200.
3. Dari `diproses`, `PATCH .../respond` `{ "status": "gagal_koordinasi" }` → 400, `HCOORD_GAGAL_REQUIRES_TERLAMBAT`.

## Siapa intervensi

- **Antar bidang macet:** Sekretaris (dashboard lintas bidang, thread tertahan SLA).
- **Unit lambat:** Kabid terkait / Sekretaris eskalasi.
- **Keputusan pimpinan:** Gubernur/Kadis lewat dashboard eksekutif (agregat, bukan detail operasional).

## Event kebijakan (`policy_rule_logged`)

- Job persistensi: dedupe per `policy_key` per thread (jendela jam, env `POLICY_LOG_DEDUPE_HOURS`, default 12).
- Timeline: kritis tampil utuh (dedupe key); peringatan dibatasi; ringan digulung menjadi satu ringkasan (lihat `executionThreadTimelineService`).

## Checklist regresi cepat

- [ ] Create horizontal + daftar per thread.
- [ ] Transisi valid status + transisi ilegal tertolak dengan `code` stabil.
- [ ] Respond selesai/tolak + gagal hanya dari terlambat.
- [ ] Dashboard per role memuat tanpa error; filter status & SLA.
- [ ] Executive dashboard: empty state bila tidak ada koordinasi terbuka.
- [ ] OpenAPI path `/horizontal` selaras dengan respons nyata.
