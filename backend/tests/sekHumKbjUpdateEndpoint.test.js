import { expect } from "chai";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { sequelize } from "../config/database.js";
import sekHumRoutes from "../routes/SEK-HUM.js";
import sekKbjRoutes from "../routes/SEK-KBJ.js";

const SekHum =
  sequelize.models["SEK-HUM"] ||
  sequelize.models.SekHum ||
  sequelize.models.Sek_hum;
const SekKbj =
  sequelize.models["SEK-KBJ"] ||
  sequelize.models.SekKbj ||
  sequelize.models.Sek_kbj;
const User = sequelize.models.User;

const DEFAULT_ROLE_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_UNIT_ID = "Sekretariat";

const app = express();
app.use(express.json());
app.use("/api/sek-hum", sekHumRoutes);
app.use("/api/sek-kbj", sekKbjRoutes);

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

describe("PUT Endpoint: SEK-HUM & SEK-KBJ", () => {
  before(() => {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = "test-secret";
    }
  });

  it("should update SEK-HUM record via PUT /api/sek-hum/:id", async () => {
    const user = await createValidUser("putsekhum");

    const record = await SekHum.create({
      layanan_id: "LY035",
      jenis_layanan_humas: "Protokol",
      nama_kegiatan: "Rapat Awal",
      penanggung_jawab: "Kasubbag Umum",
      pelaksana: "Tester",
      status: "pending",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-hum/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        layanan_id: "LY036",
        jenis_layanan_humas: "Acara Resmi",
        status: "berlangsung",
        tempat: "Aula Dinas",
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.jenis_layanan_humas).to.equal("Acara Resmi");
    expect(response.body.data.status).to.equal("berlangsung");

    const updated = await SekHum.findByPk(record.id);
    expect(updated).to.exist;
    expect(updated.jenis_layanan_humas).to.equal("Acara Resmi");
    expect(updated.layanan_id).to.equal("LY036");
    expect(updated.status).to.equal("berlangsung");
  });

  it("should return 404 when updating non-existing SEK-HUM record", async () => {
    const user = await createValidUser("putsekhum404");
    const token = createAuthToken(user);

    const response = await request(app)
      .put("/api/sek-hum/9876543")
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "selesai",
      });

    expect(response.status).to.equal(404);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal("SekHum not found");
  });

  it("should update SEK-KBJ record via PUT /api/sek-kbj/:id", async () => {
    const user = await createValidUser("putsekkbj");

    const record = await SekKbj.create({
      layanan_id: "LY046",
      jenis_layanan_kebijakan: "Bahan Kebijakan Teknis",
      judul: "Kajian Awal",
      periode: "Tahunan",
      tahun: 2026,
      penanggung_jawab: "Sekretaris",
      pelaksana: "Tester",
      status: "draft",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-kbj/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        layanan_id: "LY047",
        jenis_layanan_kebijakan: "Rekapitulasi Laporan",
        rekapitulasi_keuangan: "Rekap disusun dari data triwulan.",
        status: "review",
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.jenis_layanan_kebijakan).to.equal(
      "Rekapitulasi Laporan",
    );
    expect(response.body.data.status).to.equal("review");

    const updated = await SekKbj.findByPk(record.id);
    expect(updated).to.exist;
    expect(updated.jenis_layanan_kebijakan).to.equal("Rekapitulasi Laporan");
    expect(updated.layanan_id).to.equal("LY047");
    expect(updated.status).to.equal("review");
  });

  it("should return 400 on invalid SEK-KBJ enum update", async () => {
    const user = await createValidUser("putsekkbj400");

    const record = await SekKbj.create({
      layanan_id: "LY046",
      jenis_layanan_kebijakan: "Bahan Kebijakan Teknis",
      judul: "Kajian Valid",
      periode: "Tahunan",
      tahun: 2026,
      penanggung_jawab: "Sekretaris",
      pelaksana: "Tester",
      status: "draft",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-kbj/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "status-invalid",
      });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal("Error updating SekKbj");
  });
});
