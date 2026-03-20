-- =====================================================
-- TABLE: upt_keu
-- MODULE: UPT-KEU
-- Generated: 2026-03-19T23:39:21.745Z
-- =====================================================

CREATE TABLE IF NOT EXISTS upt_keu (
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('"Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi"')) NOT NULL DEFAULT 'UPTD',
  kode_unit VARCHAR(10) NOT NULL DEFAULT '01',
  akses_terbatas BOOLEAN NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_upt_keu_unit_kerja ON upt_keu(unit_kerja);

