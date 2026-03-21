// tests/integration/workflow-rbac.integration.spec.mjs

import request from "supertest";
import express from "express";
const controller = {
  list: (req, res) => res.status(200).json({ ok: true }),
  create: (req, res) => res.status(201).json({ ok: true }),
  getById: (req, res) => res.status(200).json({ ok: true }),
  update: (req, res) => res.status(200).json({ ok: true }),
  remove: (req, res) => res.status(204).end(),
};
import { createWorkflowRouter } from "../../backend/routes/workflows.mjs";

describe("Workflow RBAC integration", () => {
  const app = express();
  app.use(express.json());
  // Inject mock protect and requireWorkflowPermission
  const mockProtect = (req, res, next) => {
    req.user = { id: 1, role: "user" };
    next();
  };
  const mockRequireWorkflowPermission = (action) => (req, res, next) => {
    if (req.headers["x-allow"] === "yes") return next();
    return res.status(403).json({ error: "forbidden" });
  };
  app.use(
    createWorkflowRouter({
      protect: mockProtect,
      requireWorkflowPermission: mockRequireWorkflowPermission,
      controller,
    }),
  );

  it("allows access with permission", async () => {
    const res = await request(app).get("/workflows").set("x-allow", "yes");
    expect(res.status).toBe(200);
  });

  it("denies access without permission", async () => {
    const res = await request(app).get("/workflows");
    expect(res.status).toBe(403);
  });
});
// TODO: Add more tests for other endpoints and cross-institution logic
