# Stale Reference Fix Log — SIGAP-MALUT

**Tanggal:** 2026-04-06

---

## Referensi yang Dihapus / Diperbaiki

| # | File | Referensi Lama | Referensi Baru | Tanggal Fix |
|---|------|----------------|----------------|-------------|
| 1 | `openapi.yaml` | `POST /api/tasks/{id}/force-close` (path aktif) | Dihapus — diganti catatan kanonik | 2026-04-06 |
| 2 | `openapi.yaml` | `POST /api/tasks/{id}/reassign` (path aktif) | Dihapus — diganti catatan kanonik | 2026-04-06 |
| 3 | `v28-system-completion-report.md` | "Super Admin (2 endpoints): force-close, reassign" | "Super Admin — jalur kanonik audit" | 2026-04-06 |
| 4 | `v28-system-completion-report.md` | Daftar 2 phantom endpoint di OpenAPI summary | Penjelasan jalur kanonik reject → close | 2026-04-06 |

---

## Referensi yang Tidak Perlu Diperbaiki

| # | File | Referensi | Alasan Dibiarkan |
|---|------|-----------|-----------------|
| 1 | `openapi.yaml` | Comment `# Tidak ada endpoint force-close` | Sudah correct — ini catatan negatif |
| 2 | `v28-system-completion-report.md` | Comment `Tidak ada endpoint force-close terpisah` | Sudah correct — ini penjelasan kanonik |
| 3 | `phantom-endpoint-resolution-report.md` | Menyebut "force-close" | Correct — ini laporan tentang removal-nya |
| 4 | `api-consistency-fix-log.md` | Menyebut "force-close" | Correct — ini log fix |

---

## Stale References Sebelumnya (Sesi Lebih Awal)

Dari sesi audit sebelumnya, referensi stale ini sudah diperbaiki:

| File | Old Reference | New Reference |
|------|--------------|---------------|
| `16-audit-gap-resmi-prioritas-revisi.md` | 6 link ke filename lama | Updated ke canonical names |
| `55-terminology-canonical.md` | 3 ref ke nomor dokumen lama | Updated ke nomor baru |
| `39-status-koordinasi-horizontal.md` | `horizontal-coordination-qa-uat.md` | `63-horizontal-coordination-qa-uat.md` |

---

## Status Akhir

**Total stale references saat ini: 0** ✅
