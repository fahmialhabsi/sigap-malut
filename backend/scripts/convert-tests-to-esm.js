#!/usr/bin/env node
import fs from "fs";
import path from "path";

const testsDir = path.resolve(process.cwd(), "tests");

function convertRequireToImport(content) {
  // Destructured require: const { a, b } = require('mod'); -> import { a, b } from 'mod';
  content = content.replace(
    /const\s+(\{[^}]+\})\s*=\s*require\(['"]([^'"\)]+)['"]\);/g,
    (m, destr, mod) => {
      return `import ${destr} from '${mod}';`;
    },
  );

  // Simple default require: const X = require('mod'); -> import X from 'mod';
  // For relative modules, import as __pkg_<id> and provide default fallback: const X = __pkg_X.default ?? __pkg_X
  content = content.replace(
    /const\s+([A-Za-z0-9_$]+)\s*=\s*require\(['"]([^'"\)]+)['"]\);/g,
    (m, id, mod) => {
      if (mod.startsWith(".")) {
        const alias = `__pkg_${id}`;
        return `import ${alias} from '${mod}';\nconst ${id} = ${alias} && (${alias}.default ?? ${alias});`;
      }
      return `import ${id} from '${mod}';`;
    },
  );

  return content;
}

function ensureESMDirHeader(origContent, converted) {
  const needsDir = /__dirname|__filename/.test(origContent);
  if (!needsDir) return converted;

  const header = `import path from 'path';\nimport { fileURLToPath } from 'url';\nconst __filename = fileURLToPath(import.meta.url);\nconst __dirname = path.dirname(__filename);\n\n`;
  if (
    converted.includes("fileURLToPath") ||
    converted.includes("const __dirname") ||
    /import\s+path\s+from\s+['\"]path['\"]/.test(converted) ||
    /import\s+\{?\s*fileURLToPath\s*\}?\s+from\s+['\"]url['\"]/.test(converted)
  )
    return converted;
  return header + converted;
}

function ensureRelativeExtensions(converted) {
  // add .js extension to relative imports that miss extension
  converted = converted.replace(/from\s+['"](\.\.\/[^'"\)]+?)['"]/g, (m, p) => {
    if (p.match(/\.[a-zA-Z0-9]+$/)) return m;
    return `from '${p}.js'`;
  });
  converted = converted.replace(
    /from\s+['"](\.{1}\/[^'"\)]+?)['"]/g,
    (m, p) => {
      if (p.match(/\.[a-zA-Z0-9]+$/)) return m;
      return `from '${p}.js'`;
    },
  );
  return converted;
}

async function run() {
  if (!fs.existsSync(testsDir)) {
    console.error("No tests directory found at", testsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(testsDir).filter((f) => f.endsWith(".cjs"));
  if (files.length === 0) {
    console.log("No .cjs test files found.");
    return;
  }

  for (const file of files) {
    const full = path.join(testsDir, file);
    const outFile = full.replace(/\.cjs$/, ".js");
    const bakFile = full + ".bak";

    try {
      const src = fs.readFileSync(full, "utf8");
      let converted = convertRequireToImport(src);
      converted = ensureESMDirHeader(src, converted);
      converted = ensureRelativeExtensions(converted);

      if (!fs.existsSync(bakFile)) fs.copyFileSync(full, bakFile);
      fs.writeFileSync(outFile, converted, "utf8");

      console.log(
        `Converted: ${file} -> ${path.basename(outFile)} (backup: ${path.basename(bakFile)})`,
      );
    } catch (e) {
      console.error("Failed to convert", file, e.message);
    }
  }

  console.log(
    "\nConversion complete. Review generated .js files in tests/ and run your test runner.",
  );
}

run();
