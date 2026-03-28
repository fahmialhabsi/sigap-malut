import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const s = new Sequelize(
  `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  { logging: false },
);

try {
  // Tampilkan semua user dengan role mereka
  const [users] = await s.query(
    "SELECT id, username, email, role FROM users ORDER BY id",
  );
  process.stdout.write("ID|Username|Email|Role\n");
  for (const u of users) {
    process.stdout.write(`${u.id}|${u.username}|${u.email}|${u.role}\n`);
  }
} catch (e) {
  process.stdout.write("Error: " + e.message + "\n");
}
await s.close();
