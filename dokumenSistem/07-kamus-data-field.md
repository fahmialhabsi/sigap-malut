# 07 — Kamus Data Field SIGAP-MALUT

**Versi:** 2.2 (update 2026-04-05 — sinkron dengan model Sequelize aktual)  
**Referensi kode:** `backend/models/`  
**Catatan:** v1.x hanya mendokumentasikan 3 tabel legacy (`layanan`, `user`, `approval_log`). Dokumen ini telah diperluas untuk mencakup semua tabel domain utama sistem v2.0+.

---

## 1. Tabel `Tasks` (Sequelize model: `Task`)

**Deskripsi:** Menyimpan perintah/tugas utama dalam rantai komando digital.  
**File:** `backend/models/Task.js`  
**Tabel DB:** `Tasks`

| Field | Tipe | Null | Default | Deskripsi |
|-------|------|------|---------|-----------|
| `id` | INTEGER | NOT NULL | auto_increment | Primary key |
| `title` | VARCHAR(255) | NOT NULL | — | Judul singkat tugas |
| `description` | TEXT | NULL | — | Narasi lengkap tugas |
| `modul_id` | VARCHAR(255) | NULL | — | Kode modul domain (legacy link) |
| `layanan_id` | VARCHAR(255) | NULL | — | Referensi ke tabel layanan (legacy) |
| `created_by` | INTEGER | NOT NULL | — | FK → Users.id (Sekretaris/Kabid yang buat) |
| `module` | VARCHAR(100) | NULL | — | Kategori modul (e.g., `kepegawaian`, `anggaran`) |
| `source_unit` | VARCHAR(100) | NULL | — | Unit asal tugas (e.g., `Sekretariat`, `Bidang Distribusi`) |
| `sumber_perintah_kadin` | INTEGER | NULL | — | FK → Tasks.id (parent task dari Kepala Dinas) |
| `status` | ENUM | NOT NULL | `draft` | Lihat enum di bawah |
| `priority` | INTEGER | NOT NULL | `3` | 1=Urgent, 2=Tinggi, 3=Normal, 4=Rendah |
| `due_date` | DATE | NULL | — | Deadline pelaksanaan |
| `sla_seconds` | INTEGER | NULL | — | SLA dalam detik (untuk monitoring keterlambatan) |
| `metadata` | JSON | NULL | — | Data tambahan fleksibel (termasuk `pelaksana_submit`) |
| `execution_thread_id` | VARCHAR(36) | NULL | — | Link ke execution thread horizontal |
| `returned_by` | INTEGER | NULL | — | FK → Users.id (yang mengembalikan tugas) |
| `returned_at` | DATE | NULL | — | Timestamp pengembalian |
| `catatan_verifikasi` | TEXT | NULL | — | Catatan dari Kasubag/JF saat mengembalikan ke pelaksana |
| `revisi_ke` | INTEGER | NOT NULL | `0` | Berapa kali tugas dikembalikan untuk revisi |
| `is_sensitive` | BOOLEAN | NOT NULL | `false` | Flag kerahasiaan dokumen |
| `created_at` | TIMESTAMP | NOT NULL | `NOW()` | Waktu dibuat |
| `updated_at` | TIMESTAMP | NOT NULL | `NOW()` | Waktu terakhir diupdate |

### Status ENUM Lengkap (`Tasks.status`)

| Status | Deskripsi | Terminal? |
|--------|-----------|-----------|
| `draft` | Tugas baru dibuat, belum di-assign | Tidak |
| `assigned` | Sudah di-assign ke penerima | Tidak |
| `accepted` | Penerima sudah menerima | Tidak |
| `in_progress` | Sedang dikerjakan | Tidak |
| `submitted` | Hasil dikirim, menunggu verifikasi | Tidak |
| `returned_to_pelaksana` | Dikembalikan untuk revisi (ada catatan) | Tidak |
| `verified` | Terverifikasi Kasubag/JF | Tidak |
| `approved_by_secretary` | Disetujui Sekretaris | Tidak |
| `forwarded_to_kadin` | Diteruskan ke Kepala Dinas | Tidak |
| `closed` | Selesai/ditutup | **Ya** |
| `rejected` | Ditolak | Semi-terminal (bisa reopen) |
| `escalated` | Dieskalasi | Semi-terminal (bisa reopen) |
| `review_kabid` | *Planned* — Review oleh Kepala Bidang | Tidak (belum ada TRANSITIONS) |
| `submitted_to_kabid` | *Planned* — Dikirim ke Kabid | Tidak (belum ada TRANSITIONS) |
| `approved_kabid` | *Planned* — Disetujui Kabid | Tidak (belum ada TRANSITIONS) |
| `returned_to_jf` | *Planned* — Dikembalikan ke JF | Tidak (belum ada TRANSITIONS) |
| `submitted_to_jf` | *Planned* — Dikirim ke JF | Tidak (belum ada TRANSITIONS) |
| `verified_by_jf` | *Planned* — Terverifikasi JF | Tidak (belum ada TRANSITIONS) |

