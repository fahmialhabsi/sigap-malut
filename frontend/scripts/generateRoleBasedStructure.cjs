const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const modulConfigPath = path.resolve(
  __dirname,
  "../../master-data/00_MASTER_MODUL_CONFIG.csv",
);
const generatedPagesDir = path.resolve(__dirname, "../src/pages/generated");
const targetPagesDir = path.resolve(__dirname, "../src/pages");
const roleMap = {
  "Super Admin": "superadmin",
  "Kepala Dinas Dan Gubernur": "kepaladinasGubernur",
  Sekretariat: "sekretariat",
  "Bidang Ketersediaan": "bidangKetersediaan",
  "Bidang Distribusi": "bidangDistribusi",
  "Bidang Konsumsi": "bidangKonsumsi",
  UPTD: "uptd",
  Publik: "publik",
};

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function moveOrCreateFile(src, dest, modul) {
  ensureDirSync(path.dirname(dest));
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved: ${src} -> ${dest}`);
  } else if (!fs.existsSync(dest)) {
    // Generate template file if not exists
    const template = `// filepath: ${dest}
import React from "react";

export default function ${modul.modul_id}ListPage() {
  return (
    <div>
      <h2>${modul.nama_modul}</h2>
      <p>${modul.deskripsi || "Halaman modul."}</p>
    </div>
  );
}
`;
    fs.writeFileSync(dest, template, "utf8");
    console.log(`Created: ${dest}`);
  }
}

function getRoleFolder(kategori, bidang) {
  if (roleMap[kategori]) return roleMap[kategori];
  if (roleMap[bidang]) return roleMap[bidang];
  return "publik";
}

function main() {
  const modulList = [];
  fs.createReadStream(modulConfigPath)
    .pipe(csv())
    .on("data", (row) => modulList.push(row))
    .on("end", () => {
      modulList.forEach((modul) => {
        const modulId = modul.modul_id;
        const kategori = modul.kategori;
        const bidang = modul.bidang;
        const roleFolder = getRoleFolder(kategori, bidang);
        const srcFile = path.join(generatedPagesDir, `${modulId}ListPage.jsx`);
        const destDir = path.join(targetPagesDir, roleFolder);
        const destFile = path.join(destDir, `${modulId}ListPage.jsx`);
        moveOrCreateFile(srcFile, destFile, modul);
      });
      // Optionally, remove generated folder if empty
      if (
        fs.existsSync(generatedPagesDir) &&
        fs.readdirSync(generatedPagesDir).length === 0
      ) {
        fs.rmdirSync(generatedPagesDir);
        console.log("Removed empty generated folder.");
      }
      console.log("=== DONE ===");
    });
}

main();
