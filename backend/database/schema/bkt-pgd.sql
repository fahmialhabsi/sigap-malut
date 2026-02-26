-- =====================================================
-- TABLE: bkt_pgd
-- MODULE: BKT-PGD
-- Generated: 2026-02-17T19:24:46.472Z
-- =====================================================

CREATE TABLE IF NOT EXISTS bkt_pgd (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL,
  reported_to_sekretariat BOOLEAN NOT NULL DEFAULT 0,
  reported_at TIMESTAMP,
  sekretariat_notes TEXT,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_pengendalian VARCHAR(100) CHECK(jenis_pengendalian IN ('Pemantauan Produksi', 'Pemantauan Pasokan', 'Neraca Pangan', 'Early Warning', 'Sistem Informasi')) NOT NULL,
  periode DATE NOT NULL,
  tahun INTEGER NOT NULL,
  bulan INTEGER NOT NULL,
  komoditas_id INTEGER,
  nama_komoditas VARCHAR(255),
  kabupaten VARCHAR(100),
  kecamatan VARCHAR(100),
  luas_tanam DECIMAL(15,2),
  luas_panen DECIMAL(15,2),
  produktivitas DECIMAL(10,2),
  produksi_total DECIMAL(15,2),
  target_produksi DECIMAL(15,2),
  persentase_capaian DECIMAL(5,2),
  pasokan_lokal DECIMAL(15,2),
  pasokan_luar_daerah DECIMAL(15,2),
  pasokan_impor DECIMAL(15,2),
  total_pasokan DECIMAL(15,2),
  konsumsi_estimasi DECIMAL(15,2),
  stok_awal DECIMAL(15,2),
  stok_akhir DECIMAL(15,2),
  surplus_defisit DECIMAL(15,2),
  status_ketersediaan VARCHAR(100) CHECK(status_ketersediaan IN ('Surplus', 'Aman', 'Menipis', 'Defisit')) DEFAULT 'Aman',
  tingkat_kerawanan VARCHAR(100) CHECK(tingkat_kerawanan IN ('Aman', 'Waspada', 'Rawan', 'Sangat Rawan')) DEFAULT 'Aman',
  early_warning_status VARCHAR(100) CHECK(early_warning_status IN ('Normal', 'Waspada', 'Siaga', 'Darurat')) DEFAULT 'Normal',
  indikator_early_warning TEXT,
  rekomendasi_ews TEXT,
  neraca_pangan_ketersediaan DECIMAL(15,2),
  neraca_pangan_penggunaan DECIMAL(15,2),
  sumber_data VARCHAR(255),
  metode_pengumpulan VARCHAR(100) CHECK(metode_pengumpulan IN ('Survey Lapangan', 'Desk Study', 'Koordinasi Instansi', 'Lainnya')),
  validitas_data VARCHAR(100) CHECK(validitas_data IN ('Valid', 'Perlu Verifikasi', 'Tidak Valid')) DEFAULT 'Valid',
  analisis TEXT,
  kendala TEXT,
  rekomendasi TEXT,
  file_data VARCHAR(255),
  file_laporan VARCHAR(255),
  rincian_layanan TEXT,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kepala Bidang Ketersediaan',
  pelaksana VARCHAR(255) NOT NULL,
  kelompok_penerima VARCHAR(255) DEFAULT 'Sekretariat/Pimpinan',
  jenis_data VARCHAR(255),
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Sensitif',
  status VARCHAR(100) CHECK(status IN ('draft', 'review', 'final', 'publish')) NOT NULL DEFAULT 'draft',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bkt_pgd_unit_kerja ON bkt_pgd(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_bkt_pgd_layanan_id ON bkt_pgd(layanan_id);
CREATE INDEX IF NOT EXISTS idx_bkt_pgd_komoditas_id ON bkt_pgd(komoditas_id);
CREATE INDEX IF NOT EXISTS idx_bkt_pgd_status ON bkt_pgd(status);
CREATE INDEX IF NOT EXISTS idx_bkt_pgd_created_at ON bkt_pgd(created_at);

