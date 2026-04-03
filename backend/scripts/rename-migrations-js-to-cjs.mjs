/**
 * Migrasi Sequelize ber-CommonJS harus ber-ekstensi .cjs jika package.json punya "type": "module".
 * Usage: node scripts/rename-migrations-js-to-cjs.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "../migrations");

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".js")) continue;
  const from = path.join(dir, f);
  const to = path.join(dir, f.replace(/\.js$/i, ".cjs"));
  if (fs.existsSync(to)) {
    console.error("Skip (target exists):", f);
    continue;
  }
  fs.renameSync(from, to);
  console.log("Renamed:", f, "→", path.basename(to));
}
