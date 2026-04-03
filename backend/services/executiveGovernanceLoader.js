import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GOV_PATH = path.join(__dirname, "../config/executiveGovernance.json");

export function loadExecutiveGovernance() {
  try {
    const raw = readFileSync(GOV_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return { version: 0, decision_support_rules: [], escalation_after_deadline: {} };
  }
}
