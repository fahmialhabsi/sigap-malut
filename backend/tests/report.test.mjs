import request from "supertest";
import express from "express";
import complianceRoutes from "../routes/compliance.js";
import reportRoutes from "../routes/report.js";

const app = express();
app.use(express.json());
app.use("/api/compliance", complianceRoutes);
app.use("/report", reportRoutes);

describe("Compliance Report API", () => {
  it("GET /report returns compliance data", async () => {
    const res = await request(app).get("/report");
    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);
  });

  it("GET /api/compliance/report returns compliance data", async () => {
    const res = await request(app).get("/api/compliance/report");
    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);
  });
});
