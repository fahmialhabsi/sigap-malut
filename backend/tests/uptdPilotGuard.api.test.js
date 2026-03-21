import express from "express";
import request from "supertest";
import { expect } from "chai";
import { enforceUptdPilotAccess } from "../middleware/uptdPilotGuard.js";

function buildTestApp() {
  const app = express();
  app.use(express.json());

  app.use((req, _res, next) => {
    const role = req.header("x-role");
    const unitKerja = req.header("x-unit-kerja");

    if (role) {
      req.user = {
        id: "test-user-id",
        role,
        unit_kerja: unitKerja || "",
      };
    }

    next();
  });

  app.get("/api/pilot/uptd", enforceUptdPilotAccess, (req, res) => {
    res.status(200).json({ success: true, pilot: req.pilotProject || null });
  });

  app.post("/api/pilot/uptd", enforceUptdPilotAccess, (req, res) => {
    res.status(200).json({ success: true, pilot: req.pilotProject || null });
  });

  return app;
}

describe("UPTD Pilot Guard API", () => {
  const app = buildTestApp();

  it("should block request when user is not authenticated", async () => {
    const res = await request(app).get("/api/pilot/uptd");

    expect(res.status).to.equal(401);
    expect(res.body.success).to.equal(false);
  });

  it("should allow full access for UPTD pilot role", async () => {
    const res = await request(app)
      .post("/api/pilot/uptd")
      .set("x-role", "kepala_uptd")
      .set("x-unit-kerja", "UPTD Balai Pengawasan Mutu");

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.pilot.access).to.equal("full");
    expect(res.body.pilot.source_unit).to.equal("UPTD");
  });

  it("should reject excluded role from pilot scope", async () => {
    const res = await request(app)
      .get("/api/pilot/uptd")
      .set("x-role", "super_admin")
      .set("x-unit-kerja", "UPTD");

    expect(res.status).to.equal(403);
    expect(res.body.success).to.equal(false);
    expect(res.body.code).to.equal("PILOT_SCOPE_EXCLUDED_ROLE");
  });

  it("should allow read-only reviewer from replication unit", async () => {
    const res = await request(app)
      .get("/api/pilot/uptd")
      .set("x-role", "sekretaris")
      .set("x-unit-kerja", "Sekretariat");

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.pilot.access).to.equal("read-only");
    expect(res.body.pilot.reviewer_unit).to.equal("Sekretariat");
  });

  it("should reject write access for reviewer from replication unit", async () => {
    const res = await request(app)
      .post("/api/pilot/uptd")
      .set("x-role", "sekretaris")
      .set("x-unit-kerja", "Sekretariat")
      .send({});

    expect(res.status).to.equal(403);
    expect(res.body.success).to.equal(false);
    expect(res.body.code).to.equal("PILOT_READ_ONLY");
  });

  it("should reject role that is not included in pilot rule", async () => {
    const res = await request(app)
      .get("/api/pilot/uptd")
      .set("x-role", "staf_umum")
      .set("x-unit-kerja", "UPTD");

    expect(res.status).to.equal(403);
    expect(res.body.success).to.equal(false);
    expect(res.body.code).to.equal("PILOT_ROLE_NOT_ALLOWED");
  });
});
