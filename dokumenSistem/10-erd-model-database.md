# 08-ERD-Logical-Model

> **VERSI:** 2.0 — Diperbarui 22 Maret 2026 berdasarkan keputusan arsitektur final (dokumen 33)

## Tabel yang Sudah Ada (Existing)

- `layanan` (PK: id_layanan)
- `users` (PK: id_user, FK: bidang, FK: role) — field tambahan: `unit_kerja`, `jabatan`, `nip`, `pangkat`, `golongan`
- `approval_log` (PK: id, FK: layanan_id, FK: reviewer_id)
- `bidang` (PK: id_bidang)
- `role` (PK: id_role)

Relasi existing:

- `layanan.bidang_penanggung_jawab` → `bidang.id_bidang`
- `users.role` → `role.id_role`
- `approval_log.layanan_id` → `layanan.id_layanan`
- `approval_log.reviewer_id` → `users.id_user`

---

## Tabel Baru — Hierarki & Tugas

### `user_hierarchy` ← **BARU**

Mendefinisikan relasi atasan-bawahan secara eksplisit. Wajib ada sebelum modul penilaian kinerja, task assignment, dan rantai perintah bisa berjalan.

```sql
user_hierarchy (
  id                SERIAL PRIMARY KEY,
  bawahan_id        INTEGER NOT NULL REFERENCES users(id),
  atasan_id         INTEGER NOT NULL REFERENCES users(id),
  unit_kerja_asal   VARCHAR(100),
  unit_kerja_tugas  VARCHAR(100),
  jenis_hierarki    VARCHAR(20) CHECK (jenis_hierarki IN ('permanen','sementara','koordinasi')),
  jenis_relasi      VARCHAR(20) CHECK (jenis_relasi IN ('struktural','fungsional','cross_unit')),
  adalah_primer     BOOLEAN DEFAULT true,
  berlaku_dari      DATE,
  berlaku_sampai    DATE,
  disetujui_oleh    INTEGER REFERENCES users(id),
  status            VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif','selesai','dibatalkan')),
  catatan           TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
)
```

Relasi:

- `user_hierarchy.bawahan_id` → `users.id`
- `user_hierarchy.atasan_id` → `users.id`
- `user_hierarchy.disetujui_oleh` → `users.id`

### `tasks` ← Existing (dari dokumen 14), diperluas

```sql
tasks (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(500) NOT NULL,
  description   TEXT,
  module        VARCHAR(100),
  source_unit   VARCHAR(100),
  priority      VARCHAR(20) DEFAULT 'normal',
  due_date      TIMESTAMPTZ,
  sla_seconds   INTEGER,
  status        VARCHAR(50),
  metadata      JSONB,
  created_by    INTEGER REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
)
```

### `task_assignments` ← Diperluas dengan field substitusi

```sql
task_assignments (
  id                    SERIAL PRIMARY KEY,
  task_id               INTEGER NOT NULL REFERENCES tasks(id),
  assignee_id_primer    INTEGER REFERENCES users(id),  -- Pelaksana yang seharusnya
  assignee_id_aktual    INTEGER REFERENCES users(id),  -- Pelaksana yang benar-benar kerjakan
  adalah_substitusi     BOOLEAN DEFAULT false,
  alasan_substitusi     TEXT,
  disetujui_oleh        INTEGER REFERENCES users(id),  -- Kepala Unit yang approve substitusi
  kinerja_dihitung_ke   INTEGER REFERENCES users(id),  -- Yang mendapat kredit kinerja
  role                  VARCHAR(50),
  jenis_tugas           VARCHAR(30) CHECK (jenis_tugas IN
                          ('satu_kali','rutin_harian','rutin_mingguan','projektual')),
  jadwal_rutin          VARCHAR(50),         -- cth: 'setiap_hari_kerja', 'setiap_senin'
  berlaku_sampai        DATE,                -- NULL = standing assignment tanpa batas waktu
  assigned_by           INTEGER REFERENCES users(id),
  assigned_at           TIMESTAMPTZ DEFAULT NOW(),
  accepted_at           TIMESTAMPTZ,
  rejected_at           TIMESTAMPTZ
)
```

---

## Tabel Baru — Penilaian Kinerja

### `skp_penilaian` ← **BARU**

Menyimpan data penilaian SKP dengan dual-layer access control.

