# 33 — Keputusan Arsitektur Final: Dashboard, Hierarki, & Desain Sistem SIGAP-MALUT

**Versi:** 1.0  
**Tanggal:** 22 Maret 2026  
**Status:** FINAL — Terkunci Penuh (21 Poin Keputusan)  
**Acuan Regulasi:** PP 30/2019 (SKP/Kinerja ASN), PP 95/2018 (SPBE), SPIP, Pergub Maluku Utara 56/2021, PP 71/2019 (TTE), UU ITE  
**Catatan:** Dokumen ini merangkum seluruh hasil diskusi arsitektur yang telah dikonfirmasi dan tidak boleh dimodifikasi tanpa persetujuan eksplisit. Semua keputusan di sini menjadi acuan tunggal saat implementasi.

---

## BAGIAN I — PARADIGMA DESAIN SISTEM

### I.1 Prinsip Utama: Dashboard Wajib Terpisah per Jabatan

Setiap dashboard **harus mencerminkan fungsi jabatan dan posisi dalam rantai perintah**, bukan hanya atribut role atau unit kerja. Ini bukan preferensi — melainkan keharusan teknis dan regulasi:

- **PP 95/2018 (SPBE)** — sistem pemerintah wajib menerapkan kontrol akses berbasis peran
- **SPIP** — segregation of duties, setiap fungsi harus terpisah dengan akses terbatas
- **PP 30/2019** — penilaian kinerja ASN bersifat konfidensial antara penilai dan yang dinilai
- **Pergub Maluku Utara 56/2021** — SOTK mendefinisikan fungsi berbeda per jabatan

### I.2 Model "Dual-Track Access"

Seluruh data sensitif di sistem memiliki dua jalur akses yang berbeda:

| Track                                  | Akses          | Bentuk                                 | Siapa                                 |
| -------------------------------------- | -------------- | -------------------------------------- | ------------------------------------- |
| **Track 1 — Teknis/Operasional**       | Digital penuh  | Data mentah di DB, form input, history | Atasan langsung + pelaksana terkait   |
| **Track 2 — Administratif/Manajerial** | Dokumen formal | PDF laporan yang sudah diproses        | Eselon III + Kepala Dinas (read-only) |

Prinsip ini konsisten dengan **CMP-07 (Segregation of Duties)** dalam dokumen 12 (IT Governance SPBE-SPIP).

---

## BAGIAN II — STRUKTUR ORGANISASI FINAL (TERKUNCI)

```
KEPALA DINAS
│
├── SEKRETARIAT
│   ├── Sekretaris                         ← Orchestrator / HUB WAJIB
│   ├── Kasubag Umum & Kepegawaian
│   │   └── Pelaksana (n orang)            ← Data entry kepegawaian/umum
│   ├── Pejabat Fungsional (n orang)       ← Verifikasi dokumen admin, NO Pelaksana
│   └── Bendahara                          ← Verifikasi keuangan saja, NO Pelaksana
│
├── BIDANG KETERSEDIAAN PANGAN
│   ├── Kepala Bidang
│   ├── Pejabat Fungsional 1               ← Hybrid Manager: verifikasi + analisa + PUNYA Pelaksana
│   │   └── Pelaksana (n orang)
│   └── Pejabat Fungsional 2
│       └── Pelaksana (n orang)
│
├── BIDANG DISTRIBUSI PANGAN
│   ├── Kepala Bidang
│   ├── Pejabat Fungsional 1
│   │   └── Pelaksana (n orang)
│   └── Pejabat Fungsional 2
│       └── Pelaksana (n orang)
│
├── BIDANG KONSUMSI & KEAMANAN PANGAN
│   ├── Kepala Bidang
│   ├── Pejabat Fungsional 1
│   │   └── Pelaksana (n orang)
│   └── Pejabat Fungsional 2
│       └── Pelaksana (n orang)
│
└── UPTD BALAI PENGAWASAN MUTU PANGAN
    ├── Kepala UPTD
    ├── Kasubag UPTD                       ← Admin hub SEMUA staf UPTD
    │   └── Pelaksana (n orang)
    ├── Kepala Seksi 1                     ← Laporan LANGSUNG ke Kepala UPTD
    │   └── Pelaksana (n orang)
    ├── Kepala Seksi 2                     ← Laporan LANGSUNG ke Kepala UPTD
    │   └── Pelaksana (n orang)
    └── Pejabat Fungsional                 ← Analisa teknis lab, NO Pelaksana
        (Terima tugas langsung dari Kepala UPTD)
```

### I.3 Dua Jenis Pejabat Fungsional (KRITIS)

