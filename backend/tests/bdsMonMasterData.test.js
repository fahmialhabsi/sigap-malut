import "../models/index.js";
import { sequelize } from "../config/database.js";
const BDSMON = sequelize.models.BdsMon;
const Komoditas = sequelize.models.Komoditas;

describe("Integrasi Master Data: BDS-MON", () => {
  test("should only accept valid komoditas_id from master Komoditas", async () => {
    const uniq = Date.now();
    const komoditas = await Komoditas.create({
      nama: `Komoditas${uniq}`,
      satuan: "kg",
      kode: `K${uniq}`,
    });
    const bdsMon = await BDSMON.create({
      komoditas_id: komoditas.id,
      tahun: 2026,
      stok: 100,
      unit_kerja: "Sekretariat",
      layanan_id: "LY082",
      jenis_monitoring: "Arus Distribusi",
      periode: "2026-01-01",
      bulan: 1,
      satuan: "kg",
      penanggung_jawab: "Admin",
      pelaksana: "Admin",
      created_by: 1,
    });
    expect(bdsMon.komoditas_id).toBeDefined();
    // Coba insert dengan komoditas_id tidak valid
    await expect(
      BDSMON.create({
        komoditas_id: 99999999,
        tahun: 2026,
        stok: 100,
        unit_kerja: "Sekretariat",
        layanan_id: "LY082",
        jenis_monitoring: "Arus Distribusi",
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
