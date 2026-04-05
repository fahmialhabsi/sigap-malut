# Alur koordinasi horizontal berbasis execution thread

## Prinsip

- Setiap item koordinasi horizontal **wajib** terikat `execution_thread_id` yang sama dengan rantai instruksi/tugas/klarifikasi terkait.
- Timeline thread menampilkan jenis `koordinasi_horizontal` (lihat `executionThreadTimelineService`).
- Event audit tambahan: `execution_thread_events` untuk create, respond, ubah status, dan **log policy** terjadwal.

## Siapa membuat

- Pengguna dengan akses ke thread (`userCanAccessExecutionThread`) dapat `POST /api/coordination/horizontal` menyertakan `execution_thread_id` (UUID).
- Umumnya: Sekretaris, Kabid, UPTD, atau admin koordinasi.

## Siapa merespons

- **Penutupan / balasan:** penerima (`to_user_id`) atau super admin (`PATCH .../respond`).
- **Transisi status kerja:** pengirim, penerima, super admin; Sekretaris diizinkan jika `to_user_id` null (koordinasi terbuka).

## Dampak ke observabilitas

- **GET** `/api/execution-thread/:id` — tetap mengevaluasi policy **di respons** untuk saran; **persist** policy ke event dilakukan oleh job (`policyExecutionLogScheduler`), bukan oleh setiap GET.
- Dashboard peran memuat ringkasan dari `/api/coordination/horizontal/dashboard/*`.

## Job policy

- Cron default: `POLICY_EXECUTION_LOG_CRON` (mis. `15 */4 * * *`).
- Dedupe: rule yang sama pada thread yang sama tidak ditulis ulang dalam `POLICY_LOG_DEDUPE_HOURS` (default 6 jam).
- Event: `event_type = policy_rule_logged`, `ref_modul = policy_engine`, payload berisi `policy_key`, `severity`, `recommended_action`, `context_snapshot`.

## Nonaktifkan

- `POLICY_EXECUTION_LOG_DISABLED=1` — mematikan scheduler log policy.
