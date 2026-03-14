export const up = async (queryInterface, Sequelize) => {
  // Untuk semua dialect: langsung createTable dalam try-catch agar aman idempotent
  try {
    await queryInterface.createTable("data_induk_asn", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    });
  } catch (e) {}
  try {
    await queryInterface.createTable("penghargaan", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    });
  } catch (e) {}
  try {
    await queryInterface.createTable("pelatihan_pengolahan_pangan_lokal", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    });
  } catch (e) {}
  try {
    await queryInterface.createTable("pengolahan_data_kepegawaian", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    });
  } catch (e) {}
};

export const down = async (queryInterface) => {
  // safe down: drop only if exist (Sequelize will ignore if not exist)
  await queryInterface.dropTable("data_induk_asn").catch(() => {});
  await queryInterface.dropTable("penghargaan").catch(() => {});
  await queryInterface
    .dropTable("pelatihan_pengolahan_pangan_lokal")
    .catch(() => {});
  await queryInterface.dropTable("pengolahan_data_kepegawaian").catch(() => {});
};
