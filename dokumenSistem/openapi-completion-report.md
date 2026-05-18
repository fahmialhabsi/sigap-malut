# OpenAPI Completion Report — SIGAP-MALUT v2.7

Tanggal: 6 April 2026

## Sebelum v2.7

- Total endpoint terdokumentasi: ~38
- Missing: Task lifecycle dasar, Bidang JF/Kabid, UPTD, Pelaksana Bidang
- Schema: Tidak ada `TaskSummary`

## Sesudah v2.7

- Total endpoint terdokumentasi: ~57
- Endpoint baru ditambahkan: 19

## Daftar Endpoint Baru

### Task Lifecycle
| Endpoint | Method | Tags |
|---|---|---|
| `/api/tasks/{id}/accept` | POST | Tasks - Lifecycle |
| `/api/tasks/{id}/start` | POST | Tasks - Lifecycle |
| `/api/tasks/{id}/close` | POST | Tasks - Lifecycle |

### Pelaksana Bidang
| Endpoint | Method | Tags |
|---|---|---|
| `/api/pelaksana-bidang/tugas` | GET | Pelaksana Bidang |
| `/api/pelaksana-bidang/tugas/{id}/submit` | POST | Pelaksana Bidang |

### JF Bidang Ketersediaan
| Endpoint | Method | Tags |
|---|---|---|
| `/api/jf/ketersediaan/verifikasi/masuk` | GET | JF - Bidang Ketersediaan |
| `/api/jf/ketersediaan/verifikasi/{id}/terima` | POST | JF - Bidang Ketersediaan |
| `/api/jf/ketersediaan/verifikasi/{id}/kembalikan` | POST | JF - Bidang Ketersediaan |
| `/api/jf/ketersediaan/tugas-kabid/{id}/submit` | POST | JF - Bidang Ketersediaan |

### Kabid
| Endpoint | Method | Tags |
|---|---|---|
| `/api/kabid/ketersediaan/approval-queue` | GET | Kabid - Bidang Ketersediaan |
| `/api/kabid/ketersediaan/approval-queue/{id}/setujui` | POST | Kabid - Bidang Ketersediaan |
| `/api/kabid/ketersediaan/approval-queue/{id}/kembalikan` | POST | Kabid - Bidang Ketersediaan |
| `/api/kabid/distribusi/approval-queue/{id}/setujui` | POST | Kabid - Bidang Distribusi |
| `/api/kabid/konsumsi/approval-queue/{id}/setujui` | POST | Kabid - Bidang Konsumsi |

### UPTD
| Endpoint | Method | Tags |
|---|---|---|
| `/api/uptd/dashboard/summary` | GET | UPTD |
| `/api/uptd/kasubag/assign-tu` | POST | UPTD |
| `/api/uptd/kasi/assign` | POST | UPTD |

## Schema Baru

- `TaskSummary`: Object lengkap dengan enum 19 statuses

## Keterangan Error Codes dalam OpenAPI

Submit validation error codes didokumentasikan:
- `OUTPUT_TOO_SHORT`: output_ringkas kurang dari 50 karakter
- `OUTPUT_URL_REQUIRED`: modul kepegawaian/ASN wajib output_url

Guard violation codes:
- `422 chain_of_command_violation`: BYPASS_JF / BYPASS_KABID / BYPASS_SEKRETARIS

## Endpoint yang Masih Belum Terdokumentasi (P3 — non-blocking)

- JF Distribusi dan Konsumsi endpoints (pattern sama dengan Ketersediaan)
- Kabid Distribusi dan Konsumsi approval-queue detail
- UPTD Ops endpoints (`/api/uptd-ops/*`)
- Koordinasi Gubernur dan Kadin detail
