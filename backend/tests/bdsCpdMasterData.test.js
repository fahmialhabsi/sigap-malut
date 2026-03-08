import { expect } from "chai";
const BDSCPD = sequelize.models.BdsCpd || sequelize.models.BdsCpd;
import { sequelize } from "../config/database.js";
const Komoditas = sequelize.models.Komoditas;

describe("Integrasi Master Data: BDS-CPD", () => {
  it("should only accept valid komoditas_id from master Komoditas", function (done) {
    this.timeout(5000);
    console.log(
      "DEBUG BDSCPD model:",
      typeof BDSCPD,
      BDSCPD && typeof BDSCPD.create,
    );
    const uniq = Date.now();
    Komoditas.create({
      nama: `Komoditas${uniq}`,
      satuan: "kg",
      kode: `K${uniq}`,
    })
      .then((komoditas) => {
        return BDSCPD.create({
          komoditas_id: komoditas.id,
          tahun: 2026,
          stok: 100,
          harga: 5000,
        });
      })
      .then((bdsCpd) => {
        expect(bdsCpd.komoditas_id).to.exist;
        return BDSCPD.create({
          komoditas_id: 99999999,
          tahun: 2026,
          stok: 100,
          harga: 5000,
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