| Aspek                     | JF di Sekretariat    | JF di 3 Bidang                | JF di UPTD           |
| ------------------------- | -------------------- | ----------------------------- | -------------------- |
| Punya Pelaksana?          | ❌ Tidak             | ✅ Ya (tiap JF punya sendiri) | ❌ Tidak             |
| Bisa assign tugas?        | ❌ Tidak             | ✅ Bisa ke Pelaksana miliknya | ❌ Tidak             |
| Wewenang verifikasi       | Dokumen administrasi | Data teknis bidang            | Hasil uji lab        |
| Wewenang analisa          | Terbatas             | ✅ Penuh — ini tugas utama    | Terbatas ke lab      |
| Penilaian kinerja bawahan | ❌ Tidak ada bawahan | ✅ Menilai Pelaksana miliknya | ❌ Tidak ada bawahan |
| Laporan ke                | Sekretaris           | Kepala Bidang                 | Kepala UPTD          |

**Solusi implementasi:** Role tetap `PEJABAT_FUNGSIONAL` (satu role), tetapi dashboard adaptif berdasarkan apakah user memiliki bawahan di tabel `user_hierarchy` (`has_subordinate` dihitung dinamis).

---

## BAGIAN III — DASHBOARD ROUTES (TERKUNCI)

### III.1 Peta Lengkap 16 Dashboard

| #   | Role DB                                    | Dashboard                        | Route                     | Status                      |
| --- | ------------------------------------------ | -------------------------------- | ------------------------- | --------------------------- |
| 1   | `SUPER_ADMIN`                              | Super Admin                      | `/dashboard/superadmin`   | ✅ Ada                      |
| 2   | `KEPALA_DINAS` / `GUBERNUR`                | Kepala Dinas                     | `/dashboard`              | ✅ Ada                      |
| 3   | `SEKRETARIS`                               | Sekretaris                       | `/dashboard/sekretariat`  | ✅ Ada (perlu tambah modul) |
| 4   | `KASUBAG_UMUM_KEPEGAWAIAN`                 | Kasubag Umum & Kepeg.            | `/dashboard/kasubag`      | ❌ Belum dibangun           |
| 5   | `PEJABAT_FUNGSIONAL` (tanpa bawahan)       | JF Sekretariat                   | `/dashboard/fungsional`   | ❌ Belum dibangun           |
| 6   | `BENDAHARA`                                | Bendahara                        | `/dashboard/bendahara`    | ❌ Belum dibangun           |
| 7   | `PELAKSANA`                                | Pelaksana (lintas unit, adaptif) | `/dashboard/pelaksana`    | ❌ Belum dibangun           |
| 8   | `KEPALA_BIDANG_KETERSEDIAAN`               | Kepala Bidang Ketersediaan       | `/dashboard/ketersediaan` | ✅ Partial                  |
| 9   | `PEJABAT_FUNGSIONAL` (dengan bawahan)      | JF Bidang (adaptif)              | `/dashboard/fungsional`   | ❌ Belum dibangun           |
| 10  | `KEPALA_BIDANG_DISTRIBUSI`                 | Kepala Bidang Distribusi         | `/dashboard/distribusi`   | ✅ Partial                  |
| 11  | `KEPALA_BIDANG_KONSUMSI`                   | Kepala Bidang Konsumsi           | `/dashboard/konsumsi`     | ✅ Partial                  |
| 12  | `KEPALA_UPTD`                              | Kepala UPTD                      | `/dashboard/uptd`         | ✅ Partial                  |
| 13  | `KASUBAG_UPTD`                             | Kasubag UPTD                     | `/dashboard/kasubag-uptd` | ❌ Belum dibangun           |
| 14  | `KEPALA_SEKSI_UPTD`                        | Kepala Seksi UPTD                | `/dashboard/kasi-uptd`    | ❌ Belum dibangun           |
| 15  | `PEJABAT_FUNGSIONAL` (UPTD, tanpa bawahan) | JF UPTD                          | `/dashboard/fungsional`   | ❌ Belum dibangun           |
| 16  | `VIEWER`                                   | Publik                           | `/dashboard-publik`       | ✅ Partial                  |

**Catatan:** Dashboard `/dashboard/fungsional` dipakai oleh semua jenis JF — kontennya adaptif berdasarkan `has_subordinate`.

### III.2 Daftar Role Keys di DB (15 Role — Terkunci)

