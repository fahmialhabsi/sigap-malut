import fs from "fs";
import path from "path";

const modelsDir = path.join(process.cwd(), "models");
const files = fs.readdirSync(modelsDir).filter((f) => f.endsWith(".js"));
const modified = [];

for (const file of files) {
  const p = path.join(modelsDir, file);
  let src = fs.readFileSync(p, "utf8");
  if (!/layanan_id\s*:\s*\{\s*type:\s*DataTypes\.STRING/.test(src)) continue;
  // Skip files that explicitly reference layanan_menpanrb or LY codes or define STRING(10)
  if (/layanan_menpanrb|LY\d{2,}|DataTypes\.STRING\(\d+\)/.test(src)) continue;

  const before = src;
  // replace several common patterns
  src = src.replace(
    /layanan_id\s*:\s*\{\s*type:\s*DataTypes\.STRING(,?)/g,
    "layanan_id: { type: DataTypes.UUID$1",
  );
  src = src.replace(
    /layanan_id\s*:\s*\{\s*type:\s*DataTypes\.STRING\s*\}/g,
    "layanan_id: { type: DataTypes.UUID }",
  );

  if (src !== before) {
    fs.writeFileSync(p, src, "utf8");
    modified.push(file);
  }
}

console.log("Modified", modified.length, "files:");
modified.forEach((f) => console.log(" -", f));
