# Enum Coverage Report — SIGAP-MALUT v2.7

Tanggal: 6 April 2026

## Status: ✅ FULLY COVERED (19/19 statuses)

Setiap status di `Task.status` ENUM (Task.js) memiliki minimal satu transisi masuk atau keluar
yang terdefinisi di `TRANSITIONS` dalam `backend/controllers/taskController.js`.

| Status | TRANSITIONS.from | TRANSITIONS.to | Dead-End? |
|---|---|---|---|
| `draft` | assign, reopen | — | NO |
| `assigned` | accept, reject_assignment, reject, escalate | assign | NO |
| `accepted` | start, reject, escalate | accept | NO |
| `in_progress` | submit, submit_to_jf, reject, escalate | start, review_back | NO |
| `submitted` | verify, verify_reject, reject, escalate | submit | NO |
| `submitted_to_jf` | verify_by_jf, return_to_pelaksana_jf, reject, escalate | submit_to_jf | NO |
| `verified_by_jf` | submit_to_kabid, reject, escalate | verify_by_jf | NO |
| `submitted_to_kabid` | kabid_review, kabid_approve, kabid_return, reject, escalate | submit_to_kabid, jf_resubmit | NO |
| `review_kabid` | kabid_approve, kabid_return, reject, escalate | kabid_review | NO |
| `approved_kabid` | kabid_forward_sekretaris, reject, escalate | kabid_approve | NO |
| `returned_to_jf` | jf_resubmit, reject, escalate | kabid_return | NO |
| `returned_to_pelaksana` | start, submit, submit_to_jf | verify_reject, return_to_pelaksana_jf | NO |
| `verified` | review, review_back, reject, escalate | verify, kabid_forward_sekretaris | NO |
| `approved_by_secretary` | forward, close | review | NO |
| `forwarded_to_kadin` | close | forward | NO |
| `closed` | — (terminal) | close | NO (terminal) |
| `rejected` | reopen | reject, escalate | NO |
| `escalated` | reopen | escalate | NO |

## Catatan Penting

- Status `closed` adalah terminal (tidak perlu transisi keluar — ini adalah state selesai yang valid)
- Status Bidang (`submitted_to_jf` dst) sebelum v2.7 adalah **ORPHAN** — tidak ada transisi
- Setelah v2.7: semua orphan telah ditutup dengan 9 transisi baru
