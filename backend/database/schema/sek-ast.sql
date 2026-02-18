-- =====================================================
-- TABLE: sek_ast
-- MODULE: SEK-AST
-- Generated: 2026-02-17T19:24:46.409Z
-- =====================================================

CREATE TABLE IF NOT EXISTS sek_ast (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL DEFAULT 'Sekretariat',
  layanan_id VARCHAR(10) NOT NULL,
  kode_aset VARCHAR(50),
  nama_aset VARCHAR(255) NOT NULL,
  kategori_aset VARCHAR(100) CHECK(kategori_aset IN ('Tanah', 'Peralatan dan Mesin', 'Gedung dan Bangunan', 'Jalan Irigasi dan Jaringan', 'Aset Tetap Lainnya', 'Konstruksi Dalam Pengerjaan')) NOT NULL,
  merk_type VARCHAR(255),
  nomor_seri VARCHAR(100),
  tahun_perolehan INTEGER,
  cara_perolehan VARCHAR(100) CHECK(cara_perolehan IN ('Pembelian', 'Hibah', 'Donasi', 'Transfer', 'Lainnya')),
  harga_perolehan DECIMAL(15,2),
  nilai_buku DECIMAL(15,2),
  kondisi VARCHAR(100) CHECK(kondisi IN ('Baik', 'Rusak Ringan', 'Rusak Berat')) NOT NULL DEFAULT 'Baik',
  lokasi VARCHAR(255),
  ruangan VARCHAR(100),
  penanggung_jawab_aset VARCHAR(255),
  qr_code VARCHAR(255),
  tanggal_inventarisasi DATE,
  tanggal_pemeliharaan_terakhir DATE,
  tanggal_pemeliharaan_berikutnya DATE,
  biaya_pemeliharaan DECIMAL(15,2),
  jenis_pemeliharaan VARCHAR(100) CHECK(jenis_pemeliharaan IN ('Rutin', 'Berkala', 'Darurat')),
  status_aset VARCHAR(100) CHECK(status_aset IN ('Aktif', 'Tidak Digunakan', 'Rusak', 'Dalam Perbaikan', 'Akan Dihapus', 'Dihapuskan')) NOT NULL DEFAULT 'Aktif',
  alasan_penghapusan TEXT,
  tanggal_penghapusan DATE,
  nomor_sk_penghapusan VARCHAR(100),
  file_foto VARCHAR(255),
  file_bast VARCHAR(255),
  file_sk VARCHAR(255),
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kasubbag Umum',
  pelaksana VARCHAR(255) NOT NULL,
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Biasa',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sek_ast_unit_kerja ON sek_ast(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_sek_ast_layanan_id ON sek_ast(layanan_id);
CREATE INDEX IF NOT EXISTS idx_sek_ast_created_at ON sek_ast(created_at);

