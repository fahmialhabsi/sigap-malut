// scripts/check-workflows-api.ts
// CLI checker for workflows API endpoints and cross-institution authorization
// Usage: npx ts-node scripts/check-workflows-api.ts [--json] [--verbose]
// Dependencies: ts-morph, glob, minimist, chalk

import { Project, SyntaxKind } from "ts-morph";
import * as path from "path";
import * as fs from "fs";
import { glob } from "glob";
import minimist from "minimist";
import chalk from "chalk";

// --- Config ---
const ROUTE_PATTERNS = [
  "/api/workflows",
  "/api/workflows/:id",
  "/api/workflows/:id/transition",
  "/api/workflows/:id/transitions",
];
const EXPECTED_ENDPOINTS = [
  { path: "/api/workflows", method: "GET" },
  { path: "/api/workflows", method: "POST" },
  { path: "/api/workflows/:id", method: "GET" },
  { path: "/api/workflows/:id", method: "PUT" },
  { path: "/api/workflows/:id/transition", method: "POST" },
  { path: "/api/workflows/:id/transitions", method: "GET" },
];
const AUTH_MIDDLEWARE_NAMES = [
  "ensureScope",
  "requireScope",
  "authorize",
  "canOperateOnInstitution",
  "isSystemAdmin",
  "checkRoles",
  "verifyServiceToken",
  "auth",
  "authMiddleware",
];
const CROSS_INST_KEYWORDS = [
  "workflows:cross-institution",
  "trusted_internal_service",
  "isSystemAdmin",
  "canOperateOnInstitution",
  "req.user",
  "req.user.roles",
  "req.user.institutions",
];

// --- CLI Args ---
const argv = minimist(process.argv.slice(2));
const VERBOSE = !!argv.verbose;
const OUTPUT_JSON = !!argv.json;

// --- Helpers ---

function logInfo(msg: string) {
  if (!OUTPUT_JSON) console.log(chalk.cyan(msg));
}
function logWarn(msg: string) {
  if (!OUTPUT_JSON) console.log(chalk.yellow(msg));
}
function logError(msg: string) {
  if (!OUTPUT_JSON) console.log(chalk.red(msg));
}
function logOk(msg: string) {
  if (!OUTPUT_JSON) console.log(chalk.green(msg));
}

function normalizePath(p: string) {
  return p.replace(/:[^/]+/g, ":id").replace(/\\/g, "/");
}

function detectStack(): "node" | "rails" | "django" | "unknown" {
  if (fs.existsSync("package.json")) return "node";
  if (fs.existsSync("Gemfile")) return "rails";
  if (fs.existsSync("manage.py") || fs.existsSync("requirements.txt"))
    return "django";
  return "unknown";
}