```sql
skp_penilaian (
  id               SERIAL PRIMARY KEY,
  penilai_id       INTEGER NOT NULL REFERENCES users(id),
  dinilai_id       INTEGER NOT NULL REFERENCES users(id),
  periode          VARCHAR(20),   -- cth: '2026-S1'
  status           VARCHAR(30) DEFAULT 'draft_input'
                     CHECK (status IN (
                       'draft_input','submitted_review','approved_digital',
                       'selesai_ttd_fisik','rejected'
                     )),
  nilai_skp        DECIMAL(5,2),
  nilai_perilaku   DECIMAL(5,2),
  catatan          TEXT,
  doc_hash         VARCHAR(64),   -- SHA-256 hash dari PDF
  approved_by      INTEGER REFERENCES users(id),
  approved_at      TIMESTAMPTZ,
  ttd_fisik        BOOLEAN DEFAULT false,
  ttd_fisik_date   DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
)
```

Aturan akses (divalidasi di middleware):

- `penilai_id` harus terdaftar sebagai `atasan_id` dari `dinilai_id` di tabel `user_hierarchy`
- Kepala Bidang tidak bisa mengakses record ini untuk Pelaksana di bidangnya (hanya JF-nya)
- Kepala Dinas hanya melihat agregat statistik, tidak bisa akses records individual ini

---

## Tabel Baru — Absensi

### `absensi_harian` ← **BARU**

```sql
absensi_harian (
  id               SERIAL PRIMARY KEY,
  pegawai_id       INTEGER NOT NULL REFERENCES users(id),
  tanggal          DATE NOT NULL,
  status           VARCHAR(20) CHECK (status IN
                     ('hadir','sakit','ijin','cuti','dinas_luar','alpha')),
  keterangan       TEXT,
  ref_absen_online VARCHAR(100),  -- kode referensi dari Absen Online BKD (manual)
  ref_sppd_id      INTEGER,       -- FK ke tabel perjalanan_dinas jika status = dinas_luar
  perlu_substitusi BOOLEAN DEFAULT false, -- auto-set jika tidak hadir + ada tugas aktif
  verified_by      INTEGER REFERENCES users(id),
  verified_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (pegawai_id, tanggal)
)
```

---

## Tabel Baru — KGB Tracking

### `kgb_tracking` ← Diperbarui

```sql
kgb_tracking (
  id                       SERIAL PRIMARY KEY,
  pegawai_id               INTEGER NOT NULL REFERENCES users(id),
  tanggal_kgb_terakhir     DATE,
  tanggal_kgb_berikutnya   DATE,
  status                   VARCHAR(20) DEFAULT 'on_track'
                             CHECK (status IN ('on_track','jatuh_tempo','terlambat','selesai')),
  diusulkan_oleh           INTEGER REFERENCES users(id),
  diusulkan_at             TIMESTAMPTZ,
  notifikasi_terkirim_ke   INTEGER REFERENCES users(id), -- Kepala Unit yang diingatkan
  notifikasi_terkirim_at   TIMESTAMPTZ,
  sk_nomor                 VARCHAR(100),
  catatan                  TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
)
```

---

## Diagram Relasi Ringkas (Tabel Kunci)

```
users
  ├── user_hierarchy.bawahan_id  → users.id
  ├── user_hierarchy.atasan_id   → users.id
  ├── task_assignments.assignee_id_primer  → users.id
  ├── task_assignments.assignee_id_aktual  → users.id
  ├── task_assignments.kinerja_dihitung_ke → users.id
  ├── skp_penilaian.penilai_id   → users.id
  ├── skp_penilaian.dinilai_id   → users.id
  ├── absensi_harian.pegawai_id  → users.id
  └── kgb_tracking.pegawai_id   → users.id

tasks
  └── task_assignments.task_id  → tasks.id
```

---

## Catatan Penting untuk Implementasi

1. **`user_hierarchy` harus diisi sebelum modul penilaian kinerja diaktifkan** — semua validasi atasan-bawahan bergantung pada tabel ini, bukan field `unit_kerja` saja.
2. **Validasi `penilai_id`** di `skp_penilaian` harus dilakukan di middleware: cek apakah `penilai_id` adalah `atasan_id` dari `dinilai_id` di `user_hierarchy` dengan `status = 'aktif'`.
3. **`absensi_harian.perlu_substitusi`** di-set otomatis oleh trigger atau service saat insert: jika `status != 'hadir'` DAN ada record aktif di `task_assignments` untuk `pegawai_id` tersebut pada tanggal yang sama.
4. **`kgb_tracking.notifikasi_terkirim_ke`** di-update oleh Kasubag Sekretariat saat mengirim notifikasi ke Kepala Bidang — ini menjadi bukti bahwa notifikasi sudah dikirimkan.
