// backend/services/workflowService.js
const WorkflowInstance = require("../models/WorkflowInstance");
const WorkflowHistory = require("../models/WorkflowHistory");
const workflowEngine = require("./workflowEngine");

async function createWorkflow(data, user) {
  // Accept domain_sequence and persist
  const instance = await WorkflowInstance.create({
    ...data,
    domain_sequence: Array.isArray(data.domain_sequence)
      ? data.domain_sequence
      : [],
    current_step_index: 0,
    current_domain:
      Array.isArray(data.domain_sequence) && data.domain_sequence.length > 0
        ? data.domain_sequence[0]
        : null,
    current_state: "draft",
  });
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
      user_id: user && user.id,
      action,
      from_state: result.fromState,
      to_state: result.toState,
      comment,
      current_step_index: result.current_step_index,
      current_domain: result.current_domain,
      next_domain: result.nextDomain,
      timestamp: new Date(),
    });
  }

  return instance;
}

module.exports = {
  createWorkflow,
  transitionWorkflow,
  // ...other exports...
};
