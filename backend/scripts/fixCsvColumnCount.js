// Script: fixCsvColumnCount.js
// Usage: node fixCsvColumnCount.js
// Overwrites original CSVs to ensure all rows have the same column count as header (10 columns)
import fs from "fs";
import path from "path";
import readline from "readline";

const dir = "master-data/FIELDS_SEKRETARIAT";
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith("_fields.csv"))
  .map((f) => path.join(dir, f));

function parseCsvLine(line) {
  // Split CSV line, respecting quoted commas
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function escapeCsvField(field) {
  if (field.includes(",") || field.includes('"')) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return field;
}

async function fixFile(filePath) {
  const absPath = path.resolve(filePath);
  const lines = fs.readFileSync(absPath, "utf-8").split(/\r?\n/);
  if (lines.length === 0) return;
  const header = parseCsvLine(lines[0]);
  const colCount = header.length;
  const fixedLines = [header.map(escapeCsvField).join(",")];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    let fields = parseCsvLine(lines[i]);
    // Gabungkan kolom kelebihan ke kolom terakhir
    if (fields.length > colCount) {
      fields = fields
        .slice(0, colCount - 1)
        .concat([fields.slice(colCount - 1).join(",")]);
    }
    // Tambah kolom kosong jika kurang
    while (fields.length < colCount) {
      fields.push("");
    }
    fields = fields.map(escapeCsvField);
    fixedLines.push(fields.join(","));
  }
  fs.writeFileSync(absPath, fixedLines.join("\n"), "utf-8");
  console.log(`Fixed: ${filePath}`);
}

(async () => {
  for (const file of files) {
    await fixFile(file);
  }
  console.log("All CSV files fixed.");
})();
