// backend/services/workflowService.js

import WorkflowInstance from "../models/WorkflowInstance.js";
// import WorkflowHistory from "../models/WorkflowHistory.js"; // Uncomment jika file ada
import * as workflowEngine from "./workflowEngine.js";
import WorkflowHistory from "../models/WorkflowHistory.js";

async function createWorkflow(data, user) {
  // Accept domain_sequence and persist (force persist as array, never override by ...data)
  const { domain_sequence, ...otherData } = data || {};
  const safeDomainSequence = Array.isArray(domain_sequence)
    ? domain_sequence
    : typeof domain_sequence === "string" && domain_sequence.startsWith("[")
      ? JSON.parse(domain_sequence)
      : [];
  const instance = await WorkflowInstance.create({
    domain_sequence: safeDomainSequence,
    current_step_index: 0,
    current_domain:
      Array.isArray(safeDomainSequence) && safeDomainSequence.length > 0
        ? safeDomainSequence[0]
        : null,
    current_state: "draft",
    ...otherData,
  }); // [CROSS_AGENCY_PERSIST]
  return instance;
}

async function transitionWorkflow(instance, action, user, comment) {
  // Call workflowEngine.performTransition
  const result = await workflowEngine.performTransition({
    instance,
    action,
    user,
    comment,
  });

  if (result && result.success) {
    // Update WorkflowInstance in DB
    if (instance.set) {
      instance.set({
        current_state: result.toState,
        current_step_index: result.current_step_index,
        current_domain: result.current_domain,
      });
      await instance.save();
    } else {
      // fallback for plain object
      instance.current_state = result.toState;
      instance.current_step_index = result.current_step_index;
      instance.current_domain = result.current_domain;
      await WorkflowInstance.update(
        {
          current_state: result.toState,
          current_step_index: result.current_step_index,
          current_domain: result.current_domain,
        },
        { where: { id: instance.id } },
      );
    }

    // Save WorkflowHistory
    await WorkflowHistory.create({
      workflow_instance_id: instance.id,
      module_id: instance.module_id, // Pastikan module_id diisi
      user_id: user && user.id,
      action,
      from_state: result.fromState,
      to_state: result.toState,
      comment,
      current_step_index: result.current_step_index,
      current_domain: result.current_domain,
      next_domain: result.nextDomain,
      created_at: new Date(), // created_at biasanya NOT NULL
      timestamp: new Date(),
    });
  }

  return instance;
}

// Fungsi approve untuk multi-level approval (dummy, sesuai test)
function approve(doc, level) {
  if (doc && doc.approvals && level) {
    doc.approvals[level] = true;
  }
  return doc;
}

export { createWorkflow, transitionWorkflow, approve };
