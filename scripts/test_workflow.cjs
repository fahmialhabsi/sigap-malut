// Simple test to create a WorkflowInstance and run transitions.
// Adjust require paths if your project exposes models differently.

(async () => {
  try {
    const workflowServiceModule =
      await import("../backend/services/workflowService.js");
    const WorkflowInstanceModule =
      await import("../backend/models/WorkflowInstance.js");
    const workflowService =
      workflowServiceModule.default || workflowServiceModule;
    const WorkflowInstance =
      WorkflowInstanceModule.default || WorkflowInstanceModule;

    console.log("Creating workflow instance with domain_sequence...");
    const data = {
      module_id: "test-module",
      entity_id: "999999",
      domain_sequence: ["pelaksana", "sekretaris", "kepala_dinas"],
      status: "active",
      started_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const creator = { id: 1, name: "tester" };
    const instance = await workflowService.createWorkflow(data, creator);
    console.log("Created instance id=", instance.id);
    // reload from DB to be sure persisted
    const reloaded = await WorkflowInstance.findByPk(instance.id);
    console.log("Persisted values:", {
      id: reloaded.id,
      domain_sequence: reloaded.domain_sequence,
      current_state: reloaded.current_state,
      current_step_index: reloaded.current_step_index,
      current_domain: reloaded.current_domain,
    });

    // Submit transition
    console.log("Perform submit transition...");
    await workflowService.transitionWorkflow(
      reloaded,
      "submit",
      creator,
      "test submit",
    );
    await reloaded.reload();
    console.log("After submit:", {
      id: reloaded.id,
      current_state: reloaded.current_state,
      current_step_index: reloaded.current_step_index,
      current_domain: reloaded.current_domain,
    });

    // Review transition
    console.log("Perform review transition...");
    await workflowService.transitionWorkflow(
      reloaded,
      "review",
      { id: 2, name: "reviewer" },
      "test review",
    );
    await reloaded.reload();
    console.log("After review:", {
      id: reloaded.id,
      current_state: reloaded.current_state,
      current_step_index: reloaded.current_step_index,
      current_domain: reloaded.current_domain,
    });

    // Approve transition
    console.log("Perform approve transition...");
    await workflowService.transitionWorkflow(
      reloaded,
      "approve",
      { id: 3, name: "approver" },
      "test approve",
    );
    await reloaded.reload();
    console.log("After approve:", {
      id: reloaded.id,
      current_state: reloaded.current_state,
      current_step_index: reloaded.current_step_index,
      current_domain: reloaded.current_domain,
    });

    console.log("Test finished OK");
    process.exit(0);
  } catch (err) {
    console.error("TEST ERROR:", err && err.stack ? err.stack : err);
    process.exit(2);
  }
})();
