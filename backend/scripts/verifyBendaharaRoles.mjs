#!/usr/bin/env node
/**
 * Smoke check: role bendahara terpisah ada di roleModuleMapping + fieldMask konsisten.
 * npm run verify:bendahara-roles
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mapPath = path.join(__dirname, "..", "config", "roleModuleMapping.json");

const codes = [
  "bendahara_pengeluaran",
  "bendahara_gaji",
  "bendahara_barang",
  "bendahara",
];

const matrix = JSON.parse(fs.readFileSync(mapPath, "utf8"));
const roles = matrix.roles || {};
const fm = matrix.fieldMasks || {};

const out = { ok: true, roles: {}, field_masks: { kgb: fm.kgb?.allowedRoles } };

for (const c of codes) {
  const perms = roles[c]?.permissions?.length ?? 0;
  out.roles[c] = perms > 0 ? "OK" : "MISSING";
  if (perms === 0 && c !== "bendahara") out.ok = false;
}

const kgbAllowed = fm.kgb?.allowedRoles || [];
if (!kgbAllowed.includes("bendahara_gaji")) {
  out.ok = false;
  out.note = "kgb fieldMask seharusnya menyertakan bendahara_gaji";
}

console.log(JSON.stringify(out, null, 2));
process.exit(out.ok ? 0 : 1);
