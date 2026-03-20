# 06-Workflow-Specification

## Workflow Layanan (Contoh: Layanan KGB)

| Status       | Role Input   | Role Verifikasi | Role Finalisasi | Trigger Event            |
| ------------ | ------------ | --------------- | --------------- | ------------------------ |
| Draft        | Staf         |                 |                 | Input data               |
| Diajukan     | Staf         | Atasan          |                 | Submit                   |
| Diverifikasi | Atasan       | Sekretaris      |                 | Verifikasi               |
| Disetujui    | Sekretaris   | Kepala Dinas    |                 | Approve                  |
| Selesai      | Kepala Dinas |                 |                 | Finalisasi               |
| Arsip        |              |                 |                 | Otomatis setelah selesai |

## Workflow Approval Log

| Status    | Role              | Trigger |
| --------- | ----------------- | ------- |
| Draft     | Inputer           | Input   |
| Submitted | Reviewer          | Submit  |
| Approved  | Approver          | Approve |
| Rejected  | Reviewer/Approver | Reject  |
