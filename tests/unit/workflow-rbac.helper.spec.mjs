// tests/unit/workflow-rbac.helper.spec.mjs
import {
  workflowPermission,
  requireWorkflowPermission,
} from "../../backend/middleware/workflowRbac.mjs";

describe("workflowPermission", () => {
  it("returns correct permission string", () => {
    expect(workflowPermission("read")).toBe("workflow:read");
    expect(workflowPermission("create")).toBe("workflow:create");
    expect(workflowPermission("update")).toBe("workflow:update");
    expect(workflowPermission("delete")).toBe("workflow:delete");
    expect(workflowPermission("transition")).toBe("workflow:transition");
    expect(workflowPermission("transitions.read")).toBe(
      "workflow:transitions.read",
    );
    expect(workflowPermission("custom")).toBe("workflow:custom");
  });
});

describe("requireWorkflowPermission", () => {
  it("returns a middleware function", () => {
    const mw = requireWorkflowPermission("read");
    expect(typeof mw).toBe("function");
  });
});
// TODO: Add more tests for middleware behavior with mock req/res/next
