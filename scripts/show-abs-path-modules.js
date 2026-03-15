// scripts/show-abs-path-modules.js
// Menampilkan absolute path dan isi folder modules dari Node.js
import fs from "fs";
import path from "path";

const targetDir = path.resolve("../frontend/src/modules");
console.log("Absolute path folder modules:", targetDir);

try {
  if (!fs.existsSync(targetDir)) {
    console.log("Folder modules tidak ada.");
  } else {
    const files = fs.readdirSync(targetDir);
    if (files.length === 0) {
      console.log("Folder modules kosong.");
    } else {
      console.log("Isi folder modules:", files);
    }
  }
} catch (err) {
  console.error("Gagal membaca isi folder modules:", err);
}
