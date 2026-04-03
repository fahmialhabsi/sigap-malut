/**
 * Konversi migrasi Sequelize dari sintaks ESM (export const up/down) ke CommonJS (module.exports).
 * Wajib untuk sequelize-cli saat package.json "type": "module" dan file .cjs.
 *
 * Usage: node scripts/convert-migrations-esm-to-cjs.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migDir = path.join(__dirname, "../migrations");

function findMatchingBraceEnd(s, openBraceIndex) {
  let depth = 0;
  for (let i = openBraceIndex; i < s.length; i++) {
    const ch = s[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function stripImports(content) {
  return content
    .split("\n")
    .filter((line) => !/^\s*import\s+/.test(line))
    .join("\n");
}

function convertExportConstStyle(content, filename) {
  let s = stripImports(content).trim();

  const upArrow =
    "export const up = async (queryInterface, Sequelize) => {";
  const downArrowQueryOnly =
    "export const down = async (queryInterface) => {";
  const downArrowSequelize =
    "export const down = async (queryInterface, Sequelize) => {";

  if (!s.includes("export const up")) return null;

  const upIdx = s.indexOf(upArrow);
  if (upIdx === -1) return null;

  const bodyOpen = upIdx + upArrow.length - 1;
  const bodyClose = findMatchingBraceEnd(s, bodyOpen);
  if (bodyClose < 0) throw new Error(`${filename}: tidak bisa parse blok up`);
  const upInner = s.slice(bodyOpen + 1, bodyClose);

  let rest = s.slice(bodyClose + 1).trim();
  if (rest.startsWith(";")) rest = rest.slice(1).trim();

  let downParams = "queryInterface";
  let downInner;
  const dQ = rest.indexOf(downArrowQueryOnly);
  const dS = rest.indexOf(downArrowSequelize);
  let openDown;
  if (dQ !== -1 && (dS === -1 || dQ <= dS)) {
    openDown = dQ + downArrowQueryOnly.length - 1;
  } else if (dS !== -1) {
    downParams = "queryInterface, Sequelize";
    openDown = dS + downArrowSequelize.length - 1;
  } else {
    throw new Error(`${filename}: tidak menemukan export const down setelah up`);
  }
  const closeDown = findMatchingBraceEnd(rest, openDown);
  if (closeDown < 0) throw new Error(`${filename}: parse blok down gagal`);
  downInner = rest.slice(openDown + 1, closeDown);

  return `"use strict";\n\nmodule.exports = {\n  async up(queryInterface, Sequelize) {${upInner}\n  },\n\n  async down(${downParams}) {${downInner}\n  },\n};\n`;
}

function convertExportFunctionStyle(content, filename) {
  let s = stripImports(content).trim();

  const upFn = "export async function up(queryInterface, Sequelize) {";
  const upIdx = s.indexOf(upFn);
  if (upIdx === -1) return null;

  const bodyOpen = upIdx + upFn.length - 1;
  const bodyClose = findMatchingBraceEnd(s, bodyOpen);
  if (bodyClose < 0) throw new Error(`${filename}: parse up function gagal`);
  const upInner = s.slice(bodyOpen + 1, bodyClose);

  const rest = s.slice(bodyClose + 1);
  const downMatch = rest.match(/\bexport async function down\(([^)]*)\)\s*\{/);
  if (!downMatch) throw new Error(`${filename}: tidak menemukan export async function down`);

  const downOpen = rest.indexOf(downMatch[0]) + downMatch[0].length - 1;
  const downClose = findMatchingBraceEnd(rest, downOpen);
  if (downClose < 0) throw new Error(`${filename}: parse down function gagal`);
  const downInner = rest.slice(downOpen + 1, downClose);
  const downParams = downMatch[1].trim();

  return `"use strict";\n\nmodule.exports = {\n  async up(queryInterface, Sequelize) {${upInner}\n  },\n\n  async down(${downParams}) {${downInner}\n  },\n};\n`;
}

function convertFile(p, filename) {
  let content = fs.readFileSync(p, "utf8");
  if (!content.includes("export ") && !content.includes("import ")) return false;
  if (content.includes("module.exports") && !content.includes("export ")) return false;

  let out = convertExportFunctionStyle(content, filename);
  if (!out) out = convertExportConstStyle(content, filename);
  if (!out) {
    throw new Error(`${filename}: pola export tidak dikenali (periksa komentar/kurung)`);
  }

  fs.writeFileSync(p, out, "utf8");
  return true;
}

let n = 0;
for (const f of fs.readdirSync(migDir)) {
  if (!f.endsWith(".cjs")) continue;
  const p = path.join(migDir, f);
  try {
    if (convertFile(p, f)) {
      console.log("Converted:", f);
      n++;
    }
  } catch (e) {
    console.error(f, e.message);
    process.exit(1);
  }
}
console.error("Done. Files converted:", n);
