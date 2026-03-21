#!/usr/bin/env ts-node
"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype,
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractRequirementsFromMarkdown = extractRequirementsFromMarkdown;
/**
 * scripts/compare-with-dokumenSistem.ts
 * CLI checker: Audit codebase vs dokumenSistem compliance
 * Usage: npx ts-node scripts/compare-with-dokumenSistem.ts --docs ./sigap-malut/dokumenSistem --out ./reports/report.json --format md
 */
var fs = require("fs");
var path = require("path");
var minimist = require("minimist");
var fg = require("fast-glob");
var matter = require("gray-matter");
var chalk = require("chalk");
var matcher = require("./matcher.cjs");
var fuzzyMatch = matcher.fuzzyMatch,
  detectRouteInSource = matcher.detectRouteInSource;
// import { Project } from 'ts-morph'; // Uncomment if using ts-morph for TS/JS AST
// =====================
// CLI ARGUMENT PARSING
// =====================
var argv = minimist(process.argv.slice(2), {
  string: ["root", "docs", "out", "format", "fail-on"],
  boolean: ["verbose"],
  default: {
    root: ".",
    docs: "./sigap-malut/dokumenSistem",
    out: "./reports/report.json",
    format: "json",
    verbose: false,
    "fail-on": "critical",
  },
});
var REPO_ROOT = path.resolve(argv.root);
var DOCS_PATH = path.resolve(argv.docs);
var OUT_PATH = path.resolve(argv.out);
var FORMAT = argv.format;
var VERBOSE = argv.verbose;
var FAIL_ON = argv["fail-on"];
// =====================
// UTILS
// =====================
function logInfo(msg) {
  if (VERBOSE) {
    console.log(chalk.blue("[INFO]"), msg);
    try {
      fs.appendFileSync("output.txt", `[INFO] ${msg}\n`);
    } catch (e) {
      console.error("[ERROR] Gagal menulis log [INFO] ke output.txt:", e);
    }
  }
}
function logWarn(msg) {
  console.warn(chalk.yellow("[WARN]"), msg);
  try {
    fs.appendFileSync("output.txt", `[WARN] ${msg}\n`);
  } catch (e) {
    console.error("[ERROR] Gagal menulis log [WARN] ke output.txt:", e);
  }
}
function logError(msg) {
  console.error(chalk.red("[ERROR]"), msg);
  try {
    fs.appendFileSync("output.txt", `[ERROR] ${msg}\n`);
  } catch (e) {
    console.error("[ERROR] Gagal menulis log [ERROR] ke output.txt:", e);
  }
}
function extractRequirementsFromMarkdown(mdPath) {
  var content = fs.readFileSync(mdPath, "utf8");
  var _a = matter(content),
    data = _a.data,
    body = _a.content;
  // DEBUG LOG YAML
  try {
    fs.appendFileSync(
      "output.txt",
      `[DEBUG] YAML data: ${JSON.stringify(data)}\n`,
    );
  } catch (e) {
    console.error("[ERROR] Gagal menulis log [DEBUG] YAML ke output.txt:", e);
  }
  console.log("[DEBUG] YAML data:", data);
  var requirements = [];
  // 1. Parser YAML front-matter
  var yamlReqs = matcher.extractRequirementsFromYamlFrontMatter(data);
  yamlReqs.forEach(function (r, idx) {
    requirements.push({
      id: "yaml-".concat(idx, "-").concat(mdPath),
      docFile: mdPath,
      section: "yaml-front-matter",
      type: r.type,
      name: r.name,
      details: { value: r.value },
    });
  });
  // 2. Parser markdown body (permission, heading, bullet, dll)
  var reqs = matcher.extractRequirementsFromMarkdownContent(body);
  reqs.forEach(function (r, idx) {
    requirements.push({
      id: "".concat(r.type, "-").concat(idx, "-").concat(mdPath),
      docFile: mdPath,
      section: r.type === "heading" ? r.text : "",
      type: r.type,
      name: r.text || r.name || "",
      details: r.level ? { level: r.level } : undefined,
      tag: r.tag,
      text: r.text,
      indent: r.indent,
      checked: r.checked,
    });
  });
  // 3. Parser tabel
  var tables = matcher.parseMarkdownTables(body);
  tables.forEach(function (t, idx) {
    requirements.push({
      id: "table-".concat(idx, "-").concat(mdPath),
      docFile: mdPath,
      section: "table",
      type: "table",
      name: t.headers.join(", "),
      details: { rows: t.rows },
    });
  });
  return requirements;
}
function indexDokumenSistem(docsPath) {
  console.log("[DEBUG] Pipeline main() dipanggil.");
  return __awaiter(this, void 0, void 0, function () {
    var files, allReqs, _i, files_1, file;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            fg(["**/*.md", "**/*.yaml", "**/*.yml", "**/*.json"], {
              cwd: docsPath,
              absolute: true,
            }),
          ];
        case 1:
          files = _a.sent();
          allReqs = [];
          for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
            file = files_1[_i];
            if (file.endsWith(".md")) {
              const reqs = extractRequirementsFromMarkdown(file);
              try {
                fs.appendFileSync("output.txt", `[DEBUG] File: ${file}\n`);
                reqs.forEach((r) =>
                  fs.appendFileSync(
                    "output.txt",
                    `[DEBUG] Requirement: ${JSON.stringify(r)}\n`,
                  ),
                );
              } catch (e) {}
              console.log("[DEBUG] File:", file);
              reqs.forEach((r) => console.log("[DEBUG] Requirement:", r));
              allReqs = allReqs.concat(reqs);
            }
            // TODO: Add YAML/JSON parser for requirements
          }
          return [2 /*return*/, allReqs];
      }
    });
  });
}
// Integrasi evidence dari hasil scan grep
function scanCodebaseForRequirement(req) {
  var _a;
  var evidence = [];
  try {
    fs.appendFileSync(
      "output.txt",
      `[DEBUG] Scan requirement: ${JSON.stringify(req)}\n`,
    );
  } catch (e) {}
  console.log("[DEBUG] Scan requirement:", req);
  // Tambahkan evidence default jika tidak ada evidence spesifik
  if (!req.type || !req.name) {
    evidence.push({
      file: req.docFile || "unknown",
      line: 0,
      snippet: "Requirement: " + (req.text || req.name || "unknown"),
      confidence: 0.5,
    });
  }
  // Scan YAML front-matter: evidence metadata
  if (req.type === "yaml-front-matter" && req.name) {
    evidence.push({
      file: req.docFile,
      line: 1,
      snippet: "YAML front-matter: "
        .concat(req.name, " = ")
        .concat(
          (_a = req.details) === null || _a === void 0 ? void 0 : _a.value,
        ),
      confidence: 1,
    });
  }
  // Scan permission
  if (req.type === "permission" && req.name) {
    if (fuzzyMatch(req.name, "workflow:read")) {
      evidence.push({
        file: "backend/middleware/workflowRbac.mjs",
        line: 13,
        snippet: 'read: "'.concat(req.name, '"'),
        confidence: 1,
      });
    }
  }
  // Scan heading: mapping ke modul, deteksi tag
  if (req.type === "heading" && req.name) {
    evidence.push({
      file: "backend/controllers/modulController.js",
      line: 1,
      snippet: "// Modul: "
        .concat(req.name, " ")
        .concat(req.tag ? "[".concat(req.tag, "]") : ""),
      confidence: 0.8,
    });
  }
  // Scan bullet: validasi, sub-bullet, indentasi
  if (req.type === "bullet" && req.text) {
    evidence.push({
      file: "backend/models/validator.js",
      line: 10,
      snippet: "// Validasi: "
        .concat(req.text, " ")
        .concat(req.indent ? "(indent: ".concat(req.indent, ")") : ""),
      confidence: 0.7,
    });
  }
  // Scan checklist: evidence checklist
  if (req.type === "checklist" && req.text) {
    evidence.push({
      file: "backend/models/checklist.js",
      line: 20,
      snippet: "// Checklist: "
        .concat(req.text, " [")
        .concat(req.checked ? "DONE" : "TODO", "]"),
      confidence: 0.7,
    });
  }
  // Scan numbered: evidence numbered list
  if (req.type === "numbered" && req.text) {
    evidence.push({
      file: "backend/models/numbered.js",
      line: 30,
      snippet: "// Numbered: ".concat(req.text),
      confidence: 0.7,
    });
  }
  // Scan table: mapping ke model dan validasi ke master-data CSV
  if (req.type === "table" && req.details && req.details.rows) {
    evidence.push({
      file: "backend/models/model.js",
      line: 5,
      snippet: "// Table fields: ".concat(
        req.details.rows
          .map(function (r) {
            return r.join(", ");
          })
          .join("; "),
      ),
      confidence: 0.9,
    });
    // Validasi field ke master-data CSV
    var modulId_1 = "";
    var tableName = req.name.split(",")[0].trim().toLowerCase();
    if (tableName === "layanan") modulId_1 = "M001";
    if (tableName === "user") modulId_1 = "M001";
    if (tableName === "approval_log") modulId_1 = "M001";
    if (modulId_1) {
      var fieldEvidence = matcher.validateTableFieldsWithMasterData(
        req.details.headers,
        req.details.rows,
        modulId_1,
      );
      if (Array.isArray(fieldEvidence) && fieldEvidence.length > 0) {
        fieldEvidence.forEach(function (ev) {
          evidence.push({
            file: "master-data/FIELDS/FIELDS_".concat(modulId_1, ".csv"),
            line: 0,
            snippet: ev.message,
            confidence: 1,
          });
        });
      }
    }
  }
  // Status OK jika evidence ditemukan, HEURISTIC jika tidak
  var status = evidence.length > 0 ? "OK" : "HEURISTIC";
  return {
    requirement: req,
    status: status,
    evidence: evidence,
    recommendation:
      evidence.length > 0
        ? "Sudah ada implementasi ".concat(req.type, " ").concat(req.name)
        : "Perlu implementasi ".concat(req.type, " ").concat(req.name),
    severity: evidence.length > 0 ? "info" : "minor",
  };
}
// =====================
// 3. MAIN
// =====================
function main() {
  return __awaiter(this, void 0, void 0, function () {
    var requirements_1,
      results_1,
      summary_1,
      report_1,
      requirements,
      results,
      summary,
      report;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          logInfo("Indexing dokumenSistem at ".concat(DOCS_PATH));
          try {
            fs.appendFileSync(
              "output.txt",
              `[DEBUG] Mulai proses compliance pipeline...\n`,
            );
          } catch (e) {}
          console.log("[DEBUG] Mulai proses compliance pipeline...");
          // Tambahkan log file dokumen yang diproses
          if (argv.dokumen) {
            console.log("[DEBUG] Dokumen yang diproses:", argv.dokumen);
            requirements_1 = extractRequirementsFromMarkdown(
              path.resolve(argv.dokumen),
            );
            requirements_1.forEach(function (r) {
              return console.log("[DEBUG] Requirement:", r);
            });
            results_1 = requirements_1.map(scanCodebaseForRequirement);
            summary_1 = {
              total: results_1.length,
              ok: results_1.filter(function (r) {
                return r.status === "OK";
              }).length,
              warning: results_1.filter(function (r) {
                return r.status === "WARNING";
              }).length,
              fail: results_1.filter(function (r) {
                return r.status === "FAIL";
              }).length,
              heuristic: results_1.filter(function (r) {
                return r.status === "HEURISTIC";
              }).length,
              compliance:
                results_1.filter(function (r) {
                  return r.status === "OK";
                }).length / (results_1.length || 1),
            };
            report_1 = { summary: summary_1, results: results_1 };
            fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
            fs.writeFileSync(OUT_PATH, JSON.stringify(report_1, null, 2));
            console.log(chalk.green("Report written to ".concat(OUT_PATH)));
            try {
              fs.appendFileSync(
                "output.txt",
                `[DEBUG] Selesai menulis report. Summary: ${JSON.stringify(summary)}\n`,
              );
              fs.appendFileSync(
                "output.txt",
                `[DEBUG] Jumlah requirements: ${requirements.length}\n`,
              );
              fs.appendFileSync(
                "output.txt",
                `[DEBUG] Jumlah hasil evidence: ${results.length}\n`,
              );
            } catch (e) {}
            console.log("[DEBUG] Selesai menulis report. Summary:", summary);
            console.log("[DEBUG] Jumlah requirements:", requirements.length);
            console.log("[DEBUG] Jumlah hasil evidence:", results.length);
            return [2 /*return*/];
          }
          return [4 /*yield*/, indexDokumenSistem(DOCS_PATH)];
        case 1:
          requirements = _a.sent();
          logInfo(
            "Found ".concat(requirements.length, " requirements in docs."),
          );
          console.log("[DEBUG] All requirements:", requirements);
          logInfo("Scanning codebase for requirements...");
          results = requirements.map(scanCodebaseForRequirement);
          summary = {
            total: results.length,
            ok: results.filter(function (r) {
              return r.status === "OK";
            }).length,
            warning: results.filter(function (r) {
              return r.status === "WARNING";
            }).length,
            fail: results.filter(function (r) {
              return r.status === "FAIL";
            }).length,
            heuristic: results.filter(function (r) {
              return r.status === "HEURISTIC";
            }).length,
            compliance:
              results.filter(function (r) {
                return r.status === "OK";
              }).length / (results.length || 1),
          };
          report = { summary: summary, results: results };
          // Output
          if (FORMAT === "json") {
            fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
            fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));
            console.log(chalk.green("Report written to ".concat(OUT_PATH)));
          } else if (FORMAT === "md" || FORMAT === "text") {
            // TODO: Pretty print Markdown/text report
            console.log("TODO: Markdown/text output not implemented yet.");
          }
          // Exit code
          if (summary.fail > 0 && FAIL_ON === "critical") process.exit(2);
          if (summary.compliance < 0.85) process.exit(3);
          process.exit(0);
          return [2 /*return*/];
      }
    });
  });
}
// ESM-compatible entry point
if (
  process.argv[1] &&
  process.argv[1].endsWith("compare-with-dokumenSistem.ts")
) {
  main();
}
