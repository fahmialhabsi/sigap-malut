import { expect } from "chai";
import { approve } from "../services/workflowService.js";

describe("Approval Multi-Level", () => {
  it("should require all levels to approve", async () => {
    const doc = {
      state: "submitted",
      approvals: { level1: false, level2: false },
    };
    await approve(doc, "level1");
    expect(doc.approvals.level1).to.be.true;
    expect(doc.approvals.level2).to.be.false;
    await approve(doc, "level2");
    expect(doc.approvals.level2).to.be.true;
  });
});
