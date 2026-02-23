// File: backend/tests/dashboardAgregasi.test.js
import { expect } from "chai";
import dashboardService from "../services/dashboardService.js";

describe("Dashboard & Agregasi", () => {
  it("should return real-time aggregated data without duplication", async () => {
    const data = await dashboardService.getAggregatedData();
    expect(data).to.be.an("array");
    expect(data.length).to.be.greaterThan(0);
    // Cek duplikasi
    const ids = data.map((d) => d.id);
    expect(new Set(ids).size).to.equal(ids.length);
    // Cek real-time
    expect(data[0]).to.have.property("updated_at");
  });
});
