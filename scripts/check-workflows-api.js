"use strict";
// scripts/check-workflows-api.ts
// CLI checker for workflows API endpoints and cross-institution authorization
// Usage: npx ts-node scripts/check-workflows-api.ts [--json] [--verbose]
// Dependencies: ts-morph, glob, minimist, chalk
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ts_morph_1 = require("ts-morph");
var fs = require("fs");
var glob_1 = require("glob");
var minimist_1 = require("minimist");
var chalk_1 = require("chalk");
// --- Config ---
var ROUTE_PATTERNS = [
    "/api/workflows",
    "/api/workflows/:id",
    "/api/workflows/:id/transition",
    "/api/workflows/:id/transitions",
];
var EXPECTED_ENDPOINTS = [
    { path: "/api/workflows", method: "GET" },
    { path: "/api/workflows", method: "POST" },
    { path: "/api/workflows/:id", method: "GET" },
    { path: "/api/workflows/:id", method: "PUT" },
    { path: "/api/workflows/:id/transition", method: "POST" },
    { path: "/api/workflows/:id/transitions", method: "GET" },
];
var AUTH_MIDDLEWARE_NAMES = [
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
var CROSS_INST_KEYWORDS = [
    "workflows:cross-institution",
    "trusted_internal_service",
    "isSystemAdmin",
    "canOperateOnInstitution",
    "req.user",
    "req.user.roles",
    "req.user.institutions",
];
// --- CLI Args ---
var argv = (0, minimist_1.default)(process.argv.slice(2));
var VERBOSE = !!argv.verbose;
var OUTPUT_JSON = !!argv.json;
// --- Helpers ---
function logInfo(msg) {
    if (!OUTPUT_JSON)
        console.log(chalk_1.default.cyan(msg));
}
function logWarn(msg) {
    if (!OUTPUT_JSON)
        console.log(chalk_1.default.yellow(msg));
}
function logError(msg) {
    if (!OUTPUT_JSON)
        console.log(chalk_1.default.red(msg));
}
function logOk(msg) {
    if (!OUTPUT_JSON)
        console.log(chalk_1.default.green(msg));
}
function normalizePath(p) {
    return p.replace(/:[^/]+/g, ":id").replace(/\\/g, "/");
}
// --- Stack Detection ---
function detectStack() {
    if (fs.existsSync("package.json"))
        return "node";
    if (fs.existsSync("Gemfile"))
        return "rails";
    if (fs.existsSync("manage.py") || fs.existsSync("requirements.txt"))
        return "django";
    return "unknown";
}
// --- Main Checker for Node/Express/TS ---
function checkNodeExpressTS() {
    return __awaiter(this, void 0, void 0, function () {
        var project, routeFiles, endpoints, authChecks, dataModelHints, crossInstitutionSupportDetected, recommendations, missingEndpoints, report, _i, endpoints_1, ep, _a, missingEndpoints_1, miss, _b, recommendations_1, rec;
        return __generator(this, function (_c) {
            project = new ts_morph_1.Project({
                tsConfigFilePath: "tsconfig.json",
                skipAddingFilesFromTsConfig: false,
            });
            routeFiles = glob_1.glob.sync("**/*routes*.ts", { ignore: "node_modules/**" });
            endpoints = [];
            authChecks = [];
            dataModelHints = [];
            crossInstitutionSupportDetected = false;
            recommendations = [];
            missingEndpoints = [];
            report = {
                endpoints: endpoints,
                authChecks: authChecks,
                dataModelHints: dataModelHints,
                crossInstitutionSupportDetected: crossInstitutionSupportDetected,
                recommendations: recommendations,
            };
            // Output
            if (OUTPUT_JSON) {
                console.log(JSON.stringify(report, null, 2));
            }
            else {
                for (_i = 0, endpoints_1 = endpoints; _i < endpoints_1.length; _i++) {
                    ep = endpoints_1[_i];
                    logOk("[FOUND] ".concat(ep.method, " ").concat(ep.path, " -> ").concat(ep.file, ":").concat(ep.line, " -> handler: ").concat(ep.handlerIdentifier));
                }
                for (_a = 0, missingEndpoints_1 = missingEndpoints; _a < missingEndpoints_1.length; _a++) {
                    miss = missingEndpoints_1[_a];
                    logWarn("[MISSING] ".concat(miss.method, " ").concat(miss.path));
                }
                if (crossInstitutionSupportDetected) {
                    logOk("Cross-institution support detected.");
                }
                else {
                    logWarn("Cross-institution support NOT detected.");
                }
                if (recommendations.length) {
                    logWarn("Recommendations:");
                    for (_b = 0, recommendations_1 = recommendations; _b < recommendations_1.length; _b++) {
                        rec = recommendations_1[_b];
                        logWarn("- ".concat(rec));
                    }
                }
            }
            // Exit code
            if (missingEndpoints.length)
                process.exit(2);
            if (!crossInstitutionSupportDetected)
                process.exit(3);
            process.exit(0);
            return [2 /*return*/];
        });
    });
}
