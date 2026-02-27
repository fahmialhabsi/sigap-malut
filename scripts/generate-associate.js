const fs = require("fs");
const path = require("path");

// ==== CONFIG ==== //
const MODEL_DIR = path.join(__dirname, "../backend/models");
const ERD_FILES = [
  path.join(__dirname, "../dokumenSistem/07-Data-Dictionary.md"),
  path.join(__dirname, "../dokumenSistem/10-ERD-Logical-Model.md"),
];

// ==== HELPERS ==== //
function normalizeName(s) {
  return (s || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function pascalCase(s) {
  return (s || "")
    .toString()
    .split(/[_\-\s]+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

function toCamel(s) {
  const parts = (s || "").toString().split(/[_\-\s]+/);
  return (
    parts[0].toLowerCase() +
    parts
      .slice(1)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("")
  );
}

function pluralize(word) {
  if (!word) return word;
  const irregular = {
    person: "people",
    man: "men",
    woman: "women",
    child: "children",
    foot: "feet",
    tooth: "teeth",
    mouse: "mice",
    goose: "geese",
  };
  const lower = word.toLowerCase();
  if (irregular[lower]) return irregular[lower];
  if (/[sxz]$/.test(lower) || /[sh]$/.test(lower)) return word + "es";
  if (/[aeiou]y$/.test(lower)) return word + "s";
  if (/y$/.test(lower)) return word.slice(0, -1) + "ies";
  return word + "s";
}

function findAssociateRange(src, modelName) {
  const esc = modelName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    "\\b" +
      esc +
      "\\.associate\\s*=\\s*(?:\\([^)]*\\)\\s*=>|function\\s*\\([^)]*\\)\\s*\\{)",
    "mi",
  );
  const m = src.match(re);
  if (!m) return null;
  const start = m.index;
  const braceStart = src.indexOf("{", start + (m[0] ? m[0].length - 1 : 0));
  if (braceStart === -1) return null;
  let idx = braceStart + 1;
  let depth = 1;
  while (idx < src.length) {
    const ch = src[idx];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) break;
    }
    idx++;
  }
  if (depth !== 0) return null;
  const end = idx + 1;
  return { start, end, innerStart: braceStart + 1, innerEnd: idx };
}

function replaceAssociateBlock(src, modelName, innerContent) {
  const range = findAssociateRange(src, modelName);
  if (range) {
    return (
      src.slice(0, range.innerStart) +
      "\n" +
      innerContent +
      "\n" +
      src.slice(range.innerEnd)
    );
  }
  const block = `\n\n${modelName}.associate = (models) => {\n${innerContent}\n};\n`;
  const modExp = /module\.exports\b/;
  const modIdx = src.search(modExp);
  if (modIdx !== -1) {
    return src.slice(0, modIdx) + block + src.slice(modIdx);
  }
  // try inserting before a `return <ModelName>;` if present
  const retExp = new RegExp("return\\s+" + modelName + "\\s*;", "m");
  const r = src.match(retExp);
  if (r && r.index !== undefined) {
    return src.slice(0, r.index) + block + src.slice(r.index);
  }
  // fallback: append
  return src + block;
}

// ==== ERD PARSER ==== //
function parseERD(files) {
  const rels = [];
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const txt = fs.readFileSync(file, "utf8");
    let current = null;
    for (const line of txt.split(/\r?\n/)) {
      if (!line.trim().startsWith("|")) continue;
      const cols = line.split("|").map((c) => c.trim());
      if (cols.length >= 3) {
        if (cols[1])
          current = cols[1].replace(/`/g, "").replace(/"/g, "").trim();
        let field = (cols[2] || "").replace(/`/g, "").replace(/"/g, "").trim();
        // try to find FK pattern anywhere in the line, case-insensitive
        const fk =
          line.match(/FK:\s*([A-Za-z0-9_\-\.]+)/i) ||
          line.match(/foreign key[:\s]*([A-Za-z0-9_\-\.]+)/i);
        if (fk && fk[1]) {
          const to = fk[1].replace(/[^A-Za-z0-9_\-\.]/g, "");
          if (current && field && !isPrimitiveType(to))
            rels.push({ from: current, field, to });
        } else {
          // sometimes FK is in a separate column (e.g., cols[3])
          if (cols.length >= 4) {
            const maybeFk = (cols[3] || "").match(/([A-Za-z0-9_\-\.]+)/i);
            if (maybeFk) {
              const to = maybeFk[1];
              if (!isPrimitiveType(to))
                rels.push({ from: current, field, to: to });
            }
          }
        }
      }
    }
    for (const match of txt.matchAll(
      /([A-Za-z0-9_\-]+)\.([A-Za-z0-9_\-]+)\s*(?:→|->)\s*([A-Za-z0-9_\-]+)\.([A-Za-z0-9_\-]+)/g,
    )) {
      const to = match[3];
      if (!isPrimitiveType(to)) {
        rels.push({
          from: match[1],
          field: match[2],
          to: to,
          refField: match[4],
        });
      }
    }
  }
  const seen = new Set();
  const out = [];
  for (const r of rels) {
    const key = `${normalizeName(r.from)}||${normalizeName(r.field)}||${normalizeName(r.to)}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(r);
    }
  }
  return out;
}

// Helper to skip obvious primitive types captured as FK targets
function isPrimitiveType(name) {
  if (!name) return false;
  const t = name.toString().trim().toLowerCase();
  const prim = [
    "uuid",
    "string",
    "text",
    "timestamp",
    "date",
    "datetime",
    "int",
    "integer",
    "bigint",
    "boolean",
    "bool",
    "float",
    "double",
    "decimal",
  ];
  return prim.includes(t);
}

// ==== ALIAS MAPPING (manual overrides) ====
// Add entries here when ERD uses a different logical name than the actual
// model filename or model name. Keys should be normalized (any case/spacing
// is fine) and values should be the model name or filename to map to.
const ALIAS_MAP = {
  // Map ERD logical names -> actual model names (or filenames without .js)
  layanan: "data_layanan_teknis",
  bidang: "fasilitasi_program_bidang",
  approver: "user",
  reviewer: "user",
};

function resolveTargetKey(name, modelsMap) {
  if (!name) return null;
  const norm = normalizeName(name);
  if (ALIAS_MAP[norm]) return normalizeName(ALIAS_MAP[norm]);
  // exact match
  if (modelsMap[norm]) return norm;
  // try safer token-based match: exact, starts/ends-with
  for (const k of Object.keys(modelsMap)) {
    if (k === norm) return k;
    if (k.endsWith(norm) || k.startsWith(norm)) return k;
    if (norm.endsWith(k) || norm.startsWith(k)) return k;
  }
  // try plural/singular variants
  const p = normalizeName(pluralize(name));
  if (modelsMap[p]) return p;
  const s = normalizeName(pluralize(name).replace(/s$/, ""));
  if (modelsMap[s]) return s;

  // try content-based heuristics: find a model file that contains `${name}_id` or similar
  const cand = name.replace(/[^A-Za-z0-9_]/g, "");
  const fkRegex = new RegExp("\\b" + cand + "_id\\b", "i");
  for (const [k, v] of Object.entries(modelsMap)) {
    if (v && v.src && fkRegex.test(v.src)) return k;
  }

  return norm;
}

// Scan a model source for potential foreign-key-like fields (e.g., `user_id`, `role_id`)
function scanModelFileForFKs(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const info = detectModelNameFromSrc(src, filePath);
  const from =
    info && info.modelName ? info.modelName : path.basename(filePath, ".js");
  const rels = [];
  // Look for attribute names ending with _id (simple heuristic)
  const attrMatches = [...src.matchAll(/([A-Za-z0-9_]+)_id\b/g)];
  for (const m of attrMatches) {
    const field = m[0];
    const candidate = m[1];
    if (isPrimitiveType(candidate)) continue;
    rels.push({ from, field, to: candidate });
  }
  return rels;
}

// Merge and dedupe relations array by normalized keys
function mergeRelations(a, b) {
  const seen = new Set();
  const out = [];
  function pushMany(arr) {
    for (const r of arr) {
      const key = `${normalizeName(r.from)}||${normalizeName(r.field)}||${normalizeName(r.to)}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(r);
      }
    }
  }
  pushMany(a || []);
  pushMany(b || []);
  return out;
}

