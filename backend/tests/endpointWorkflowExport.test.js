import { expect } from "chai";
import apiClient from "../services/apiClient.js";

describe("Endpoint, Workflow, Export", () => {
  it("should return valid response for endpoint, workflow, and export", async () => {
    const endpoint = await apiClient.get("/api/module");
    expect(endpoint.status).to.equal(200);
    expect(endpoint.data).to.be.an("object");
    // Workflow
    const workflow = await apiClient.post("/api/workflow", { state: "pending" });
    expect(workflow.status).to.equal(200);
    expect(workflow.data).to.have.property("state");
    // Export
    const exportResult = await apiClient.get("/api/export");
    expect(exportResult.status).to.equal(200);
    expect(exportResult.data).to.have.property("buffer");
  });
});