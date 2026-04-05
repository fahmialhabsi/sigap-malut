# 08 — Spesifikasi Workflow Bisnis SIGAP-MALUT

> **⚠️ CATATAN VERSI:**  
> Bagian **"Workflow Layanan (Layanan KGB)"** di bawah ini adalah spesifikasi **versi lama** yang mengacu pada alur layanan KGB (`layanan` table). Spesifikasi ini **TIDAK BERLAKU** untuk workflow Perintah/Tugas (task workflow) yang merupakan alur utama sistem sejak v2.0.  
>  
> **Untuk workflow Perintah/Tugas yang berlaku saat ini, lihat:**  
> - `14-alur-kerja-sekretariat-bidang-uptd.md` — spesifikasi lengkap lifecycle task  
> - `taskController.js` (`backend/controllers/taskController.js`) — TRANSITIONS implementasi  
> - `45-pedoman-alur-kerja-struktur-organisasi-sekretariat.md` — pedoman per unit

---

## BAGIAN A — Workflow Task/Perintah (BERLAKU — v2.0+)

Ini adalah workflow utama sistem SIGAP-MALUT sejak versi 2.0. Semua tugas yang berasal dari rantai perintah Gubernur/Kepala Dinas/Sekretaris mengikuti alur ini.

### State Machine Task (Canonical)

```
draft
  └─→ assigned       (Sekretaris/Kabid assign ke Kasubag/JF/Pelaksana)
        └─→ accepted       (Penerima tugas accept)
              └─→ in_progress   (Pelaksana mulai kerjakan)
                    └─→ submitted         (Pelaksana kirim hasil — validasi: min 50 char)
                          ├─→ verified          (Kasubag/JF verifikasi OK)
                          │     ├─→ approved_by_secretary  (Sekretaris setujui)
                          │     │     └─→ forwarded_to_kadin   (Opsional: forward ke Kepala Dinas)
                          │     │           └─→ closed
                          │     └─→ closed  (Sekretaris tutup langsung)
                          └─→ returned_to_pelaksana  (Kasubag kembalikan — ada catatan revisi)
                                └─→ in_progress    (Pelaksana buka catatan, lanjut revisi)
                                      └─→ submitted  (kembali ke alur verifikasi)

Dari status apapun:
  → rejected    (Sekretaris/Kabid/Kabid)
  → escalated   (Sekretaris/Kabid/Kabid)
  → draft       (reopen dari rejected/escalated)
```

### Status Lengkap

| Status | Deskripsi | Transisi Keluar |
|--------|-----------|----------------|
| `draft` | Tugas dibuat, belum di-assign | assign, reject, escalate |
| `assigned` | Sudah di-assign ke penerima | accept, reject_assignment, assign (re-assign), reject, escalate |
| `accepted` | Penerima sudah terima | start, reject, escalate |
| `in_progress` | Sedang dikerjakan | submit, reject, escalate |
| `submitted` | Hasil dikirim, menunggu verifikasi | verify, verify_reject (→ returned_to_pelaksana), reject, escalate |
| `returned_to_pelaksana` | Dikembalikan dengan catatan revisi | start (→ in_progress), submit (shortcut), reject, escalate |
| `verified` | Terverifikasi oleh Kasubag/JF | review (→ approved_by_secretary), review_back (→ in_progress), close, reject, escalate |
| `approved_by_secretary` | Disetujui Sekretaris | forward (→ forwarded_to_kadin), close |
| `forwarded_to_kadin` | Diteruskan ke Kepala Dinas | close |
| `closed` | Selesai — terminal state | — |
| `rejected` | Ditolak — terminal state (dapat reopen) | reopen (→ draft) |
| `escalated` | Dieskalasi — terminal state (dapat reopen) | reopen (→ draft) |

### Role per Aksi

| Aksi | Role yang Diizinkan |
|------|---------------------|
| assign | sekretaris, kepala_bidang, kasubag_umum_kepegawaian |
| accept / start | pelaksana (siapapun penerima) |
| submit | pelaksana, pelaksana_sekretariat, bendahara, pejabat_fungsional |
| verify | pejabat_fungsional, kepala_bidang, kasubag_umum_kepegawaian, sekretaris |
| verify_reject | pejabat_fungsional, kepala_bidang, kasubag_umum_kepegawaian, sekretaris |
| review / review_back | sekretaris |
| forward | sekretaris |
| close | sekretaris, kepala_dinas |
| reject | sekretaris, kepala_bidang, kepala_uptd |
| escalate | sekretaris, kepala_bidang, kepala_uptd |
| reopen | sekretaris |

### Aturan Validasi Submit

- `output_ringkas` wajib minimal **50 karakter**
- `output_url` wajib untuk tugas dengan modul `kepegawaian`, `asn`, `kgb`, `absensi`
- Kedua validasi ini berlaku di semua endpoint submit (canonical dan pelaksana-specific)

---

## BAGIAN B — Workflow Layanan KGB (DEPRECATED — v1.x)

> ⚠️ **DEPRECATED.** Alur ini berlaku untuk sistem layanan KGB lama (tabel `layanan`).  
> Tidak digunakan dalam workflow Perintah/Tugas. Dipertahankan untuk referensi historis.

### Workflow Layanan (Contoh: Layanan KGB)

| Status | Role Input | Role Verifikasi | Role Finalisasi | Trigger Event |
|--------|-----------|-----------------|-----------------|---------------|
| Draft | Staf | | | Input data |
| Diajukan | Staf | Atasan | | Submit |
| Diverifikasi | Atasan | Sekretaris | | Verifikasi |
| Disetujui | Sekretaris | Kepala Dinas | | Approve |
| Selesai | Kepala Dinas | | | Finalisasi |
| Arsip | | | | Otomatis setelah selesai |

### Workflow Approval Log (Legacy)

| Status | Role | Trigger |
|--------|------|---------|
| Draft | Inputer | Input |
| Submitted | Reviewer | Submit |
| Approved | Approver | Approve |
| Rejected | Reviewer/Approver | Reject |
