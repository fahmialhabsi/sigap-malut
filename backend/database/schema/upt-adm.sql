-- =====================================================
-- TABLE: upt_adm
-- MODULE: UPT-ADM
-- Generated: 2026-02-17T19:24:46.515Z
-- =====================================================

CREATE TABLE IF NOT EXISTS upt_adm (
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL DEFAULT 'UPTD',
  akses_terbatas BOOLEAN NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_upt_adm_unit_kerja ON upt_adm(unit_kerja);

