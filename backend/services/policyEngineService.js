import { existsSync, readFileSync, statSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, "../config/policyEngine.json");

let cached = null;
let cachedMtime = 0;

export function getPolicyEngineConfigSync() {
  try {
    if (!existsSync(CONFIG_PATH)) return { version: 0, rules: [] };
    const st = statSync(CONFIG_PATH);
    if (!cached || st.mtimeMs !== cachedMtime) {
      cachedMtime = st.mtimeMs;
      cached = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
    }
    return cached;
  } catch {
    return { version: 0, rules: [] };
  }
}

function matchWhen(when, ctx) {
  if (!when || typeof when !== "object") return true;
  if (when.health_status_eq != null && String(ctx.health_status || "") !== String(when.health_status_eq)) {
    return false;
  }
  if (
    when.sla_breach_open_tasks_gte != null &&
    Number(ctx.sla_breach_open_tasks || 0) < Number(when.sla_breach_open_tasks_gte)
  ) {
    return false;
  }
  if (
    when.horizontal_sla_overdue_gte != null &&
    Number(ctx.horizontal_sla_overdue || 0) < Number(when.horizontal_sla_overdue_gte)
  ) {
    return false;
  }
  if (
    when.decision_score_lte != null &&
    !(Number(ctx.decision_score ?? 100) <= Number(when.decision_score_lte))
  ) {
    return false;
  }
  return true;
}

/**
 * Evaluasi aturan kebijakan terhadap konteks thread (tanpa persist otomatis).
 */
export function evaluatePolicyRules(context = {}) {
  const cfg = getPolicyEngineConfigSync();
  const rules = Array.isArray(cfg.rules) ? cfg.rules : [];
  const fired = [];
  for (const rule of rules) {
    if (rule?.id && matchWhen(rule.when, context)) {
      fired.push({
        id: rule.id,
        label: rule.label || rule.id,
        severity: rule.severity || "info",
      });
    }
  }
  return { version: cfg.version || 0, flags: fired };
}
