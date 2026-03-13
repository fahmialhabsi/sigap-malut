import { expect } from "chai";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { sequelize } from "../config/database.js";
import sekLdsRoutes from "../routes/SEK-LDS.js";
import sekLksRoutes from "../routes/SEK-LKS.js";
import sekLupRoutes from "../routes/SEK-LUP.js";

const SekLds =
  sequelize.models["SEK-LDS"] ||
  sequelize.models.SekLds ||
  sequelize.models.Sek_lds;
const SekLks =
  sequelize.models["SEK-LKS"] ||
  sequelize.models.SekLks ||
  sequelize.models.Sek_lks;
const SekLup =
  sequelize.models["SEK-LUP"] ||
  sequelize.models.SekLup ||
  sequelize.models.Sek_lup;
const User = sequelize.models.User;

const DEFAULT_ROLE_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_UNIT_ID = "Sekretariat";

const app = express();
app.use(express.json());
app.use("/api/sek-lds", sekLdsRoutes);
app.use("/api/sek-lks", sekLksRoutes);
app.use("/api/sek-lup", sekLupRoutes);

function createUserSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function createValidUser(prefix) {
  const uniq = `${prefix}${createUserSuffix()}`;
  return User.create({
    username: uniq,
    password: "password123",
    plain_password: "password123",
    name: `Tester ${prefix}`,
    nama_lengkap: `Tester ${prefix}`,
    unit_kerja: "Sekretariat",
    unit_id: DEFAULT_UNIT_ID,
    role_id: DEFAULT_ROLE_ID,
    email: `${uniq}@test.com`,
    jabatan: "Staff",
  });
}

function createAuthToken(user) {
  const secret = process.env.JWT_SECRET || "test-secret";
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: "admin",
      unit_kerja: user.unit_kerja || "Sekretariat",
      nama_lengkap: user.nama_lengkap || user.name,
    },
    secret,
    { expiresIn: "1h" },
  );
}

describe("PUT Endpoint: SEK-LDS, SEK-LKS, SEK-LUP", () => {
  before(() => {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = "test-secret";
    }
  });

  it("should update SEK-LDS record via PUT /api/sek-lds/:id", async () => {
    const user = await createValidUser("putseklds");

    const record = await SekLds.create({
      layanan_id: "LY049",
      periode: "2026-03-01",
      tahun: 2026,
      bulan: 3,
      penanggung_jawab: "Sekretaris",
      pelaksana: "Tester",
      is_sensitive: "Biasa",
      status: "draft",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-lds/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status_inflasi: "Warning",
        inflasi_pangan_persen: 3.1,
        status: "review",
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.status_inflasi).to.equal("Warning");
    expect(response.body.data.status).to.equal("review");

    const updated = await SekLds.findByPk(record.id);
    expect(updated).to.exist;
    expect(updated.status_inflasi).to.equal("Warning");
    expect(updated.status).to.equal("review");
  });

  it("should return 400 on invalid SEK-LDS enum update", async () => {
    const user = await createValidUser("putseklds400");

    const record = await SekLds.create({
      layanan_id: "LY049",
      periode: "2026-03-01",
      tahun: 2026,
      bulan: 3,
      penanggung_jawab: "Sekretaris",
      pelaksana: "Tester",
      is_sensitive: "Biasa",
      status: "draft",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-lds/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status_inflasi: "INVALID_ENUM",
      });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal("Error updating SekLds");
  });

  it("should update SEK-LKS record via PUT /api/sek-lks/:id", async () => {
    const user = await createValidUser("putseklks");

    const record = await SekLks.create({
      layanan_id: "LY050",
      periode: "2026-03-01",
      tahun: 2026,
      bulan: 3,
      penanggung_jawab: "Sekretaris",
      pelaksana: "Tester",
      is_sensitive: "Biasa",
      status: "draft",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-lks/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status_pph: "Di Bawah Target",
        skor_pph: 82.5,
        status: "review",
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.status_pph).to.equal("Di Bawah Target");
    expect(response.body.data.status).to.equal("review");

    const updated = await SekLks.findByPk(record.id);
    expect(updated).to.exist;
    expect(updated.status_pph).to.equal("Di Bawah Target");
    expect(updated.status).to.equal("review");
  });

  it("should return 400 on invalid SEK-LKS enum update", async () => {
    const user = await createValidUser("putseklks400");

    const record = await SekLks.create({
      layanan_id: "LY050",
      periode: "2026-03-01",
      tahun: 2026,
      bulan: 3,
      penanggung_jawab: "Sekretaris",
      pelaksana: "Tester",
      is_sensitive: "Biasa",
      status: "draft",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-lks/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "status-invalid",
      });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal("Error updating SekLks");
  });

  it("should update SEK-LUP record via PUT /api/sek-lup/:id", async () => {
    const user = await createValidUser("putseklup");

    const record = await SekLup.create({
      layanan_id: "LY051",
      periode: "2026-03-01",
      tahun: 2026,
      bulan: 3,
      penanggung_jawab: "Sekretaris",
      pelaksana: "Tester",
      is_sensitive: "Sensitif",
      status: "draft",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-lup/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        umkm_tersertifikasi: 22,
        status: "review",
        analisis: "Peningkatan sertifikasi UMKM perlu didorong.",
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.umkm_tersertifikasi).to.equal(22);
    expect(response.body.data.status).to.equal("review");

    const updated = await SekLup.findByPk(record.id);
    expect(updated).to.exist;
    expect(updated.umkm_tersertifikasi).to.equal(22);
    expect(updated.status).to.equal("review");
  });

  it("should return 404 when updating non-existing SEK-LUP record", async () => {
    const user = await createValidUser("putseklup404");
    const token = createAuthToken(user);

    const response = await request(app)
      .put("/api/sek-lup/9876543")
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "final",
      });

    expect(response.status).to.equal(404);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal("SekLup not found");
  });
});
