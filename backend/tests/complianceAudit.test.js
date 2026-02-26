import { expect } from "chai";
import { enforce } from "../middleware/workflowEnforcement.js";

describe("Compliance & Audit", () => {
  it("should enforce workflow and alert dashboard compliance", async () => {
    const workflow = { state: "pending", user: "admin" };
    const result = await enforce(workflow);
    expect(result).to.have.property("compliant");
    expect(result.compliant).to.be.true;
    expect(result).to.have.property("alerts");
  });
});
