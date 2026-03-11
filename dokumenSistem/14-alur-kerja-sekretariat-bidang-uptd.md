# 14 — Alur Kerja Sekretariat, Bidang & UPTD

## Dokumen: Panduan Alur Kerja Tugas (Task Workflow)

**Versi:** 1.0.0  
**Tanggal:** 2026-03-11  
**Status:** Aktif

---

## 1. Latar Belakang

Dokumen ini mendeskripsikan alur kerja tugas (task workflow) yang digunakan oleh unit Sekretariat, Bidang, dan UPTD dalam sistem SIGAP Malut. Alur ini mencakup pembuatan tugas, penugasan, penerimaan, pengiriman hasil, verifikasi, dan penutupan tugas beserta mekanisme audit dan SLA.

---

## 2. Status Tugas dan Transisi

```
open ──assign──► assigned ──accept──► accepted ──submit──► submitted ──verify──► verified ──review──► reviewed/closed
                                                                                                      │
                     ◄──────────────────────────── reject ──────────────────────────────────────────┘
```

| Status     | Keterangan                                              |
|------------|----------------------------------------------------------|
| `open`     | Tugas baru dibuat, belum ada penugasan                   |
| `assigned` | Tugas telah ditugaskan ke pegawai/staf tertentu          |
| `accepted` | Pegawai yang ditugaskan menerima dan mulai mengerjakan   |
| `submitted`| Pegawai mengirimkan hasil pekerjaan untuk diverifikasi   |
| `verified` | Atasan/pemeriksa memverifikasi hasil pekerjaan           |
| `reviewed` | Pimpinan meninjau dan menyetujui hasil verifikasi        |
| `closed`   | Tugas selesai dan ditutup                                |
| `rejected` | Tugas ditolak pada salah satu tahap                      |

---

## 3. API Endpoints

| Method | Path                         | Keterangan                                   |
|--------|------------------------------|----------------------------------------------|
| POST   | `/api/tasks`                 | Buat tugas baru                              |
| GET    | `/api/tasks`                 | Daftar tugas (filter: `assigned_to`, `status`)|
| GET    | `/api/tasks/:id`             | Detail tugas termasuk riwayat                |
| POST   | `/api/tasks/:id/assign`      | Tugaskan ke pegawai                          |
| POST   | `/api/tasks/:id/accept`      | Pegawai menerima tugas                       |
| POST   | `/api/tasks/:id/submit`      | Kirim hasil pekerjaan                        |
| POST   | `/api/tasks/:id/verify`      | Verifikasi hasil pekerjaan                   |
| POST   | `/api/tasks/:id/review`      | Tinjau dan setujui / tutup tugas             |
| GET    | `/api/tasks/:id/audit`       | Riwayat audit log tugas                      |
| GET    | `/api/dashboard/sekretariat` | Ringkasan dashboard sekretariat              |

Setiap endpoint yang mengubah status **wajib** menulis entri ke `audit_log` dan mengantrekan notifikasi ke `notification_queue`.

---

## 4. Audit Log

Setiap transisi status tugas wajib mencatat entri ke tabel `audit_log` dengan format:

```json
{
  "module": "tasks",
  "entity_id": "<task.id>",
  "action": "TRANSITION_<NAMA_TRANSISI>",
  "data_old": { /* snapshot sebelum perubahan */ },
  "data_new": { /* snapshot setelah perubahan */ },
  "actor_id": "<id pegawai>",
  "ip_address": "<IP requester>"
}
```

Utility: `backend/utils/auditLogger.js` → fungsi `writeAuditLog(params)`.

---

## 5. SLA (Service Level Agreement)

- Setiap tugas dapat memiliki `sla_seconds` (durasi SLA dalam detik) dan `due_at` (batas waktu absolut).
- Skrip `scripts/checkTaskSLA.js` dijalankan secara terjadwal (disarankan setiap 15 menit via cron).
- Jika tugas melewati SLA, sistem mencatat `SLA_BREACH` ke `audit_log` dan mengirim notifikasi ke pegawai yang ditugaskan.

---

## 6. Integritas Bukti (Evidence Files)

- File bukti yang dilampirkan pada tugas **wajib** disimpan dengan hash integritas (SHA-256).
- Metadata hash disimpan di kolom `tasks.metadata` (JSON).
- Record file disimpan di tabel `task_files` (migrasi belum tersedia — **TODO: tambahkan migrasi `create-task-files`**).

---

## 7. Role & Permission

> **TODO:** File `config/roles.json` belum dimasukkan ke repositori.  
> File ini harus berisi pemetaan role → permission untuk endpoint tasks.  
> Contoh struktur:
> ```json
> {
>   "sekretariat": ["tasks:create", "tasks:assign", "tasks:verify", "tasks:review"],
>   "staf": ["tasks:accept", "tasks:submit"],
>   "uptd": ["tasks:accept", "tasks:submit"]
> }
> ```
>
> **TODO:** Definisi workflow harus ditempatkan di `config/workflows/` dengan format:
> ```
> config/workflows/default_workflow.json
> config/workflows/sekretariat_workflow.json
> ```

---

## 8. Database Tables

| Tabel                   | Keterangan                                           |
|-------------------------|------------------------------------------------------|
| `tasks`                 | Data utama tugas                                     |
| `task_assignments`      | Riwayat penugasan                                    |
| `task_logs`             | Log transisi status per tugas                        |
| `approvals`             | Rekaman persetujuan bertingkat                       |
| `audit_log`             | Audit trail append-only seluruh modul                |
| `notification_queue`    | Antrian notifikasi keluar (email/push/in_app)        |
| `layanan`               | Katalog layanan yang dapat dirujuk oleh tugas        |
| `task_files`            | ⚠️ Belum ada migrasi — perlu ditambahkan             |

---

## 9. Catatan untuk Reviewer

- **Migrasi `task_files` belum ada** dalam PR ini. Reviewer perlu memastikan migrasi ini ditambahkan sebelum fitur evidence upload diaktifkan.
- `config/roles.json` dan `config/workflows/` belum ada. Perlu dibuat sebelum endpoint dapat menggunakan middleware permission guard.
- Pastikan tidak ada konflik dengan branch `origin/copilot/add-task-workflow-feature` (cek duplikasi nama migration).
- Indeks telah ditambahkan pada kolom: `tasks.assigned_to`, `tasks.status`, `tasks.layanan_id`, `tasks.sla_seconds`.

---

## 10. Frontend

| File                                              | Keterangan                            |
|---------------------------------------------------|---------------------------------------|
| `frontend/src/pages/SekretariatTasksPage.jsx`     | Halaman utama kotak masuk tugas       |
| `frontend/src/components/tasks/TaskList.jsx`      | Komponen daftar tugas                 |
| `frontend/src/components/tasks/TaskDetail.jsx`    | Komponen detail & transisi tugas      |
| `frontend/src/components/tasks/TaskCreateModal.jsx`| Modal buat tugas baru                |

Akses halaman tugas dari sidebar sekretariat: **📋 Tugas** → `/sekretariat/tugas`.
