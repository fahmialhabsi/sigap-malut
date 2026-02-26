import { expect } from "chai";
import { transition } from "../services/workflowService.js";

describe("Workflow State Transition", () => {
  it("should allow valid state transition", async () => {
    const result = await transition("draft", "submitted");
    expect(result).to.equal("submitted");
  });

  it("should reject invalid state transition", async () => {
    try {
      await transition("draft", "approved");
      throw new Error("Should not allow invalid transition");
    } catch (err) {
      expect(err.message).to.match(/invalid/i);
    }
  });
});
