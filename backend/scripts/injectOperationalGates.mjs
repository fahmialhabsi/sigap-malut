import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ctrl = path.join(__dirname, "../controllers");

const IMP = `import { gateOperationalWrite, gateOperationalUpdate } from "../services/executionThreadGate.js";
`;

const CREATE_GATE = `    const threadOk = await gateOperationalWrite(req, res);
    if (!threadOk) return;
`;

const UPDATE_GATE_JSON = `    const threadUp = await gateOperationalUpdate(req, res, record);
    if (!threadUp) return;
`;

function addImport(s) {
  if (s.includes("executionThreadGate")) return s;
  const lines = s.split(/\r?\n/);
  let idx = -1;
  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    if (/^import /.test(lines[i])) idx = i;
  }
  if (idx < 0) return s;
  lines.splice(idx + 1, 0, IMP.trimEnd());
  return lines.join("\n");
}

/** try { + langsung Model.create */
function patchTryCreate(s) {
  const re =
    /(export const create\w+ = async \(req, res\) => \{\s*\n  try \{\s*\n)(    const record = await \w+\.create\()/m;
  if (!re.test(s)) return s;
  return s.replace(re, `$1${CREATE_GATE}$2`);
}

/** try { + normalize payload */
function patchTryNormalizeCreate(s) {
  const re =
    /(export const create\w+ = async \(req, res\) => \{\s*\n  try \{\s*\n)(    const payload = normalize)/m;
  if (!re.test(s)) return s;
  return s.replace(re, `$1${CREATE_GATE}$2`);
}

/** update: dataLama get() lalu record.update ...req.body */
function patchUpdateGetSpread(s) {
  const needle = `\n    const dataLama = { ...record.get() };\n    await record.update({\n      ...req.body`;
  if (!s.includes(needle)) return s;
  return s.replace(
    needle,
    `\n    const threadUp = await gateOperationalUpdate(req, res, record);\n    if (!threadUp) return;\n    const dataLama = { ...record.get() };\n    await record.update({\n      ...req.body`,
  );
}

/** update: toJSON + normalize */
function patchUpdateNormalize(s) {
  const needle = `\n    const dataLama = record.toJSON();\n    const payload = normalize`;
  if (!s.includes(needle)) return s;
  return s.replace(
    needle,
    `\n    const threadUp = await gateOperationalUpdate(req, res, record);\n    if (!threadUp) return;\n    const dataLama = record.toJSON();\n    const payload = normalize`,
  );
}

/** BDS-LAP update after ensureNotLocked */
function patchBdsLapUpdate(s) {
  const needle = `\n    await ensureNotLocked(record.id);\n\n    const dataLama = record.toJSON();\n    const payload = normalizeBdsLapPayload(`;
  if (!s.includes(needle)) return s;
  return s.replace(
    needle,
    `\n    await ensureNotLocked(record.id);\n\n    const threadUp = await gateOperationalUpdate(req, res, record);\n    if (!threadUp) return;\n\n    const dataLama = record.toJSON();\n    const payload = normalizeBdsLapPayload(`,
  );
}

const FILES_TRY_CREATE = [
  "BDS-BMB.js",
  "BDS-EVL.js",
  "BDS-HRG.js",
  "BKT-BMB.js",
  "BKT-FSL.js",
  "BKT-KBJ.js",
  "BKT-MEV.js",
  "BKS-BMB.js",
  "BKS-DVR.js",
  "BKS-EVL.js",
  "BKS-KBJ.js",
  "BKS-KMN.js",
  "BKS-LAP.js",
];

const FILES_TRY_NORMALIZE_CREATE = [
  "BDS-CPD.js",
  "BDS-KBJ.js",
  "BDS-MON.js",
  "BDS-LAP.js",
  "BKT-KRW.js",
  "BKT-PGD.js",
];

const FILES_SEK = [
  "SEK-ADM.js",
  "SEK-AST.js",
  "SEK-HUM.js",
  "SEK-KBJ.js",
  "SEK-KEP.js",
  "SEK-KEU.js",
  "SEK-LDS.js",
  "SEK-LKS.js",
  "SEK-LKT.js",
  "SEK-LUP.js",
  "SEK-REN.js",
  "SEK-RMH.js",
];

for (const f of FILES_TRY_CREATE) {
  const p = path.join(ctrl, f);
  let s = fs.readFileSync(p, "utf8");
  s = addImport(s);
  s = patchTryCreate(s);
  s = patchUpdateGetSpread(s);
  fs.writeFileSync(p, s);
  console.log("patched", f);
}

for (const f of FILES_TRY_NORMALIZE_CREATE) {
  const p = path.join(ctrl, f);
  let s = fs.readFileSync(p, "utf8");
  s = addImport(s);
  s = patchTryNormalizeCreate(s);
  s = f === "BDS-LAP.js" ? patchBdsLapUpdate(s) : patchUpdateNormalize(s);
  fs.writeFileSync(p, s);
  console.log("patched", f);
}

for (const f of FILES_SEK) {
  const p = path.join(ctrl, f);
  let s = fs.readFileSync(p, "utf8");
  s = addImport(s);
  s = patchTryCreate(s);
  s = patchUpdateGetSpread(s);
  fs.writeFileSync(p, s);
  console.log("patched SEK", f);
}
