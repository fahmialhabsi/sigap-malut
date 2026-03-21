import "../models/index.js";
import { sequelize } from "../config/database.js";
const SekKeu =
  sequelize.models["SEK-KEU"] ||
  sequelize.models.SekKeu ||
  sequelize.models.Sek_keu;
const User = sequelize.models.User;

describe("Integrasi Master Data: SekKeu", () => {
  test("should only accept valid created_by from master User", async () => {
    const uniq = Date.now();
    const user = await User.create({
      username: `sekkeu${uniq}`,
      password: "password123",
      nama_lengkap: "Tester SekKeu",
      unit_kerja: "Sekretariat",
      email: `sekkeu${uniq}@test.com`,
      role: "pelaksana",
      jabatan: "Staff",
    });
    const sekKeu = await SekKeu.create({
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
    expect(sekKeu.created_by).toBeDefined();
    // Coba insert dengan created_by tidak valid
    await expect(
      SekKeu.create({
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
      }),
    ).rejects.toThrow(
      /violates foreign key constraint|SequelizeForeignKeyConstraintError|ValidationError/,
    );
  });
});
