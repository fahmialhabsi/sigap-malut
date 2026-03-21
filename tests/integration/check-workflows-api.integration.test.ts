// tests/integration/check-workflows-api.integration.test.ts
// Integration test for workflows API endpoints
// Requires: supertest, jest

import request from "supertest";

const API_BASE = process.env.API_BASE || "http://localhost:3000";
const ADMIN_TOKEN = process.env.TEST_ADMIN_TOKEN || "";
const USER_TOKEN = process.env.TEST_USER_TOKEN || "";
const SERVICE_TOKEN = process.env.TEST_SERVICE_TOKEN || "";
const WORKFLOW_ID = process.env.TEST_WORKFLOW_ID || "workflow_fixture_id";

function authHeader(token: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

describe("Workflows API Integration", () => {
  it("should reject unauthenticated GET /api/workflows", async () => {
    const res = await request(API_BASE).get("/api/workflows");
    expect([401, 403]).toContain(res.statusCode);
  });

  it("should allow admin to list workflows", async () => {
    if (!ADMIN_TOKEN) return console.warn("TEST_ADMIN_TOKEN not set");
    const res = await request(API_BASE)
      .get("/api/workflows")
      .set(authHeader(ADMIN_TOKEN));
    expect(res.statusCode).toBe(200);
  });

  it("should allow user to list workflows in their institution", async () => {
    if (!USER_TOKEN) return console.warn("TEST_USER_TOKEN not set");
    const res = await request(API_BASE)
      .get("/api/workflows")
      .set(authHeader(USER_TOKEN));
    expect([200, 403]).toContain(res.statusCode); // 403 if policy blocks
  });

  it("should reject cross-institution transition for normal user", async () => {
    if (!USER_TOKEN) return console.warn("TEST_USER_TOKEN not set");
    const res = await request(API_BASE)
      .post(`/api/workflows/${WORKFLOW_ID}/transition`)
      .set(authHeader(USER_TOKEN))
      .send({ to: "step_in_other_institution" });
    expect([403, 409]).toContain(res.statusCode);
  });

  it("should allow admin or service token for cross-institution transition", async () => {
    if (!ADMIN_TOKEN && !SERVICE_TOKEN)
      return console.warn("No admin/service token");
    const token = ADMIN_TOKEN || SERVICE_TOKEN;
    const res = await request(API_BASE)
      .post(`/api/workflows/${WORKFLOW_ID}/transition`)
      .set(authHeader(token))
      .send({ to: "step_in_other_institution" });
    expect([200, 409]).toContain(res.statusCode); // 409 if invalid transition
  });

  it("should return 409 for invalid transition", async () => {
    if (!ADMIN_TOKEN) return console.warn("TEST_ADMIN_TOKEN not set");
    const res = await request(API_BASE)
      .post(`/api/workflows/${WORKFLOW_ID}/transition`)
      .set(authHeader(ADMIN_TOKEN))
      .send({ to: "invalid_transition" });
    expect([409, 400]).toContain(res.statusCode);
  });
});
