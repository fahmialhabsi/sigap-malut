// backend/tests/report.test.js
import request from "supertest";
import app from "../server.js";
import { expect } from "chai";

describe("Compliance Report API", () => {
  it("GET /report returns compliance data", async () => {
    const res = await request(app).get("/report");
    expect(res.status).to.equal(200);
    expect(res.body.summary).to.not.be.undefined;
    expect(Array.isArray(res.body.results)).to.equal(true);
    expect(res.body.results.length).to.be.greaterThan(0);
  });

  it("GET /api/compliance/report returns compliance data", async () => {
    const res = await request(app).get("/api/compliance/report");
    expect(res.status).to.equal(200);
    expect(res.body.summary).to.not.be.undefined;
    expect(Array.isArray(res.body.results)).to.equal(true);
    expect(res.body.results.length).to.be.greaterThan(0);
  });
});
