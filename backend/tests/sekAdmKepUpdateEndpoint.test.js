import { expect } from "chai";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { sequelize } from "../config/database.js";
import sekAdmRoutes from "../routes/SEK-ADM.js";
import sekKepRoutes from "../routes/SEK-KEP.js";

const SekAdm =
  sequelize.models["SEK-ADM"] ||
  sequelize.models.SekAdm ||
  sequelize.models.Sek_adm;
const SekKep =
  sequelize.models["SEK-KEP"] ||
  sequelize.models.SekKep ||
  sequelize.models.Sek_kep;
const User = sequelize.models.User;

const DEFAULT_ROLE_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_UNIT_ID = "Sekretariat";

const app = express();
app.use(express.json());
app.use("/api/sek-adm", sekAdmRoutes);
app.use("/api/sek-kep", sekKepRoutes);

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

describe("PUT Endpoint: SEK-ADM & SEK-KEP", () => {
  before(() => {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = "test-secret";
    }
  });

  it("should update SEK-ADM record via PUT /api/sek-adm/:id", async () => {
    const user = await createValidUser("putsekadm");
    const uniq = createUserSuffix();

    const record = await SekAdm.create({
      unit_kerja: "Sekretariat",
      layanan_id: "LY001",
      nomor_surat: `SM-PUT-${uniq}`,
      jenis_naskah: "Surat Masuk",
      tanggal_surat: "2026-03-13",
      pengirim_penerima: "Dinas Contoh",
      perihal: "Perihal awal",
      penanggung_jawab: "Kasubbag Umum",
      pelaksana: "Tester",
      status: "pending",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-adm/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        perihal: "Perihal update endpoint",
        status: "proses",
        keterangan: "Diperbarui via test PUT",
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.perihal).to.equal("Perihal update endpoint");
    expect(response.body.data.status).to.equal("proses");

    const updated = await SekAdm.findByPk(record.id);
    expect(updated).to.exist;
    expect(updated.perihal).to.equal("Perihal update endpoint");
    expect(updated.status).to.equal("proses");
  });

  it("should return 404 when updating non-existing SEK-ADM record", async () => {
    const user = await createValidUser("putsekadm404");
    const token = createAuthToken(user);

    const response = await request(app)
      .put("/api/sek-adm/9876543")
      .set("Authorization", `Bearer ${token}`)
      .send({
        perihal: "Tidak akan tersimpan",
        status: "proses",
      });

    expect(response.status).to.equal(404);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal("SekAdm not found");
  });

  it("should update SEK-KEP record via PUT /api/sek-kep/:id", async () => {
    const user = await createValidUser("putsekkep");

    const record = await SekKep.create({
      layanan_id: "LY012",
      asn_id: 31,
      nip: "197601011999031031",
      nama_asn: "ASN Uji PUT",
      jenis_layanan_kepegawaian: "Cuti",
      jenis_cuti: "Tahunan",
      tanggal_mulai_cuti: "2026-03-10",
      tanggal_selesai_cuti: "2026-03-11",
      lama_cuti: 2,
      penanggung_jawab: "Kasubbag Kepegawaian",
      pelaksana: "Tester",
      status: "pending",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-kep/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        tanggal_selesai_cuti: "2026-03-13",
        lama_cuti: 4,
        nomor_sk: "SK-UPDATE-001",
        status: "proses",
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.status).to.equal("proses");
    expect(response.body.data.lama_cuti).to.equal(4);

    const updated = await SekKep.findByPk(record.id);
    expect(updated).to.exist;
    expect(updated.status).to.equal("proses");
    expect(updated.lama_cuti).to.equal(4);
    expect(updated.nomor_sk).to.equal("SK-UPDATE-001");
  });

  it("should return 400 on invalid SEK-KEP enum update", async () => {
    const user = await createValidUser("putsekkep400");

    const record = await SekKep.create({
      layanan_id: "LY008",
      asn_id: 41,
      nip: "197701011999031041",
      nama_asn: "ASN Uji Invalid Update",
      jenis_layanan_kepegawaian: "Data Induk",
      penanggung_jawab: "Kasubbag Kepegawaian",
      pelaksana: "Tester",
      status: "pending",
      created_by: user.id,
    });

    const token = createAuthToken(user);

    const response = await request(app)
      .put(`/api/sek-kep/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "status-invalid",
      });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal("Error updating SekKep");
  });
});
