-- =====================================================
-- TABLE: bkt_fsl
-- MODULE: BKT-FSL
-- Generated: 2026-02-17T19:24:46.459Z
-- =====================================================

CREATE TABLE IF NOT EXISTS bkt_fsl (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL,
  reported_to_sekretariat BOOLEAN NOT NULL DEFAULT 0,
  reported_at TIMESTAMP,
  sekretariat_notes TEXT,
  layanan_id VARCHAR(10) NOT NULL DEFAULT 'LY066',
  jenis_fasilitasi VARCHAR(100) CHECK(jenis_fasilitasi IN ('Intervensi Produksi', 'Intervensi Distribusi', 'Intervensi Konsumsi', 'Bantuan Pangan', 'Lainnya')) NOT NULL,
  nama_program VARCHAR(255) NOT NULL,
  periode DATE NOT NULL,
  tahun INTEGER NOT NULL,
  wilayah_sasaran VARCHAR(255),
  kelompok_sasaran VARCHAR(255),
  jumlah_penerima INTEGER,
  jenis_intervensi VARCHAR(100) CHECK(jenis_intervensi IN ('Bantuan Benih', 'Bantuan Pupuk', 'Bantuan Alat', 'Bantuan Pangan', 'Pelatihan', 'Pendampingan', 'Lainnya')),
  volume_bantuan DECIMAL(15,2),
  satuan VARCHAR(50),
  nilai_bantuan DECIMAL(15,2),
  sumber_bantuan VARCHAR(255),
  instansi_pemberi VARCHAR(255),
  tanggal_penyaluran DATE,
  lokasi_penyaluran VARCHAR(255),
  penanggung_jawab_penyaluran VARCHAR(255),
  target_output TEXT,
  target_outcome TEXT,
  realisasi TEXT,
  kendala TEXT,
  solusi TEXT,
  dampak TEXT,
  dokumentasi_kegiatan JSON,
  file_proposal VARCHAR(255),
  file_bast VARCHAR(255),
  file_laporan VARCHAR(255),
  rincian_layanan TEXT,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kepala Bidang Ketersediaan',
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

CREATE INDEX IF NOT EXISTS idx_bkt_fsl_unit_kerja ON bkt_fsl(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_bkt_fsl_layanan_id ON bkt_fsl(layanan_id);
CREATE INDEX IF NOT EXISTS idx_bkt_fsl_status ON bkt_fsl(status);
CREATE INDEX IF NOT EXISTS idx_bkt_fsl_created_at ON bkt_fsl(created_at);

