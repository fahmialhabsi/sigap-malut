// backend/services/workflowEngine.js
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
  let domainSequence = Array.isArray(instance.domain_sequence)
    ? instance.domain_sequence
    : [];
  let currentStep =
    typeof instance.current_step_index === "number"
      ? instance.current_step_index
      : 0;
  let currentDomain = instance.current_domain || null;
  let fromState = instance.current_state || "draft";
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

  // Update instance (plain object or Sequelize)
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
