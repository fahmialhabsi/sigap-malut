-- =====================================================
-- TABLE: sek_adm
-- MODULE: SEK-ADM
-- Generated: 2026-02-17T19:24:46.403Z
-- =====================================================

CREATE TABLE IF NOT EXISTS sek_adm (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL DEFAULT 'Sekretariat',
  layanan_id VARCHAR(10) NOT NULL,
  nomor_surat VARCHAR(100),
  jenis_naskah VARCHAR(100) CHECK(jenis_naskah IN ('Surat Masuk', 'Surat Keluar', 'SK', 'SE', 'ST', 'SU', 'ND', 'MEMO', 'BA', 'Nota Dinas', 'Laporan', 'Lainnya')),
  tanggal_surat DATE NOT NULL,
  pengirim_penerima VARCHAR(255),
  perihal TEXT NOT NULL,
  isi_ringkas TEXT,
  disposisi TEXT,
  ditujukan_kepada VARCHAR(255),
  file_surat VARCHAR(255),
  file_lampiran JSON,
  arsip_code VARCHAR(50),
  is_rahasia BOOLEAN NOT NULL DEFAULT 0,
  penanggung_jawab VARCHAR(255) NOT NULL,
  pelaksana VARCHAR(255) NOT NULL,
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Biasa',
  status VARCHAR(100) CHECK(status IN ('pending', 'proses', 'selesai', 'arsip')) NOT NULL DEFAULT 'pending',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sek_adm_unit_kerja ON sek_adm(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_sek_adm_layanan_id ON sek_adm(layanan_id);
CREATE INDEX IF NOT EXISTS idx_sek_adm_status ON sek_adm(status);
CREATE INDEX IF NOT EXISTS idx_sek_adm_created_at ON sek_adm(created_at);

