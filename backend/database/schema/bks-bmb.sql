-- =====================================================
-- TABLE: bks_bmb
-- MODULE: BKS-BMB
-- Generated: 2026-02-17T19:24:46.498Z
-- =====================================================

CREATE TABLE IF NOT EXISTS bks_bmb (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_kegiatan VARCHAR(100) CHECK(jenis_kegiatan IN ('Bimtek Konsumsi', 'Bimtek Keamanan Pangan', 'Pelatihan Pengolahan', 'Penyuluhan', 'Konsultasi Teknis')) NOT NULL,
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
  metode_pelaksanaan VARCHAR(100) CHECK(metode_pelaksanaan IN ('Tatap Muka', 'Online', 'Hybrid', 'Praktik Langsung')),
  topik_bimtek_konsumsi VARCHAR(255),
  topik_bimtek_keamanan VARCHAR(255),
  jenis_pangan_lokal_diolah TEXT,
  teknik_pengolahan TEXT,
  produk_hasil_pelatihan TEXT,
  nilai_gizi_produk TEXT,
  potensi_ekonomi TEXT,
  topik_penyuluhan VARCHAR(255),
  lokasi_penyuluhan VARCHAR(255),
  jumlah_sasaran_penyuluhan INTEGER,
  media_penyuluhan TEXT,
  topik_konsultasi VARCHAR(255),
  pemohon_konsultasi VARCHAR(255),
  instansi_pemohon VARCHAR(255),
  permasalahan_konsultasi TEXT,
  jawaban_konsultasi TEXT,
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
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kepala Bidang Konsumsi',
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

CREATE INDEX IF NOT EXISTS idx_bks_bmb_layanan_id ON bks_bmb(layanan_id);
CREATE INDEX IF NOT EXISTS idx_bks_bmb_status ON bks_bmb(status);
CREATE INDEX IF NOT EXISTS idx_bks_bmb_created_at ON bks_bmb(created_at);

