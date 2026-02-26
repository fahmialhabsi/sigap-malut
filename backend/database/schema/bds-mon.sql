-- =====================================================
-- TABLE: bds_mon
-- MODULE: BDS-MON
-- Generated: 2026-02-17T19:24:46.493Z
-- =====================================================

CREATE TABLE IF NOT EXISTS bds_mon (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL,
  reported_to_sekretariat BOOLEAN NOT NULL DEFAULT 0,
  reported_at TIMESTAMP,
  sekretariat_notes TEXT,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_monitoring VARCHAR(100) CHECK(jenis_monitoring IN ('Arus Distribusi', 'Stok Pasar', 'Hambatan Distribusi', 'Fasilitasi Kelancaran', 'Koordinasi Wilayah')) NOT NULL,
  periode DATE NOT NULL,
  tahun INTEGER NOT NULL,
  bulan INTEGER NOT NULL,
  komoditas_id INTEGER,
  nama_komoditas VARCHAR(255),
  wilayah_asal VARCHAR(255),
  wilayah_tujuan VARCHAR(255),
  volume_distribusi DECIMAL(15,2),
  satuan VARCHAR(20) DEFAULT 'kg',
  moda_transportasi VARCHAR(100) CHECK(moda_transportasi IN ('Darat', 'Laut', 'Udara')),
  tanggal_distribusi DATE,
  frekuensi_distribusi INTEGER,
  pasar_id INTEGER,
  nama_pasar VARCHAR(255),
  stok_pasar DECIMAL(15,2),
  stok_normal DECIMAL(15,2),
  status_stok VARCHAR(100) CHECK(status_stok IN ('Surplus', 'Aman', 'Menipis', 'Kritis')) DEFAULT 'Aman',
  jenis_hambatan VARCHAR(100) CHECK(jenis_hambatan IN ('Infrastruktur', 'Cuaca', 'Administrasi', 'Keamanan', 'Biaya', 'Lainnya')),
  lokasi_hambatan VARCHAR(255),
  deskripsi_hambatan TEXT,
  dampak_hambatan TEXT,
  tingkat_hambatan VARCHAR(100) CHECK(tingkat_hambatan IN ('Ringan', 'Sedang', 'Berat')),
  solusi_hambatan TEXT,
  status_penanganan VARCHAR(100) CHECK(status_penanganan IN ('Belum Ditangani', 'Dalam Proses', 'Selesai')),
  jenis_fasilitasi VARCHAR(100) CHECK(jenis_fasilitasi IN ('Perizinan', 'Koordinasi', 'Bantuan Logistik', 'Lainnya')),
  penerima_fasilitasi VARCHAR(255),
  tindakan_fasilitasi TEXT,
  hasil_fasilitasi TEXT,
  instansi_koordinasi TEXT,
  topik_koordinasi TEXT,
  hasil_koordinasi TEXT,
  tindak_lanjut_koordinasi TEXT,
  analisis TEXT,
  rekomendasi TEXT,
  file_data VARCHAR(255),
  file_laporan VARCHAR(255),
  file_foto JSON,
  rincian_layanan TEXT,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kepala Bidang Distribusi',
  pelaksana VARCHAR(255) NOT NULL,
  kelompok_penerima VARCHAR(255) DEFAULT 'Sekretariat/Pimpinan',
  jenis_data VARCHAR(255),
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Sensitif',
  status VARCHAR(100) CHECK(status IN ('draft', 'review', 'final')) NOT NULL DEFAULT 'draft',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bds_mon_unit_kerja ON bds_mon(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_bds_mon_layanan_id ON bds_mon(layanan_id);
CREATE INDEX IF NOT EXISTS idx_bds_mon_komoditas_id ON bds_mon(komoditas_id);
CREATE INDEX IF NOT EXISTS idx_bds_mon_pasar_id ON bds_mon(pasar_id);
CREATE INDEX IF NOT EXISTS idx_bds_mon_status ON bds_mon(status);
CREATE INDEX IF NOT EXISTS idx_bds_mon_created_at ON bds_mon(created_at);