> **Catatan:** Status `review_kabid`, `submitted_to_kabid`, `approved_kabid`, `returned_to_jf`, `submitted_to_jf`, `verified_by_jf` ada di ENUM model tetapi **belum memiliki TRANSITIONS** di `taskController.js`. Status ini berstatus **Planned** dan tidak boleh dimasukkan ke sistem produksi sampai state machine-nya diimplementasikan.

### Priority — Keputusan Tipe Data

> **Keputusan resmi (v2.2):** Priority menggunakan `INTEGER` sesuai implementasi code.  
> ERD (`10-erd-model-database.md`) sebelumnya mencantumkan `VARCHAR` — ini adalah kesalahan dokumentasi.

| Nilai | Label |
|-------|-------|
| 1 | Urgent |
| 2 | Tinggi |
| 3 | Normal (default) |
| 4 | Rendah |

---

## 2. Tabel `TaskAssignments` (Sequelize model: `TaskAssignment`)

**Deskripsi:** Menyimpan siapa yang menerima penugasan dari tugas tertentu.  
**File:** `backend/models/TaskAssignment.js`  
**Tabel DB:** `TaskAssignments`

| Field | Tipe | Null | Default | Deskripsi |
|-------|------|------|---------|-----------|
| `id` | INTEGER | NOT NULL | auto_increment | Primary key |
| `task_id` | INTEGER | NOT NULL | — | FK → Tasks.id |
| `assignee_role` | VARCHAR(255) | NOT NULL | — | Role penerima saat di-assign |
| `assignee_user_id` | INTEGER | NULL | — | FK → Users.id (penerima tugas) |
| `assigned_by` | INTEGER | NOT NULL | — | FK → Users.id (yang memberi tugas) |
| `assigned_at` | TIMESTAMP | NOT NULL | `NOW()` | Waktu penugasan |
| `status` | VARCHAR(255) | NOT NULL | `assigned` | Status assignment: `assigned`, `accepted`, `in_progress`, `completed` |

> **Gap yang Terdokumentasi (Planned, belum diimplementasi):**  
> Dokumen ERD `10-erd-model-database.md` mendefinisikan field-field untuk fitur **Substitusi Tugas** dan **Standing Assignment** yang **belum ada di model saat ini**:
> - `assignee_id_primer`, `assignee_id_aktual`, `adalah_substitusi`, `alasan_substitusi`, `disetujui_oleh`, `kinerja_dihitung_ke` — untuk fitur substitusi
> - `jenis_tugas`, `jadwal_rutin`, `berlaku_sampai` — untuk standing assignments
>
> Field-field ini berstatus **PLANNED** dan harus ditambahkan via migration sebelum fitur substitusi diaktifkan.

---

## 3. Tabel `TaskLogs` (Sequelize model: `TaskLog`)

**Deskripsi:** Audit trail setiap aksi yang dilakukan pada tugas.  
**File:** `backend/models/TaskLog.js`  
**Tabel DB:** `TaskLogs`

| Field | Tipe | Null | Default | Deskripsi |
|-------|------|------|---------|-----------|
| `id` | INTEGER | NOT NULL | auto_increment | Primary key |
| `task_id` | INTEGER | NOT NULL | — | FK → Tasks.id |
| `actor_id` | INTEGER | NOT NULL | — | FK → Users.id (siapa yang melakukan aksi) |
| `action` | VARCHAR(255) | NOT NULL | — | Nama aksi (ASSIGN, ACCEPT, START, SUBMIT, VERIFY, VERIFY_REJECT, REVIEW, CLOSE, dll.) |
| `note` | TEXT | NULL | — | Catatan tambahan (misalnya alasan penolakan) |
| `data_old` | JSON | NULL | — | Snapshot task sebelum aksi |
| `data_new` | JSON | NULL | — | Snapshot task setelah aksi |
| `created_at` | TIMESTAMP | NOT NULL | `NOW()` | Waktu aksi dicatat |

---

## 4. Tabel `Notifications` (Sequelize model: `Notification`)

**Deskripsi:** Notifikasi in-app/email/WhatsApp untuk pengguna.  
**File:** `backend/models/Notification.js`  
**Tabel DB:** `Notifications`

