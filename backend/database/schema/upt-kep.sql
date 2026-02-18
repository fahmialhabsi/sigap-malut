-- =====================================================
-- TABLE: upt_kep
-- MODULE: UPT-KEP
-- Generated: 2026-02-17T19:24:46.521Z
-- =====================================================

CREATE TABLE IF NOT EXISTS upt_kep (
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL DEFAULT 'UPTD',
  akses_terbatas BOOLEAN NOT NULL DEFAULT 1,
  hak_akses_uptd VARCHAR(100) CHECK(hak_akses_uptd IN ('read_only', 'read_write')) NOT NULL DEFAULT 'read_write'
);

CREATE INDEX IF NOT EXISTS idx_upt_kep_unit_kerja ON upt_kep(unit_kerja);

