import { expect } from "chai";
import { sequelize } from "../config/database.js";

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

describe("Integrasi Master Data: SekAdm & SekKep", () => {
  it("should create SekAdm with valid minimum payload", async () => {
    const user = await createValidUser("sekadm");
    const uniq = createUserSuffix();

    const sekAdm = await SekAdm.create({
      unit_kerja: "Sekretariat",
      layanan_id: "LY001",
      nomor_surat: `SM-${uniq}`,
      jenis_naskah: "Surat Masuk",
      tanggal_surat: "2026-03-13",
      pengirim_penerima: "Dinas Contoh",
      perihal: "Uji integrasi SekAdm",
      penanggung_jawab: "Kasubbag Umum",
      pelaksana: "Tester",
      status: "pending",
      created_by: user.id,
    });

    expect(sekAdm).to.exist;
    expect(sekAdm.created_by).to.equal(user.id);
  });

  it("should create SekKep with valid minimum payload", async () => {
    const user = await createValidUser("sekkep");

    const sekKep = await SekKep.create({
      layanan_id: "LY008",
      asn_id: 1,
      nip: "197501011999031001",
      nama_asn: "ASN Uji SekKep",
      jenis_layanan_kepegawaian: "Data Induk",
      penanggung_jawab: "Kasubbag Kepegawaian",
      pelaksana: "Tester",
      status: "pending",
      created_by: user.id,
    });

    expect(sekKep).to.exist;
    expect(sekKep.created_by).to.equal(user.id);
  });

  it("should reject SekAdm when layanan_id is missing", async () => {
    const uniq = createUserSuffix();
    const user = await createValidUser("sekadmval");

    let error = null;
    try {
      await SekAdm.create({
        unit_kerja: "Sekretariat",
        layanan_id: null,
        nomor_surat: `SM-NOLAYANAN-${uniq}`,
        jenis_naskah: "Surat Masuk",
        tanggal_surat: "2026-03-13",
        pengirim_penerima: "Dinas Contoh",
        perihal: "Uji validasi layanan_id",
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

  it("should reject SekKep when jenis_layanan_kepegawaian is missing", async () => {
    const user = await createValidUser("sekkepval");

    let error = null;
    try {
      await SekKep.create({
        layanan_id: "LY008",
        asn_id: 10,
        nip: "197501011999031010",
        nama_asn: "ASN Uji Validasi",
        jenis_layanan_kepegawaian: null,
        penanggung_jawab: "Kasubbag Kepegawaian",
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
});