// --- Main Checker for Node/Express/TS ---
async function checkNodeExpressTS() {
  // Cari file route di backend/routes/ dan scripts/
  const routeFiles = [
    ...glob.sync("backend/routes/**/*.{ts,js}", {
      ignore: "node_modules/**",
    }),
    ...glob.sync("scripts/**/*routes*.{ts,js}", {
      ignore: "node_modules/**",
    }),
    ...glob.sync("**/*routes*.{ts,js}", { ignore: "node_modules/**" }),
  ];
  // Debug: tampilkan file route yang ditemukan
  if (!OUTPUT_JSON) {
    console.log("Route files found:", routeFiles);
  }
  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
    skipAddingFilesFromTsConfig: false,
  });
  const endpoints: any[] = [];
  const authChecks: any[] = [];
  let dataModelHints: string[] = [];
  let crossInstitutionSupportDetected = false;
  let recommendations: string[] = [];
  let missingEndpoints: any[] = [];

  // Map controller file jika ada import di workflows.js
  let controllerFile = null;
  for (const file of routeFiles) {
    if (file.endsWith("workflows.js")) {
      const content = fs.readFileSync(file, "utf-8");
      const importMatch = content.match(
        /import\s+\*\s+as\s+([a-zA-Z0-9_]+)\s+from\s+["'](\.\.\/controllers\/[^"']+)["']/,
      );
      if (importMatch) {
        controllerFile = importMatch[2].replace(/\.js$/, "") + ".js";
        if (!controllerFile.startsWith("backend/controllers/")) {
          controllerFile =
            "backend/controllers/" + controllerFile.split("../controllers/")[1];
        }
      }
    }
  }

  // Deteksi endpoint dari file route workflows.js
  for (const file of routeFiles) {
    if (file.endsWith("workflows.js")) {
      const content = fs.readFileSync(file, "utf-8");
      // Regex untuk deteksi router.METHOD(path, middleware..., handler)
      const routeRegex = /router\.(get|post|put|delete|patch)\(([^\)]+)\)/g;
      let match;
      while ((match = routeRegex.exec(content)) !== null) {
        // Ambil argumen di dalam (...)
        const args = match[2]
          .split(",")
          .map((s) => s.trim().replace(/^['"`]|['"`]$/g, ""));
        const method = match[1].toUpperCase();
        const path = args[0];
        const middlewares = args.slice(1, -1);
        const handler = args[args.length - 1];
        endpoints.push({
          method,
          path,
          file,
          middlewares,
          handlerIdentifier: handler,
          line: content.substring(0, match.index).split("\n").length,
        });
      }
    }
  }
  // Cek endpoint yang missing
  for (const exp of EXPECTED_ENDPOINTS) {
    if (
      !endpoints.find(
        (e) =>
          e.method === exp.method &&
          normalizePath(e.path) === normalizePath(exp.path),
      )
    ) {
      missingEndpoints.push(exp);
    }
  }

  // Deteksi cross-institution support di workflows.js
  for (const file of routeFiles) {
    if (file.endsWith("workflows.js")) {
      const content = fs.readFileSync(file, "utf-8");
      if (
        content.includes("cross-institution") ||
        content.includes("target_institution_id")
      ) {
        crossInstitutionSupportDetected = true;
        break;
      }
    }
  }
  // Jika belum terdeteksi, cek di controller
  if (
    !crossInstitutionSupportDetected &&
    controllerFile &&
    fs.existsSync(controllerFile)
  ) {
    const ctrlContent = fs.readFileSync(controllerFile, "utf-8");
    if (
      ctrlContent.includes("cross-institution") ||
      ctrlContent.includes("target_institution_id")
    ) {
      crossInstitutionSupportDetected = true;
    }
  }

  // Compose report
  const report = {
    endpoints,
    authChecks,
    dataModelHints,
    crossInstitutionSupportDetected,
    recommendations,
  };

  // Output
  if (OUTPUT_JSON) {
    // Tulis langsung ke file report.json
    fs.writeFileSync("report.json", JSON.stringify(report, null, 2), "utf-8");
  } else {
    for (const ep of endpoints) {
      logOk(
        `[FOUND] ${ep.method} ${ep.path} -> ${ep.file}:${ep.line} -> handler: ${ep.handlerIdentifier}`,
      );
    }
    for (const miss of missingEndpoints) {
      logWarn(`[MISSING] ${miss.method} ${miss.path}`);
    }
    if (crossInstitutionSupportDetected) {
      logOk("Cross-institution support detected.");
    } else {
      logWarn("Cross-institution support NOT detected.");
    }
    if (recommendations.length) {
      logWarn("Recommendations:");
      for (const rec of recommendations) logWarn(`- ${rec}`);
    }
  }

  // Exit code
  if (missingEndpoints.length) return 2;
  if (!crossInstitutionSupportDetected) return 3;
  return 0;
}

// Jalankan fungsi utama jika file ini dieksekusi langsung
(async () => {
  try {
    const exitCode = await checkNodeExpressTS();
    process.exit(exitCode);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
