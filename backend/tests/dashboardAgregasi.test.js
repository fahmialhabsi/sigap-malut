// File: backend/tests/dashboardAgregasi.test.js
import { expect } from "chai";
import dashboardService from "../services/dashboardService.js";

describe("Dashboard & Agregasi", () => {
  it("should return structured dashboard summary data", async () => {
    const data = await dashboardService.getAggregatedData();
    expect(data).to.be.an("object");
    expect(data).to.have.property("generated_at");
    expect(data).to.have.property("service_statistics").that.is.an("object");
    expect(data).to.have.property("workflow_statistics").that.is.an("object");
    expect(data).to.have.property("approval_statistics").that.is.an("object");
    expect(data).to.have.property("module_activity").that.is.an("array");
    expect(data)
      .to.have.property("pilot_module_statistics")
      .that.is.an("array");
  });
});
