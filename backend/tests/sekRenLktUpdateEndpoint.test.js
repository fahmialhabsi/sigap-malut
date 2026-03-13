import { expect } from "chai";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { sequelize } from "../config/database.js";
import sekRenRoutes from "../routes/SEK-REN.js";
import sekLktRoutes from "../routes/SEK-LKT.js";

const SekRen =
  sequelize.models["SEK-REN"] ||
  sequelize.models.SekRen ||
  sequelize.models.Sek_ren;
const SekLkt =
  sequelize.models["SEK-LKT"] ||
  sequelize.models.SekLkt ||
  sequelize.models.Sek_lkt;
const User = sequelize.models.User;

const DEFAULT_ROLE_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_UNIT_ID = "Sekretariat";

const app = express();
app.use(express.json());
app.use("/api/sek-ren", sekRenRoutes);
app.use("/api/sek-lkt", sekLktRoutes);

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

describe("PUT Endpoint: SEK-REN & SEK-LKT", () => {
  before(() => {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = "test-secret";
    }
  });

  it("should update SEK-REN record via PUT /api/sek-ren/:id", async () => {
    const user = await createValidUser("putsekren");

    const record = await SekRen.create({
      layanan_id: "LY040",
      jenis_layanan_perencanaan: "Renstra",
      tahun_perencanaan: 2026,
      nama_program: "Program Awal",
      penanggung_jawab: "Kasubbag Program",
      pelaksana: "Tester",
      is_sensitive: "Sensitif",
      status: "draft",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-ren/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        layanan_id: "LY041",
        jenis_layanan_perencanaan: "Renja",
        tahun_perencanaan: 2027,
        status: "finalisasi",
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.jenis_layanan_perencanaan).to.equal("Renja");
    expect(response.body.data.status).to.equal("finalisasi");

    const updated = await SekRen.findByPk(record.id);
    expect(updated).to.exist;
    expect(updated.jenis_layanan_perencanaan).to.equal("Renja");
    expect(updated.layanan_id).to.equal("LY041");
    expect(updated.status).to.equal("finalisasi");
  });

  it("should return 404 when updating non-existing SEK-REN record", async () => {
    const user = await createValidUser("putsekren404");
    const token = createAuthToken(user);

    const response = await request(app)
      .put("/api/sek-ren/9876543")
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "final",
      });

    expect(response.status).to.equal(404);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal("SekRen not found");
  });

  it("should update SEK-LKT record via PUT /api/sek-lkt/:id", async () => {
    const user = await createValidUser("putseklkt");

    const record = await SekLkt.create({
      layanan_id: "LY048",
      periode: "2026-03-01",
      tahun: 2026,
      bulan: 3,
      tingkat_kerawanan: "Aman",
      penanggung_jawab: "Sekretaris",
      pelaksana: "Tester",
      is_sensitive: "Biasa",
      status: "draft",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-lkt/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        tingkat_kerawanan: "Waspada",
        status: "review",
        analisis: "Stok menurun pada komoditas beras.",
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.tingkat_kerawanan).to.equal("Waspada");
    expect(response.body.data.status).to.equal("review");

    const updated = await SekLkt.findByPk(record.id);
    expect(updated).to.exist;
    expect(updated.tingkat_kerawanan).to.equal("Waspada");
    expect(updated.status).to.equal("review");
  });

  it("should return 400 on invalid SEK-LKT enum update", async () => {
    const user = await createValidUser("putseklkt400");

    const record = await SekLkt.create({
      layanan_id: "LY048",
      periode: "2026-03-01",
      tahun: 2026,
      bulan: 3,
      tingkat_kerawanan: "Aman",
      penanggung_jawab: "Sekretaris",
      pelaksana: "Tester",
      is_sensitive: "Biasa",
      status: "draft",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-lkt/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        tingkat_kerawanan: "Kritis",
      });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal("Error updating SekLkt");
  });
});
