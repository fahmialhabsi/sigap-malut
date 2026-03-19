import request from "supertest";
import app from "../server.js";
import Workflow from "../models/workflow.js";
import { expect } from "chai";

describe("Workflows API", () => {
  let token;
  before(async () => {
    // Mock token for admin
    token = "Bearer mock-admin-token";
  });

  it("should create workflow within user's institution", async () => {
    const res = await request(app)
      .post("/api/workflows")
      .set("Authorization", token)
      .send({
        name: "Invoice Approval",
        institution_id: "inst_123",
        definition: {
          steps: ["draft", "submitted", "approved", "rejected"],
          transitions: [
            { from: "draft", to: "submitted" },
            { from: "submitted", to: "approved" },
            { from: "submitted", to: "rejected" },
          ],
        },
      });
    expect(res.statusCode).to.equal(201);
    expect(res.body.name).to.equal("Invoice Approval");
  });

  it("should list workflows filtered by institution_id", async () => {
    const res = await request(app)
      .get("/api/workflows?institution_id=inst_123")
      .set("Authorization", token);
    expect(res.statusCode).to.equal(200);
    expect(Array.isArray(res.body)).to.equal(true);
  });

  it("should allow valid transition", async () => {
    const wf = await Workflow.findOne({
      where: { institution_id: "inst_123" },
    });
    const res = await request(app)
      .post(`/api/workflows/${wf.id}/transition`)
      .set("Authorization", token)
      .send({ to: "approved" });
    expect(res.statusCode).to.equal(200);
    expect(res.body.current_step).to.equal("approved");
  });

  it("should reject invalid transition", async () => {
    const wf = await Workflow.findOne({
      where: { institution_id: "inst_123" },
    });
    const res = await request(app)
      .post(`/api/workflows/${wf.id}/transition`)
      .set("Authorization", token)
      .send({ to: "draft" });
    expect(res.statusCode).to.equal(409);
  });

  it("should forbid cross-institution transition for regular user", async () => {
    const wf = await Workflow.findOne({
      where: { institution_id: "inst_123" },
    });
    const res = await request(app)
      .post(`/api/workflows/${wf.id}/transition`)
      .set("Authorization", "Bearer mock-user-token")
      .send({ to: "approved", target_institution_id: "inst_456" });
    expect(res.statusCode).to.equal(403);
  });

  it("should create audit log after transition", async () => {
    // Check log entry exists
    // ...implement sesuai model
  });
});
