import { expect } from "chai";
import BDSHRG from "../models/BDS-HRG.js";
import Komoditas from "../models/komoditas.js";

describe("Integrasi Master Data: BDS-HRG", () => {
  it("should only accept valid komoditas_id from master Komoditas", function (done) {
    const uniq = Date.now();
    Komoditas.create({
      nama: `Komoditas${uniq}`,
      satuan: "kg",
      kode: `K${uniq}`,
    })
      .then((komoditas) => {
        return BDSHRG.create({
          komoditas_id: komoditas.id,
          tahun: 2026,
          harga: 5000,
        });
      })
      .then((bdsHrg) => {
        expect(bdsHrg.komoditas_id).to.exist;
        return BDSHRG.create({
          komoditas_id: 99999999,
          tahun: 2026,
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
