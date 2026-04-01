-- Prompt 17–19: Bidang Konsumsi & Keamanan Pangan (M056–M067 minimal)
-- SQLite-friendly schema (pakai TEXT untuk enum/JSON)

CREATE TABLE IF NOT EXISTS konsumsi_pangan (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  periode_tahun           INTEGER NOT NULL,
  kabupaten_kota          TEXT NOT NULL,
  kelompok_pangan         TEXT NOT NULL,
  konsumsi_gram_per_kapita NUMERIC,
  sumber_data             TEXT NOT NULL DEFAULT 'bps_susenas',
  diinput_oleh            INTEGER NOT NULL,
  diverifikasi_oleh       INTEGER,
  catatan_revisi          TEXT,
  status                  TEXT NOT NULL DEFAULT 'draft',
  created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_konsumsi_pangan_unique
  ON konsumsi_pangan (periode_tahun, kabupaten_kota, kelompok_pangan);

CREATE TABLE IF NOT EXISTS pph (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  periode_tahun INTEGER NOT NULL,
  kabupaten_kota TEXT NOT NULL,
  skor_pph       NUMERIC,
  skor_energi    NUMERIC,
  skor_protein   NUMERIC,
  analisa        TEXT,
  rekomendasi    TEXT,
  dibuat_oleh    INTEGER NOT NULL,
  disetujui_oleh INTEGER,
  status         TEXT NOT NULL DEFAULT 'draft',
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pph_periode_kab
  ON pph (periode_tahun, kabupaten_kota);

CREATE TABLE IF NOT EXISTS sppg_penerima (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  kabupaten_kota TEXT NOT NULL,
  kecamatan      TEXT,
  nama_satuan    TEXT NOT NULL,
  jenis_satuan   TEXT NOT NULL DEFAULT 'sekolah',
  jumlah_penerima INTEGER NOT NULL,
  koordinat_lat  NUMERIC,
  koordinat_lng  NUMERIC,
  status_aktif   INTEGER NOT NULL DEFAULT 1,
  tanggal_daftar DATE NOT NULL,
  diinput_oleh   INTEGER NOT NULL,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sppg_penerima_kab
  ON sppg_penerima (kabupaten_kota);

CREATE TABLE IF NOT EXISTS sppg_distribusi (
  id                       INTEGER PRIMARY KEY AUTOINCREMENT,
  periode_bulan             INTEGER NOT NULL,
  periode_tahun             INTEGER NOT NULL,
  sppg_penerima_id          INTEGER NOT NULL,
  jumlah_penerima_terealisasi INTEGER,
  komoditas_distribusi      TEXT,
  tanggal_distribusi        DATE,
  status_distribusi         TEXT NOT NULL DEFAULT 'belum',
  catatan                   TEXT,
  catatan_revisi            TEXT,
  diinput_oleh              INTEGER NOT NULL,
  diverifikasi_oleh         INTEGER,
  created_at                DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at                DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sppg_distribusi_period
  ON sppg_distribusi (periode_tahun, periode_bulan, sppg_penerima_id);

CREATE TABLE IF NOT EXISTS inspeksi_keamanan (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  nomor_inspeksi      TEXT,
  tanggal_inspeksi    DATE NOT NULL,
  lokasi              TEXT NOT NULL,
  jenis_lokasi        TEXT,
  kabupaten_kota      TEXT NOT NULL,
  jenis_pangan        TEXT,
  metode_inspeksi     TEXT NOT NULL,
  temuan              TEXT,
  status_temuan       TEXT NOT NULL,
  rekomendasi         TEXT,
  tindak_lanjut       TEXT,
  foto_url            TEXT,
  laporan_url         TEXT,
  perlu_uji_lab       INTEGER NOT NULL DEFAULT 0,
  nomor_permintaan_uji TEXT,
  hasil_uji_uptd       TEXT,
  catatan_revisi       TEXT,
  status              TEXT NOT NULL DEFAULT 'draft',
  dilakukan_oleh      INTEGER NOT NULL,
  diverifikasi_oleh   INTEGER,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_inspeksi_kab_tgl
  ON inspeksi_keamanan (tanggal_inspeksi, kabupaten_kota);

CREATE TABLE IF NOT EXISTS keracunan_pangan (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  nomor_kasus           TEXT,
  tanggal_kejadian      DATETIME NOT NULL,
  lokasi                TEXT NOT NULL,
  kabupaten_kota        TEXT NOT NULL,
  jumlah_korban         INTEGER NOT NULL,
  jumlah_rawat          INTEGER NOT NULL DEFAULT 0,
  dugaan_penyebab       TEXT,
  sumber_laporan        TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'baru',
  sampel_diambil        INTEGER NOT NULL DEFAULT 0,
  tanggal_ambil_sampel  DATE,
  hasil_uji_lab          TEXT,
  intervensi            TEXT,
  koordinasi_bpom       INTEGER NOT NULL DEFAULT 0,
  laporan_url           TEXT,
  ditangani_oleh        INTEGER NOT NULL,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_keracunan_kab_tgl
  ON keracunan_pangan (tanggal_kejadian, kabupaten_kota);

CREATE TABLE IF NOT EXISTS umkm_pangan (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_umkm          TEXT NOT NULL,
  pemilik            TEXT NOT NULL,
  jenis_produk       TEXT NOT NULL,
  kabupaten_kota     TEXT NOT NULL,
  alamat             TEXT,
  no_telp            TEXT,
  status_sertifikasi TEXT NOT NULL DEFAULT 'belum',
  jenis_sertifikasi  TEXT,
  tanggal_sertifikasi DATE,
  masa_berlaku_sertifikasi DATE,
  status_binaan      TEXT NOT NULL DEFAULT 'aktif',
  diinput_oleh       INTEGER NOT NULL,
  created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_umkm_kab
  ON umkm_pangan (kabupaten_kota);

CREATE TABLE IF NOT EXISTS koordinasi_uptd (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  nomor_surat        TEXT,
  tanggal_permintaan DATE NOT NULL,
  dari_bidang        TEXT NOT NULL,
  jenis_permintaan   TEXT NOT NULL,
  deskripsi          TEXT NOT NULL,
  jenis_sampel       TEXT,
  jumlah_sampel      INTEGER,
  tanggal_pengiriman DATE,
  status             TEXT NOT NULL DEFAULT 'dikirim',
  hasil_ringkasan    TEXT,
  laporan_uptd_url   TEXT,
  tanggal_hasil      DATE,
  ref_kasus_id       INTEGER,
  ref_inspeksi_id    INTEGER,
  dibuat_oleh        INTEGER NOT NULL,
  created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_koor_uptd_tgl_bidang
  ON koordinasi_uptd (tanggal_permintaan, dari_bidang);

