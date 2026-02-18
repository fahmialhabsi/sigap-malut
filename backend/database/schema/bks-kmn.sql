-- =====================================================
-- TABLE: bks_kmn
-- MODULE: BKS-KMN
-- Generated: 2026-02-17T19:24:46.508Z
-- =====================================================

CREATE TABLE IF NOT EXISTS bks_kmn (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL,
  reported_to_sekretariat BOOLEAN NOT NULL DEFAULT 0,
  reported_at TIMESTAMP,
  sekretariat_notes TEXT,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_kegiatan_keamanan VARCHAR(100) CHECK(jenis_kegiatan_keamanan IN ('Pembinaan Pangan Segar', 'Sosialisasi Pangan Aman', 'Fasilitasi PSAT', 'Koordinasi Pengawasan', 'Rekomendasi Teknis')) NOT NULL,
  tanggal_kegiatan DATE,
  lokasi VARCHAR(255),
  objek_pembinaan VARCHAR(255),
  jenis_pangan_segar TEXT,
  aspek_pembinaan TEXT,
  jumlah_pelaku_dibina INTEGER,
  hasil_pembinaan TEXT,
  tindak_lanjut_pembinaan TEXT,
  materi_sosialisasi TEXT,
  sasaran_sosialisasi VARCHAR(255),
  jumlah_peserta_sosialisasi INTEGER,
  metode_sosialisasi VARCHAR(100) CHECK(metode_sosialisasi IN ('Penyuluhan', 'Workshop', 'Seminar', 'Media Massa', 'Lainnya')),
  psat_nama_usaha VARCHAR(255),
  psat_jenis_usaha VARCHAR(100) CHECK(psat_jenis_usaha IN ('Rumah Makan', 'Katering', 'Jasa Boga', 'Kantin', 'Depot', 'Warung Makan', 'Lainnya')),
  psat_alamat VARCHAR(255),
  psat_pemilik VARCHAR(255),
  psat_status_sertifikat VARCHAR(100) CHECK(psat_status_sertifikat IN ('Belum', 'Proses', 'Sudah')),
  psat_jenis_fasilitasi TEXT,
  psat_kendala TEXT,
  psat_solusi TEXT,
  instansi_koordinasi_pengawasan TEXT,
  topik_koordinasi TEXT,
  hasil_koordinasi TEXT,
  tindak_lanjut_koordinasi TEXT,
  tanggal_rapat DATE,
  pemohon_rekomendasi VARCHAR(255),
  instansi_pemohon VARCHAR(255),
  permasalahan TEXT,
  analisis_teknis TEXT,
  rekomendasi_teknis TEXT,
  dasar_rekomendasi TEXT,
  status_rekomendasi VARCHAR(100) CHECK(status_rekomendasi IN ('Diproses', 'Diterbitkan', 'Ditolak')),
  nomor_rekomendasi VARCHAR(100),
  tanggal_rekomendasi DATE,
  file_surat_rekomendasi VARCHAR(255),
  file_dokumentasi JSON,
  file_laporan VARCHAR(255),
  rincian_layanan TEXT,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kepala Bidang Konsumsi',
  pelaksana VARCHAR(255) NOT NULL,
  kelompok_penerima VARCHAR(255),
  jenis_data VARCHAR(255),
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Sensitif',
  status VARCHAR(100) CHECK(status IN ('draft', 'proses', 'selesai')) NOT NULL DEFAULT 'draft',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bks_kmn_unit_kerja ON bks_kmn(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_bks_kmn_layanan_id ON bks_kmn(layanan_id);
CREATE INDEX IF NOT EXISTS idx_bks_kmn_status ON bks_kmn(status);
CREATE INDEX IF NOT EXISTS idx_bks_kmn_created_at ON bks_kmn(created_at);

