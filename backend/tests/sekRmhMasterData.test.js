import { expect } from "chai";
import { sequelize } from "../config/database.js";

const SekRmh =
  sequelize.models["SEK-RMH"] ||
  sequelize.models.SekRmh ||
  sequelize.models.Sek_rmh;
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

describe("Integrasi Master Data: SekRmh", () => {
  it("should create SekRmh with valid minimum payload", async () => {
    const user = await createValidUser("sekrmh");

    const sekRmh = await SekRmh.create({
      layanan_id: "LY029",
      jenis_layanan_rumah_tangga: "Perjalanan Dinas",
      penanggung_jawab: "Kasubbag Umum",
      pelaksana: "Tester",
      is_sensitive: "Biasa",
      status: "pending",
      created_by: user.id,
    });

    expect(sekRmh).to.exist;
    expect(sekRmh.created_by).to.equal(user.id);
  });

  it("should reject SekRmh when jenis_layanan_rumah_tangga is missing", async () => {
    const user = await createValidUser("sekrmhval");

    let error = null;
    try {
      await SekRmh.create({
        layanan_id: "LY029",
        jenis_layanan_rumah_tangga: null,
        penanggung_jawab: "Kasubbag Umum",
        pelaksana: "Tester",
        is_sensitive: "Biasa",
        status: "pending",
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

  it("should reject SekRmh when status enum is invalid", async () => {
    const user = await createValidUser("sekrmhstatus");

    let error = null;
    try {
      await SekRmh.create({
        layanan_id: "LY029",
        jenis_layanan_rumah_tangga: "Kebersihan",
        penanggung_jawab: "Kasubbag Umum",
        pelaksana: "Tester",
        is_sensitive: "Biasa",
        status: "status-invalid",
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
