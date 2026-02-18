-- =====================================================
-- TABLE: upt_ast
-- MODULE: UPT-AST
-- Generated: 2026-02-17T19:24:46.516Z
-- =====================================================

CREATE TABLE IF NOT EXISTS upt_ast (
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL DEFAULT 'UPTD',
  lokasi_unit VARCHAR(255) DEFAULT 'UPTD Balai Pengawasan Mutu',
  kategori_aset_uptd VARCHAR(100) CHECK(kategori_aset_uptd IN ('Alat Inspeksi', 'Peralatan Lab', 'Alat Kantor', 'Kendaraan', 'Lainnya')),
  akses_terbatas BOOLEAN NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_upt_ast_unit_kerja ON upt_ast(unit_kerja);