```
SUPER_ADMIN
KEPALA_DINAS
GUBERNUR
SEKRETARIS
KASUBAG_UMUM_KEPEGAWAIAN
PEJABAT_FUNGSIONAL          ← satu role, dashboard adaptif
BENDAHARA
PELAKSANA                   ← satu role, konten adaptif per unit_kerja
KEPALA_BIDANG_KETERSEDIAAN
KEPALA_BIDANG_DISTRIBUSI
KEPALA_BIDANG_KONSUMSI
KEPALA_UPTD
KASUBAG_UPTD
KEPALA_SEKSI_UPTD
VIEWER
```

---

## BAGIAN IV — RANTAI PERINTAH (CHAIN OF COMMAND)

### IV.1 Alur Wajib (Tidak Bisa Bypass)

```
PELAKSANA
  → Atasan langsung (JF Bidang / Kasubag)
  → Kepala Bidang / Kepala UPTD (Eselon III)
  → SEKRETARIS (WAJIB — tidak bisa dilewati)
  → Kepala Dinas
```

**Backend enforcement:** Middleware `chainOfCommandGuard` memblokir request yang melompati hierarki. Auto-alert ke Sekretaris jika bypass terdeteksi.

### IV.2 Skenario Workflow Perintah

```
[Kepala Dinas] → "Siapkan data kepegawaian semua ASN"
    ↓
[Sekretaris] — Notifikasi: perintah baru → [Distribusikan ke Kasubag]
    ↓
[Kasubag] — Notifikasi: tugas baru → [Assign ke Pelaksana: Ahmad]
    ↓
[Pelaksana Ahmad] — Notifikasi: tugas baru → Input data + Submit
    ↓
[Kasubag] — Notifikasi: Ahmad submit → Verifikasi → Teruskan ke Sekretaris
    ↓
[Sekretaris] — Approval Queue → Setujui → Forward ke Kepala Dinas
    ↓
[Kepala Dinas] — Notifikasi: data sudah tersedia
```

### IV.3 Aturan Alur di 3 Bidang

```
Pelaksana → JF Bidang (WAJIB, tidak bisa bypass ke Kepala Bidang)
JF Bidang → Kepala Bidang
Kepala Bidang → Sekretaris (WAJIB sebelum ke Kepala Dinas)
```

### IV.4 Aturan Alur di UPTD (Dual Track)

```
[Jalur Admin]    Pelaksana → Kasubag UPTD → Kepala UPTD
[Jalur Teknis 1] Pelaksana → Kepala Seksi 1 → Kepala UPTD
[Jalur Teknis 2] Pelaksana → Kepala Seksi 2 → Kepala UPTD
[Jalur Analisa]  JF UPTD ← (menerima tugas dari) Kepala UPTD langsung
Kepala UPTD → WAJIB ke Sekretaris sebelum ke Kepala Dinas
```

---

## BAGIAN V — PENILAIAN KINERJA / SKP

### V.1 Matriks Penilaian Kinerja (Terkunci)

| Penilai                       | Yang Dinilai                                              | Unit        | Catatan                                           |
| ----------------------------- | --------------------------------------------------------- | ----------- | ------------------------------------------------- |
| Kepala Dinas                  | Sekretaris, Kepala Bidang (×3), Kepala UPTD               | Semua       | Langsung                                          |
| Sekretaris                    | Kasubag, JF Sekretariat, Bendahara, Pelaksana Sekretariat | Sekretariat | Langsung                                          |
| Kasubag Umum & Kepeg.         | Pelaksana bawahannya SAJA                                 | Sekretariat | Structural                                        |
| **JF Bidang (×2 per bidang)** | **Pelaksana bawahannya SAJA**                             | 3 Bidang    | **CONFIDENTIAL — Kepala Bidang TIDAK BISA LIHAT** |
| Kepala Bidang                 | JF 1 dan JF 2 di bawahnya SAJA                            | Per bidang  | Langsung                                          |
| Kepala UPTD                   | Kasubag UPTD, Kasi 1, Kasi 2, JF UPTD                     | UPTD        | Langsung                                          |
| Kasubag UPTD                  | Pelaksana bawahannya saja                                 | UPTD        | Tanpa kewenangan teknis                           |
| Kepala Seksi UPTD             | Pelaksana bawahannya saja                                 | UPTD        |                                                   |
| Pelaksana                     | Diri sendiri (read-only)                                  | Semua       | Tidak bisa edit                                   |
| JF Sekretariat                | ❌ Tidak ada bawahan                                      | Sekretariat |                                                   |
| JF UPTD                       | ❌ Tidak ada bawahan                                      | UPTD        |                                                   |
| Bendahara                     | ❌ Tidak ada bawahan                                      | Sekretariat |                                                   |

