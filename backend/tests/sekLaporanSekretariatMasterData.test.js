import { expect } from "chai";
import { sequelize } from "../config/database.js";

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

describe("Integrasi Master Data: SekLds, SekLks, SekLup", () => {
  it("should create SekLds with valid minimum payload", async () => {
    const user = await createValidUser("seklds");

    const sekLds = await SekLds.create({
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

    expect(sekLds).to.exist;
    expect(sekLds.created_by).to.equal(user.id);
  });

  it("should reject SekLds when periode is missing", async () => {
    const user = await createValidUser("sekldsval");

    let error = null;
    try {
      await SekLds.create({
        layanan_id: "LY049",
        periode: null,
        tahun: 2026,
        bulan: 3,
        penanggung_jawab: "Sekretaris",
        pelaksana: "Tester",
        is_sensitive: "Biasa",
        status: "draft",
        created_by: user.id,
      });
    } catch (err) {
      error = err;
    }

    expect(error).to.not.be.null;
    expect(error.name).to.match(
      /SequelizeValidationError|ValidationError|SequelizeDatabaseError/,
    );
  });

  it("should create SekLks with valid minimum payload", async () => {
    const user = await createValidUser("seklks");

    const sekLks = await SekLks.create({
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

    expect(sekLks).to.exist;
    expect(sekLks.created_by).to.equal(user.id);
  });

  it("should reject SekLks when status_pph enum is invalid", async () => {
    const user = await createValidUser("seklksval");

    let error = null;
    try {
      await SekLks.create({
        layanan_id: "LY050",
        periode: "2026-03-01",
        tahun: 2026,
        bulan: 3,
        status_pph: "Tidak Valid",
        penanggung_jawab: "Sekretaris",
        pelaksana: "Tester",
        is_sensitive: "Biasa",
        status: "draft",
        created_by: user.id,
      });
    } catch (err) {
      error = err;
    }

    expect(error).to.not.be.null;
    expect(error.name).to.match(
      /SequelizeValidationError|ValidationError|SequelizeDatabaseError/,
    );
  });

  it("should create SekLup with valid minimum payload", async () => {
    const user = await createValidUser("seklup");

    const sekLup = await SekLup.create({
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

    expect(sekLup).to.exist;
    expect(sekLup.created_by).to.equal(user.id);
  });

  it("should reject SekLup when periode is missing", async () => {
    const user = await createValidUser("seklupval");

    let error = null;
    try {
      await SekLup.create({
        layanan_id: "LY051",
        periode: null,
        tahun: 2026,
        bulan: 3,
        penanggung_jawab: "Sekretaris",
        pelaksana: "Tester",
        is_sensitive: "Sensitif",
        status: "draft",
        created_by: user.id,
      });
    } catch (err) {
      error = err;
    }

    expect(error).to.not.be.null;
    expect(error.name).to.match(
      /SequelizeValidationError|ValidationError|SequelizeDatabaseError/,
    );
  });
});
