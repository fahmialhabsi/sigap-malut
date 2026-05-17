/**
 * Migration: tambah field kondisi B pada tabel spj
 * - jenis_kondisi, atas_nama_pejabat_id, pptk_id
 * - konfirmasi_pejabat_at, konfirmasi_pejabat_ip, catatan_penolakan_pejabat, deadline_konfirmasi
 * - unit_kerja_asal, uraian_kegiatan, nomor_spm, tanggal_spm
 */

"use strict";

/** @param {import('sequelize').QueryInterface} qi */
async function safeAdd(qi, table, col, def) {
  const desc = await qi.describeTable(table).catch(() => null);
  if (!desc || desc[col]) return;
  await qi.addColumn(table, col, def);
}

module.exports = {
  async up(qi, Sq) {
    const T = "spj";

    await safeAdd(qi, T, "jenis_kondisi", {
      type: Sq.STRING(16),
      allowNull: false,
      defaultValue: "mandiri",
      after: "nomor_spj",
    });

    await safeAdd(qi, T, "atas_nama_pejabat_id", {
      type: Sq.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
      onDelete: "SET NULL",
      after: "jenis_kondisi",
    });

    await safeAdd(qi, T, "pptk_id", {
      type: Sq.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
      onDelete: "SET NULL",
      after: "atas_nama_pejabat_id",
    });

    await safeAdd(qi, T, "konfirmasi_pejabat_at", {
      type: Sq.DATE,
      allowNull: true,
      after: "pptk_id",
    });

    await safeAdd(qi, T, "konfirmasi_pejabat_ip", {
      type: Sq.STRING(45),
      allowNull: true,
      after: "konfirmasi_pejabat_at",
    });

    await safeAdd(qi, T, "catatan_penolakan_pejabat", {
      type: Sq.TEXT,
      allowNull: true,
      after: "konfirmasi_pejabat_ip",
    });

    await safeAdd(qi, T, "deadline_konfirmasi", {
      type: Sq.DATEONLY,
      allowNull: true,
      after: "catatan_penolakan_pejabat",
    });

    await safeAdd(qi, T, "unit_kerja_asal", {
      type: Sq.STRING(100),
      allowNull: true,
      after: "lampiran_url",
    });

    await safeAdd(qi, T, "uraian_kegiatan", {
      type: Sq.TEXT,
      allowNull: true,
      after: "keterangan",
    });

    await safeAdd(qi, T, "nomor_spm", {
      type: Sq.STRING(50),
      allowNull: true,
      after: "catatan_ppk",
    });

    await safeAdd(qi, T, "tanggal_spm", {
      type: Sq.DATEONLY,
      allowNull: true,
      after: "nomor_spm",
    });

    // Index untuk lookup kondisi B (antrian konfirmasi pejabat)
    await qi.addIndex(T, ["atas_nama_pejabat_id", "status"], {
      name: "idx_spj_atas_nama_status",
    }).catch(() => null);

    // Index untuk PPTK
    await qi.addIndex(T, ["pptk_id"], {
      name: "idx_spj_pptk_id",
    }).catch(() => null);
  },

  async down(qi) {
    const T = "spj";
    const cols = [
      "jenis_kondisi", "atas_nama_pejabat_id", "pptk_id",
      "konfirmasi_pejabat_at", "konfirmasi_pejabat_ip", "catatan_penolakan_pejabat",
      "deadline_konfirmasi", "unit_kerja_asal", "uraian_kegiatan",
      "nomor_spm", "tanggal_spm",
    ];
    for (const col of cols) {
      await qi.removeColumn(T, col).catch(() => null);
    }
  },
};
