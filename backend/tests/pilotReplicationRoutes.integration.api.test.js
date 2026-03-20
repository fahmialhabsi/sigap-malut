import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { expect } from "chai";
import registerRoutes from "../routes/index.js";

const buildApp = () => {
  const app = express();
  app.use(express.json());
  registerRoutes(app);
  return app;
};

const createToken = ({
  id = "test-user-id",
  username = "tester",
  email = "tester@example.com",
  role,
  unitKerja,
}) => {
  return jwt.sign(
    {
      id,
      username,
      email,
      role,
      unit_kerja: unitKerja,
      nama_lengkap: "Tester Integration",
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );
};

describe("Pilot Replication Route Integration (SEK/BKT/BDS/BKS)", () => {
  let app;

  before(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
    app = buildApp();
  });

  it("should reject unauthenticated request on SEK endpoint", async () => {
    const res = await request(app).get("/api/sek-adm");

    expect(res.status).to.equal(401);
    expect(res.body.success).to.equal(false);
  });

  const routeGroups = [
    { name: "SEK", path: "/api/sek-adm", sourceUnit: "Sekretariat" },
    {
      name: "BKT",
      path: "/api/bkt-bmb",
      sourceUnit: "Bidang Ketersediaan",
    },
    { name: "BDS", path: "/api/bds-bmb", sourceUnit: "Bidang Distribusi" },
    { name: "BKS", path: "/api/bks-bmb", sourceUnit: "Bidang Konsumsi" },
  ];

  routeGroups.forEach(({ name, path, sourceUnit }) => {
    it(`should reject excluded role on ${name} route`, async () => {
      const token = createToken({
        role: "super_admin",
        unitKerja: sourceUnit,
      });

      const res = await request(app)
        .get(path)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(403);
      expect(res.body.success).to.equal(false);
      expect(res.body.code).to.equal("PILOT_SCOPE_EXCLUDED_ROLE");
    });

    it(`should block write access for read-only reviewer on ${name} route`, async () => {
      const token = createToken({
        role: "sekretaris",
        unitKerja: "UPTD Balai Pengawasan Mutu",
      });

      const res = await request(app)
        .post(path)
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(res.status).to.equal(403);
      expect(res.body.success).to.equal(false);
      expect(res.body.code).to.equal("PILOT_READ_ONLY");
    });
  });
});
