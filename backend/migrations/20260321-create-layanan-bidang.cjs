// Migration: Create layanan & bidang tables

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bidang', {
      id_bidang: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      nama_bidang: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      deskripsi: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('layanan', {
      id_layanan: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      kode_layanan: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      nama_layanan: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      bidang_penanggung_jawab: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'bidang', key: 'id_bidang' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      deskripsi: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      jenis_output: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      SLA: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      aktif: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('layanan');
    await queryInterface.dropTable('bidang');
  },
};
