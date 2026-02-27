import fs from "fs/promises";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const auditLogger = require("../utils/auditLogger.js");

class WorkflowEngine {
  constructor() {
    this.workflows = new Map();
  }

  registerWorkflow(name, definition) {
    this.workflows.set(name, definition);
  }

  registerMany(defs) {
    for (const [k, v] of Object.entries(defs || {})) {
      this.registerWorkflow(k, v);
    }
  }

  async loadFromDir(dirPath) {
    const files = await fs.readdir(dirPath).catch(() => []);
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      const full = path.join(dirPath, f);
      try {
        const raw = await fs.readFile(full, "utf8");
        const def = JSON.parse(raw);
        const name = def.name || path.basename(f, ".json");
        this.registerWorkflow(name, def);
      } catch (err) {
        console.warn("Failed to load workflow file", f, err.message);
      }
    }
  }

  getWorkflow(name) {
    return this.workflows.get(name);
  }

  // Determine whether a user can perform transition 'to' from current state
  canTransition(workflowName, fromState, toState, user) {
    const wf = this.getWorkflow(workflowName);
    if (!wf) return { allowed: false, reason: "workflow_not_found" };

    const transitions = wf.transitions || [];
    let candidate = null;

    if (Array.isArray(transitions)) {
      candidate = transitions.find(
        (t) => (t.from === fromState || t.from === "*") && t.to === toState,
      );
    } else if (typeof transitions === "object") {
      const allowed = transitions[fromState] || [];
      if (!allowed.includes(toState))
        return { allowed: false, reason: "invalid_transition" };
      candidate = { from: fromState, to: toState };
    }

    if (!candidate) return { allowed: false, reason: "invalid_transition" };

    const requiredPermissions = candidate.requiredPermissions || [];
    const allowedRoles = candidate.allowedRoles || [];

    const userPermissions = (user && (user.permissions || user.perms)) || [];
    const userRoles =
      (user && (user.roles || (user.role ? [user.role] : []))) || [];

    for (const p of requiredPermissions) {
      if (!userPermissions.includes(p))
        return { allowed: false, reason: "missing_permission", missing: p };
    }

    if (allowedRoles.length) {
      const ok = userRoles.some((r) => allowedRoles.includes(r));
      if (!ok) return { allowed: false, reason: "role_not_allowed" };
    }

    return { allowed: true, transition: candidate };
  }

  async performTransition({ workflowName, entity, to, user, app, note }) {
    const wf = this.getWorkflow(workflowName);
    if (!wf) throw new Error("workflow_not_found");
    const from =
      entity && (entity.status || entity.state)
        ? entity.status || entity.state
        : "draft";

    const check = this.canTransition(workflowName, from, to, user);
    if (!check.allowed) {
      const err = new Error(check.reason || "transition_not_allowed");
      err.meta = check;
      throw err;
    }

    const before = {
      ...(entity && (entity.toJSON ? entity.toJSON() : entity)),
    };

    if (entity && typeof entity.update === "function") {
      await entity.update({ status: to });
    } else if (entity && typeof entity === "object") {
      entity.status = to;
    }

    try {
      if (auditLogger && typeof auditLogger.logAudit === "function") {
        await auditLogger.logAudit({
          userId: user && user.id,
          action: `transition:${from}->${to}`,
          entityId: entity && entity.id,
          before,
          after: entity,
          workflow: workflowName,
        });
      }
    } catch (err) {
      console.warn("Audit failed", err.message);
    }

    try {
      const models =
        app && typeof app.get === "function" ? app.get("models") : null;
      const ApprovalLog = models && models.ApprovalLog;
      if (ApprovalLog && typeof ApprovalLog.create === "function") {
        await ApprovalLog.create({
          workflow_id: entity && entity.id,
          approver_id: user && user.id,
          approver_role:
            (user && (user.role || (user.roles && user.roles[0]))) || null,
          action: to,
          notes: note || null,
        });
      }
    } catch (err) {
      console.warn("Failed to write ApprovalLog", err.message);
    }

    return entity;
  }
}

const engine = new WorkflowEngine();
export default engine;
