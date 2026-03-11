# 05 — Alur Kerja Perintah/Tugas (Sekretariat, 3 Bidang, UPTD)

Versi: 1.0  
Penulis: Tim SIGAP Malut (draft untuk implementasi)  
Tujuan: Menspesifikasikan workflow perintah/tugas yang enforce alur SOTK, audit trail, verifikasi, monitoring, eskalasi, dan UI/UX per peran (Sekretaris, Kasubag Umum & Kepegawaian, Pejabat Fungsional, Pelaksana, Bendahara) serta memperluas ke 3 Bidang dan UPTD.

Ringkasan singkat

- Sekretariat = hub / orchestrator untuk administrasi & dokumentasi.
- Perintah/tugas harus lewat workflow digital: Sekretaris → Kasubag/Pejabat Fungsional → Pelaksana/Bendahara/UPTD → Verifikasi oleh JF/Kepala Bidang → Sekretaris review → (opsional) forward ke Kepala Dinas.
- Setiap aksi dicatat di audit_log (sudah ada tabel public.audit_log). Workflow menambahkan tabel domain (tasks, task_assignments, task_logs, approvals, notifications).

1. Entitas domain dan tabel database (rekomendasi)

- tasks (perintah/tugas utama)
  - id (pk), title, description, module, source_unit (sekretariat/bidang/uptd), priority, due_date, sla_seconds, status, metadata JSON, created_by (pegawai_id), created_at, updated_at
- task_assignments
  - id, task_id, assignee_pegawai_id, role (kasubag/jf/pelaksana/bendahara/uptd), assigned_by, assigned_at, accepted_at, rejected_at
- task_logs
  - id, task_id, actor_pegawai_id, action (create/assign/accept/start/submit/verify/approve/reject/escalate/close), payload JSON, created_at
- approvals
  - id, task_id, level (1..N), approver_pegawai_id, action, note, action_at
- task_files
  - id, task_id, file_path, file_type, uploaded_by, uploaded_at
- notifications
  - id, target_pegawai_id, task_id, channel (in_app,email,wa), message, seen, created_at
- task_statuses (master)
  - draft, open, in_progress, submitted, verified, approved_by_secretary, forwarded_to_kadin, closed, rejected, escalated
- workflow_rules (optional, for dynamic rules)
  - id, module, from_status, to_status, allowed_roles, requires_approval

Catatan: semua perubahan CRUD pada tasks dan assignments harus menulis snapshot ke audit_log (existing table) — gunakan pegawai_id sebagai pegawai_id di audit_log.

2. Lifecycle / state machine (usulan)

- Draft (pembuatan oleh Sekretariat atau Kasubag/JF)
- Open / Assigned (Sekretaris atau Kepala Bidang assign ke Kasubag/JF)
- Accepted (assignee menerima tugas)
- In Progress (pelaksana kerja)
- Submitted (pelaksana/ bendahara submit hasil + file pendukung)
- Verified (JF / Kepala Subbid verifikasi teknis)
  - If verified -> mark verified + move to Secretary review
  - If not verified -> reject to pelaksana with note (loop)
- Reviewed by Secretary
  - If ok -> approved_by_secretary -> may be forwarded to Kepala Dinas (option)
  - If not ok -> back to assignee (request revisi)
- Forwarded to Kepala Dinas (optional) -> Kepala Dinas action -> Closed
- Closed (task done)
  Transitions must be guarded by role checks.

3. Hak akses & peran (rules)

- Sekretaris
  - Bisa create task for Sekretariat or any bidang/uptd
  - Bisa assign ke Kasubag / Pejabat Fungsional / Kepala Bidang
  - Bisa review & approve final sebelum forward ke Kepala Dinas
  - Dashboard: inbox semua tugas di Sekretariat, ringkasan KPI, tugas overdue, approval queue
- Kasubag Umum & Kepegawaian
  - Terima assign dari Sekretaris, dapat assign ke Pelaksana/ Bendahara
  - Menandai accepted/rejected, memantau progress pelaksana
  - Dashboard: tugas yang ditugaskan, status pelaksana, form input SPJ / surat / kepegawaian
- Pejabat Fungsional (JF)
  - Technical verifier: verifikasi hasil kerja pelaksana
  - Menerima tugas/permintaan verifikasi dari Kepala Bidang / Kasubag
  - Dashboard: verify queue, timeline evidence, history
- Pelaksana
  - Menerima tugas dari Kasubag / JF
  - Dapat submit bukti (file/photo/hasil)
  - Dashboard: my tasks, checklist, upload form
- Bendahara
  - Menerima tugas jenis keuangan (SPJ, pembayaran)
  - Dapat meminta bukti, verifikasi biaya, menandai settled
  - Dashboard: finance queue, pending verifications
- Kepala Bidang / Kepala UPTD
  - Review strategis & approve rencana; assign upline tasks
  - Dashboard: ringkasan kinerja bidang, tasks escalated
- Kepala Dinas
  - Penerima final jika Sekretaris forward; tak perlu implementasi detail di awal

4. UI / Dashboard per peran (rekomendasi kelihatan dan fungsi)

