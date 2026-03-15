// scripts/convert-fields-csv.js
// Konversi semua *_fields.csv di frontend/public/master-data/FIELDS_*/ menjadi FIELDS_<module>.json di master-data/
// Usage: node scripts/convert-fields-csv.js

import fs from "fs";
import path from "path";
import Papa from "papaparse";

const BASE_DIR = path.resolve("frontend/public/master-data");
const OUTPUT_DIR = path.resolve("master-data");

function scanFieldCsvDirs() {
  return fs
    .readdirSync(BASE_DIR)
    .filter((f) => f.startsWith("FIELDS_"))
    .map((f) => path.join(BASE_DIR, f))
    .filter((f) => fs.statSync(f).isDirectory());
}

function csvToJson(csvPath) {
  const csv = fs.readFileSync(csvPath, "utf-8");
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  // Normalisasi kolom jika perlu
  return data.map((row) => {
    const obj = {};
    for (const k in row) {
      obj[k.trim()] = row[k];
    }
    return obj;
  });
}

function main() {
  const dirs = scanFieldCsvDirs();
  for (const dir of dirs) {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith("_fields.csv"));
    for (const file of files) {
      const moduleKey = file.replace(/_fields\.csv$/, "");
      const fields = csvToJson(path.join(dir, file));
      const outFile = path.join(OUTPUT_DIR, `FIELDS_${moduleKey}.json`);
      fs.writeFileSync(outFile, JSON.stringify(fields, null, 2));
      console.log(`Converted: ${file} -> FIELDS_${moduleKey}.json`);
    }
  }
}

main();
