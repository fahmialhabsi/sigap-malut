import { expect } from "chai";
import SekKeu from "../models/SEK-KEU.js";
import User from "../models/User.js";

describe("Integrasi Master Data: SekKeu", () => {
  it("should only accept valid created_by from master User", function (done) {
    const uniq = Date.now();
    User.create({
      username: `sekkeu${uniq}`,
      password: "password123",
      nama_lengkap: "Tester SekKeu",
      unit_kerja: "Sekretariat",
      email: `sekkeu${uniq}@test.com`,
      role: "pelaksana",
      jabatan: "Staff",
    })
      .then((user) => {
        return SekKeu.create({
          unit_kerja: "Sekretariat",
          kode_unit: "00",
          layanan_id: "LY016",
          tahun_anggaran: 2026,
          jenis_layanan_keuangan: "SPJ",
          penanggung_jawab: "Bendahara",
          pelaksana: "Tester",
          is_sensitive: "Biasa",
          status: "pending",
          created_by: user.id,
        });
      })
      .then((sekKeu) => {
        expect(sekKeu.created_by).to.exist;
        return SekKeu.create({
          unit_kerja: "Sekretariat",
          kode_unit: "00",
          layanan_id: "LY016",
          tahun_anggaran: 2026,
          jenis_layanan_keuangan: "SPJ",
          penanggung_jawab: "Bendahara",
          pelaksana: "Tester",
          is_sensitive: "Biasa",
          status: "pending",
          created_by: 99999999,
        });
      })
      .then(() => done(new Error("Should fail with FK constraint error")))
      .catch((error) => {
        expect(error).to.not.be.null;
        expect(error.name).to.match(
          /SequelizeForeignKeyConstraintError|ValidationError/,
        );
        done();
      });
  });
});
