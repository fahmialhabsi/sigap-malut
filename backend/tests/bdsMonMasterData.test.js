import { expect } from "chai";
const BDSMON = sequelize.models.BdsMon || sequelize.models.BdsMon;
import { sequelize } from "../config/database.js";
const Komoditas = sequelize.models.Komoditas;

describe("Integrasi Master Data: BDS-MON", () => {
  it("should only accept valid komoditas_id from master Komoditas", function (done) {
    this.timeout(5000);
    console.log(
      "DEBUG BDSMON model:",
      typeof BDSMON,
      BDSMON && typeof BDSMON.create,
    );
    const uniq = Date.now();
    Komoditas.create({
      nama: `Komoditas${uniq}`,
      satuan: "kg",
      kode: `K${uniq}`,
    })
      .then((komoditas) => {
        return BDSMON.create({
          komoditas_id: komoditas.id,
          tahun: 2026,
          stok: 100,
        });
      })
      .then((bdsMon) => {
        expect(bdsMon.komoditas_id).to.exist;
        return BDSMON.create({
          komoditas_id: 99999999,
          tahun: 2026,
          stok: 100,
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
