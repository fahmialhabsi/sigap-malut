const fs = require("fs");
const path = require("path");

const ERD_FILES = [
  path.join(__dirname, "../dokumenSistem/07-Data-Dictionary.md"),
  path.join(__dirname, "../dokumenSistem/10-ERD-Logical-Model.md"),
];

function normalizeName(s) {
  return (s || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
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
        const fk =
          line.match(/FK:\s*([A-Za-z0-9_\-\.]+)/i) ||
          line.match(/foreign key[:\s]*([A-Za-z0-9_\-\.]+)/i);
        if (fk && fk[1]) {
          const to = fk[1].replace(/[^A-Za-z0-9_\-\.]/g, "");
          if (current && field && !isPrimitiveType(to))
            rels.push({ from: current, field, to });
        } else {
          if (cols.length >= 4) {
            const maybeFk = (cols[3] || "").match(/([A-Za-z0-9_\-\.]+)/i);
            if (maybeFk) {
              const to = maybeFk[1];
              if (!isPrimitiveType(to)) rels.push({ from: current, field, to });
            }
          }
        }
      }
    }
    for (const match of txt.matchAll(
      /([A-Za-z0-9_\-]+)\.([A-Za-z0-9_\-]+)\s*(?:→|->)\s*([A-Za-z0-9_\-]+)\.([A-Za-z0-9_\-]+)/g,
    )) {
      const to = match[3];
      if (!isPrimitiveType(to))
        rels.push({
          from: match[1],
          field: match[2],
          to: to,
          refField: match[4],
        });
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

const rels = parseERD(ERD_FILES);
if (rels.length === 0) {
  console.log("No relations found");
  process.exit(0);
}
console.log(`Found ${rels.length} relations:\n`);
rels.forEach((r, i) => {
  console.log(
    `${i + 1}. ${r.from}.${r.field} -> ${r.to}` +
      (r.refField ? ` (ref ${r.refField})` : ""),
  );
});
