// scripts/verify-workflow-rbac.ts
// Simple script to check workflow routes for RBAC enforcement
import fs from "fs";

const file = "backend/routes/workflows.js";
const content = fs.readFileSync(file, "utf-8");
const lines = content.split("\n");
const missing = [];

const endpoints = [
  { method: "get", path: "/workflows" },
  { method: "post", path: "/workflows" },
  { method: "get", path: "/workflows/:id" },
  { method: "put", path: "/workflows/:id" },
  { method: "delete", path: "/workflows/:id" },
  { method: "post", path: "/workflows/:id/transition" },
  { method: "get", path: "/workflows/:id/transitions" },
];

for (const ep of endpoints) {
  const regex = new RegExp(
    `router\\.${ep.method}\\(.*requireWorkflowPermission\\(`,
  );
  if (!content.match(regex)) {
    missing.push(`${ep.method.toUpperCase()} ${ep.path}`);
  }
}

if (missing.length) {
  console.log("Missing RBAC enforcement for:");
  for (const m of missing) console.log(" -", m);
  process.exit(1);
} else {
  console.log("All workflow endpoints have RBAC enforcement.");
  process.exit(0);
}
