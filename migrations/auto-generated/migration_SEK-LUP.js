export async function up({ context: queryInterface }) {
  await queryInterface.createTable('SEK-LUP', {
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
      undefined: { type: DataTypes.STRING, allowNull: true },
    });
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable('SEK-LUP');
}