| Field | Tipe | Null | Default | Deskripsi |
|-------|------|------|---------|-----------|
| `id` | INTEGER | NOT NULL | auto_increment | Primary key |
| `target_user_id` | INTEGER | NOT NULL | — | FK → Users.id (penerima notifikasi) |
| `task_id` | INTEGER | NULL | — | FK → Tasks.id (opsional, jika notifikasi terkait task) |
| `channel` | ENUM | NOT NULL | `in_app` | `in_app`, `email`, `wa` |
| `message` | TEXT | NOT NULL | — | Isi pesan notifikasi |
| `link` | VARCHAR(500) | NULL | — | URL deep-link ke halaman terkait |
| `seen` | BOOLEAN | NOT NULL | `false` | Apakah notifikasi sudah dibaca |
| `created_at` | TIMESTAMP | NOT NULL | `NOW()` | Waktu notifikasi dibuat |

---

## 5. Tabel `user_hierarchy` (Sequelize model: `UserHierarchy`)

**Deskripsi:** Mendefinisikan relasi atasan-bawahan antar pengguna dalam SOTK.  
**File:** `backend/models/UserHierarchy.js`  
**Tabel DB:** `user_hierarchy`

| Field | Tipe | Null | Default | Deskripsi |
|-------|------|------|---------|-----------|
| `id` | INTEGER | NOT NULL | auto_increment | Primary key |
| `atasan_id` | INTEGER | NOT NULL | — | FK → Users.id (atasan) |
| `bawahan_id` | INTEGER | NOT NULL | — | FK → Users.id (bawahan langsung) |
| `adalah_primer` | BOOLEAN | NOT NULL | `true` | Apakah ini jalur pelaporan utama (ada yang multi-level) |
| `catatan` | TEXT | NULL | — | Keterangan tambahan (misalnya: "PLT", "PPNPN") |

---

## 6. Tabel Legacy (v1.x — Tetap Aktif untuk Layanan KGB)

### 6.1 Tabel `layanan`

| Field | Tipe | Null | Deskripsi |
|-------|------|------|-----------|
| `id_layanan` | UUID | NOT NULL | Primary key |
| `kode_layanan` | VARCHAR | NOT NULL | Kode layanan |
| `nama_layanan` | VARCHAR | NOT NULL | Nama layanan |
| `bidang_penanggung_jawab` | VARCHAR | NOT NULL | FK → bidang |
| `deskripsi` | TEXT | NULL | Deskripsi layanan |
| `jenis_output` | VARCHAR | NOT NULL | Jenis output |
| `SLA` | INTEGER | NOT NULL | SLA dalam satuan (lihat satuan unit) |
| `aktif` | BOOLEAN | NOT NULL | Status aktif |
| `created_at` | TIMESTAMP | NOT NULL | — |
| `updated_at` | TIMESTAMP | NOT NULL | — |

### 6.2 Tabel `users`

> Untuk schema lengkap Users, lihat `backend/models/User.js`.

| Field | Tipe | Null | Deskripsi |
|-------|------|------|-----------|
| `id` | INTEGER | NOT NULL | Primary key |
| `nama` | VARCHAR | NOT NULL | Nama lengkap ASN |
| `email` | VARCHAR | NOT NULL | Email (unique) |
| `role` | VARCHAR | NOT NULL | Role code — lihat `55-terminology-canonical.md` untuk canonical list |
| `unit_kerja` | VARCHAR | NULL | Unit kerja (Sekretariat, Bidang X, UPTD) |
| `username` | VARCHAR | NOT NULL | Username login |
| `password_hash` | VARCHAR | NOT NULL | Bcrypt hash |
| `is_active` | BOOLEAN | NOT NULL | Status aktif |
| `created_at` | TIMESTAMP | NOT NULL | — |

### 6.3 Tabel `approval_log` (Legacy)

| Field | Tipe | Null | Deskripsi |
|-------|------|------|-----------|
| `id` | UUID | NOT NULL | Primary key |
| `layanan_id` | UUID | NOT NULL | FK → layanan |
| `reviewer_id` | UUID | NOT NULL | FK → users |
| `action` | VARCHAR | NOT NULL | Aksi yang dilakukan |
| `catatan` | TEXT | NULL | Catatan reviewer |
| `timestamp` | TIMESTAMP | NOT NULL | Waktu aksi |

---

## 7. Dokumen Terkait

- `10-erd-model-database.md` — ERD visual (sinkronkan dengan dokumen ini)
- `14-alur-kerja-sekretariat-bidang-uptd.md` — Workflow yang menggunakan tabel-tabel di atas
- `55-terminology-canonical.md` — Role codes dan label UI canonical
- `08-spesifikasi-workflow-bisnis.md` — State machine task (canonical BAGIAN A)
- `openapi.yaml` — API endpoint yang mengakses tabel-tabel ini
