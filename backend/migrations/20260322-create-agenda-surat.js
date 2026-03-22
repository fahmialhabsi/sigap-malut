export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("agenda_surat", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nomor_agenda: {
      type: Sequelize.STRING(20),
      allowNull: false,
      unique: true,
    },
    jenis: {
      type: Sequelize.ENUM("masuk", "keluar"),
      allowNull: false,
    },
    referensi_id: { type: Sequelize.INTEGER, allowNull: false },
    tanggal: { type: Sequelize.DATEONLY, allowNull: false },
    perihal: { type: Sequelize.TEXT, allowNull: true },
    dari_kepada: { type: Sequelize.STRING(255), allowNull: true },
    kode_klasifikasi: { type: Sequelize.STRING(50), allowNull: true },
    tahun: { type: Sequelize.INTEGER, allowNull: true },
    bulan: { type: Sequelize.INTEGER, allowNull: true },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("agenda_surat");
};
