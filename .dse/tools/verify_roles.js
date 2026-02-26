// Verifier: inspect only structured `roles` arrays/objects in JSON and JS
const fs = require("fs");
const path = require("path");

const workspaceRoot = path.resolve(__dirname, "..", "..");
const rolesPath = path.join(workspaceRoot, ".dse", "roles.json");
const reportPath = path.join(workspaceRoot, ".dse", "verify_roles_report.json");

function loadCanonical() {
  try {
    const data = JSON.parse(fs.readFileSync(rolesPath, "utf8"));
    const set = new Set();
    if (Array.isArray(data.roles)) {
      data.roles.forEach((r) => {
        if (r.code) set.add(String(r.code).toLowerCase());
        if (Array.isArray(r.aliases))
          r.aliases.forEach((a) => set.add(String(a).toLowerCase()));
      });
    }
    return set;
  } catch (e) {
    console.error("Failed to load roles.json", e.message);
    return new Set();
  }
}

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (["node_modules", ".git"].includes(f)) continue;
    const fp = path.join(dir, f);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) {
      filelist = walk(fp, filelist);
    } else {
      filelist.push(fp);
    }
  }
  return filelist;
}

function extractRolesFromJson(obj) {
  const findings = [];
  function recurse(node, ctxPath) {
    if (node && typeof node === "object") {
      Object.keys(node).forEach((k) => {
        const v = node[k];
        if (k === "roles" && Array.isArray(v)) {
          findings.push({ path: ctxPath.concat(k), roles: v });
        } else if (typeof v === "object") {
          recurse(v, ctxPath.concat(k));
        }
      });
    }
  }
  recurse(obj, []);
  return findings;
}

function extractRolesFromJs(text) {
  const findings = [];
  const regexRolesArray = /roles\s*:\s*\[([^\]]*)\]/g;
  const regexRolesObject = /roles\s*:\s*\{([\s\S]*?)\}\s*(,|\n)/g;

  let m;
  while ((m = regexRolesArray.exec(text)) !== null) {
    const inside = m[1];
    const matches = inside.match(/['"`]([^'"`]+)['"`]/g) || [];
    const roles = matches.map((x) => x.replace(/['"`]/g, "").trim());
    findings.push({ type: "array", roles });
  }

  while ((m = regexRolesObject.exec(text)) !== null) {
    const inside = m[1];
    const arrMatches = inside.match(/\[([^\]]*)\]/g) || [];
    const roles = [];
    arrMatches.forEach((a) => {
      const mm = a.match(/['"`]([^'"`]+)['"`]/g) || [];
      mm.forEach((x) => roles.push(x.replace(/['"`]/g, "").trim()));
    });
    if (roles.length) findings.push({ type: "object", roles });
  }

  return findings;
}

function main() {
  const canonical = loadCanonical();
  const allFiles = walk(workspaceRoot);
  const report = { generated_at: new Date().toISOString(), findings: [] };

  for (const file of allFiles) {
    try {
      if (file.endsWith(".json")) {
        const rel = path.relative(workspaceRoot, file);
        const content = fs.readFileSync(file, "utf8");
        const obj = JSON.parse(content);
        const roleArrays = extractRolesFromJson(obj);
        roleArrays.forEach((r) => {
          (r.roles || []).forEach((role) => {
            let actual = role;
            if (role && typeof role === "object") {
              if (role.code) actual = role.code;
              else return; // skip complex objects without explicit code
            }
            const tok = String(actual).toLowerCase();
            if (!canonical.has(tok)) {
              report.findings.push({
                file: rel,
                location: r.path.join("."),
                token: tok,
                value: role,
              });
            }
          });
        });
      } else if (file.endsWith(".js")) {
        const rel = path.relative(workspaceRoot, file);
        const text = fs.readFileSync(file, "utf8");
        const jsFindings = extractRolesFromJs(text);
        jsFindings.forEach((f) => {
          (f.roles || []).forEach((role) => {
            const tok = String(role).toLowerCase();
            if (!canonical.has(tok)) {
              report.findings.push({
                file: rel,
                location: "js_roles",
                token: tok,
                value: role,
              });
            }
          });
        });
      }
    } catch (e) {
      // ignore parse errors for unrelated files
    }
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log("Wrote filtered report to", reportPath);
}

main();
