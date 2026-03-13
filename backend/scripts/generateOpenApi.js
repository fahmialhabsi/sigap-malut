/**
 * generateOpenApi.js — SIGAP Malut OpenAPI Generator v2
 *
 * Reads every route file referenced in routes/index.js and every Sequelize
 * model to produce a complete docs/api/openapi.yaml.
 *
 * No manual editing required — re-run after adding routes or models.
 *
 * Usage:  node scripts/generateOpenApi.js
 * NPM:    npm run generate:openapi
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTE_INDEX_PATH = path.resolve(__dirname, "../routes/index.js");
const ROUTES_DIR = path.resolve(__dirname, "../routes");
const MODELS_DIR = path.resolve(__dirname, "../models");
const OUTPUT_PATH = path.resolve(__dirname, "../../docs/api/openapi.yaml");

// ─────────────────────────────────────────────────────────────────────────────
// 1. Parse routes/index.js → {imports, mounts}
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns:
 *   imports  Map<varName, relativeFilePath>  (from import statements)
 *   mounts   Array<{prefix, varName}>        (from app.use calls)
 */
function parseRouteIndex() {
  const src = fs.readFileSync(ROUTE_INDEX_PATH, "utf8");

  const imports = new Map();
  for (const m of src.matchAll(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g)) {
    imports.set(m[1], m[2]);
  }

  const mounts = [];
  for (const m of src.matchAll(/app\.use\(\s*['"]([^'"]+)['"]\s*,\s*(\w+)/g)) {
    mounts.push({ prefix: m[1], varName: m[2] });
  }

  return { imports, mounts };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Parse individual route files
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract every HTTP route definition from a route file.
 * Handles:
 *   - router.get|post|put|delete|patch('/path', ...handlers)
 *   - router.route('/path').get(h).post(h).put(h).delete(h)
 *   - router.use(protect)  marks all routes in file as secured
 *
 * Returns Array<{method, routePath, secured, roles}> or null (file missing).
 */
function parseRouteFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const src = fs.readFileSync(filePath, "utf8");

  const globalProtect = /router\.use\s*\(\s*protect\s*\)/.test(src);
  const routes = [];
  const seen = new Set();

  function add(method, routePath, secured, roles) {
    const key = method + ":" + routePath;
    if (!seen.has(key)) {
      seen.add(key);
      routes.push({
        method: method.toLowerCase(),
        routePath,
        secured,
        roles: roles || [],
      });
    }
  }

  // Pattern A: router.route('/path').get(h).post(h)...
  const routeCallRe = /router\.route\s*\(\s*['"]([^'"]*)['"]\s*\)/g;
  let m;
  while ((m = routeCallRe.exec(src)) !== null) {
    const routePath = m[1];
    const rest = src.slice(m.index);
    const semi = rest.indexOf(";");
    const snippet = semi !== -1 ? rest.slice(0, semi + 1) : rest.slice(0, 300);
    for (const mm of snippet.matchAll(/\.(get|post|put|delete|patch)\s*\(/gi)) {
      add(mm[1], routePath, globalProtect, []);
    }
  }

  // Pattern B: router.METHOD('/path', ...handlers)
  const simpleRe =
    /router\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]*)['"]/gi;
  while ((m = simpleRe.exec(src)) !== null) {
    const method = m[1];
    const routePath = m[2];
    const ctxEnd = src.indexOf(")", m.index + m[0].length);
    const ctx =
      ctxEnd !== -1
        ? src.slice(m.index, ctxEnd + 1)
        : src.slice(m.index, m.index + 400);
    const secured = globalProtect || /\bprotect\b/.test(ctx.slice(m[0].length));
    const roleMatch =
      ctx.match(/authorizeByRole\s*\(\s*['"]([^'"]+)['"]\s*\)/) ||
      ctx.match(/requireRole\s*\(\s*['"]([^'"]+)['"]\s*\)/);
    add(method, routePath, secured, roleMatch ? [roleMatch[1]] : []);
  }

  return routes;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Parse Sequelize model fields for schema generation
// ─────────────────────────────────────────────────────────────────────────────

const DT_MAP = {
  STRING: { type: "string" },
  TEXT: { type: "string" },
  CHAR: { type: "string" },
  INTEGER: { type: "integer", format: "int32" },
  BIGINT: { type: "integer", format: "int64" },
  FLOAT: { type: "number", format: "float" },
  DOUBLE: { type: "number", format: "double" },
  DECIMAL: { type: "number" },
  BOOLEAN: { type: "boolean" },
  DATE: { type: "string", format: "date-time" },
  DATEONLY: { type: "string", format: "date" },
  TIME: { type: "string", format: "time" },
  JSON: { type: "object" },
  JSONB: { type: "object" },
  UUID: { type: "string", format: "uuid" },
  ENUM: { type: "string" },
  ARRAY: { type: "array", items: { type: "string" } },
};

const SKIP_FIELDS = new Set(["id", "createdAt", "updatedAt", "deletedAt"]);

function parseModelFields(modCode) {
  const filePath = path.join(MODELS_DIR, modCode + ".js");
  if (!fs.existsSync(filePath)) return null;
  const src = fs.readFileSync(filePath, "utf8");

  const fields = [];
  // Detect actual field indentation: 2-space (inline define) or 4-space (multi-line define)
  const indentProbe = src.match(
    /^( {2,6})\w+:\s*\{[\s\S]*?type:\s*DataTypes\./m,
  );
  const n = indentProbe ? indentProbe[1].length : 4;
  const fieldRe = new RegExp(
    `^ {${n}}(\\w+):\\s*\\{([\\s\\S]*?)^ {${n}}\\}`,
    "gm",
  );
  let m;
  while ((m = fieldRe.exec(src)) !== null) {
    const name = m[1];
    if (SKIP_FIELDS.has(name)) continue;
    const body = m[2];
    const dtMatch = body.match(/DataTypes\.(\w+)/);
    if (!dtMatch) continue;

    const dt = dtMatch[1].toUpperCase();
    const oasDef = DT_MAP[dt] || { type: "string" };
    const required = /allowNull:\s*false/.test(body);

    let enumValues = null;
    if (dt === "ENUM") {
      const enumCall = body.match(/DataTypes\.ENUM\s*\(([\s\S]*?)\)/);
      if (enumCall) {
        enumValues = [];
        for (const ev of enumCall[1].matchAll(/['"]([^'"]+)['"]/g)) {
          enumValues.push(ev[1]);
        }
      }
    }

    fields.push({ name, ...oasDef, required, enumValues });
  }

  return fields.length > 0 ? fields : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Metadata helpers
// ─────────────────────────────────────────────────────────────────────────────

const PREFIX_TAG = {
  "/api/auth": "Auth",
  "/api/dashboard": "Dashboards",
  "/api/module-generator": "Module Generator",
  "/api/approval": "Workflow",
  "/api/workflow-status": "Workflow",
  "/api/audit-trail": "Workflow",
  "/api/notification": "Collaboration",
  "/api/reminder": "Collaboration",
  "/api/case": "Collaboration",
  "/api/comment": "Collaboration",
  "/api/report": "Collaboration",
  "/api/perintah": "Collaboration",
  "/api/tasks": "Tasks",
  "/api/pegawai": "Master Data",
  "/api/komoditas": "Master Data",
  "/api/modules": "Master Data",
  "/api/chatbot": "AI Assistant",
};

const TAG_ORDER = [
  "System",
  "Dashboards",
  "Auth",
  "Module Generator",
  "Workflow",
  "Collaboration",
  "Tasks",
  "Master Data",
  "AI Assistant",
  "Sekretariat",
  "Bidang Ketersediaan",
  "Bidang Distribusi",
  "Bidang Konsumsi",
  "UPTD",
  "Dynamic Tables",
  "General",
];

function tagForPrefix(prefix) {
  if (PREFIX_TAG[prefix]) return PREFIX_TAG[prefix];
  if (prefix.startsWith("/api/sek-")) return "Sekretariat";
  if (prefix.startsWith("/api/bkt-")) return "Bidang Ketersediaan";
  if (prefix.startsWith("/api/bds-")) return "Bidang Distribusi";
  if (prefix.startsWith("/api/bks-")) return "Bidang Konsumsi";
  if (prefix.startsWith("/api/upt-")) return "UPTD";
  return "General";
}

function moduleCode(prefix) {
  return prefix.replace("/api/", "").toUpperCase();
}
function schemaName(prefix) {
  return prefix.replace("/api/", "").replace(/-/g, "_").toUpperCase();
}

function opSummary(method, routePath, mod) {
  const verbs = {
    get: "Get",
    post: "Create",
    put: "Update",
    delete: "Delete",
    patch: "Patch",
  };
  const verb = verbs[method] || method;
  const label = mod.replace(/-/g, " ");
  if (routePath === "/")
    return method === "get"
      ? "List " + label + " records"
      : "Create " + label + " record";
  if (routePath === "/:id") return verb + " " + label + " by ID";
  const clean = routePath
    .replace(/^\//, "")
    .replace(/:/g, "")
    .replace(/\//g, " ");
  return (verb + " " + label + " " + clean).trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. YAML generation helpers
// ─────────────────────────────────────────────────────────────────────────────

function ys(val) {
  const s = String(val == null ? "" : val);
  if (/[:{}\[\],#&*!|>'"@`]/.test(s) || s.trim() !== s || s === "") {
    return "'" + s.replace(/'/g, "''") + "'";
  }
  return s;
}

function buildOp(summary, tag, secured, roles, hasBody, bodyRef) {
  const L = [];
  L.push("summary: " + ys(summary));
  L.push("tags:");
  L.push("  - " + ys(tag));
  if (roles && roles.length > 0) {
    L.push("x-required-roles:");
    roles.forEach(function (r) {
      L.push("  - " + r);
    });
  }
  if (secured) {
    L.push("security:");
    L.push("  - BearerAuth: []");
  }
  if (hasBody) {
    L.push("requestBody:");
    L.push("  required: true");
    L.push("  content:");
    L.push("    application/json:");
    L.push("      schema:");
    L.push(
      "        $ref: '" +
        (bodyRef || "#/components/schemas/GenericRequest") +
        "'",
    );
  }
  L.push("responses:");
  L.push("  '200':");
  L.push("    description: Success");
  L.push("    content:");
  L.push("      application/json:");
  L.push("        schema:");
  L.push("          $ref: '#/components/schemas/GenericSuccess'");
  L.push("  '400':");
  L.push("    description: Bad request");
  L.push("    content:");
  L.push("      application/json:");
  L.push("        schema:");
  L.push("          $ref: '#/components/schemas/GenericError'");
  L.push("  '401':");
  L.push("    description: Unauthorized");
  L.push("  '403':");
  L.push("    description: Forbidden");
  L.push("  '404':");
  L.push("    description: Not found");
  L.push("  '500':");
  L.push("    description: Internal server error");
  return L;
}

function writePathParams(paramNames, lines, indent) {
  if (!paramNames || paramNames.length === 0) return;
  lines.push(indent + "parameters:");
  paramNames.forEach(function (p) {
    lines.push(indent + "  - name: " + p);
    lines.push(indent + "    in: path");
    lines.push(indent + "    required: true");
    lines.push(indent + "    schema:");
    lines.push(indent + "      type: string");
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Main builder
// ─────────────────────────────────────────────────────────────────────────────

function buildOpenApi() {
  const { imports, mounts } = parseRouteIndex();

  // pathMap: fullOasPath -> Map<httpMethod, opData{summary,tag,secured,roles,hasBody,bodyRef}>
  const pathMap = new Map();
  const usedTags = new Set(["System"]);
  const modSchemas = new Map(); // schemaBaseName -> fields[]

  function registerOp(fullPath, method, opData) {
    if (!pathMap.has(fullPath)) pathMap.set(fullPath, new Map());
    pathMap.get(fullPath).set(method, opData);
    usedTags.add(opData.tag);
  }

  // ── Static system paths ──────────────────────────────────────────────────
  registerOp("/health", "get", {
    summary: "Health check",
    tag: "System",
    secured: false,
  });
  registerOp("/api/test-db", "get", {
    summary: "Database connectivity test",
    tag: "System",
    secured: false,
  });

  // ── Dynamic tables (generic handler) ─────────────────────────────────────
  registerOp("/api/{tableName}/meta", "get", {
    summary: "Get field metadata for a dynamic table",
    tag: "Dynamic Tables",
    secured: true,
  });
  registerOp("/api/{tableName}/export", "get", {
    summary: "Export rows as Excel/CSV",
    tag: "Dynamic Tables",
    secured: true,
  });
  registerOp("/api/{tableName}", "get", {
    summary: "List rows from a dynamic table",
    tag: "Dynamic Tables",
    secured: true,
  });
  registerOp("/api/{tableName}", "post", {
    summary: "Create row in a dynamic table",
    tag: "Dynamic Tables",
    secured: true,
    hasBody: true,
  });
  registerOp("/api/{tableName}/{id}", "get", {
    summary: "Get a single row",
    tag: "Dynamic Tables",
    secured: true,
  });
  registerOp("/api/{tableName}/{id}", "put", {
    summary: "Update a row",
    tag: "Dynamic Tables",
    secured: true,
    hasBody: true,
  });
  registerOp("/api/{tableName}/{id}", "delete", {
    summary: "Delete a row",
    tag: "Dynamic Tables",
    secured: true,
  });
  usedTags.add("Dynamic Tables");

  // ── Parse every mounted route file ───────────────────────────────────────
  for (const { prefix, varName } of mounts) {
    const relPath = imports.get(varName);
    if (!relPath) continue;
    if (varName === "tablesRoutes") continue; // handled above as dynamic tables

    const filePath = path.resolve(
      ROUTES_DIR,
      relPath.replace(/^\.\//, "").replace(/\.js$/, "") + ".js",
    );

    const parsedRoutes = parseRouteFile(filePath);
    const tag = tagForPrefix(prefix);
    const mod = moduleCode(prefix);

    const routesToProcess =
      parsedRoutes && parsedRoutes.length > 0
        ? parsedRoutes
        : [
            { method: "get", routePath: "/", secured: true, roles: [] },
            {
              method: "post",
              routePath: "/",
              secured: true,
              roles: [],
              isBody: true,
            },
            { method: "get", routePath: "/:id", secured: true, roles: [] },
            {
              method: "put",
              routePath: "/:id",
              secured: true,
              roles: [],
              isBody: true,
            },
            { method: "delete", routePath: "/:id", secured: true, roles: [] },
          ];

    for (const r of routesToProcess) {
      const oasPath = r.routePath.replace(/:(\w+)/g, "{$1}");
      const fullPath = prefix + (oasPath === "/" ? "" : oasPath);
      const hasBody = ["post", "put", "patch"].includes(r.method);
      registerOp(fullPath, r.method, {
        summary: opSummary(r.method, r.routePath, mod),
        tag,
        secured: r.secured,
        roles: r.roles || [],
        hasBody: hasBody,
        bodyRef: hasBody
          ? "#/components/schemas/" + schemaName(prefix) + "Request"
          : null,
      });
    }

    // Collect Sequelize model schema
    const fields = parseModelFields(mod);
    if (fields) modSchemas.set(schemaName(prefix), fields);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Assemble YAML
  // ─────────────────────────────────────────────────────────────────────────
  const L = [];

  L.push("openapi: '3.0.3'");
  L.push("info:");
  L.push("  title: SIGAP Malut API");
  L.push("  version: '2.0.0'");
  L.push("  description: |");
  L.push(
    "    Dokumentasi API otomatis — Sistem Informasi Gastronomi dan Pangan Maluku Utara.",
  );
  L.push("    Di-generate dari definisi route Express.js dan model Sequelize.");
  L.push("    Generated: " + new Date().toISOString());
  L.push("  contact:");
  L.push("    name: Dinas Ketahanan Pangan Maluku Utara");

  L.push("servers:");
  L.push("  - url: http://localhost:5000");
  L.push("    description: Local development");
  L.push("  - url: /");
  L.push("    description: Relative (production)");

  L.push("tags:");
  for (const t of TAG_ORDER) {
    if (usedTags.has(t)) L.push("  - name: " + ys(t));
  }

  L.push("paths:");
  for (const [fullPath, methodMap] of pathMap) {
    L.push("  " + fullPath + ":");
    const pathParams = [];
    for (const mm of fullPath.matchAll(/\{(\w+)\}/g)) pathParams.push(mm[1]);
    writePathParams(pathParams, L, "    ");

    for (const [method, opData] of methodMap) {
      L.push("    " + method + ":");
      const opLines = buildOp(
        opData.summary,
        opData.tag,
        opData.secured,
        opData.roles,
        opData.hasBody,
        opData.bodyRef,
      );
      for (const ol of opLines) L.push("      " + ol);
    }
  }

  L.push("components:");
  L.push("  securitySchemes:");
  L.push("    BearerAuth:");
  L.push("      type: http");
  L.push("      scheme: bearer");
  L.push("      bearerFormat: JWT");

  L.push("  schemas:");

  L.push("    GenericSuccess:");
  L.push("      type: object");
  L.push("      properties:");
  L.push("        success:");
  L.push("          type: boolean");
  L.push("          example: true");
  L.push("        data:");
  L.push("          oneOf:");
  L.push("            - type: object");
  L.push("            - type: array");
  L.push("              items: {}");
  L.push("        message:");
  L.push("          type: string");

  L.push("    GenericError:");
  L.push("      type: object");
  L.push("      properties:");
  L.push("        success:");
  L.push("          type: boolean");
  L.push("          example: false");
  L.push("        message:");
  L.push("          type: string");
  L.push("        error:");
  L.push("          type: string");

  L.push("    GenericRequest:");
  L.push("      type: object");
  L.push("      additionalProperties: true");

  L.push("    PaginatedResponse:");
  L.push("      type: object");
  L.push("      properties:");
  L.push("        success:");
  L.push("          type: boolean");
  L.push("        data:");
  L.push("          type: array");
  L.push("          items: {}");
  L.push("        total:");
  L.push("          type: integer");
  L.push("        page:");
  L.push("          type: integer");
  L.push("        limit:");
  L.push("          type: integer");

  // Module schemas derived from Sequelize models
  for (const [sName, fields] of modSchemas) {
    const requiredFields = fields.filter(function (f) {
      return f.required;
    });

    // Request schema (for POST/PUT body)
    L.push("    " + sName + "Request:");
    L.push("      type: object");
    if (requiredFields.length > 0) {
      L.push("      required:");
      requiredFields.forEach(function (f) {
        L.push("        - " + f.name);
      });
    }
    L.push("      properties:");
    for (const f of fields) {
      L.push("        " + f.name + ":");
      L.push("          type: " + f.type);
      if (f.format) L.push("          format: " + f.format);
      if (f.enumValues && f.enumValues.length > 0) {
        L.push("          enum:");
        f.enumValues.forEach(function (ev) {
          L.push("            - " + ys(ev));
        });
      }
    }

    // Response schema (includes id + timestamps)
    L.push("    " + sName + "Response:");
    L.push("      type: object");
    L.push("      properties:");
    L.push("        id:");
    L.push("          type: integer");
    for (const f of fields) {
      L.push("        " + f.name + ":");
      L.push("          type: " + f.type);
      if (f.format) L.push("          format: " + f.format);
      if (f.enumValues && f.enumValues.length > 0) {
        L.push("          enum:");
        f.enumValues.forEach(function (ev) {
          L.push("            - " + ys(ev));
        });
      }
    }
    L.push("        createdAt:");
    L.push("          type: string");
    L.push("          format: date-time");
    L.push("        updatedAt:");
    L.push("          type: string");
    L.push("          format: date-time");
  }

  return L.join("\n") + "\n";
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Entry point
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  const yaml = buildOpenApi();

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, yaml, "utf8");

  const pathCount = (yaml.match(/^  \/[^\s]/gm) || []).length;
  const opCount = (yaml.match(/^    (get|post|put|delete|patch):/gm) || [])
    .length;
  const schemaCount = (yaml.match(/^    \w[\w_]+:/gm) || []).length;

  console.log("OpenAPI YAML generated: " + OUTPUT_PATH);
  console.log(
    "Paths: " +
      pathCount +
      "  |  Operations: " +
      opCount +
      "  |  Schemas: " +
      schemaCount,
  );
}

main();
