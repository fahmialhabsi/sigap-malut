import { expect } from "chai";

import { transitionWorkflow } from "../services/workflowService.js";

describe("Workflow State Transition", () => {
  it("should allow valid state transition", async () => {
    const result = await transitionWorkflow("draft", "submitted");
    expect(result).to.equal("submitted");
  });

  it("should reject invalid state transition", async () => {
    try {
      await transitionWorkflow("draft", "approved");
      throw new Error("Should not allow invalid transition");
    } catch (err) {
      expect(err.message).to.match(/invalid/i);
    }
  });
});
