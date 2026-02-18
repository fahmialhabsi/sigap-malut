-- =====================================================
-- TABLE: sek_ren
-- MODULE: SEK-REN
-- Generated: 2026-02-17T19:24:46.449Z
-- =====================================================

CREATE TABLE IF NOT EXISTS sek_ren (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_layanan_perencanaan VARCHAR(100) CHECK(jenis_layanan_perencanaan IN ('Renstra', 'Renja', 'Fasilitasi Program', 'Sinkronisasi', 'LKJIP/LAKIP', 'Laporan Kinerja')) NOT NULL,
  tahun_perencanaan INTEGER NOT NULL,
  periode_renstra VARCHAR(20),
  visi TEXT,
  misi TEXT,
  tujuan TEXT,
  sasaran TEXT,
  strategi TEXT,
  kode_program VARCHAR(50),
  nama_program VARCHAR(255),
  kode_kegiatan VARCHAR(50),
  nama_kegiatan VARCHAR(255),
  indikator_kinerja TEXT,
  target_kinerja VARCHAR(255),
  satuan_target VARCHAR(50),
  realisasi_kinerja VARCHAR(255),
  persentase_capaian DECIMAL(5,2),
  pagu_anggaran DECIMAL(15,2),
  bidang_pelaksana VARCHAR(255),
  penanggung_jawab_kegiatan VARCHAR(255),
  waktu_pelaksanaan VARCHAR(100),
  output TEXT,
  outcome TEXT,
  kendala TEXT,
  solusi TEXT,
  rekomendasi TEXT,
  status_sinkronisasi VARCHAR(100) CHECK(status_sinkronisasi IN ('Belum', 'Proses', 'Sesuai', 'Tidak Sesuai')),
  file_renstra VARCHAR(255),
  file_renja VARCHAR(255),
  file_lakip VARCHAR(255),
  file_laporan_kinerja VARCHAR(255),
  file_pendukung JSON,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Fungsional Perencana',
  pelaksana VARCHAR(255) NOT NULL,
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Sensitif',
  status VARCHAR(100) CHECK(status IN ('draft', 'finalisasi', 'disetujui', 'final')) NOT NULL DEFAULT 'draft',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sek_ren_layanan_id ON sek_ren(layanan_id);
CREATE INDEX IF NOT EXISTS idx_sek_ren_status ON sek_ren(status);
CREATE INDEX IF NOT EXISTS idx_sek_ren_created_at ON sek_ren(created_at);

