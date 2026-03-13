import { expect } from "chai";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { sequelize } from "../config/database.js";
import sekKeuRoutes from "../routes/SEK-KEU.js";
import sekAstRoutes from "../routes/SEK-AST.js";

const SekKeu =
  sequelize.models["SEK-KEU"] ||
  sequelize.models.SekKeu ||
  sequelize.models.Sek_keu;
const SekAst =
  sequelize.models["SEK-AST"] ||
  sequelize.models.SekAst ||
  sequelize.models.Sek_ast;
const User = sequelize.models.User;

const DEFAULT_ROLE_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_UNIT_ID = "Sekretariat";

const app = express();
app.use(express.json());
app.use("/api/sek-keu", sekKeuRoutes);
app.use("/api/sek-ast", sekAstRoutes);

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

describe("PUT Endpoint: SEK-KEU & SEK-AST", () => {
  before(() => {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = "test-secret";
    }
  });

  it("should update SEK-KEU record via PUT /api/sek-keu/:id", async () => {
    const user = await createValidUser("putsekkeu");

    const record = await SekKeu.create({
      unit_kerja: "Sekretariat",
      kode_unit: "00",
      layanan_id: "LY016",
      tahun_anggaran: 2026,
      jenis_layanan_keuangan: "RKA/DPA",
      pagu_anggaran: 5000000,
      realisasi: 1000000,
      penanggung_jawab: "Bendahara",
      pelaksana: "Tester",
      is_sensitive: "Sensitif",
      status: "pending",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-keu/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        layanan_id: "LY022",
        jenis_layanan_keuangan: "Monitoring",
        realisasi: 2750000,
        status: "diverifikasi",
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.jenis_layanan_keuangan).to.equal("Monitoring");
    expect(response.body.data.status).to.equal("diverifikasi");

    const updated = await SekKeu.findByPk(record.id);
    expect(updated).to.exist;
    expect(updated.jenis_layanan_keuangan).to.equal("Monitoring");
    expect(updated.layanan_id).to.equal("LY022");
    expect(updated.status).to.equal("diverifikasi");
  });

  it("should return 404 when updating non-existing SEK-KEU record", async () => {
    const user = await createValidUser("putsekkeu404");
    const token = createAuthToken(user);

    const response = await request(app)
      .put("/api/sek-keu/9876543")
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "diverifikasi",
      });

    expect(response.status).to.equal(404);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal("SekKeu not found");
  });

  it("should update SEK-AST record via PUT /api/sek-ast/:id", async () => {
    const user = await createValidUser("putsekast");

    const record = await SekAst.create({
      unit_kerja: "Sekretariat",
      layanan_id: "LY023",
      nama_aset: "Laptop Dinas",
      kategori_aset: "Peralatan dan Mesin",
      kondisi: "Baik",
      status_aset: "Aktif",
      penanggung_jawab: "Kasubbag Umum",
      pelaksana: "Tester",
      is_sensitive: "Biasa",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-ast/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status_aset: "Dalam Perbaikan",
        lokasi: "Gudang Aset",
        nilai_buku: 8500000,
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.status_aset).to.equal("Dalam Perbaikan");
    expect(response.body.data.lokasi).to.equal("Gudang Aset");

    const updated = await SekAst.findByPk(record.id);
    expect(updated).to.exist;
    expect(updated.status_aset).to.equal("Dalam Perbaikan");
    expect(updated.lokasi).to.equal("Gudang Aset");
  });

  it("should return 400 on invalid SEK-AST enum update", async () => {
    const user = await createValidUser("putsekast400");

    const record = await SekAst.create({
      unit_kerja: "Sekretariat",
      layanan_id: "LY023",
      nama_aset: "Printer Gudang",
      kategori_aset: "Peralatan dan Mesin",
      kondisi: "Baik",
      status_aset: "Aktif",
      penanggung_jawab: "Kasubbag Umum",
      pelaksana: "Tester",
      is_sensitive: "Biasa",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-ast/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status_aset: "Status Invalid",
      });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal("Error updating SekAst");
  });
});
