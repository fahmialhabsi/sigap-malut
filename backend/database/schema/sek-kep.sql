-- =====================================================
-- TABLE: sek_kep
-- MODULE: SEK-KEP
-- Generated: 2026-02-17T19:24:46.424Z
-- =====================================================

CREATE TABLE IF NOT EXISTS sek_kep (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  layanan_id VARCHAR(10) NOT NULL,
  asn_id INTEGER NOT NULL,
  nip VARCHAR(18) NOT NULL,
  nama_asn VARCHAR(255) NOT NULL,
  jenis_layanan_kepegawaian VARCHAR(100) CHECK(jenis_layanan_kepegawaian IN ('Data Induk', 'Kenaikan Pangkat', 'Mutasi', 'Gaji Tunjangan', 'Cuti', 'Penilaian Kinerja', 'Disiplin', 'Pensiun')) NOT NULL,
  pangkat_lama VARCHAR(50),
  pangkat_baru VARCHAR(50),
  golongan_lama VARCHAR(10),
  golongan_baru VARCHAR(10),
  jabatan_lama VARCHAR(255),
  jabatan_baru VARCHAR(255),
  tmt_kenaikan DATE,
  nomor_sk VARCHAR(100),
  tanggal_sk DATE,
  jenis_cuti VARCHAR(100) CHECK(jenis_cuti IN ('Tahunan', 'Sakit', 'Besar', 'Melahirkan', 'Alasan Penting', 'Luar Tanggungan Negara')),
  tanggal_mulai_cuti DATE,
  tanggal_selesai_cuti DATE,
  lama_cuti INTEGER,
  nilai_skp DECIMAL(5,2),
  predikat_kinerja VARCHAR(100) CHECK(predikat_kinerja IN ('Sangat Baik', 'Baik', 'Cukup', 'Kurang', 'Buruk')),
  jenis_sanksi VARCHAR(100) CHECK(jenis_sanksi IN ('Ringan', 'Sedang', 'Berat')),
  uraian_sanksi TEXT,
  tanggal_pensiun DATE,
  jenis_pensiun VARCHAR(100) CHECK(jenis_pensiun IN ('BUP (Batas Usia Pensiun)', 'Atas Permintaan Sendiri', 'Alasan Lain')),
  gaji_pokok DECIMAL(15,2),
  total_tunjangan DECIMAL(15,2),
  file_sk VARCHAR(255),
  file_pendukung JSON,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kasubbag Kepegawaian',
  pelaksana VARCHAR(255) NOT NULL,
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Sensitif',
  status VARCHAR(100) CHECK(status IN ('pending', 'proses', 'disetujui', 'ditolak', 'selesai')) NOT NULL DEFAULT 'pending',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sek_kep_layanan_id ON sek_kep(layanan_id);
CREATE INDEX IF NOT EXISTS idx_sek_kep_asn_id ON sek_kep(asn_id);
CREATE INDEX IF NOT EXISTS idx_sek_kep_status ON sek_kep(status);
CREATE INDEX IF NOT EXISTS idx_sek_kep_created_at ON sek_kep(created_at);

