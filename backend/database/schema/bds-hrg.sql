-- =====================================================
-- TABLE: bds_hrg
-- MODULE: BDS-HRG
-- Generated: 2026-02-17T19:24:46.485Z
-- =====================================================

CREATE TABLE IF NOT EXISTS bds_hrg (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL,
  reported_to_sekretariat BOOLEAN NOT NULL DEFAULT 0,
  reported_at TIMESTAMP,
  sekretariat_notes TEXT,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_layanan_harga VARCHAR(100) CHECK(jenis_layanan_harga IN ('Pemantauan Harga', 'Analisis Fluktuasi', 'Rekomendasi Stabilisasi', 'Operasi Pasar', 'Koordinasi TPID')) NOT NULL,
  periode DATE NOT NULL,
  tahun INTEGER NOT NULL,
  bulan INTEGER NOT NULL,
  komoditas_id INTEGER,
  nama_komoditas VARCHAR(255),
  pasar_id INTEGER,
  nama_pasar VARCHAR(255),
  tanggal_pantau DATE,
  harga DECIMAL(15,2),
  satuan VARCHAR(20) DEFAULT 'kg',
  harga_bulan_lalu DECIMAL(15,2),
  perubahan_harga DECIMAL(15,2),
  persentase_perubahan DECIMAL(5,2),
  tren_harga VARCHAR(100) CHECK(tren_harga IN ('Naik', 'Stabil', 'Turun')),
  tingkat_fluktuasi VARCHAR(100) CHECK(tingkat_fluktuasi IN ('Rendah', 'Sedang', 'Tinggi')),
  penyebab_fluktuasi TEXT,
  dampak_fluktuasi TEXT,
  analisis_harga TEXT,
  prediksi_harga TEXT,
  rekomendasi_stabilisasi TEXT,
  jenis_operasi_pasar VARCHAR(100) CHECK(jenis_operasi_pasar IN ('Pasar Murah', 'Subsidi', 'Bantuan Langsung', 'Lainnya')),
  tanggal_operasi_pasar DATE,
  lokasi_operasi_pasar VARCHAR(255),
  komoditas_operasi_pasar TEXT,
  harga_pasar_normal DECIMAL(15,2),
  harga_operasi_pasar DECIMAL(15,2),
  subsidi_per_unit DECIMAL(15,2),
  volume_operasi_pasar DECIMAL(15,2),
  jumlah_pembeli INTEGER,
  total_nilai_subsidi DECIMAL(15,2),
  sumber_anggaran VARCHAR(255),
  tanggal_rapat_tpid DATE,
  tempat_rapat_tpid VARCHAR(255),
  peserta_tpid TEXT,
  agenda_tpid TEXT,
  hasil_rapat_tpid TEXT,
  rekomendasi_tpid TEXT,
  tindak_lanjut_tpid TEXT,
  inflasi_pangan DECIMAL(5,2),
  target_inflasi_tpid DECIMAL(5,2) DEFAULT 2.50,
  status_inflasi VARCHAR(100) CHECK(status_inflasi IN ('On Target', 'Warning', 'Alert')),
  file_data_harga VARCHAR(255),
  file_notulensi_tpid VARCHAR(255),
  file_foto_operasi_pasar JSON,
  file_laporan VARCHAR(255),
  rincian_layanan TEXT,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kepala Bidang Distribusi',
  pelaksana VARCHAR(255) NOT NULL,
  kelompok_penerima VARCHAR(255) DEFAULT 'Sekretariat/Pimpinan/TPID',
  jenis_data VARCHAR(255),
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Sensitif',
  status VARCHAR(100) CHECK(status IN ('draft', 'review', 'final', 'publish')) NOT NULL DEFAULT 'draft',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bds_hrg_unit_kerja ON bds_hrg(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_bds_hrg_layanan_id ON bds_hrg(layanan_id);
CREATE INDEX IF NOT EXISTS idx_bds_hrg_komoditas_id ON bds_hrg(komoditas_id);
CREATE INDEX IF NOT EXISTS idx_bds_hrg_pasar_id ON bds_hrg(pasar_id);
CREATE INDEX IF NOT EXISTS idx_bds_hrg_status ON bds_hrg(status);
CREATE INDEX IF NOT EXISTS idx_bds_hrg_created_at ON bds_hrg(created_at);

