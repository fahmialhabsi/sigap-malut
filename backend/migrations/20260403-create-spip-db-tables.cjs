/** @param {import('sequelize').QueryInterface} queryInterface */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("spip_risk_register", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      unit_kerja: { type: Sequelize.STRING(40), allowNull: false }, // Sekretariat|UPTD|Bidang...
      periode_tahun: { type: Sequelize.INTEGER, allowNull: true },
      kode_risiko: { type: Sequelize.STRING(50), allowNull: true },
      nama_risiko: { type: Sequelize.TEXT, allowNull: false },
      kategori_risiko: { type: Sequelize.STRING(120), allowNull: true },
      sasaran_konteks: { type: Sequelize.TEXT, allowNull: true },
      proses_bisnis_konteks: { type: Sequelize.TEXT, allowNull: true },
      pemilik_risiko: { type: Sequelize.STRING(160), allowNull: true },
      status: {
        type: Sequelize.ENUM("draft", "active", "closed"),
        allowNull: false,
        defaultValue: "active",
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
    });
    await queryInterface.addIndex("spip_risk_register", ["unit_kerja"], {
      name: "spip_risk_register_unit_idx",
    });
    await queryInterface.addIndex("spip_risk_register", ["periode_tahun"], {
      name: "spip_risk_register_periode_tahun_idx",
    });

    await queryInterface.createTable("spip_rtp", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      risk_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "spip_risk_register", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      uraian_rtp: { type: Sequelize.TEXT, allowNull: false },
      penanggung_jawab: { type: Sequelize.STRING(160), allowNull: true },
      target_tanggal: { type: Sequelize.DATEONLY, allowNull: true },
      status: {
        type: Sequelize.ENUM("planned", "in_progress", "done", "blocked", "cancelled"),
        allowNull: false,
        defaultValue: "planned",
      },
      realized_at: { type: Sequelize.DATE, allowNull: true },
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
    });
    await queryInterface.addIndex("spip_rtp", ["risk_id"], {
      name: "spip_rtp_risk_id_idx",
    });
    await queryInterface.addIndex("spip_rtp", ["target_tanggal"], {
      name: "spip_rtp_target_tanggal_idx",
    });

    await queryInterface.createTable("spip_monitoring", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      risk_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "spip_risk_register", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      jenis: {
        type: Sequelize.ENUM(
          "kegiatan_pengendalian",
          "peristiwa_risiko",
          "level_risiko",
          "efektivitas_pengendalian",
        ),
        allowNull: false,
      },
      tanggal: { type: Sequelize.DATEONLY, allowNull: false },
      uraian: { type: Sequelize.TEXT, allowNull: true },
      hasil: { type: Sequelize.TEXT, allowNull: true },
      nilai: { type: Sequelize.DECIMAL(12, 4), allowNull: true },
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
    });
    await queryInterface.addIndex("spip_monitoring", ["risk_id"], {
      name: "spip_monitoring_risk_id_idx",
    });
    await queryInterface.addIndex("spip_monitoring", ["tanggal"], {
      name: "spip_monitoring_tanggal_idx",
    });
    await queryInterface.addIndex("spip_monitoring", ["jenis"], {
      name: "spip_monitoring_jenis_idx",
    });

    await queryInterface.createTable("spip_evidence_link", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      spip_ref_type: {
        type: Sequelize.ENUM("risk", "rtp", "monitoring"),
        allowNull: false,
      },
      spip_ref_id: { type: Sequelize.INTEGER, allowNull: false },
      sumber_modul: { type: Sequelize.STRING(100), allowNull: false }, // audit_log|approval_log|spj|sek_ast|dll
      sumber_tabel: { type: Sequelize.STRING(120), allowNull: true },
      sumber_id: { type: Sequelize.STRING(120), allowNull: true },
      judul: { type: Sequelize.TEXT, allowNull: true },
      url: { type: Sequelize.STRING(700), allowNull: true },
      occurred_at: { type: Sequelize.DATE, allowNull: true }, // timestamp kejadian bukti
      created_by: { type: Sequelize.STRING(100), allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("spip_evidence_link", ["spip_ref_type", "spip_ref_id"], {
      name: "spip_evidence_ref_idx",
    });
    await queryInterface.addIndex("spip_evidence_link", ["sumber_modul"], {
      name: "spip_evidence_sumber_modul_idx",
    });
    await queryInterface.addIndex("spip_evidence_link", ["occurred_at"], {
      name: "spip_evidence_occurred_at_idx",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("spip_evidence_link");
    await queryInterface.dropTable("spip_monitoring");
    await queryInterface.dropTable("spip_rtp");
    await queryInterface.dropTable("spip_risk_register");
  },
};

