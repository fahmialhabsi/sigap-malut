import { expect } from "chai";
import { sequelize } from "../config/database.js";

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

describe("Integrasi Master Data: SekKeu & SekAst", () => {
  it("should create SekKeu with valid minimum payload", async () => {
    const user = await createValidUser("sekkeu");

    const sekKeu = await SekKeu.create({
      unit_kerja: "Sekretariat",
      kode_unit: "00",
      layanan_id: "LY016",
      tahun_anggaran: 2026,
      jenis_layanan_keuangan: "RKA/DPA",
      penanggung_jawab: "Bendahara",
      pelaksana: "Tester",
      is_sensitive: "Sensitif",
      status: "pending",
      created_by: user.id,
    });

    expect(sekKeu).to.exist;
    expect(sekKeu.created_by).to.equal(user.id);
  });

  it("should reject SekKeu when jenis_layanan_keuangan is missing", async () => {
    const user = await createValidUser("sekkeuval");

    let error = null;
    try {
      await SekKeu.create({
        unit_kerja: "Sekretariat",
        kode_unit: "00",
        layanan_id: "LY016",
        tahun_anggaran: 2026,
        jenis_layanan_keuangan: null,
        penanggung_jawab: "Bendahara",
        pelaksana: "Tester",
        is_sensitive: "Sensitif",
        status: "pending",
        created_by: user.id,
      });
    } catch (err) {
      error = err;
    }

    expect(error).to.not.be.null;
    expect(error.name).to.match(/SequelizeValidationError|ValidationError/);
  });

  it("should create SekAst with valid minimum payload", async () => {
    const user = await createValidUser("sekast");

    const sekAst = await SekAst.create({
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

    expect(sekAst).to.exist;
    expect(sekAst.created_by).to.equal(user.id);
  });

  it("should reject SekAst when nama_aset is missing", async () => {
    const user = await createValidUser("sekastval");

    let error = null;
    try {
      await SekAst.create({
        unit_kerja: "Sekretariat",
        layanan_id: "LY023",
        nama_aset: null,
        kategori_aset: "Peralatan dan Mesin",
        kondisi: "Baik",
        status_aset: "Aktif",
        penanggung_jawab: "Kasubbag Umum",
        pelaksana: "Tester",
        is_sensitive: "Biasa",
        created_by: user.id,
      });
    } catch (err) {
      error = err;
    }

    expect(error).to.not.be.null;
    expect(error.name).to.match(/SequelizeValidationError|ValidationError/);
  });
});
