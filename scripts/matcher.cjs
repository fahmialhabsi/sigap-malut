"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractRequirementsFromYamlFrontMatter = extractRequirementsFromYamlFrontMatter;
exports.validateTableFieldsWithMasterData = validateTableFieldsWithMasterData;
exports.fuzzyMatch = fuzzyMatch;
exports.detectRouteInSource = detectRouteInSource;
exports.parseMarkdownTables = parseMarkdownTables;
exports.extractRequirementsFromMarkdownContent = extractRequirementsFromMarkdownContent;
// Parser YAML front-matter (menggunakan gray-matter)
function extractRequirementsFromYamlFrontMatter(data) {
    var requirements = [];
    if (!data || typeof data !== "object")
        return requirements;
    // Contoh: ambil semua key-value sebagai requirement
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            requirements.push({
                type: "yaml-front-matter",
                name: key,
                value: data[key],
            });
        }
    }
    return requirements;
}
var fs = require("fs");
var path = require("path");
var sync_1 = require("csv-parse/sync");
// Validasi field tabel Markdown ke master-data CSV
function validateTableFieldsWithMasterData(tableHeaders, tableRows, modulId) {
    // Cari file CSV master-data berdasarkan modulId
    var csvPath = path.resolve(__dirname, "../master-data/FIELDS/FIELDS_".concat(modulId, ".csv"));
    var csvFields = [];
    try {
        var csvContent = fs.readFileSync(csvPath, "utf8");
        var records = (0, sync_1.parse)(csvContent, {
            columns: true,
            skip_empty_lines: true,
        });
        csvFields = Array.isArray(records)
            ? records.map(function (r) { return r.field_name; })
            : [];
    }
    catch (e) {
        return { error: "Master-data CSV not found for ".concat(modulId) };
    }
    // Validasi setiap field dari tabel Markdown
    var evidence = [];
    tableRows.forEach(function (row) {
        var field = row[0]; // Asumsi kolom pertama adalah field_name
        if (field && !csvFields.includes(field)) {
            evidence.push({
                field: field,
                status: "NOT_FOUND",
                message: "Field '".concat(field, "' tidak ditemukan di master-data CSV modul ").concat(modulId),
            });
        }
    });
    return evidence;
}
// Fuzzy match: Levenshtein distance sederhana
function fuzzyMatch(a, b, threshold) {
    if (threshold === void 0) { threshold = 2; }
    if (a === b)
        return true;
    // Levenshtein distance
    var matrix = Array(a.length + 1)
        .fill(null)
        .map(function () { return Array(b.length + 1).fill(null); });
    for (var i = 0; i <= a.length; i++)
        matrix[i][0] = i;
    for (var j = 0; j <= b.length; j++)
        matrix[0][j] = j;
    for (var i = 1; i <= a.length; i++) {
        for (var j = 1; j <= b.length; j++) {
            var cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
        }
    }
    return matrix[a.length][b.length] <= threshold;
}
// Detect route in source code (regex sederhana)
function detectRouteInSource(source, route) {
    // Contoh: route '/api/data' akan dicari di source
    var regex = new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return regex.test(source);
}
// Tambahan: parser tabel Markdown
function parseMarkdownTables(content) {
    var tables = [];
    var lines = content.split("\n");
    var i = 0;
    while (i < lines.length) {
        // Cari header tabel (baris dengan | dan tanpa ---)
        if (lines[i].trim().startsWith("|") &&
            lines[i + 1] &&
            lines[i + 1].includes("---")) {
            // Parsing header
            var headers = lines[i]
                .split("|")
                .map(function (h) { return h.trim(); })
                .filter(function (h) { return h; });
            i += 2; // skip header dan separator
            var rows = [];
            while (i < lines.length && lines[i].trim().startsWith("|")) {
                var row = lines[i]
                    .split("|")
                    .map(function (r) { return r.trim(); })
                    .filter(function (r) { return r; });
                while (row.length < headers.length)
                    row.push("");
                if (row.length === headers.length)
                    rows.push(row);
                i++;
            }
            // Filter type tabel
            var type = "other";
            var headerStr = headers.join(",").toLowerCase();
            if (headerStr.includes("entitas") && headerStr.includes("field"))
                type = "entitas";
            else if (headerStr.includes("role") && headerStr.includes("modul"))
                type = "role-mapping";
            else if (headerStr.includes("status") && headerStr.includes("workflow"))
                type = "workflow";
            else if (headerStr.includes("mapping"))
                type = "mapping";
            tables.push({ headers: headers, rows: rows, type: type });
        }
        else {
            i++;
        }
    }
    return tables;
}
// scripts/matcher.ts
function extractRequirementsFromMarkdownContent(content) {
    var requirements = [];
    // Deteksi permission
    if (content.match(/workflow:read/)) {
        requirements.push({ type: "permission", name: "workflow:read" });
    }
    // Heading parser: ##, ###, dst, dengan tag [KPI], [TODO], dsb
    var headingRegex = /^\s*(#{1,6})\s+(.+)$/gm;
    var match;
    while ((match = headingRegex.exec(content)) !== null) {
        // Deteksi tag di heading
        var tagMatch = match[2].match(/\[(\w+)\]/);
        requirements.push({
            type: "heading",
            level: match[1].length,
            text: match[2].replace(/\[(\w+)\]/, '').trim(),
            tag: tagMatch ? tagMatch[1] : undefined,
        });
    }
    // Numbered list: 1. 2. 3.
    var numberedRegex = /^\s*\d+\.\s+(.+)$/gm;
    while ((match = numberedRegex.exec(content)) !== null) {
        requirements.push({ type: "numbered", text: match[1].trim() });
    }
    // Checklist: - [ ] atau - [x]
    var checklistRegex = /^\s*[-*+]\s+\[( |x|X)\]\s+(.+)$/gm;
    while ((match = checklistRegex.exec(content)) !== null) {
        requirements.push({
            type: "checklist",
            checked: match[1].toLowerCase() === "x",
            text: match[2].trim(),
        });
    }
    // Bullet & sub-bullet: -, *, +, indentasi
    var bulletRegex = /^\s*([-*+])\s+(.+)$/gm;
    while ((match = bulletRegex.exec(content)) !== null) {
        // Deteksi sub-bullet (indentasi)
        var indentMatch = match.input.substring(0, match.index).match(/\s*$/);
        var indent = indentMatch ? indentMatch[0].length : 0;
        requirements.push({
            type: "bullet",
            text: match[2].trim(),
            indent: indent,
        });
    }
    return requirements;
}
