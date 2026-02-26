-- =====================================================
-- TABLE: bds_bmb
-- MODULE: BDS-BMB
-- Generated: 2026-02-17T19:24:46.475Z
-- =====================================================

CREATE TABLE IF NOT EXISTS bds_bmb (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL,
  reported_to_sekretariat BOOLEAN NOT NULL DEFAULT 0,
  reported_at TIMESTAMP,
  sekretariat_notes TEXT,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_bimbingan VARCHAR(100) CHECK(jenis_bimbingan IN ('Bimtek Distribusi', 'Bimtek CPPD', 'Supervisi Lapangan', 'Konsultasi Teknis', 'Fasilitasi Stakeholder')) NOT NULL,
  nama_kegiatan VARCHAR(255) NOT NULL,
  tanggal_kegiatan DATE NOT NULL,
  waktu_mulai TIME,
  waktu_selesai TIME,
  tempat VARCHAR(255),
  kabupaten VARCHAR(100),
  sasaran_peserta VARCHAR(255),
  jumlah_peserta INTEGER,
  narasumber VARCHAR(255),
  fasilitator VARCHAR(255),
  materi_bimbingan TEXT,
  metode_pelaksanaan VARCHAR(100) CHECK(metode_pelaksanaan IN ('Tatap Muka', 'Online', 'Hybrid', 'Kunjungan Lapangan')),
  area_supervisi VARCHAR(255),
  objek_supervisi VARCHAR(255),
  temuan_supervisi TEXT,
  rekomendasi_supervisi TEXT,
  topik_konsultasi VARCHAR(255),
  pemohon_konsultasi VARCHAR(255),
  instansi_pemohon VARCHAR(255),
  permasalahan_konsultasi TEXT,
  jawaban_konsultasi TEXT,
  stakeholder_difasilitasi TEXT,
  topik_fasilitasi VARCHAR(255),
  hasil_fasilitasi TEXT,
  output_kegiatan TEXT,
  outcome_kegiatan TEXT,
  evaluasi_kegiatan TEXT,
  tindak_lanjut TEXT,
  biaya_kegiatan DECIMAL(15,2),
  sumber_anggaran VARCHAR(255),
  file_materi JSON,
  file_daftar_hadir VARCHAR(255),
  file_dokumentasi JSON,
  file_laporan VARCHAR(255),
  rincian_layanan TEXT,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kepala Bidang Distribusi',
  pelaksana VARCHAR(255) NOT NULL,
  kelompok_penerima VARCHAR(255),
  jenis_data VARCHAR(255),
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Biasa',
  status VARCHAR(100) CHECK(status IN ('perencanaan', 'pelaksanaan', 'selesai')) NOT NULL DEFAULT 'perencanaan',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bds_bmb_unit_kerja ON bds_bmb(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_bds_bmb_layanan_id ON bds_bmb(layanan_id);
CREATE INDEX IF NOT EXISTS idx_bds_bmb_status ON bds_bmb(status);
CREATE INDEX IF NOT EXISTS idx_bds_bmb_created_at ON bds_bmb(created_at);

