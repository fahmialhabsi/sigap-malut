import { expect } from "chai";
import { sequelize } from "../config/database.js";

const BDSMON =
  sequelize.models.BdsMon ||
  sequelize.models["BDS-MON"] ||
  sequelize.models.Bds_mon;
const User = sequelize.models.User;

const DEFAULT_ROLE_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_UNIT_ID = "Bidang Distribusi";

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
    unit_kerja: "Bidang Distribusi",
    unit_id: DEFAULT_UNIT_ID,
    role_id: DEFAULT_ROLE_ID,
    email: `${uniq}@test.com`,
    jabatan: "Staff",
  });
}

describe("Integrasi Master Data: BDS-MON", () => {
  it("should persist komoditas_id on valid minimum payload", async () => {
    const user = await createValidUser("bdsmon");

    const row = await BDSMON.create({
      unit_kerja: "Bidang Distribusi",
      layanan_id: "LY082",
      jenis_monitoring: "Arus Distribusi",
      periode: "2026-03-01",
      tahun: 2026,
      bulan: 3,
      komoditas_id: 123456,
      pelaksana: "Tester",
      created_by: user.id,
    });

    expect(row).to.exist;
    expect(row.komoditas_id).to.equal(123456);
  });

  it("should reject BDS-MON when jenis_monitoring is missing", async () => {
    const user = await createValidUser("bdsmonval");

    let error = null;
    try {
      await BDSMON.create({
        unit_kerja: "Bidang Distribusi",
        layanan_id: "LY082",
        jenis_monitoring: null,
        periode: "2026-03-01",
        tahun: 2026,
        bulan: 3,
        komoditas_id: 123456,
        pelaksana: "Tester",
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
