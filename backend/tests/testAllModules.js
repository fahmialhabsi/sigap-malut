import Mocha from "mocha";
import path from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import sequelize from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testDir = __dirname;
const mocha = new Mocha({ timeout: 60000, reporter: "spec" });

(async () => {
  // Reset database for tests to avoid unique/index conflicts
  // Ensure all model definitions are loaded before syncing the DB
  const modelsDir = path.join(__dirname, "..", "models");
  if (fs.existsSync(modelsDir)) {
    const modelFiles = fs.readdirSync(modelsDir).filter((f) => f.endsWith(".js"));
    for (const mf of modelFiles) {
      const p = path.join(modelsDir, mf);
      await import(pathToFileURL(p).href);
    }
  }

  await sequelize.sync({ force: true });

  fs.readdirSync(testDir)
    .filter((file) => file.endsWith(".test.js"))
    .forEach((file) => {
      mocha.addFile(path.join(testDir, file));
    });

  mocha.run((failures) => {
    process.exitCode = failures ? 1 : 0;
  });
})();
// testAllModules.js
// Script ES module untuk menjalankan semua test di folder backend/tests secara otomatis

// ...existing code...
