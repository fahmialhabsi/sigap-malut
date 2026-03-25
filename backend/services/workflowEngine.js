// backend/services/workflowEngine.js
// A-16: Node-based workflow engine.
// Jika instance memiliki unit_kerja, gunakan graph node dari workflowNodes.js.
// Fallback ke domain_sequence linear (mode lama) agar backward-compatible.
import {
  resolveGraph,
  getCurrentNode,
  canTransition,
  resolveNextNode,
} from "./workflowNodes.js";

async function performTransition({ instance, action, user, comment }) {
  // Lazy import to avoid circular dependency
  let workflowService = null;
  try {
    workflowService = await import("./workflowService.js");
  } catch (e) {
    workflowService = null;
  }
  if (
    workflowService &&
    typeof workflowService.performTransition === "function" &&
    workflowService.performTransition !== performTransition
  ) {
    return workflowService.performTransition({
      instance,
      action,
      user,
      comment,
    });
  }

  if (!instance) throw new Error("Instance required");

  const fromState = instance.current_state || "draft";
  const userRole =
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    "pelaksana";

  // â”€â”€ NODE-BASED PATH (A-16) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const unitKerja = instance.unit_kerja || user?.unit_kerja || "";
  if (unitKerja) {
    const graph = resolveGraph(unitKerja);
    const currentNode = getCurrentNode(instance, graph);

    // Bypass detection: role tidak boleh bertindak di node ini
    if (!canTransition(currentNode, action, userRole)) {
      // Log bypass attempt asinkron (best-effort)
      try {
        const { default: Bypassdetection } =
          await import("../models/bypassDetection.js");
        await Bypassdetection.create({
          user_id: user?.id || null,
          user_role: userRole,
          node_id: currentNode.id,
          action_attempted: action,
          unit_kerja: unitKerja,
          workflow_instance_id: instance.id || null,
          detected_at: new Date(),
        }).catch(() => {}); // non-fatal
      } catch {
        // model mungkin belum ada kolom baru â€” abaikan
      }
      return {
        success: false,
        blocked: true,
        reason: `Role '${userRole}' tidak diizinkan melakukan aksi '${action}' pada node '${currentNode.label}'.`,
        currentNode: currentNode.id,
      };
    }

    const nextNode = resolveNextNode(currentNode, action, graph);
    const toState = nextNode
      ? nextNode.terminal
        ? nextNode.id // "finished" | "rejected"
        : nextNode.id // node id sebagai state
      : fromState;

    const current_node_id = nextNode ? nextNode.id : currentNode.id;

    // Update instance (Sequelize model atau plain object)
    if (instance.set) {
      instance.set({
        current_state: toState,
        current_node_id,
        current_domain: current_node_id, // backward-compat alias
        current_step_index: instance.current_step_index ?? 0,
      });
    } else {
      instance.current_state = toState;
      instance.current_node_id = current_node_id;
      instance.current_domain = current_node_id;
    }

    const historyEntry = {
      user_id: user?.id,
      action,
      from_state: fromState,
      to_state: toState,
      comment,
      timestamp: new Date(),
      current_node_id,
      current_domain: current_node_id,
      next_domain: null,
    };

    return {
      success: true,
      workflowId: instance.id,
      fromState,
      toState,
      current_step_index: instance.current_step_index ?? 0,
      current_domain: current_node_id,
      current_node_id,
      nextDomain: null,
      historyEntry,
    };
  }

  // â”€â”€ LEGACY LINEAR PATH (domain_sequence) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let domainSequence = Array.isArray(instance.domain_sequence)
    ? instance.domain_sequence
    : [];
  let currentStep =
    typeof instance.current_step_index === "number"
      ? instance.current_step_index
      : 0;
  let currentDomain = instance.current_domain || null;
  let toState = fromState;
  let nextDomain = null;

  if (action === "submit") {
    toState = "submitted";
    if (domainSequence.length > 0) {
      currentStep = 0;
      currentDomain = domainSequence[0];
      nextDomain = domainSequence[1] || null;
    }
  } else if (action === "review" || action === "approve") {
    if (domainSequence.length > 0) {
      currentStep = currentStep + 1;
      currentDomain = domainSequence[currentStep] || null;
      nextDomain = domainSequence[currentStep + 1] || null;
      if (!currentDomain) {
        toState = "finished";
      }
    }
  } else if (action) {
    toState = action;
  }

  if (instance.set) {
    instance.set({
      current_state: toState,
      current_step_index: currentStep,
      current_domain: currentDomain,
    });
  } else {
    instance.current_state = toState;
    instance.current_step_index = currentStep;
    instance.current_domain = currentDomain;
  }

  const historyEntry = {
    user_id: user && user.id,
    action,
    from_state: fromState,
    to_state: toState,
    comment,
    timestamp: new Date(),
    current_step_index: currentStep,
    current_domain: currentDomain,
    next_domain: nextDomain,
  };

  return {
    success: true,
    workflowId: instance.id,
    fromState,
    toState,
    current_step_index: currentStep,
    current_domain: currentDomain,
    nextDomain: nextDomain,
    historyEntry,
  };
}

export { performTransition };
export default { performTransition };