### V.2 Matriks Akses Penilaian — Sistem Digital vs. Dokumen

| Aktor          | Akses DB (input/edit)                     | Akses PDF (review/TTD)                     |
| -------------- | ----------------------------------------- | ------------------------------------------ |
| JF Bidang      | ✅ Nilai Pelaksana bawahannya             | ✅ PDF draft → approve/reject              |
| Kasubag        | ✅ Nilai Pelaksana bawahannya             | ✅ PDF draft → approve/reject              |
| Kepala Bidang  | ❌ TIDAK BOLEH akses data nilai Pelaksana | ✅ PDF FINAL untuk TTD saja                |
| Kepala UPTD    | ❌ TIDAK BOLEH akses data nilai Pelaksana | ✅ PDF FINAL untuk TTD saja                |
| Sekretaris     | ✅ Nilai semua bawahan Sekretariat        | ✅ PDF FINAL untuk TTD saja                |
| Kepala Dinas   | ❌ Tidak akses nilai individual           | ✅ Statistik agregat per unit (tanpa nama) |
| Pelaksana lain | ❌ DIBLOKIR TOTAL                         | ❌ DIBLOKIR TOTAL                          |

### V.3 State Machine Workflow SKP

```
[JF input nilai] → status: "draft_input" (tidak terlihat siapapun)
    ↓ JF klik Submit
[Sistem generate PDF DRAFT]
  - Watermark: "DRAFT - BELUM RESMI"
  - Metadata: nama JF, jabatan, timestamp
  - Hash SHA-256 di-generate
  - QR Code → link ke halaman verifikasi
    ↓ Notifikasi ke Eselon III
[Eselon III buka PDF] (bukan data DB)
  ├── Reject + catatan → kembali ke JF → loop
  └── Approve → klik [Approve] di sistem
    ↓
[Sistem generate PDF FINAL]
  - Watermark "RESMI" menggantikan "DRAFT"
  - QR Code + SHA-256 hash tertanam
  - status: "approved_digital"
  - DB: approved_by, approved_at, doc_hash disimpan
    ↓ Cetak + Tanda Tangan Basah
[Tanda tangan fisik]
  - Eselon III tanda tangan + Kepala Dinas tanda tangan
    ↓ Konfirmasi di sistem
[Update DB: ttd_fisik = true, ttd_fisik_date = tanggal]
    ↓
status: "selesai_ttd_fisik"
```

### V.4 Model Digital Evidence SKP

| Field DB (`skp_penilaian`) | Nilai         | Keterangan                        |
| -------------------------- | ------------- | --------------------------------- |
| `approved_by`              | FK `users.id` | ID Eselon III yang approve        |
| `approved_at`              | TIMESTAMPTZ   | Waktu approve digital             |
| `doc_hash`                 | VARCHAR(64)   | SHA-256 hash dari isi PDF         |
| `ttd_fisik`                | BOOLEAN       | Apakah sudah ditandatangani fisik |
| `ttd_fisik_date`           | DATE          | Tanggal TTD fisik                 |

**Tidak ada upload scan fisik** — bukti digital dari hash + metadata sudah cukup untuk audit internal.

**TTE Level:**

- Level 1 (QR Code ke halaman verifikasi): ✅ Diimplementasikan sekarang
- Level 2 (SHA-256 hash tertanam): ✅ Diimplementasikan sekarang
- Level 3 (BSrE/Peruri TTE resmi): ⏳ Ditunda — implementasi jika ada anggaran di masa depan

---

## BAGIAN VI — SISTEM TUGAS (TASK MANAGEMENT)

### VI.1 Jenis Tugas

| Jenis          | Kode             | Deskripsi                                       | Approval     |
| -------------- | ---------------- | ----------------------------------------------- | ------------ |
| Satu kali      | `satu_kali`      | Tugas individual untuk satu kejadian            | Per tugas    |
| Projektual     | `projektual`     | Tugas dalam rangka proyek/kegiatan              | Per tugas    |
| Rutin harian   | `rutin_harian`   | Standing assignment — berlaku setiap hari kerja | Sekali setup |
| Rutin mingguan | `rutin_mingguan` | Standing assignment — berlaku setiap minggu     | Sekali setup |

### VI.2 Standing Assignment (Tugas Rutin Tetap)

Berbeda dari task substitusi (situasional), standing assignment adalah penugasan permanen berulang:

- Contoh: "Pelaksana X = penanggung jawab kirim rekap absensi setiap pagi"
- Tidak perlu approval setiap hari — sudah di-assign sekali, berlaku terus
- Atasan bisa override/ubah kapan saja

