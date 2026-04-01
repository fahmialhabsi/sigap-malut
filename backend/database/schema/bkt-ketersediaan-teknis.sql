-- Bidang Ketersediaan & Kerawanan Pangan (Prompt 11)
-- M033–M036 + EWS

CREATE TABLE IF NOT EXISTS produksi_pangan (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  periode_bulan     INTEGER NOT NULL,
  periode_tahun     INTEGER NOT NULL,
  kabupaten_kota    TEXT NOT NULL,
  komoditas_id      INTEGER NOT NULL,
  volume_produksi   NUMERIC NOT NULL,
  satuan            TEXT NOT NULL DEFAULT 'ton',
  sumber_data       TEXT NOT NULL, -- survei_lapangan|dinas_pertanian|bps|estimasi
  catatan           TEXT,
  catatan_revisi    TEXT,
  diinput_oleh      INTEGER NOT NULL,
  diverifikasi_oleh INTEGER,
  status            TEXT NOT NULL DEFAULT 'draft', -- draft|terverifikasi|disetujui
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_produksi_pangan_periode_wilayah_komoditas
  ON produksi_pangan (periode_tahun, periode_bulan, kabupaten_kota, komoditas_id);

CREATE TABLE IF NOT EXISTS stok_pangan (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  tanggal_update DATE NOT NULL,
  lokasi_gudang  TEXT NOT NULL,
  kabupaten_kota TEXT NOT NULL,
  komoditas_id   INTEGER NOT NULL,
  volume_stok    NUMERIC NOT NULL,
  satuan         TEXT NOT NULL DEFAULT 'ton',
  estimasi_hari  INTEGER,
  status_stok    TEXT NOT NULL DEFAULT 'aman', -- aman|waspada|kritis
  diinput_oleh   INTEGER NOT NULL,
  catatan_revisi TEXT,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stok_pangan_tanggal_wilayah_komoditas
  ON stok_pangan (tanggal_update, kabupaten_kota, komoditas_id);

CREATE TABLE IF NOT EXISTS neraca_pangan (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  periode        TEXT NOT NULL, -- 2026-Q1|2026-S1|2026
  kabupaten_kota TEXT NOT NULL,
  komoditas_id   INTEGER NOT NULL,
  produksi       NUMERIC NOT NULL DEFAULT 0,
  impor          NUMERIC NOT NULL DEFAULT 0,
  ekspor         NUMERIC NOT NULL DEFAULT 0,
  susut_tercecer NUMERIC NOT NULL DEFAULT 0,
  ketersediaan   NUMERIC,
  kebutuhan      NUMERIC,
  surplus_defisit NUMERIC,
  status         TEXT NOT NULL DEFAULT 'draft', -- draft|final
  disusun_oleh   INTEGER NOT NULL,
  disetujui_oleh INTEGER,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_neraca_pangan_periode_wilayah_komoditas
  ON neraca_pangan (periode, kabupaten_kota, komoditas_id);

CREATE TABLE IF NOT EXISTS kerawanan_pangan (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  periode           TEXT NOT NULL,
  kabupaten_kota    TEXT NOT NULL,
  kecamatan         TEXT,
  skor_kerawanan    NUMERIC,
  status_kerawanan  TEXT NOT NULL, -- aman|waspada|rawan|sangat_rawan
  aspek_stok        NUMERIC,
  aspek_akses       NUMERIC,
  aspek_pemanfaatan NUMERIC,
  aspek_stabilitas  NUMERIC,
  jumlah_penduduk_terdampak INTEGER,
  catatan           TEXT,
  catatan_revisi    TEXT,
  diinput_oleh      INTEGER NOT NULL,
  diverifikasi_oleh INTEGER,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kerawanan_pangan_periode_kabkota
  ON kerawanan_pangan (periode, kabupaten_kota);

CREATE TABLE IF NOT EXISTS ews_ketersediaan (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  tanggal_alert   DATE NOT NULL,
  jenis_indikator TEXT NOT NULL, -- stok_beras|produksi_padi|wilayah_rawan|harga_pangan|distribusi|bencana
  nilai_aktual    NUMERIC,
  threshold       NUMERIC,
  level_alert     TEXT NOT NULL, -- informasi|warning|kritis
  deskripsi       TEXT NOT NULL,
  rekomendasi     TEXT,
  status          TEXT NOT NULL DEFAULT 'aktif', -- aktif|ditangani|selesai
  dikirim_ke_kadin INTEGER NOT NULL DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ews_ketersediaan_tanggal_jenis_level
  ON ews_ketersediaan (tanggal_alert, jenis_indikator, level_alert);

-- Prompt 12: Analisa JF (catatan analisa + hasil kerja JF)
CREATE TABLE IF NOT EXISTS analisa_jf_ketersediaan (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  jf_id       INTEGER NOT NULL,
  judul       TEXT NOT NULL,
  jenis       TEXT NOT NULL, -- analisa_ketersediaan|analisa_kerawanan|neraca_pangan|laporan_bimtek|rekomendasi
  isi_analisa TEXT NOT NULL,
  periode     TEXT,
  referensi_data TEXT, -- JSON string
  dokumen_url TEXT,
  status      TEXT NOT NULL DEFAULT 'draft', -- draft|diajukan_kabid|dikembalikan|disetujui
  catatan_kabid TEXT,
  diajukan_at DATETIME,
  disetujui_at DATETIME,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analisa_jf_ketersediaan_jf_periode
  ON analisa_jf_ketersediaan (jf_id, periode);

