// scripts/test-write-modules.js
// Script sederhana untuk menguji penulisan file ke frontend/src/modules
import fs from "fs";
import path from "path";

const targetDir = path.resolve("../frontend/src/modules");
const testFile = path.join(targetDir, "test-dummy.txt");

try {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log("Folder modules berhasil dibuat.");
  }
  fs.writeFileSync(testFile, "Ini file dummy test dari Node.js");
  console.log("File test-dummy.txt berhasil dibuat di modules.");
} catch (err) {
  console.error("Gagal menulis file ke modules:", err);
}