**Authority Matrix Standing Assignment:**

| Pembuat             | Scope                       | Keterangan                                |
| ------------------- | --------------------------- | ----------------------------------------- |
| Kasubag Sekretariat | Pelaksana bawahannya        | **Creator utama**                         |
| Kasubag UPTD        | Pelaksana bawahannya        | **Creator utama**                         |
| Sekretaris          | Semua bawahan Sekretariat   | Backup — jika Kasubag berhalangan         |
| Kepala Bidang       | JF + Pelaksana di Bidangnya | Backup — jika tidak ada Kasubag di Bidang |
| Kepala UPTD         | Semua bawahan UPTD          | Backup — jika Kasubag UPTD berhalangan    |

### VI.3 Task Substitution (Bukan Cross-Unit)

Prinsip kritis: **Yang berpindah adalah TUGAS, bukan user.**

- Cross-unit assignment = ❌ TIDAK ADA
- Task substitution dalam unit yang sama = ✅ Diperbolehkan
- Approval: **wajib dari Kepala Unit**
- Kinerja: dihitung ke `assignee_aktual` (yang benar-benar mengerjakan)

**Field tambahan di `task_assignments`:**

```sql
assignee_id_primer    -- Pelaksana yang seharusnya mengerjakan
assignee_id_aktual    -- Pelaksana yang benar-benar mengerjakan (substitusi)
adalah_substitusi     -- BOOLEAN
alasan_substitusi     -- TEXT (sakit, berhalangan, dll)
disetujui_oleh        -- FK users.id (Kepala Unit yang approve)
kinerja_dihitung_ke   -- FK users.id (assignee_aktual mendapat kredit kinerja)
```

**Alur substitusi:**

```
Kasubag/JF input absensi → Pelaksana A tidak hadir
    ↓ Sistem flag: "ada tugas aktif + tidak hadir → perlu substitusi?"
[JF/Kasubag ajukan substitusi]
  - Pilih: tugas mana yang perlu disubstitusi
  - Pilih: Pelaksana pengganti (sistem tampilkan yang tersedia)
  - Tulis: alasan substitusi
  - Submit ke Kepala Unit
    ↓
[Kepala Unit APPROVE]
  - Sistem catat semua field substitusi
  - Notifikasi ke Pelaksana pengganti: "Anda mendapat tugas substitusi"
  - Notifikasi ke Pelaksana primer: "Tugas Anda dialihkan"
    ↓
[History tersimpan permanen — dapat diaudit]
```

---

## BAGIAN VII — ABSENSI

### VII.1 Model Absensi: Self-Report + Verifikasi (Model B)

```
ASN → input Absen Online BKD (sistem wajib, tetap berjalan seperti biasa)
    +
ASN → input status di SIGAP-MALUT (hadir/sakit/ijin/cuti/dinas_luar/alpha)
                                   + keterangan + konteks operasional
                    ↓
Kasubag Sekretariat → verifikasi kesesuaian keduanya (global — SEMUA ASN Dinas)
Kasubag UPTD → verifikasi untuk staf UPTD saja (lokal)
```

**Status Absen Online BKD:** Sistem tertutup saat ini (tidak ada API). Integrasi otomatis akan ditambahkan di masa depan ketika BKD membuka akses API.

### VII.2 Struktur Tabel `absensi_harian`

```sql
absensi_harian (
  id               SERIAL PRIMARY KEY,
  pegawai_id       INTEGER NOT NULL REFERENCES users(id),
  tanggal          DATE NOT NULL,
  status           ENUM('hadir','sakit','ijin','cuti','dinas_luar','alpha') NOT NULL,
  keterangan       TEXT,
  ref_absen_online VARCHAR(100),     -- Kode referensi dari Absen Online BKD (manual)
  ref_sppd_id      INTEGER REFERENCES perjalanan_dinas(id), -- jika dinas_luar
  perlu_substitusi BOOLEAN DEFAULT false, -- auto-flag jika tidak hadir + ada tugas aktif
  verified_by      INTEGER REFERENCES users(id),
  verified_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
)
```

### VII.3 Distribusi Rekap Absensi Pagi

- Kasubag Sekretariat klik tombol **"Kirim rekap absensi ke semua Kepala Unit"** setiap pagi
- **ATAU** Kasubag mendelegasikan ke Pelaksana bawahannya sebagai **standing assignment**
- Kepala Bidang dan Kepala UPTD menerima notifikasi: daftar staf yang tidak hadir di unitnya

---

