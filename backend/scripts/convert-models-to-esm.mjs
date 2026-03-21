#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";

function toPascalCase(s) {
  return s
    .replace(/[-_ ]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (m, c) => c.toUpperCase());
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const res = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(res)));
    else files.push(res);
  }
  return files;
}

async function convertFile(filePath, { dryRun = true } = {}) {
  const src = await fs.readFile(filePath, "utf8");

  // Skip if already ESM-style simple header
  if (
    src.includes("import sequelize from '../config/database.js'") ||
    src.includes('import sequelize from \"../config/database.js\"')
  ) {
    return { skipped: true, reason: "already-esm" };
  }

  if (!/module\.exports\s*=/.test(src))
    return { skipped: true, reason: "no-commonjs" };

  // Try to find sequelize.define('name', { ... }, { ... })
  const defineRe =
    /sequelize\.define\s*\(\s*['"]([^'\"]+)['"]\s*,\s*(\{[\s\S]*?\})\s*(?:,\s*(\{[\s\S]*?\}))?\s*\)/m;
  const m = src.match(defineRe);
  if (!m) return { skipped: true, reason: "no-define-match" };

  const modelName = m[1];
  const fields = m[2];
  const options = m[3] || "{}";
  const varName = toPascalCase(modelName);

  const newContent = `import { DataTypes } from 'sequelize';\nimport sequelize from '../config/database.js';\n\nlet ${varName};\nif (sequelize.models && sequelize.models.${modelName}) {\n  ${varName} = sequelize.models.${modelName};\n} else {\n  ${varName} = sequelize.define(\n    '${modelName}',\n    ${fields},\n    ${options},\n  );\n}\n\nexport default ${varName};\n`;

  if (dryRun) {
    return { converted: true, file: filePath, newContent };
  }

  // backup and write
  const backupPath = `${filePath}.bak`;
  await fs.writeFile(backupPath, src, "utf8");
  await fs.writeFile(filePath, newContent, "utf8");
  return { converted: true, file: filePath, backup: backupPath };
}

async function main() {
  const cwd = process.cwd();
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const modelsDir = path.join(cwd, "models");

  if (!(await fs.stat(modelsDir).catch(() => false))) {
    console.error("models directory not found at", modelsDir);
    process.exit(2);
  }

  console.log(`Scanning models in ${modelsDir} (dryRun=${!apply})`);
  const allFiles = (await walk(modelsDir)).filter((f) => f.endsWith(".js"));

  const results = [];
  for (const f of allFiles) {
    try {
      const res = await convertFile(f, { dryRun: !apply });
      results.push({ file: f, ...res });
    } catch (e) {
      results.push({ file: f, error: String(e) });
    }
  }

  const converted = results.filter((r) => r.converted);
  const skipped = results.filter((r) => r.skipped || r.reason);
  const errored = results.filter((r) => r.error);

  console.log("\nSummary:");
  console.log(" Converted:", converted.length);
  converted
    .slice(0, 20)
    .forEach((c) =>
      console.log(
        "  -",
        c.file,
        c.backup ? `(backup: ${c.backup})` : "(dry-preview)",
      ),
    );
  console.log(" Skipped:", skipped.length);
  skipped
    .slice(0, 20)
    .forEach((s) => console.log("  -", s.file, s.reason || "skipped"));
  console.log(" Errors:", errored.length);
  errored.slice(0, 20).forEach((e) => console.log("  -", e.file, e.error));

  if (!apply) {
    console.log(
      "\nDry-run complete. To apply changes: run with --apply\nExample:\n  cd backend\n  node scripts/convert-models-to-esm.mjs --apply\n",
    );
  } else {
    console.log("\nApply complete. Review backups (*.bak) before committing.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
