# Status koordinasi horizontal (`horizontal_coordination_requests`)

Sumber kebenaran implementasi: `backend/services/horizontalCoordinationStateMachine.js`. Label UI frontend: `frontend/src/constants/horizontalCoordinationStatus.js`.

## Status alur terbuka (kerja)

| Status | Keterangan |
|--------|------------|
| `diajukan` | Default saat dibuat (`POST .../horizontal`). |
| `diterima` | Penerima mengakui permintaan. |
| `diproses` | Sedang dikerjakan. |
| `menunggu_balasan` | Menunggu jawaban / data pihak lain. |
| `terlambat` | Ditandai terlambat (bisa diperkuat dengan `sla_due_at` lewat). |

## Status penutupan / eskalasi

| Status | Keterangan |
|--------|------------|
| `selesai` | Diselesaikan dengan balasan (`PATCH .../respond`). |
| `ditolak` | Ditolak (`PATCH .../respond`). |
| `dibatalkan` | Dibatalkan — lewat `PATCH .../status` atau `.../respond` sesuai peran. |
| `gagal_koordinasi` | Koordinasi tidak tercapai — **hanya** dari status `terlambat` (PATCH status atau respond). |

## Peta transisi `PATCH .../status`

- `diajukan` → `diterima` \| `dibatalkan`
- `diterima` → `diproses` \| `dibatalkan`
- `diproses` → `menunggu_balasan` \| `terlambat` \| `dibatalkan`
- `menunggu_balasan` → `diproses` \| `terlambat` \| `dibatalkan`
- `terlambat` → `diproses` \| `gagal_koordinasi` \| `dibatalkan`

`selesai` dan `ditolak` **bukan** target `PATCH .../status` — gunakan `PATCH .../respond`.

## API

- **Tanpa menutup (alur + batal jalur + gagal dari terlambat):** `PATCH /api/coordination/horizontal/:id/status`
- **Menutup dengan balasan:** `PATCH /api/coordination/horizontal/:id/respond`

## Kode error (ringkas)

| Kode | Arti singkat |
|------|----------------|
| `THREAD_WAJIB` | `execution_thread_id` tidak valid / wajib (create). |
| `KOORDINASI_TIDAK_DITEMUKAN` | ID koordinasi tidak ada. |
| `HCOORD_INVALID_TRANSITION` | Transisi status tidak diizinkan. |
| `HCOORD_USE_RESPOND_ENDPOINT` | Penutupan selesai/ditolak lewat `/respond`. |
| `HCOORD_ALREADY_CLOSED` | Sudah terminal. |
| `HCOORD_GAGAL_REQUIRES_TERLAMBAT` | `gagal_koordinasi` tanpa dari `terlambat`. |
| `HCOORD_FORBIDDEN_ACTOR` | Bukan pihak yang berhak. |
| `HCOORD_STATUS_INVALID` | Nilai status tidak dikenali. |

OpenAPI: `dokumenSistem/openapi.yaml` (tag **CoordinationHorizontal**). Panduan QA: `63-horizontal-coordination-qa-uat.md`.

> **Dokumen terkait:** `40-alur-koordinasi-horizontal.md` (mekanisme alur & policy), `63-horizontal-coordination-qa-uat.md` (QA/UAT), `openapi.yaml` (kontrak API).
