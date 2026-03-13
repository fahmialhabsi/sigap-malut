import { expect } from "chai";
import { sequelize } from "../config/database.js";

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

describe("Integrasi Master Data: SekHum & SekKbj", () => {
  it("should create SekHum with valid minimum payload", async () => {
    const user = await createValidUser("sekhum");

    const sekHum = await SekHum.create({
      layanan_id: "LY035",
      jenis_layanan_humas: "Protokol",
      nama_kegiatan: "Rapat Koordinasi",
      penanggung_jawab: "Kasubbag Umum",
      pelaksana: "Tester",
      status: "pending",
      created_by: user.id,
    });

    expect(sekHum).to.exist;
    expect(sekHum.created_by).to.equal(user.id);
  });

  it("should reject SekHum when jenis_layanan_humas is missing", async () => {
    const user = await createValidUser("sekhumval");

    let error = null;
    try {
      await SekHum.create({
        layanan_id: "LY035",
        jenis_layanan_humas: null,
        nama_kegiatan: "Rapat Koordinasi",
        penanggung_jawab: "Kasubbag Umum",
        pelaksana: "Tester",
        status: "pending",
        created_by: user.id,
      });
    } catch (err) {
      error = err;
    }

    expect(error).to.not.be.null;
    expect(error.name).to.match(/SequelizeValidationError|ValidationError/);
  });

  it("should create SekKbj with valid minimum payload", async () => {
    const user = await createValidUser("sekkbj");

    const sekKbj = await SekKbj.create({
      layanan_id: "LY046",
      jenis_layanan_kebijakan: "Bahan Kebijakan Teknis",
      judul: "Kajian Neraca Pangan",
      periode: "Tahunan",
      tahun: 2026,
      penanggung_jawab: "Sekretaris",
      pelaksana: "Tester",
      status: "draft",
      created_by: user.id,
    });

    expect(sekKbj).to.exist;
    expect(sekKbj.created_by).to.equal(user.id);
  });

  it("should reject SekKbj when judul is missing", async () => {
    const user = await createValidUser("sekkbjval");

    let error = null;
    try {
      await SekKbj.create({
        layanan_id: "LY046",
        jenis_layanan_kebijakan: "Bahan Kebijakan Teknis",
        judul: null,
        periode: "Tahunan",
        tahun: 2026,
        penanggung_jawab: "Sekretaris",
        pelaksana: "Tester",
        status: "draft",
        created_by: user.id,
      });
    } catch (err) {
      error = err;
    }

    expect(error).to.not.be.null;
    expect(error.name).to.match(/SequelizeValidationError|ValidationError/);
  });
});
