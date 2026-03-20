import "../models/index.js";
import { sequelize } from "../config/database.js";
const BDSHRG = sequelize.models.BdsHrg;
const Komoditas = sequelize.models.Komoditas;

describe("Integrasi Master Data: BDS-HRG", () => {
  test("should only accept valid komoditas_id from master Komoditas", async () => {
    const uniq = Date.now();
    const komoditas = await Komoditas.create({
      nama: `Komoditas${uniq}`,
      satuan: "kg",
      kode: `K${uniq}`,
    });
    const bdsHrg = await BDSHRG.create({
      komoditas_id: komoditas.id,
      tahun: 2026,
      harga: 5000,
      unit_kerja: "Sekretariat",
      layanan_id: "LY087",
      jenis_layanan_harga: "Pemantauan Harga",
      periode: "2026-01-01",
      bulan: 1,
      satuan: "kg",
      penanggung_jawab: "Admin",
      pelaksana: "Admin",
      created_by: 1,
    });
    expect(bdsHrg.komoditas_id).toBeDefined();
    // Coba insert dengan komoditas_id tidak valid
    await expect(
      BDSHRG.create({
        komoditas_id: 99999999,
        tahun: 2026,
        harga: 5000,
        unit_kerja: "Sekretariat",
        layanan_id: "LY087",
        jenis_layanan_harga: "Pemantauan Harga",
        periode: "2026-01-01",
        bulan: 1,
        satuan: "kg",
        penanggung_jawab: "Admin",
        pelaksana: "Admin",
        created_by: 1,
      }),
    ).rejects.toThrow(
      /violates foreign key constraint|SequelizeForeignKeyConstraintError|ValidationError/,
    );
  });
});