## BAGIAN VIII — KGB (KENAIKAN GAJI BERKALA)

### VIII.1 Alur KGB Lengkap per Unit

**3 Bidang (tidak ada Kasubag):**

```
Kepala Bidang → monitoring masa berlaku KGB staf (JF + Pelaksana)
             → ajukan usulan KGB ke Kasubag Sekretariat via SIGAP-MALUT
Kasubag Sekretariat → proses draft SK KGB
Sekretaris → review + approve
Kepala Dinas → tanda tangan SK KGB
```

**UPTD:**

```
Kasubag UPTD → monitoring + alert jatuh tempo → ajukan usulan ke Kasubag Sekretariat
Kasubag Sekretariat → proses draft SK KGB
(alur sama dengan Bidang)
```

**Sekretariat:**

```
Kasubag Sekretariat → monitoring + proses langsung SK KGB untuk staf Sekretariat
```

### VIII.2 KGB Alert System (Fitur Kasubag Sekretariat)

- Kasubag Sekretariat memiliki akses monitoring KGB **SEMUA ASN seluruh Dinas Pangan**
- Sistem otomatis mengirim **notifikasi ke Kepala Bidang** jika ada ASN di Bidangnya yang sudah waktunya KGB namun belum diusulkan
- Fields tambahan di tabel `kgb_tracking`:

```sql
notifikasi_terkirim_ke   -- FK users.id (Kepala Bidang yang diingatkan)
notifikasi_terkirim_at   -- TIMESTAMPTZ (kapan notifikasi terakhir dikirim)
```

---

## BAGIAN IX — KASUBAG UPTD: SCOPE ADMINISTRATIF

### IX.1 Batas Akses Kasubag UPTD

| Fungsi                                 | Akses | Catatan                                 |
| -------------------------------------- | ----- | --------------------------------------- |
| Absensi semua staf UPTD                | ✅    | Termasuk Pelaksana Kasi 1, Kasi 2, JF   |
| Monitoring KGB semua staf UPTD         | ✅    | Proposer ke Sekretariat                 |
| Surat masuk/keluar UPTD                | ✅    |                                         |
| Data kepegawaian dasar semua staf UPTD | ✅    | Tanggal lahir, pangkat, golongan, NIP   |
| Riwayat KGB semua staf UPTD            | ✅    | Untuk kalkulasi jatuh tempo             |
| Perjalanan dinas semua staf UPTD       | ✅    |                                         |
| Diklat/pelatihan staf UPTD             | ✅    |                                         |
| Data teknis hasil uji/analisa Kasi     | ❌    | Bukan kewenangannya                     |
| Memberi tugas teknis ke Pelaksana Kasi | ❌    |                                         |
| Menilai kinerja teknis Pelaksana Kasi  | ❌    |                                         |
| Proses formal SK KGB                   | ❌    | Hanya propose — SK diproses Sekretariat |

---

## BAGIAN X — TABEL DATABASE BARU (DESAIN FINAL)

### X.1 Tabel `user_hierarchy`

```sql
user_hierarchy (
  id                SERIAL PRIMARY KEY,
  bawahan_id        INTEGER NOT NULL REFERENCES users(id),
  atasan_id         INTEGER NOT NULL REFERENCES users(id),
  unit_kerja_asal   VARCHAR(100),           -- unit asal si bawahan
  unit_kerja_tugas  VARCHAR(100),           -- unit tempat bertugas (umumnya sama)
  jenis_hierarki    ENUM('permanen','sementara','koordinasi') NOT NULL,
  jenis_relasi      ENUM('struktural','fungsional','cross_unit') NOT NULL,
  adalah_primer     BOOLEAN DEFAULT true,   -- apakah ini atasan utama?
  berlaku_dari      DATE,
  berlaku_sampai    DATE,                   -- NULL = tidak ada batas waktu
  disetujui_oleh    INTEGER REFERENCES users(id),
  status            ENUM('aktif','selesai','dibatalkan') DEFAULT 'aktif',
  catatan           TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
)
```

### X.2 Tabel `task_assignments` (dengan field substitusi)

