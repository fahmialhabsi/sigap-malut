// Script untuk memperbaiki file SEK-RMH_fields.csv (data) agar jumlah kolom di setiap baris konsisten dengan header
// ESM compatible
import fs from "fs";
import path from "path";

const filePath =
  "e:/sigap-malut/frontend/public/master-data/FIELDS_SEKRETARIAT/SEK-RMH_fields.csv";

const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/);
if (lines.length < 2) {
  console.log("File kosong atau hanya header.");
  process.exit(0);
}
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
} else {
  console.log("No changes needed.");
}
