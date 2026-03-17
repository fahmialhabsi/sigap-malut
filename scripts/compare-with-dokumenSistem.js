#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var chalk_1 = require("chalk");
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
    if (VERBOSE)
        console.log(chalk_1.default.blue("[INFO]"), msg);
}
function logWarn(msg) {
    console.warn(chalk_1.default.yellow("[WARN]"), msg);
}
function logError(msg) {
    console.error(chalk_1.default.red("[ERROR]"), msg);
}
function extractRequirementsFromMarkdown(mdPath) {
    var content = fs.readFileSync(mdPath, "utf8");
    var _a = matter(content), data = _a.data, body = _a.content;
    var requirements = [];
    // TODO: Parse YAML front-matter for structured requirements
    // TODO: Parse tables and bullet lists for endpoints, entities, permissions, etc.
    // TODO: Use regex/heuristics for section headers and key phrases
    // Example: extract endpoints from /api/... patterns
    // Example: extract permission strings like 'workflow:read'
    // Example: extract entity names from tables
    // For now, placeholder:
    if (body.match(/workflow:read/)) {
        requirements.push({
            id: "perm-workflow-read",
            docFile: mdPath,
            section: "RBAC",
            type: "permission",
            name: "workflow:read",
        });
    }
    // ...add more extraction logic here
    return requirements;
}
function indexDokumenSistem(docsPath) {
    var files = fg.sync(["**/*.md", "**/*.yaml", "**/*.yml", "**/*.json"], {
        cwd: docsPath,
        absolute: true,
    });
    var allReqs = [];
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        if (file.endsWith(".md")) {
            allReqs = allReqs.concat(extractRequirementsFromMarkdown(file));
        }
        // TODO: Add YAML/JSON parser for requirements
    }
    return allReqs;
}
function scanCodebaseForRequirement(req) {
    // TODO: Use AST/regex/grep to find evidence in codebase
    // Placeholder: always HEURISTIC
    return {
        requirement: req,
        status: "HEURISTIC",
        evidence: [],
        recommendation: "TODO: Implement codebase scan",
        severity: "minor",
    };
}
// =====================
// 3. MAIN
// =====================
function main() {
    logInfo("Indexing dokumenSistem at ".concat(DOCS_PATH));
    var requirements = indexDokumenSistem(DOCS_PATH);
    logInfo("Found ".concat(requirements.length, " requirements in docs."));
    logInfo("Scanning codebase for requirements...");
    var results = requirements.map(scanCodebaseForRequirement);
    // TODO: Compute compliance summary, dashboard, etc.
    var summary = {
        total: results.length,
        ok: results.filter(function (r) { return r.status === "OK"; }).length,
        warning: results.filter(function (r) { return r.status === "WARNING"; }).length,
        fail: results.filter(function (r) { return r.status === "FAIL"; }).length,
        heuristic: results.filter(function (r) { return r.status === "HEURISTIC"; }).length,
        compliance: results.filter(function (r) { return r.status === "OK"; }).length / (results.length || 1),
    };
    var report = { summary: summary, results: results };
    // Output
    if (FORMAT === "json") {
        fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
        fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));
        console.log(chalk_1.default.green("Report written to ".concat(OUT_PATH)));
    }
    else if (FORMAT === "md" || FORMAT === "text") {
        // TODO: Pretty print Markdown/text report
        console.log("TODO: Markdown/text output not implemented yet.");
    }
    // Exit code
    if (summary.fail > 0 && FAIL_ON === "critical")
        process.exit(2);
    if (summary.compliance < 0.85)
        process.exit(3);
    process.exit(0);
}
if (require.main === module) {
    main();
}
// TODO: Implement full extraction, codebase scan, evidence collection, and markdown output.
// TODO: Add logging, config, and more detailed matching heuristics.
