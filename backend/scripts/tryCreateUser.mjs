import { sequelize } from "../config/database.js";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsDir = path.resolve(__dirname, "..", "models");

async function loadModels() {
  if (fs.existsSync(modelsDir)) {
    const files = fs.readdirSync(modelsDir).filter((f) => f.endsWith(".js"));
    for (const f of files) {
      const p = path.join(modelsDir, f);
      try {
        await import(pathToFileURL(p).href);
      } catch (e) {
        console.warn("warning importing model", p, e.message);
      }
    }
  }
}

(async () => {
  try {
    await sequelize.authenticate();
    await loadModels();
    await sequelize.sync();
    const User = sequelize.models.User;
    console.log("User model keys", Object.keys(User.rawAttributes));
    try {
      const user = await User.create({
        username: `softcreate${Date.now()}`,
        password: "password123",
        name: "SoftCreate",
        unit_id: "Sekretariat",
        email: `soft${Date.now()}@test.com`,
        role_id: "pelaksana",
        jabatan: "Staff",
      });
      console.log("Created user", user.toJSON());
    } catch (e) {
      console.error("Create error name:", e.name);
      console.error(e);
    }
    process.exit(0);
  } catch (e) {
    console.error("setup error", e);
    process.exit(1);
  }
})();
