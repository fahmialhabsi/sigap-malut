const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dir = path.join(__dirname, "..", "dokumenSistem");
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".md"))
  .sort();
let concat = "";
for (const f of files) {
  concat += fs.readFileSync(path.join(dir, f), "utf8");
}
const hash = crypto
  .createHash("sha256")
  .update(concat, "utf8")
  .digest("hex")
  .toUpperCase();
fs.writeFileSync(
  path.join(__dirname, "_dokumen_hash.txt"),
  hash + "\n",
  "utf8",
);
fs.writeFileSync(
  path.join(__dirname, "_dokumen_files.txt"),
  files.join(",") + "\n",
  "utf8",
);
// also compute per-file hashes and write JSON
const perFile = files.map((f) => {
  const data = fs.readFileSync(path.join(dir, f), "utf8");
  const h = crypto
    .createHash("sha256")
    .update(data, "utf8")
    .digest("hex")
    .toUpperCase();
  return { file: f, hash: h };
});
fs.writeFileSync(
  path.join(__dirname, "dokumen_hashes.json"),
  JSON.stringify(perFile, null, 2),
  "utf8",
);
console.log("WROTE_FILES");
