import express from "express";
import request from "supertest";
import { expect } from "chai";
import { createReplicationPilotGuard } from "../middleware/uptdPilotGuard.js";

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

  const sekretariatGuard = createReplicationPilotGuard({
    domainCode: "SEKRETARIAT_STANDARD_REPLIKA_UPTD",
    sourceUnit: "Sekretariat",
  });

  app.get("/api/pilot/sekretariat", sekretariatGuard, (req, res) => {
    res.status(200).json({ success: true, pilot: req.pilotProject || null });
  });

  app.post("/api/pilot/sekretariat", sekretariatGuard, (req, res) => {
    res.status(200).json({ success: true, pilot: req.pilotProject || null });
  });

  return app;
}

describe("Replication Pilot Guard API", () => {
  const app = buildTestApp();

  it("should allow full access for matching source unit", async () => {
    const res = await request(app)
      .post("/api/pilot/sekretariat")
      .set("x-role", "kasubbag")
      .set("x-unit-kerja", "Sekretariat")
      .send({});

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.pilot.access).to.equal("full");
    expect(res.body.pilot.source_unit).to.equal("Sekretariat");
  });

  it("should reject excluded role on replication route", async () => {
    const res = await request(app)
      .get("/api/pilot/sekretariat")
      .set("x-role", "gubernur")
      .set("x-unit-kerja", "Sekretariat");

    expect(res.status).to.equal(403);
    expect(res.body.success).to.equal(false);
    expect(res.body.code).to.equal("PILOT_SCOPE_EXCLUDED_ROLE");
  });

  it("should allow read-only access for UPTD reviewer source", async () => {
    const res = await request(app)
      .get("/api/pilot/sekretariat")
      .set("x-role", "kepala_uptd")
      .set("x-unit-kerja", "UPTD Balai Pengawasan Mutu");

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.pilot.access).to.equal("read-only");
    expect(res.body.pilot.source_unit).to.equal("Sekretariat");
  });

  it("should reject write attempt for read-only reviewer", async () => {
    const res = await request(app)
      .post("/api/pilot/sekretariat")
      .set("x-role", "sekretaris")
      .set("x-unit-kerja", "Bidang Distribusi")
      .send({});

    expect(res.status).to.equal(403);
    expect(res.body.success).to.equal(false);
    expect(res.body.code).to.equal("PILOT_READ_ONLY");
  });
});
