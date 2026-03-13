import { expect } from "chai";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { sequelize } from "../config/database.js";
import sekRmhRoutes from "../routes/SEK-RMH.js";

const SekRmh =
  sequelize.models["SEK-RMH"] ||
  sequelize.models.SekRmh ||
  sequelize.models.Sek_rmh;
const User = sequelize.models.User;

const DEFAULT_ROLE_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_UNIT_ID = "Sekretariat";

const app = express();
app.use(express.json());
app.use("/api/sek-rmh", sekRmhRoutes);

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

describe("PUT Endpoint: SEK-RMH", () => {
  before(() => {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = "test-secret";
    }
  });

  it("should update SEK-RMH record via PUT /api/sek-rmh/:id", async () => {
    const user = await createValidUser("putsekrmh");

    const record = await SekRmh.create({
      layanan_id: "LY029",
      jenis_layanan_rumah_tangga: "Perjalanan Dinas",
      nama_pegawai: "Pegawai Uji",
      tujuan: "Ternate",
      penanggung_jawab: "Kasubbag Umum",
      pelaksana: "Tester",
      is_sensitive: "Biasa",
      status: "pending",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-rmh/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        layanan_id: "LY034",
        jenis_layanan_rumah_tangga: "Kendaraan",
        nomor_polisi: "DG 1234 XX",
        driver: "Driver Uji",
        status: "disetujui",
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.jenis_layanan_rumah_tangga).to.equal("Kendaraan");
    expect(response.body.data.status).to.equal("disetujui");

    const updated = await SekRmh.findByPk(record.id);
    expect(updated).to.exist;
    expect(updated.jenis_layanan_rumah_tangga).to.equal("Kendaraan");
    expect(updated.layanan_id).to.equal("LY034");
    expect(updated.status).to.equal("disetujui");
  });

  it("should return 404 when updating non-existing SEK-RMH record", async () => {
    const user = await createValidUser("putsekrmh404");
    const token = createAuthToken(user);

    const response = await request(app)
      .put("/api/sek-rmh/9876543")
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "disetujui",
      });

    expect(response.status).to.equal(404);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal("SekRmh not found");
  });

  it("should return 400 on invalid SEK-RMH enum update", async () => {
    const user = await createValidUser("putsekrmh400");

    const record = await SekRmh.create({
      layanan_id: "LY029",
      jenis_layanan_rumah_tangga: "Kebersihan",
      area_kebersihan: "Ruang Arsip",
      penanggung_jawab: "Kasubbag Umum",
      pelaksana: "Tester",
      is_sensitive: "Biasa",
      status: "pending",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-rmh/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "status-invalid",
      });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal("Error updating SekRmh");
  });
});