function findModelFiles() {
  if (!fs.existsSync(MODEL_DIR)) return [];
  return fs
    .readdirSync(MODEL_DIR)
    .filter((f) => f.endsWith(".js") && f !== "index.js");
}

function detectModelNameFromSrc(src, filePath) {
  let m = src.match(/sequelize\.define\(\s*['"`]([A-Za-z0-9_\-]+)['"`]/);
  if (m)
    return {
      modelName: m[1],
      pascal: pascalCase(m[1]),
      norm: normalizeName(m[1]),
      filePath,
    };
  m = src.match(/const\s+([A-Za-z0-9_]+)\s*=\s*sequelize\.define\(/);
  if (m)
    return {
      modelName: m[1],
      pascal: pascalCase(m[1]),
      norm: normalizeName(m[1]),
      filePath,
    };
  m = src.match(/class\s+([A-Za-z0-9_]+)\s+extends\s+Model/);
  if (m)
    return {
      modelName: m[1],
      pascal: pascalCase(m[1]),
      norm: normalizeName(m[1]),
      filePath,
    };
  m = src.match(/([A-Za-z0-9_]+)\.init\s*\(/);
  if (m)
    return {
      modelName: m[1],
      pascal: pascalCase(m[1]),
      norm: normalizeName(m[1]),
      filePath,
    };
  m = src.match(/return\s+([A-Za-z0-9_]+)/);
  if (m) {
    const varName = m[1];
    const vm = src.match(
      new RegExp(
        "const\\s+" +
          varName +
          "\\s*=\\s*sequelize\\.define\\(\\s*['\"`]([A-Za-z0-9_\-]+)['\"`]",
      ),
    );
    if (vm)
      return {
        modelName: vm[1],
        pascal: pascalCase(vm[1]),
        norm: normalizeName(vm[1]),
        filePath,
      };
  }
  const base = path.basename(filePath, ".js");
  return {
    modelName: pascalCase(base),
    pascal: pascalCase(base),
    norm: normalizeName(base),
    filePath,
  };
}

function patchAssociateFn(filePath, rels, modelsMap, patchedSummary) {
  const src = fs.readFileSync(filePath, "utf8");
  const info = detectModelNameFromSrc(src, filePath);
  if (!info) return false;
  const modelName = info.modelName;
  const myRels = rels.filter((r) => {
    const normFrom = normalizeName(r.from);
    const baseFile = normalizeName(path.basename(filePath, ".js"));
    const normModel = normalizeName(modelName);
    // match exact, or plural/singular variants
    if (normFrom === normModel || normFrom === baseFile) return true;
    if (pluralize(normFrom) === normModel || pluralize(normModel) === normFrom)
      return true;
    return false;
  });
  if (myRels.length === 0) return false;
  const lines = [];
  const createdTargetHas = {};
  for (const r of myRels) {
    // skip primitives incorrectly parsed as FK targets
    if (isPrimitiveType(r.to)) continue;
    const asRaw = (r.field || "").replace(/_id$/, "") || r.to;
    const as = toCamel(asRaw);
    const targetPascal = pascalCase(r.to);
    lines.push(
      `  ${modelName}.belongsTo(models.${targetPascal}, { foreignKey: "${r.field}", as: "${as}" });`,
    );
    if (patchedSummary)
      patchedSummary.add(
        `Model ${path.basename(filePath)}: ${modelName}.belongsTo(models.${targetPascal}, { foreignKey: "${r.field}", as: "${as}" })`,
      );
    const targetKey = resolveTargetKey(r.to, modelsMap);
    const targetInfo =
      modelsMap[targetKey] ||
      modelsMap[normalizeName(path.basename(r.to, ".js"))];
    if (targetInfo && targetInfo.filePath) {
      // avoid creating reciprocal hasMany on the same model (self-reference)
      if (normalizeName(targetInfo.modelName) === normalizeName(modelName)) {
        continue;
      }
      const srcT = fs.readFileSync(targetInfo.filePath, "utf8");
      const sourcePascal = pascalCase(modelName);
      const hasAs = pluralize(toCamel(modelName));
      const hasRegex = new RegExp(
        targetInfo.modelName + "\\.hasMany\\s*\\(\\s*models\\." + sourcePascal,
        "i",
      );
      if (!hasRegex.test(srcT) && !createdTargetHas[targetInfo.filePath]) {
        const newInner = (function () {
          const tgtRange = findAssociateRange(srcT, targetInfo.modelName);
          if (tgtRange) {
            const existingInner = srcT
              .slice(tgtRange.innerStart, tgtRange.innerEnd)
              .trim();
            const lines = existingInner ? existingInner.split(/\r?\n/) : [];
            if (
              !lines.find((l) => l.includes(`hasMany(models.${sourcePascal}`))
            ) {
              lines.push(
                `  ${targetInfo.modelName}.hasMany(models.${sourcePascal}, { foreignKey: "${r.field}", as: "${hasAs}" });`,
              );
            }
            return lines.join("\n");
          } else {
            return `  ${targetInfo.modelName}.hasMany(models.${sourcePascal}, { foreignKey: "${r.field}", as: "${hasAs}" });`;
          }
        })();
        const replaced = replaceAssociateBlock(
          srcT,
          targetInfo.modelName,
          newInner,
        );
        fs.writeFileSync(targetInfo.filePath, replaced, "utf8");
        createdTargetHas[targetInfo.filePath] = true;
        if (patchedSummary)
          patchedSummary.add(
            `Model ${path.basename(targetInfo.filePath)}: ${targetInfo.modelName}.hasMany(models.${sourcePascal})`,
          );
      }
    } else {
      if (patchedSummary)
        patchedSummary.add(
          `Unmapped target for relation ${r.from}.${r.field} -> ${r.to}`,
        );
      console.log(
        `(warn) target model not found for relation: ${r.from}.${r.field} -> ${r.to}`,
      );
    }
  }
  const inner = lines.join("\n");
  const newSrc = replaceAssociateBlock(src, modelName, inner);
  fs.writeFileSync(filePath, newSrc, "utf8");
  return true;
}

// ==== MAIN ==== //
const erdRels = parseERD(ERD_FILES);
const models = findModelFiles();
const modelsMap = {};
const patchedSummary = new Set();

// scan models for *_id fields to infer relations
let modelInferredRels = [];
for (const f of models) {
  const fp = path.join(MODEL_DIR, f);
  try {
    modelInferredRels = modelInferredRels.concat(scanModelFileForFKs(fp));
  } catch (e) {
    // ignore
  }
}

const rels = mergeRelations(erdRels, modelInferredRels);
console.log(`Identified ${rels.length} relasi (ERD + model scan)...`);

models.forEach((f) => {
  const fp = path.join(MODEL_DIR, f);
  const src = fs.readFileSync(fp, "utf8");
  const info = detectModelNameFromSrc(src, fp);
  if (info) {
    modelsMap[info.norm] = {
      filePath: fp,
      modelName: info.modelName,
      pascal: info.pascal,
      src,
    };
    modelsMap[normalizeName(path.basename(f, ".js"))] = modelsMap[info.norm];
  }
});

models.forEach((f) => {
  const fp = path.join(MODEL_DIR, f);
  try {
    const ok = patchAssociateFn(fp, rels, modelsMap, patchedSummary);
    if (ok) console.log(`✅ Associate patched at: ${f}`);
    else console.log(`(skip) No associate needed for: ${f}`);
  } catch (e) {
    console.error(`Error patching ${f}:`, e.message);
  }
});

console.log("\n=== PATCHED RELATION SUMMARY ===");
patchedSummary.forEach((s) => console.log(s));
console.log("DONE. All associates up-to-date!");
