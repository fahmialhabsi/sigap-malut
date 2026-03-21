# 07-Role-Module-Matrix (proposed)

| Role          | Modul/Layanan        | Create | Read | Update | Delete | Approve | Finalize | Permissions                                                                                                                                                                                                |
| ------------- | -------------------- | ------ | ---- | ------ | ------ | ------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sekretaris    | KGB, Kepegawaian     | Y      | Y    | Y      | Y      | Y       | Y        | create:kgb, read:kgb, update:kgb, delete:kgb, create:kepegawaian, read:kepegawaian, update:kepegawaian, delete:kepegawaian, approve:staff_level, finalize:administration                                   |
| Kepala Bidang | Distribusi, Konsumsi | Y      | Y    | Y      | Y      | Y       | Y        | create:distribusi, read:distribusi, update:distribusi, delete:distribusi, finalize:distribusi, create:konsumsi, read:konsumsi, update:konsumsi, delete:konsumsi, finalize:konsumsi, approve:field_requests |
| Kepala UPTD   | UPTD                 | Y      | Y    | Y      | Y      | Y       | Y        | create:uptd, read:uptd, update:uptd, delete:uptd, approve:uptd_requests, finalize:uptd                                                                                                                     |
| Staf          | KGB, Kepegawaian     | Y      | Y    | N      | N      | N       | N        | create:kgb_request, read:own_records, read:kgb                                                                                                                                                             |
| Bendahara     | Keuangan             | Y      | Y    | Y      | Y      | N       | N        | create:payments, read:financial_records, update:payments, delete:payments, verify:payments                                                                                                                 |

## Additional proposed rows (roles present in canonical registry but missing above)

| Role                 | Modul/Layanan         | Create | Read | Update | Delete | Approve | Finalize | Permissions                                                                                   |
| -------------------- | --------------------- | ------ | ---- | ------ | ------ | ------- | -------- | --------------------------------------------------------------------------------------------- |
| Kepala Dinas         | Governance / All      | -      | Y    | -      | -      | Y       | Y        | approve:kgb, approve:kepegawaian, finalize:kgb, finalize:kepegawaian, read:compliance_reports |
| Atasan               | HR / Team             | -      | Y    | -      | -      | Y       | -        | approve:direct_reports, read:direct_reports                                                   |
| Pelaksana            | Stok / Komoditas      | Y      | Y    | Y      | -      | -       | -        | create:stok_records, read:stok_records, update:stok_records                                   |
| Fungsional           | Analysis / Verifikasi | -      | Y    | -      | -      | -       | -        | analyze:data, verify:requests, read:field_data                                                |
| Data Steward         | Master Data           | Y      | Y    | Y      | Y      | Y       | -        | manage:master_data, approve:master_changes, read:master_data                                  |
| System Administrator | Infrastruktur         | -      | Y    | -      | -      | -       | -        | manage:infrastructure, manage:integrations, manage:secrets                                    |
| Auditor              | Compliance            | -      | Y    | -      | -      | -       | -        | read:audit_log, read:compliance_reports                                                       |
| Kepala Subbagian     | Administrasi          | -      | Y    | -      | -      | Y       | -        | read:subbag_data, approve:subbag_requests                                                     |
| Kepala Seksi         | Seksi                 | -      | Y    | -      | -      | Y       | -        | read:seksi_data, approve:seksi_requests                                                       |
| DevOps               | Infrastruktur / CI/CD | -      | Y    | -      | -      | -       | -        | deploy:applications, manage:ci_cd, read:infrastructure_metrics                                |

Notes: align `Permissions` entries with `default_permissions` in `.dse/roles.json` when applying.
