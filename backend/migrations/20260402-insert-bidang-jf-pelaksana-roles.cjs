/**
 * Menyisipkan role aplikasi yang dipakai Manajemen User / getDashboardPath
 * bila belum ada di tabel `roles` (menghindari error resolveRoleRow saat update user).
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== "postgres") {
      console.warn(
        "[20260402-insert-bidang-jf-pelaksana-roles] Lewati: hanya PostgreSQL.",
      );
      return;
    }

    const defs = [
      [
        "pelaksana_ketersediaan",
        "Pelaksana Ketersediaan",
        "Pelaksana teknis bidang ketersediaan dan kerawanan pangan.",
      ],
      [
        "pelaksana_distribusi",
        "Pelaksana Distribusi",
        "Pelaksana teknis bidang distribusi pangan.",
      ],
      [
        "pelaksana_konsumsi",
        "Pelaksana Konsumsi",
        "Pelaksana teknis bidang konsumsi dan keamanan pangan.",
      ],
      [
        "fungsional_ketersediaan",
        "Fungsional Ketersediaan",
        "Jabatan fungsional verifikasi/analisis bidang ketersediaan.",
      ],
      [
        "fungsional_distribusi",
        "Fungsional Distribusi",
        "Jabatan fungsional verifikasi/analisis bidang distribusi.",
      ],
      [
        "fungsional_konsumsi",
        "Fungsional Konsumsi",
        "Jabatan fungsional verifikasi/analisis bidang konsumsi.",
      ],
    ];

    // Cast eksplisit: $1 dipakai 2× (SELECT + WHERE); PG memerlukan satu tipe
    // untuk parameter yang sama — tanpa cast → "inconsistent types ... text versus varchar".
    for (const [code, name, description] of defs) {
      await queryInterface.sequelize.query(
        `INSERT INTO roles (id, code, name, level, description, default_permissions, is_active, created_at, updated_at)
         SELECT gen_random_uuid(), $1::varchar(100), $2::text, (SELECT COALESCE(MAX(level), 0) + 1 FROM roles), $3::text, '[]'::json, true, NOW(), NOW()
         WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code = $1::varchar(100))`,
        { bind: [code, name, description] },
      );
    }
  },

  down: async () => {
    // Tidak menghapus otomatis: bisa memutus FK users.role_id
  },
};
