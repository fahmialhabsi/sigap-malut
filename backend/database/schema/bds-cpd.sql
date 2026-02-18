-- =====================================================
-- TABLE: bds_cpd
-- MODULE: BDS-CPD
-- Generated: 2026-02-17T19:24:46.478Z
-- =====================================================

CREATE TABLE IF NOT EXISTS bds_cpd (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL,
  reported_to_sekretariat BOOLEAN NOT NULL DEFAULT 0,
  reported_at TIMESTAMP,
  sekretariat_notes TEXT,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_layanan_cppd VARCHAR(100) CHECK(jenis_layanan_cppd IN ('Perencanaan', 'Pengadaan', 'Pengelolaan Stok', 'Penyaluran Darurat', 'Evaluasi')) NOT NULL,
  periode DATE NOT NULL,
  tahun INTEGER NOT NULL,
  bulan INTEGER,
  komoditas_id INTEGER,
  nama_komoditas VARCHAR(255),
  kebutuhan_cppd DECIMAL(15,2),
  dasar_perhitungan TEXT,
  target_stok DECIMAL(15,2),
  lokasi_penyimpanan VARCHAR(255),
  kapasitas_gudang DECIMAL(15,2),
  rencana_pengadaan DECIMAL(15,2),
  sumber_pengadaan VARCHAR(100) CHECK(sumber_pengadaan IN ('APBD', 'APBN', 'Swadaya', 'Lainnya')),
  metode_pengadaan VARCHAR(100) CHECK(metode_pengadaan IN ('Pembelian Langsung', 'Tender', 'Penunjukan Langsung', 'Hibah')),
  penyedia VARCHAR(255),
  tanggal_pengadaan DATE,
  volume_pengadaan DECIMAL(15,2),
  harga_satuan DECIMAL(15,2),
  total_nilai DECIMAL(15,2),
  kualitas_cppd VARCHAR(100) CHECK(kualitas_cppd IN ('Sangat Baik', 'Baik', 'Cukup', 'Kurang')) DEFAULT 'Baik',
  tanggal_masuk_gudang DATE,
  stok_awal_bulan DECIMAL(15,2),
  penerimaan_bulan_ini DECIMAL(15,2),
  penyaluran_bulan_ini DECIMAL(15,2),
  stok_akhir_bulan DECIMAL(15,2),
  status_stok VARCHAR(100) CHECK(status_stok IN ('Aman', 'Menipis', 'Kritis')) DEFAULT 'Aman',
  persentase_terhadap_target DECIMAL(5,2),
  kondisi_fisik_cppd VARCHAR(100) CHECK(kondisi_fisik_cppd IN ('Baik', 'Rusak Ringan', 'Rusak Berat')) DEFAULT 'Baik',
  suhu_gudang DECIMAL(5,2),
  kelembaban_gudang DECIMAL(5,2),
  petugas_gudang VARCHAR(255),
  jenis_penyaluran VARCHAR(100) CHECK(jenis_penyaluran IN ('Darurat Bencana', 'Kerawanan Pangan', 'Stabilisasi Harga', 'Lainnya')),
  alasan_penyaluran TEXT,
  wilayah_penyaluran VARCHAR(255),
  penerima_penyaluran VARCHAR(255),
  volume_penyaluran DECIMAL(15,2),
  tanggal_penyaluran DATE,
  status_penyaluran VARCHAR(100) CHECK(status_penyaluran IN ('Perencanaan', 'Proses', 'Selesai')),
  jumlah_penerima_manfaat INTEGER,
  dampak_penyaluran TEXT,
  evaluasi_pelaksanaan TEXT,
  kendala TEXT,
  solusi TEXT,
  rekomendasi TEXT,
  file_rencana VARCHAR(255),
  file_kontrak VARCHAR(255),
  file_bast VARCHAR(255),
  file_laporan_stok VARCHAR(255),
  file_foto JSON,
  rincian_layanan TEXT,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kepala Bidang Distribusi',
  pelaksana VARCHAR(255) NOT NULL,
  kelompok_penerima VARCHAR(255),
  jenis_data VARCHAR(255),
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Sensitif',
  status VARCHAR(100) CHECK(status IN ('draft', 'review', 'final', 'approved')) NOT NULL DEFAULT 'draft',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bds_cpd_unit_kerja ON bds_cpd(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_bds_cpd_layanan_id ON bds_cpd(layanan_id);
CREATE INDEX IF NOT EXISTS idx_bds_cpd_komoditas_id ON bds_cpd(komoditas_id);
CREATE INDEX IF NOT EXISTS idx_bds_cpd_status ON bds_cpd(status);
CREATE INDEX IF NOT EXISTS idx_bds_cpd_created_at ON bds_cpd(created_at);

