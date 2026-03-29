// backend/controllers/sekretaris/programPrioritasController.js
// Widget SPPG (Makan Bergizi Gratis) + TPID untuk Sekretaris

import { Op, QueryTypes } from "sequelize";
import sequelize from "../../config/database.js";

// Kabupaten/Kota di Maluku Utara (10 wilayah)
const KAB_KOTA = [
  "Ternate", "Tidore Kepulauan", "Halmahera Barat", "Halmahera Tengah",
  "Halmahera Timur", "Halmahera Selatan", "Halmahera Utara",
  "Kepulauan Sula", "Pulau Taliabu", "Pulau Morotai",
];

// GET /api/sekretaris/sppg/status
export const getSppgStatus = async (req, res) => {
  try {
    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();

    // Coba ambil dari tabel SPPG jika ada
    const sppgData = await sequelize.query(
      `SELECT kabupaten, COUNT(*) as total_data,
              SUM(CASE WHEN is_valid = 1 OR is_valid = TRUE THEN 1 ELSE 0 END) as data_valid
       FROM sppg
       WHERE bulan = :bulan AND tahun = :tahun AND deleted_at IS NULL
       GROUP BY kabupaten`,
      { type: QueryTypes.SELECT, replacements: { bulan, tahun } }
    ).catch(() => []);

    // Build status per kab/kota
    const statusPerKab = KAB_KOTA.map((kab) => {
      const data = sppgData.find((d) => d.kabupaten === kab);
      return {
        kabupaten: kab,
        sudah_input: !!data,
        total_data: data?.total_data || 0,
        data_valid: data?.data_valid || 0,
        pct_valid: data?.total_data > 0 ? Math.round((data.data_valid / data.total_data) * 100) : 0,
      };
    });

    const sudahInput = statusPerKab.filter((k) => k.sudah_input).length;
    const belumInput = statusPerKab.filter((k) => !k.sudah_input);

    res.json({
      success: true,
      data: {
        periode: { bulan, tahun },
        total_kab_kota: KAB_KOTA.length,
        sudah_input: sudahInput,
        belum_input: belumInput.length,
        pct_coverage: Math.round((sudahInput / KAB_KOTA.length) * 100),
        detail: statusPerKab,
        alert: belumInput.length > 0 ? `${belumInput.length} wilayah belum input data SPPG bulan ini` : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/sekretaris/tpid/data
export const getTpidData = async (req, res) => {
  try {
    // Data koordinasi TPID — dari tabel rapat/koordinasi jika ada
    const rapatTpid = await sequelize.query(
      `SELECT * FROM tpid_rapat ORDER BY tanggal DESC LIMIT 5`,
      { type: QueryTypes.SELECT }
    ).catch(() => []);

    // Harga komoditas terkini dari BDS-HRG untuk bahan rapat
    const hargaTerkini = await sequelize.query(
      `SELECT komoditas_id, AVG(harga_eceran) as avg_harga, MAX(tanggal) as last_update
       FROM "BDS-HRG" WHERE deleted_at IS NULL
       GROUP BY komoditas_id LIMIT 10`,
      { type: QueryTypes.SELECT }
    ).catch(() => []);

    // Jadwal rapat berikutnya (simulasi jika tabel tidak ada)
    const jadwalBerikutnya = rapatTpid.length > 0 ? null : {
      tanggal: null,
      keterangan: "Jadwal belum ditetapkan",
    };

    res.json({
      success: true,
      data: {
        rapat_terakhir: rapatTpid.slice(0, 3),
        jadwal_berikutnya: jadwalBerikutnya,
        harga_komoditas: hargaTerkini,
        kesiapan_data: hargaTerkini.length > 0 ? "siap" : "perlu_update",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
