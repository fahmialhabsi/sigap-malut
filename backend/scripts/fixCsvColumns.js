// Script untuk memperbaiki file CSV agar jumlah kolom di setiap baris konsisten dengan header
// ESM compatible
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.resolve(__dirname, "../../");
const FIELDS_DIRS = [path.join(WORKSPACE_ROOT, "master-data/FIELDS_UPTD")];

function fixCSVFile(filePath) {
  const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/);
  if (lines.length < 2) return;
  const header = lines[0];
  const headerCols = header.split(",").length;
  const fixedLines = [header];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    // Split by comma, but handle quoted fields
    let cols = [];
    let current = "";
    let inQuotes = false;
    for (let c = 0; c < lines[i].length; c++) {
      const char = lines[i][c];
      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
      } else if (char === "," && !inQuotes) {
        cols.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    cols.push(current);
    // Perbaiki jika kolom lebih banyak dari header
    if (cols.length > headerCols) {
      // Gabungkan kolom kelebihan ke kolom terakhir
      cols = cols
        .slice(0, headerCols - 1)
        .concat([cols.slice(headerCols - 1).join(",")]);
    }
    // Jika kurang, tambahkan kolom kosong
    while (cols.length < headerCols) cols.push("");
    fixedLines.push(cols.join(","));
  }
  fs.writeFileSync(filePath, fixedLines.join("\n"));
  console.log("Fixed:", filePath);
}

function main() {
  for (const dir of FIELDS_DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith("_fields.csv")) continue;
      fixCSVFile(path.join(dir, file));
    }
  }
}

main();
