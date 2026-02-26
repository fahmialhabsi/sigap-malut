import Mocha from "mocha";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import sequelize from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testDir = __dirname;
const mocha = new Mocha({ timeout: 60000, reporter: "spec" });

(async () => {
  // Reset database for tests to avoid unique/index conflicts
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