```sql
task_assignments (
  id                    SERIAL PRIMARY KEY,
  task_id               INTEGER NOT NULL REFERENCES tasks(id),
  assignee_id_primer    INTEGER REFERENCES users(id),   -- Pelaksana yang seharusnya
  assignee_id_aktual    INTEGER REFERENCES users(id),   -- Pelaksana yang benar-benar kerjakan
  adalah_substitusi     BOOLEAN DEFAULT false,
  alasan_substitusi     TEXT,
  disetujui_oleh        INTEGER REFERENCES users(id),   -- Kepala Unit yang approve substitusi
  kinerja_dihitung_ke   INTEGER REFERENCES users(id),   -- Yang mendapat kredit kinerja
  role                  VARCHAR(50),        -- role assignee dalam konteks tugas ini
  jenis_tugas           ENUM('satu_kali','rutin_harian','rutin_mingguan','projektual'),
  jadwal_rutin          VARCHAR(50),        -- "setiap_hari_kerja", "setiap_senin", dll
  berlaku_sampai        DATE,               -- NULL = standing assignment tanpa batas waktu
  assigned_by           INTEGER REFERENCES users(id),
  assigned_at           TIMESTAMPTZ DEFAULT NOW(),
  accepted_at           TIMESTAMPTZ,
  rejected_at           TIMESTAMPTZ
)
```

### X.3 Tabel `skp_penilaian` (Penilaian Kinerja SKP)

```sql
skp_penilaian (
  id               SERIAL PRIMARY KEY,
  penilai_id       INTEGER NOT NULL REFERENCES users(id),   -- JF/Kasubag/Eselon penilai
  dinilai_id       INTEGER NOT NULL REFERENCES users(id),   -- ASN yang dinilai
  periode          VARCHAR(20),    -- contoh: "2026-S1" (semester 1 2026)
  status           ENUM('draft_input','submitted_review','approved_digital',
                        'selesai_ttd_fisik','rejected') DEFAULT 'draft_input',
  nilai_skp        DECIMAL(5,2),
  nilai_perilaku   DECIMAL(5,2),
  catatan          TEXT,
  doc_hash         VARCHAR(64),    -- SHA-256 hash dari PDF
  approved_by      INTEGER REFERENCES users(id),
  approved_at      TIMESTAMPTZ,
  ttd_fisik        BOOLEAN DEFAULT false,
  ttd_fisik_date   DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
)
```

### X.4 Tabel `kgb_tracking`

```sql
kgb_tracking (
  id                       SERIAL PRIMARY KEY,
  pegawai_id               INTEGER NOT NULL REFERENCES users(id),
  tanggal_kgb_terakhir     DATE,
  tanggal_kgb_berikutnya   DATE,
  status                   ENUM('on_track','jatuh_tempo','terlambat','selesai') DEFAULT 'on_track',
  diusulkan_oleh           INTEGER REFERENCES users(id),
  diusulkan_at             TIMESTAMPTZ,
  notifikasi_terkirim_ke   INTEGER REFERENCES users(id),  -- Kepala Bidang yang diingatkan
  notifikasi_terkirim_at   TIMESTAMPTZ,
  sk_id                    INTEGER,                        -- FK ke tabel SK (jika ada)
  catatan                  TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
)
```

---

## BAGIAN XI — RINGKASAN 21 KEPUTUSAN FINAL (TERKUNCI)

| #   | Keputusan                                                                         | Status   |
| --- | --------------------------------------------------------------------------------- | -------- |
| P1  | Struktur organisasi + hierarki (5 unit, 15 jabatan)                               | ✅ Final |
| P2  | Dashboard routes (16 routes spesifik per jabatan)                                 | ✅ Final |
| P3  | Role keys di DB (15 role eksplisit)                                               | ✅ Final |
| P4  | PELAKSANA = 1 role global, konten adaptif per `unit_kerja`                        | ✅ Final |
| P5  | JF Dashboard adaptif — `has_subordinate` dari `user_hierarchy`                    | ✅ Final |
| P6  | Chain of command enforcement — bypass diblokir backend                            | ✅ Final |
| P7  | Penilaian kinerja: JF Bidang confidential dari Kepala Bidang                      | ✅ Final |
| P8  | SKP workflow state machine (4 state, digital + fisik)                             | ✅ Final |
| P9  | Digital evidence model: QR + SHA-256, tanpa upload scan                           | ✅ Final |
| P10 | Matriks penilaian kinerja lengkap (semua unit)                                    | ✅ Final |
| P11 | Task substitution dalam unit — yang berpindah TUGAS bukan user                    | ✅ Final |
| P12 | Jenis tugas: 4 tipe (`satu_kali`, `rutin_harian`, `rutin_mingguan`, `projektual`) | ✅ Final |
| P13 | Absensi Model B: self-report ASN + verifikasi Kasubag                             | ✅ Final |
| P14 | Rekap absensi pagi: manual oleh Kasubag atau standing assignment                  | ✅ Final |
| P15 | KGB: Kepala Bidang usul ke Sekretariat; Kasubag Sektretariat monitoring global    | ✅ Final |
| P16 | Kasubag UPTD = admin hub SEMUA staf UPTD (tanpa kewenangan teknis)                | ✅ Final |
| P17 | `user_hierarchy` sebagai tabel tersendiri (bukan field di `users`)                | ✅ Final |
| P18 | TTE Level 1+2 saja (QR + hash) — Level 3 BSrE/Peruri ditunda                      | ✅ Final |
| P19 | Absen Online BKD = sistem tertutup saat ini; integrasi API kelak                  | ✅ Final |
| P20 | KGB Alert System: Kasubag Sekretariat notif ke Kepala Bidang jika KGB terlewat    | ✅ Final |
| P21 | Standing assignment: creator utama Kasubag; Kepala Unit sebagai backup            | ✅ Final |

