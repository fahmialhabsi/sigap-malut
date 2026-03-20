import "../models/index.js";
import { sequelize } from "../config/database.js";
const BDSCPD = sequelize.models.BdsCpd;
const Komoditas = sequelize.models.Komoditas;

describe("Integrasi Master Data: BDS-CPD", () => {
  test("should only accept valid komoditas_id from master Komoditas", async () => {
    const uniq = Date.now();
    const komoditas = await Komoditas.create({
      nama: `Komoditas${uniq}`,
      satuan: "kg",
      kode: `K${uniq}`,
    });
    const bdsCpd = await BDSCPD.create({
      komoditas_id: komoditas.id,
      tahun: 2026,
      stok: 100,
      harga: 5000,
      unit_kerja: "Sekretariat",
      layanan_id: "LY092",
      jenis_layanan_cppd: "Perencanaan",
      periode: "2026-01-01",
      pelaksana: "Admin",
      created_by: 1,
    });
    expect(bdsCpd.komoditas_id).toBeDefined();
    // Coba insert dengan komoditas_id tidak valid
    await expect(
      BDSCPD.create({
        komoditas_id: 99999999,
        tahun: 2026,
        stok: 100,
        harga: 5000,
        unit_kerja: "Sekretariat",
        layanan_id: "LY092",
        jenis_layanan_cppd: "Perencanaan",
        periode: "2026-01-01",
        pelaksana: "Admin",
        created_by: 1,
      }),
    ).rejects.toThrow(
      /violates foreign key constraint|SequelizeForeignKeyConstraintError|ValidationError/,
    );
  });
});
