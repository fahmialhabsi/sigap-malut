// Simple converter: wrap files that `import sequelize from '../config/database.js'`
// into `export default (sequelize, DataTypes) => { ... return Model; }`.
// This is a best-effort transformation; review changes before committing.

import fs from "fs";
import path from "path";

const modelsDir = path.resolve(process.cwd(), "backend", "models");
const files = fs
  .readdirSync(modelsDir)
  .filter((f) => f.endsWith(".js") && f !== "index.js");

for (const file of files) {
  const p = path.join(modelsDir, file);
  let src = fs.readFileSync(p, "utf8");
  if (
    !src.includes("import sequelize from") &&
    !src.includes("require('../config/database')")
  )
    continue;

  const original = src;
  // Remove import sequelize line(s)
  src = src.replace(
    /import\s+sequelize\s+from\s+['\"][\.\/]+config\/database\.js['\"];?\n/,
    "",
  );
  src = src.replace(
    /const\s+sequelize\s*=\s*require\(['\"]\.\/\.\/config\/database['\"]\);?\n/,
    "",
  );

  // Find model var name
  const m = src.match(/const\s+(\w+)\s*=\s*sequelize\.define\(/);
  let modelVar = m ? m[1] : null;
  // fallback: look for "module.exports = sequelize.define" or "export default sequelize.define"
  if (!modelVar) {
    const m2 = src.match(
      /export\s+default\s+\(sequelize,\s*DataTypes\)\s*=>\s*{[\s\S]*?const\s+(\w+)\s*=\s*sequelize\.define\(/,
    );
    if (m2) modelVar = m2[1];
  }
  if (!modelVar) {
    const m3 = src.match(/export\s+default\s+(\w+);/);
    if (m3) modelVar = m3[1];
  }
  if (!modelVar) {
    console.warn(`Skipping ${file}: cannot find model variable name`);
    continue;
  }

  // Remove any top-level `export default Model;` or `export default <expr>;`
  src = src.replace(/export\s+default\s+[\s\S]*?;?\s*$/m, "");

  // Wrap with factory if not already wrapped
  if (!/export\s+default\s*\(sequelize,\s*DataTypes\)\s*=>/m.test(original)) {
    const wrapped = `export default (sequelize, DataTypes) => {\n${src}\n  return ${modelVar};\n};\n`;
    fs.writeFileSync(p, wrapped, "utf8");
    console.log(`Converted ${file} -> factory-export (modelVar=${modelVar})`);
  } else {
    console.log(`Already factory-export: ${file}`);
  }
}

console.log("Conversion complete. Please review changes before committing.");
