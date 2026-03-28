"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    // ── Add PPK fields to spj ────────────────────────────────────────────────
    if (tables.includes("spj")) {
      const spjCols = await queryInterface.describeTable("spj");

      if (!spjCols.submitted_to_ppk_at) {
        await queryInterface.addColumn("spj", "submitted_to_ppk_at", {
          type: Sequelize.DATE, allowNull: true,
        });
      }
      if (!spjCols.ppk_verified_at) {
        await queryInterface.addColumn("spj", "ppk_verified_at", {
          type: Sequelize.DATE, allowNull: true,
        });
      }
      if (!spjCols.ppk_user_id) {
        await queryInterface.addColumn("spj", "ppk_user_id", {
          type: Sequelize.INTEGER, allowNull: true,
        });
      }
      if (!spjCols.ppk_catatan) {
        await queryInterface.addColumn("spj", "ppk_catatan", {
          type: Sequelize.TEXT, allowNull: true,
        });
      }
      if (!spjCols.spm_nomor) {
        await queryInterface.addColumn("spj", "spm_nomor", {
          type: Sequelize.STRING(100), allowNull: true,
        });
      }
      if (!spjCols.spm_tanggal) {
        await queryInterface.addColumn("spj", "spm_tanggal", {
          type: Sequelize.DATEONLY, allowNull: true,
        });
      }
      if (!spjCols.sp2d_nomor) {
        await queryInterface.addColumn("spj", "sp2d_nomor", {
          type: Sequelize.STRING(100), allowNull: true,
        });
      }
      if (!spjCols.sp2d_tanggal) {
        await queryInterface.addColumn("spj", "sp2d_tanggal", {
          type: Sequelize.DATEONLY, allowNull: true,
        });
      }
      if (!spjCols.sp2d_nilai) {
        await queryInterface.addColumn("spj", "sp2d_nilai", {
          type: Sequelize.DECIMAL(15, 2), allowNull: true,
        });
      }
      if (!spjCols.jenis) {
        await queryInterface.addColumn("spj", "jenis", {
          type: Sequelize.STRING(50), allowNull: true, defaultValue: "umum",
          comment: "gaji | barang | laporan | umum",
        });
      }
      if (!spjCols.nomor_spp) {
        await queryInterface.addColumn("spj", "nomor_spp", {
          type: Sequelize.STRING(100), allowNull: true,
        });
      }
      if (!spjCols.nilai) {
        await queryInterface.addColumn("spj", "nilai", {
          type: Sequelize.DECIMAL(15, 2), allowNull: true,
        });
      }
      if (!spjCols.pptk_nama) {
        await queryInterface.addColumn("spj", "pptk_nama", {
          type: Sequelize.STRING(200), allowNull: true,
        });
      }
    }

    // ── Create rekening_anggaran ─────────────────────────────────────────────
    if (!tables.includes("rekening_anggaran")) {
      await queryInterface.createTable("rekening_anggaran", {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        kode: {
          type: Sequelize.STRING(30),
          allowNull: false,
          comment: "Kode rekening BPKAD, e.g. 5.1.01",
        },
        nama: {
          type: Sequelize.STRING(300),
          allowNull: false,
        },
        jenis: {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: "pegawai | barang_jasa | modal",
        },
        tahun_anggaran: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: new Date().getFullYear(),
        },
        unit_kerja: {
          type: Sequelize.STRING(150),
          allowNull: true,
        },
        pagu: {
          type: Sequelize.DECIMAL(18, 2),
          allowNull: false,
          defaultValue: 0,
        },
        realisasi: {
          type: Sequelize.DECIMAL(18, 2),
          allowNull: false,
          defaultValue: 0,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      });
    }

    // ── Create gaji_pegawai ──────────────────────────────────────────────────
    if (!tables.includes("gaji_pegawai")) {
      await queryInterface.createTable("gaji_pegawai", {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        nama: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        jabatan: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        bulan: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        tahun: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        gaji_pokok: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
        },
        tunjangan: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
        },
        potongan: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
        },
        status: {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: "pending",
          comment: "pending | dibayar | ditahan",
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      });
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes("rekening_anggaran")) {
      await queryInterface.dropTable("rekening_anggaran");
    }
    if (tables.includes("gaji_pegawai")) {
      await queryInterface.dropTable("gaji_pegawai");
    }
  },
};
