/**
 * Satu kali: ganti impor utils/api → services/api (atau ./api di folder services/).
 * Jalankan: node scripts/migrate-frontend-api-imports.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(__dirname, "..", "frontend", "src");

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walk(p, acc);
    else if (/\.(jsx|js)$/.test(name.name)) acc.push(p);
  }
  return acc;
}

let updated = 0;
for (const f of walk(srcRoot)) {
  if (f.replace(/\\/g, "/").endsWith("/services/api.js")) continue;

  let c = fs.readFileSync(f, "utf8");
  const orig = c;

  const inServicesDir = path.dirname(f).replace(/\\/g, "/").endsWith("/services");
  if (inServicesDir) {
    c = c.replace(/from\s+["']\.\.\/utils\/api["']/g, 'from "./api"');
  }

  c = c.replace(/from\s+["']\.\.\/\.\.\/\.\.\/utils\/api["']/g, 'from "../../../services/api"');
  c = c.replace(/from\s+["']\.\.\/\.\.\/utils\/api["']/g, 'from "../../services/api"');
  c = c.replace(/from\s+["']\.\.\/utils\/api["']/g, 'from "../services/api"');

  if (c !== orig) {
    fs.writeFileSync(f, c, "utf8");
    console.log(f);
    updated += 1;
  }
}
console.error("Files updated:", updated);
