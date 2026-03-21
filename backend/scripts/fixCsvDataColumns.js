// Script untuk memperbaiki semua file CSV data (bukan _fields.csv) agar jumlah kolom di setiap baris konsisten dengan header
// ESM compatible
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MASTER_FOLDERS = [
  path.join(__dirname, "../../master-data/FIELDS_SEKRETARIAT"),
  path.join(__dirname, "../../master-data/FIELDS_BIDANG_KETERSEDIAAN"),
  path.join(__dirname, "../../master-data/FIELDS_BIDANG_DISTRIBUSI"),
  path.join(__dirname, "../../master-data/FIELDS_BIDANG_KONSUMSI"),
  path.join(__dirname, "../../master-data/FIELDS_UPTD"),
  path.join(__dirname, "../../frontend/public/master-data/FIELDS_SEKRETARIAT"),
  path.join(
    __dirname,
    "../../frontend/public/master-data/FIELDS_BIDANG_KETERSEDIAAN",
  ),
  path.join(
    __dirname,
    "../../frontend/public/master-data/FIELDS_BIDANG_DISTRIBUSI",
  ),
  path.join(
    __dirname,
    "../../frontend/public/master-data/FIELDS_BIDANG_KONSUMSI",
  ),
  path.join(__dirname, "../../frontend/public/master-data/FIELDS_UPTD"),
  path.join(__dirname, "../../frontend/public/master-data/FIELDS"),
];

function fixCsvFile(filePath) {
  const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/);
  if (lines.length < 2) return;
  const header = lines[0].split(",");
  const fixed = [lines[0]];
  let changed = false;
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = lines[i].split(",");
    if (cols.length !== header.length) {
      changed = true;
      if (cols.length > header.length) {
        fixed.push(cols.slice(0, header.length).join(","));
      } else {
        fixed.push(
          cols.concat(Array(header.length - cols.length).fill("")).join(","),
        );
      }
    } else {
      fixed.push(lines[i]);
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, fixed.join("\n"));
    console.log(`Fixed: ${filePath}`);
  }
}

function scanAndFixAllCsv() {
  for (const folder of MASTER_FOLDERS) {
    if (!fs.existsSync(folder)) continue;
    const files = fs
      .readdirSync(folder)
      .filter((f) => f.endsWith(".csv") && !f.endsWith("_fields.csv"));
    for (const file of files) {
      const filePath = path.join(folder, file);
      fixCsvFile(filePath);
    }
  }
}

scanAndFixAllCsv();