- Sekretaris Dashboard (utama)
  - Widget: Today inbox (tasks assigned to Sekretariat), Approval queue (submitted tasks awaiting Secretary review), Overdue tasks (all units), KPI tiles (compliance rate, avg time to verify), Recent audit_log events (filterable)
  - Actions: Create Task, Assign Task, Review Task (with timeline), Generate report (PDF)
- Kasubag Dashboard
  - Inbox: Assigned tasks
  - Team view: tasks by pelaksana (kanban / list)
  - Quick actions: Assign to pelaksana, Request Clarification, Mark Accepted
  - Forms: SPJ/Perjalanan/Kepegawaian aligned to field definitions
- Pejabat Fungsional Dashboard
  - Verify queue with evidence viewer (files, photos)
  - Approve/Reject with technical note, set severity
- Pelaksana Dashboard
  - My tasks: checklist per task, upload evidence, time tracking (start/stop)
  - Submit button -> creates task_logs + triggers notification
- Bendahara Dashboard
  - Finance tasks: request documents, validate amounts vs RAB, mark settled
- Bidang / UPTD Dashboard
  - Aggregated view: tasks for the entire bidang/uptd, status, alerts for samples or lab tests

5. Notifications & SLA / escalation

- Notifications:
  - on assignment -> notify assignee in_app + email (optional WA)
  - on submission -> notify verifier (JF)
  - on verification result -> notify pelaksana & kasubag
  - on secretary approval -> notify relevant Kepala Dinas (if forwarded)
- SLA:
  - tasks.sla_seconds populated from rule or priority; scheduled job checks overdue tasks and escalates (e.g., after 48h to Kepala Bidang and Sekretaris)
  - show overdue count on dashboards and send daily digest emails to Sekretaris & Kepala Bidang
- Escalation:
  - configurable via workflow_rules (who to escalate to and after what delay)

6. Verifikasi & auditability (how to prove)

- All transitions create task_logs + write snapshot to audit_log table (existing) with:
  - modul = 'tasks' or actual module name
  - entitas_id = task.id
  - aksi = transition name
  - data_lama/data_baru snapshots
  - pegawai_id = actor
  - created_at timestamp
- File evidence stored in task_files; hash saved in metadata for integrity
- Approval records captured in approvals table + linked to audit_log

7. API endpoints (summary)

- POST /api/tasks -> create task (body: title,...)
- GET /api/tasks?assigned_to=me&status=open -> list
- GET /api/tasks/:id -> detail + timeline + files
- POST /api/tasks/:id/assign -> assign to user/role
- POST /api/tasks/:id/accept -> assignee accepts
- POST /api/tasks/:id/submit -> pelaksana submit result + files
- POST /api/tasks/:id/verify -> JF verify (approve/reject)
- POST /api/tasks/:id/review -> Secretary review (approve/forward/back)
- POST /api/tasks/:id/escalate -> manual escalate
- GET /api/dashboard/sekretariat -> aggregates for Secretary
- GET /api/dashboard/kasubag -> aggregates for Kasubag
  (Each endpoint writes audit_log entry and sends notifications.)

8. UI components (frontend)

- TaskCreateModal (dynamic form builder from module fields JSON)
- TaskList (filter, search, sort, kanban)
- TaskDetail (timeline, evidence viewer, assignment panel, approval panel)
- ApprovalPanel (multi-level)
- KPI widgets (compliance rate, avg handling time, overdue count)
- Inbox widget & notification center

9. Integrasi dengan data master & existing tables

- Use existing modules/master (eg layanan, modul UI CSVs) to pre-fill module dropdowns and default assignees.
- Use users/roles table to map pegawai_id to roles (Sekretaris, Kasubag, JF, Pelaksana, Bendahara, Kepala Bidang, Kepala UPTD).
- Use audit_log (public.audit_log) for central audit; ensure all domain actions replicate there.

10. Reporting & monitoring

- Task audit report: filter by date, module, status, pegawai, who did what
- SLA report: average TAT, % overdue
- Compliance dashboard: % tasks approved by Secretary within SLA
- Exports: CSV/PDF per period

11. Example SQL (skeleton migrations)

```sql
-- tasks
CREATE TABLE tasks (
  id serial PRIMARY KEY,
  title varchar(255) NOT NULL,
  description text,
  module varchar(100),
  source_unit varchar(100),
  priority smallint DEFAULT 3,
  due_date date,
  sla_seconds integer,
  status varchar(50) DEFAULT 'draft',
  metadata json,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- task_assignments
CREATE TABLE task_assignments (
  id serial PRIMARY KEY,
  task_id int REFERENCES tasks(id) ON DELETE CASCADE,
  assignee_pegawai_id text NOT NULL,
  role varchar(50),
  assigned_by text,
  assigned_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  rejected_at timestamptz
);

-- task_logs
CREATE TABLE task_logs (
  id serial PRIMARY KEY,
  task_id int REFERENCES tasks(id) ON DELETE CASCADE,
  actor_pegawai_id text NOT NULL,
  action varchar(50) NOT NULL,
  payload json,
  created_at timestamptz DEFAULT now()
);

-- approvals
CREATE TABLE approvals (
  id serial PRIMARY KEY,
  task_id int REFERENCES tasks(id) ON DELETE CASCADE,
  level integer,
  approver_pegawai_id text,
  action varchar(20),
  note text,
  action_at timestamptz
);
```
