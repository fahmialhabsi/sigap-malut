-- =====================================================
-- TABLE: sek_keu
-- MODULE: SEK-KEU
-- Generated: 2026-02-17T19:24:46.428Z
-- =====================================================

CREATE TABLE IF NOT EXISTS sek_keu (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL DEFAULT 'Sekretariat',
  kode_unit VARCHAR(10) NOT NULL DEFAULT '00',
  layanan_id VARCHAR(10) NOT NULL,
  tahun_anggaran INTEGER NOT NULL,
  jenis_layanan_keuangan VARCHAR(100) CHECK(jenis_layanan_keuangan IN ('RKA/DPA', 'Belanja', 'Pencairan', 'SPJ', 'Laporan', 'Revisi', 'Monitoring')) NOT NULL,
  nomor_dpa VARCHAR(100),
  kode_rekening VARCHAR(50),
  nama_rekening VARCHAR(255),
  pagu_anggaran DECIMAL(15,2),
  realisasi DECIMAL(15,2) DEFAULT 0,
  sisa_anggaran DECIMAL(15,2),
  persentase_realisasi DECIMAL(5,2),
  jenis_belanja VARCHAR(100) CHECK(jenis_belanja IN ('Belanja Pegawai', 'Belanja Barang', 'Belanja Modal')),
  uraian_belanja TEXT,
  keperluan TEXT,
  penerima_uang VARCHAR(255),
  tanggal_pencairan DATE,
  jumlah_pencairan DECIMAL(15,2),
  nomor_spj VARCHAR(100),
  tanggal_spj DATE,
  status_spj VARCHAR(100) CHECK(status_spj IN ('Belum SPJ', 'SPJ Lengkap', 'SPJ Kurang', 'Diverifikasi', 'Ditolak')),
  jenis_revisi VARCHAR(100) CHECK(jenis_revisi IN ('Revisi Anggaran', 'Pergeseran', 'Tambahan')),
  alasan_revisi TEXT,
  file_dpa VARCHAR(255),
  file_spj VARCHAR(255),
  file_bukti JSON,
  file_laporan VARCHAR(255),
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Bendahara',
  pelaksana VARCHAR(255) NOT NULL,
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Sensitif',
  status VARCHAR(100) CHECK(status IN ('pending', 'proses', 'diverifikasi', 'disetujui', 'ditolak', 'selesai')) NOT NULL DEFAULT 'pending',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sek_keu_unit_kerja ON sek_keu(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_sek_keu_layanan_id ON sek_keu(layanan_id);
CREATE INDEX IF NOT EXISTS idx_sek_keu_status ON sek_keu(status);
CREATE INDEX IF NOT EXISTS idx_sek_keu_created_at ON sek_keu(created_at);