---

## BAGIAN XII — DOKUMEN LAIN YANG PERLU DIPERBARUI

Berdasarkan audit dokumenSistem, dokumen-dokumen berikut memerlukan pembaruan agar konsisten dengan arsitektur final ini:

| #   | Dokumen                                           | Temuan                                                                                            | Aksi                                                          |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | `01-profil-dan-kondisi-dinas-pangan.md`           | "Kepala Bidang menilai staf bidang" — ambigu                                                      | ✅ Diperbarui: Kepala Bidang menilai JF; JF menilai Pelaksana |
| 2   | `10-erd-model-database.md`                        | Tidak ada definisi `user_hierarchy`, `task_assignments` extended, `skp_penilaian`, `kgb_tracking` | ✅ Diperbarui: semua tabel baru ditambahkan                   |
| 3   | `26-panduan-persiapan-coding.md`                  | Role tidak lengkap di CSV; tidak ada konteks `has_subordinate` untuk JF                           | ✅ Diperbarui: role matrix + konteks unit                     |
| 4   | `32-rekomendasi-arsitektur-dashboard-per-role.md` | Matriks E hanya mencakup JF Sekretariat, belum memisahkan JF Bidang                               | ✅ Diperbarui: matriks dipisahkan                             |
| 5   | `09-matriks-role-akses-modul.md`                  | Role baru belum terdefinisi                                                                       | ✅ Diperbarui: tambah semua 15 role                           |
| 6   | `14-alur-kerja-sekretariat-bidang-uptd.md`        | Belum mencakup UPTD detail dan standing assignment                                                | ✅ Diperbarui                                                 |

---

## BAGIAN XIII — LANGKAH IMPLEMENTASI SETELAH DOKUMEN TERKUNCI

Urutan implementasi yang direkomendasikan:

### Fase 1 — Migrasi Database

1. Buat migration: tabel `user_hierarchy`
2. Update migration `task_assignments`: tambah field substitusi + jenis_tugas
3. Buat migration: tabel `absensi_harian`
4. Buat migration: tabel `skp_penilaian`
5. Buat migration: tabel `kgb_tracking` (update field `notifikasi_terkirim_ke/at`)

### Fase 2 — Role & Auth

6. Tambah role baru di seeder: `KASUBAG_UMUM_KEPEGAWAIAN`, `KASUBAG_UPTD`, `KEPALA_SEKSI_UPTD`
7. Update `authController.js` `roleToDashboard` untuk semua 15 role
8. Update `permissionCheck.js` untuk validasi relasi hierarki (bukan hanya role)

### Fase 3 — Dashboard Baru

9. `DashboardPelaksana.jsx` — My Tasks, Upload Bukti, Nilai Saya, Status KGB
10. `DashboardKasubag.jsx` — Team Tasks, Alert KGB, Penilaian Pelaksana, Absensi
11. `DashboardFungsional.jsx` — Verify Queue + conditional panel Tim Saya (jika `has_subordinate`)
12. `DashboardBendahara.jsx` — SPJ Masuk, Verifikasi, Realisasi Anggaran
13. `DashboardKasubagUptd.jsx` — Admin hub UPTD, absensi, KGB, surat
14. `DashboardKasiUptd.jsx` — Team Tasks Kasi, Penilaian Pelaksana, Laporan Teknis

### Fase 4 — Modul Inti

15. Modul Task Management (tasks + task_assignments + substitution)
16. Modul Absensi (self-report + verifikasi + rekap)
17. Modul SKP (workflow PDF, QR, hash, dual-layer access)
18. Modul KGB Alert System

---

_Dokumen ini adalah referensi tunggal (single source of truth) untuk semua keputusan arsitektur SIGAP-MALUT. Sebelum coding dimulai, seluruh dokumenSistem harus konsisten dengan dokumen ini._
