import { expect } from "chai";
import { sequelize } from "../config/database.js";

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

describe("Integrasi Master Data: SekRen & SekLkt", () => {
  it("should create SekRen with valid minimum payload", async () => {
    const user = await createValidUser("sekren");

    const sekRen = await SekRen.create({
      layanan_id: "LY040",
      jenis_layanan_perencanaan: "Renstra",
      tahun_perencanaan: 2026,
      penanggung_jawab: "Kasubbag Program",
      pelaksana: "Tester",
      status: "draft",
      created_by: user.id,
    });

    expect(sekRen).to.exist;
    expect(sekRen.created_by).to.equal(user.id);
  });

  it("should reject SekRen when jenis_layanan_perencanaan is missing", async () => {
    const user = await createValidUser("sekrenval");

    let error = null;
    try {
      await SekRen.create({
        layanan_id: "LY040",
        jenis_layanan_perencanaan: null,
        tahun_perencanaan: 2026,
        penanggung_jawab: "Kasubbag Program",
        pelaksana: "Tester",
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

  it("should create SekLkt with valid minimum payload", async () => {
    const user = await createValidUser("seklkt");

    const sekLkt = await SekLkt.create({
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

    expect(sekLkt).to.exist;
    expect(sekLkt.created_by).to.equal(user.id);
  });

  it("should reject SekLkt when tingkat_kerawanan enum is invalid", async () => {
    const user = await createValidUser("seklktval");

    let error = null;
    try {
      await SekLkt.create({
        layanan_id: "LY048",
        periode: "2026-03-01",
        tahun: 2026,
        bulan: 3,
        tingkat_kerawanan: "Kritis",
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
});
