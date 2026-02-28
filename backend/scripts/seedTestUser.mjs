import bcrypt from "bcrypt";
import sequelize from "../config/database.js";

async function run() {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    const email =
      "super_admin-sekretariat-dinas-pangan-maluku-utara@dinpangan.go.id";
    const username = "super_admin";
    const plain = "Admin123";

    const [existing] = await sequelize.query(
      "SELECT id FROM users WHERE email = :email LIMIT 1",
      {
        replacements: { email },
      },
    );

    if (existing && existing.length) {
      console.log("User already exists, id=", existing[0].id);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(plain, 10);
    const now = new Date().toISOString();

    const qi = sequelize.getQueryInterface();
    await qi.bulkInsert(
      "users",
      [
        {
          username,
          name: "Super Admin",
          email,
          password: hashed,
          role_id: "super_admin",
          unit_id: "Sekretariat",
          nama_lengkap: "Super Admin",
          unit_kerja: "Sekretariat",
          jabatan: "Administrator",
          is_active: true,
          created_at: now,
          updated_at: now,
        },
      ],
      {},
    );

    console.log("Seeded test user:", email);
    process.exit(0);
  } catch (err) {
    console.error("Seeder error:", err);
    process.exit(1);
  }
}

run();
