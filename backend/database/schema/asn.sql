-- =====================================================
-- TABLE: asn
-- MODULE: M001 (Data ASN)
-- Generated: 2026-02-18T00:00:00.000Z
-- =====================================================

CREATE TABLE IF NOT EXISTS asn (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nip VARCHAR(18) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  jenis_kelamin VARCHAR(1) CHECK(jenis_kelamin IN ('L', 'P')),
  agama VARCHAR(20),
  pangkat VARCHAR(50),
  golongan VARCHAR(10),
  tmt_pangkat DATE,
  jabatan VARCHAR(255),
  unit_kerja VARCHAR(255),
  eselon VARCHAR(10),
  tanggal_kgb_terakhir DATE,
  tanggal_kgb_berikutnya DATE,
  tanggal_kenaikan_pangkat_terakhir DATE,
  tanggal_kenaikan_pangkat_berikutnya DATE,
  tanggal_penghargaan_10_tahun DATE,
  tanggal_penghargaan_20_tahun DATE,
  tanggal_penghargaan_30_tahun DATE,
  tmt_cpns DATE,
  tmt_pns DATE,
  masa_kerja_tahun INTEGER,
  masa_kerja_bulan INTEGER,
  pendidikan_terakhir VARCHAR(50),
  jurusan VARCHAR(100),
  no_hp VARCHAR(20),
  email VARCHAR(100),
  alamat TEXT,
  status VARCHAR(20) CHECK(status IN ('aktif', 'pensiun', 'mutasi', 'meninggal')) DEFAULT 'aktif',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_asn_nip ON asn(nip);
CREATE INDEX IF NOT EXISTS idx_asn_nama ON asn(nama);
CREATE INDEX IF NOT EXISTS idx_asn_status ON asn(status);
CREATE INDEX IF NOT EXISTS idx_asn_unit_kerja ON asn(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_asn_kgb_next ON asn(tanggal_kgb_berikutnya);
CREATE INDEX IF NOT EXISTS idx_asn_pangkat_next ON asn(tanggal_kenaikan_pangkat_berikutnya);
