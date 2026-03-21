#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * scripts/generate-fix-suggestions.ts
 * CLI: Generate fix suggestions based on compliance report
 * Usage: npx ts-node scripts/generate-fix-suggestions.ts --report ./reports/report.json --out ./reports/fix-suggestions.json --format json
 */
var fs = require("fs");
var path = require("path");
var minimist = require("minimist");
var chalk_1 = require("chalk");
var argv = minimist(process.argv.slice(2), {
    string: ["report", "out", "format"],
    boolean: ["verbose"],
    default: {
        report: "./reports/report.json",
        out: "./reports/fix-suggestions.json",
        format: "json",
        verbose: false,
    },
});
var REPORT_PATH = path.resolve(argv.report);
var OUT_PATH = path.resolve(argv.out);
var FORMAT = argv.format;
var VERBOSE = argv.verbose;
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
function generateFixSuggestions(report) {
    var suggestions = report.results
        .filter(function (r) { return r.status !== "OK"; })
        .map(function (r) { return ({
        requirement: r.requirement,
        severity: r.severity,
        suggestion: r.recommendation || "Perbaiki requirement: ".concat(r.requirement.name),
        evidence: r.evidence,
    }); });
    return suggestions;
}
function main() {
    logInfo("Membaca report dari ".concat(REPORT_PATH));
    if (!fs.existsSync(REPORT_PATH)) {
        logError("Report tidak ditemukan: ".concat(REPORT_PATH));
        process.exit(1);
    }
    var report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"));
    var suggestions = generateFixSuggestions(report);
    if (FORMAT === "json") {
        fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
        fs.writeFileSync(OUT_PATH, JSON.stringify(suggestions, null, 2));
        console.log(chalk_1.default.green("Fix suggestions ditulis ke ".concat(OUT_PATH)));
    }
    else {
        // TODO: Tambahkan output format lain jika diperlukan
        console.log(suggestions);
    }
}
if (import.meta.url === "file://".concat(process.argv[1]) || import.meta.url.endsWith("generate-fix-suggestions.js")) {
    main();
}
