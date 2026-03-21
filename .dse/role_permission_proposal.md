## Proposal Mapping Permission — SIGAP MALUT

Generated: 2026-02-26

Tujuan: menyajikan mapping permission terstruktur (pattern: `<action>:<resource>`) untuk setiap role canonical agar dapat langsung diimplementasikan ke `roles.json` dan mekanisme RBAC runtime.

Rekomendasi pola permission:

- action: create, read, update, delete, approve, finalize, manage, verify, deploy
- resource: kgb, kepegawaian, distribusi, konsumsi, uptd, keuangan, stok, komoditas, master_data, integrations, infrastructure, audit_log, compliance_reports, ci_cd

---

roles:

- code: kepala_dinas
  display_name: Kepala Dinas
  permissions:
  - approve:kgb
  - approve:kepegawaian
  - finalize:kgb
  - finalize:kepegawaian
  - read:compliance_reports
  - read:audit_log
  - manage:governance_settings

- code: sekretaris
  display_name: Sekretaris
  permissions:
  - create:kgb
  - read:kgb
  - update:kgb
  - delete:kgb
  - create:kepegawaian
  - read:kepegawaian
  - update:kepegawaian
  - delete:kepegawaian
  - approve:staff_level
  - finalize:administration
  - manage:administration_records

- code: kepala_bidang
  display_name: Kepala Bidang
  permissions:
  - create:distribusi
  - read:distribusi
  - update:distribusi
  - delete:distribusi
  - finalize:distribusi
  - create:konsumsi
  - read:konsumsi
  - update:konsumsi
  - delete:konsumsi
  - finalize:konsumsi
  - approve:field_requests

- code: kepala_uptd
  display_name: Kepala UPTD
  permissions:
  - create:uptd
  - read:uptd
  - update:uptd
  - delete:uptd
  - approve:uptd_requests
  - finalize:uptd

- code: staf
  display_name: Staf
  permissions:
  - create:kgb_request
  - read:own_records
  - read:kgb

- code: bendahara
  display_name: Bendahara
  permissions:
  - create:payments
  - read:financial_records
  - update:payments
  - delete:payments
  - verify:payments

- code: atasan
  display_name: Atasan Langsung
  permissions:
  - approve:direct_reports
  - read:direct_reports

- code: pelaksana
  display_name: Pelaksana
  permissions:
  - create:stok_records
  - read:stok_records
  - update:stok_records

- code: fungsional
  display_name: Fungsional
  permissions:
  - analyze:data
  - verify:requests
  - read:field_data

- code: data_steward
  display_name: Data Steward
  permissions:
  - manage:master_data
  - approve:master_changes
  - read:master_data

- code: sysadmin
  display_name: System Administrator
  permissions:
  - manage:infrastructure
  - manage:integrations
  - manage:secrets
  - read:infrastructure_metrics

- code: auditor
  display_name: Auditor
  permissions:
  - read:audit_log
  - read:compliance_reports

- code: kepala_subbagian
  display_name: Kepala Subbagian
  permissions:
  - read:subbag_data
  - approve:subbag_requests

- code: kepala_seksi
  display_name: Kepala Seksi
  permissions:
  - read:seksi_data
  - approve:seksi_requests

- code: devops
  display_name: DevOps
  permissions:
  - deploy:applications
  - manage:ci_cd
  - read:infrastructure_metrics

---

Tindak lanjut yang disarankan:

- Terapkan pola permission ini ke `roles.json` pada field `default_permissions`/`permissions` setelah review stakeholder.
- Tambahkan kolom permission ke `dokumenSistem/09-Role-Module-Matrix.md` untuk sinkronisasi dokumentasi.
- Jalankan pemindaian sekunder untuk menemukan referensi role non-struktural sebelum perubahan otomatis.

Jika setuju, saya bisa membuat patch yang memperbarui `roles.json` dan menambahkan kolom permission ke `09-Role-Module-Matrix.md`.
