import { Op, fn, col } from "sequelize";
import { Parser as Json2CsvParser } from "json2csv";
import HargaPangan from "../models/HargaPangan.js";
import InflasiHarian from "../models/InflasiHarian.js";
import UmkmPangan from "../models/UmkmPangan.js";
import StokPangan from "../models/StokPangan.js";
import Komoditas from "../models/komoditas.js";

const DEFAULT_DAYS = 30;
const MAX_DAYS = 366;

function clampDays(raw) {
  const n = Number(raw || DEFAULT_DAYS);
  if (!Number.isFinite(n)) return DEFAULT_DAYS;
  return Math.max(1, Math.min(MAX_DAYS, Math.floor(n)));
}

function dateOnlyNDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  // keep DATEONLY compatibility in PG
  return d.toISOString().slice(0, 10);
}

/**
 * Baris CPPD / cadangan publik diidentifikasi dari nama lokasi gudang (input operasional).
 * Stok operasional utama: **Gudang Bulog Ternate** (Provinsi Maluku Utara).
 */
function cppdStokWhere() {
  return {
    [Op.or]: [
      { lokasi_gudang: { [Op.iLike]: "%Gudang Bulog Ternate%" } },
      {
        [Op.and]: [
          { lokasi_gudang: { [Op.iLike]: "%Bulog%" } },
          { lokasi_gudang: { [Op.iLike]: "%Ternate%" } },
        ],
      },
      { lokasi_gudang: { [Op.iLike]: "%CPPD%" } },
      { lokasi_gudang: { [Op.iLike]: "%Cadangan Pemerintah%" } },
      { lokasi_gudang: { [Op.iLike]: "%Badan Pangan%" } },
    ],
  };
}

function statusRank(s) {
  const x = String(s || "").toLowerCase();
  if (x === "kritis") return 3;
  if (x === "waspada") return 2;
  return 1;
}

function worstStatus(statuses) {
  let out = "aman";
  for (const s of statuses) {
    if (statusRank(s) > statusRank(out)) out = String(s || "aman").toLowerCase();
  }
  return out;
}

/**
 * Agregat publik CPPD Provinsi Maluku Utara dari `stok_pangan`
 * (tanggal pembaruan terakhir + jumlah per komoditas).
 */
export async function computePublicCppd() {
  const where = cppdStokWhere();
  const maxDate = await StokPangan.max("tanggal_update", { where }).catch(
    () => null,
  );

  if (!maxDate) {
    return {
      status_keseluruhan: null,
      tanggal_data: null,
      stok_cadangan: [],
      catatan:
        "Belum ada entri stok yang cocok dengan lokasi cadangan publik. Untuk Malut, gunakan lokasi_gudang **Gudang Bulog Ternate** (atau variasi yang mengandung Bulog + Ternate), atau kata kunci CPPD / Cadangan Pemerintah / Badan Pangan.",
      meta: {
        wilayah: "Provinsi Maluku Utara",
        lokasi_utama_operasional: "Gudang Bulog Ternate",
        identifikasi_lokasi:
          "Filter: mengandung 'Gudang Bulog Ternate'; atau (Bulog DAN Ternate); atau CPPD / Cadangan Pemerintah / Badan Pangan.",
        pemilik_data_input: "Bidang Ketersediaan / Distribusi (sesuai SOP entri)",
        pemilik_publikasi: "Sekretariat Dinas Pangan Provinsi Maluku Utara",
        frekuensi_update_dianjurkan: "Mingguan (operasional) + rekap bulanan",
      },
    };
  }

  const rows = await StokPangan.findAll({
    where: { ...where, tanggal_update: maxDate },
    attributes: [
      "komoditas_id",
      "volume_stok",
      "satuan",
      "status_stok",
      "lokasi_gudang",
      "kabupaten_kota",
    ],
    raw: true,
  });

  const byKom = new Map();
  for (const r of rows) {
    const id = r.komoditas_id;
    if (!byKom.has(id)) {
      byKom.set(id, {
        komoditas_id: id,
        volume: 0,
        statuses: [],
        satuan: r.satuan || "ton",
        contoh_lokasi: r.lokasi_gudang,
      });
    }
    const a = byKom.get(id);
    a.volume += Number(r.volume_stok || 0);
    a.statuses.push(r.status_stok);
  }

  const ids = [...byKom.keys()];
  const komRows =
    ids.length > 0
      ? await Komoditas.findAll({
          where: { id: { [Op.in]: ids } },
          attributes: ["id", "nama"],
          raw: true,
        }).catch(() => [])
      : [];
  const idToNama = new Map((komRows || []).map((k) => [k.id, k.nama]));

  const stok_cadangan = [...byKom.values()].map((a) => ({
    komoditas: idToNama.get(a.komoditas_id) || `Komoditas #${a.komoditas_id}`,
    komoditas_id: a.komoditas_id,
    volume: a.volume,
    satuan: a.satuan,
    status: worstStatus(a.statuses),
    contoh_lokasi: a.contoh_lokasi,
  }));

  const allStatuses = stok_cadangan.map((s) => s.status);
  const status_keseluruhan = allStatuses.length
    ? worstStatus(allStatuses)
    : null;

  return {
    status_keseluruhan,
    tanggal_data: maxDate,
    stok_cadangan,
    catatan:
      "CPPD Provinsi Maluku Utara — agregat volume per komoditas pada tanggal pembaruan terakhir (data operasional Dinas Pangan).",
    meta: {
      wilayah: "Provinsi Maluku Utara",
      lokasi_utama_operasional: "Gudang Bulog Ternate",
      identifikasi_lokasi:
        "Agregasi dari stok_pangan: prioritas lokasi Gudang Bulog Ternate (atau Bulog+Ternate), juga CPPD / Cadangan Pemerintah / Badan Pangan.",
      pemilik_data_input: "Bidang Ketersediaan / Distribusi (sesuai SOP entri)",
      pemilik_publikasi: "Sekretariat Dinas Pangan Provinsi Maluku Utara",
      frekuensi_update_dianjurkan: "Mingguan (operasional) + rekap bulanan",
    },
  };
}

export async function getPublicCppdSummary(req, res) {
  try {
    const data = await computePublicCppd();
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat ringkasan CPPD publik",
      error: err.message,
    });
  }
}

export async function getPublicSummary(req, res) {
  try {
    const [latestInflasi, latestHargaDateRow, umkmSertifikatCount, cppd] =
      await Promise.all([
        // NOTE: table di beberapa environment belum punya semua kolom baru;
        // pakai attributes subset agar kompatibel (hindari select kolom yang belum ada).
        InflasiHarian.findOne({
          order: [["tanggal", "DESC"]],
          attributes: [
            "tanggal",
            "indeks_laspeyres",
            "inflasi_dod_persen",
            "inflasi_mtd_persen",
            "inflasi_yoy_proksi_persen",
          ],
        }),
        HargaPangan.findOne({
          where: { status: "terverifikasi" },
          attributes: [[fn("max", col("tanggal")), "tanggal_terbaru"]],
          raw: true,
        }),
        UmkmPangan.count({
          where: { status_sertifikasi: { [Op.notILike]: "belum" } },
        }),
        computePublicCppd(),
      ]);

    const hargaTanggalTerbaru =
      latestHargaDateRow?.tanggal_terbaru || null;

    return res.json({
      success: true,
      data: {
        last_updated_at: new Date().toISOString(),
        inflasi: latestInflasi
          ? {
              tanggal: latestInflasi.tanggal,
              inflasi_dod_persen: latestInflasi.inflasi_dod_persen,
              inflasi_mtd_persen: latestInflasi.inflasi_mtd_persen,
              inflasi_yoy_proksi_persen: latestInflasi.inflasi_yoy_proksi_persen,
              coverage_komoditas_persen: null,
            }
          : null,
        harga_pangan: {
          tanggal_terbaru: hargaTanggalTerbaru,
        },
        umkm: {
          umkm_tersertifikasi_count: umkmSertifikatCount,
        },
        cppd,
        catatan: {
          inflasi: "Inflasi harian adalah proksi internal; inflasi resmi mengacu BPS.",
          harga: "Harga pangan adalah rerata hasil survei yang sudah terverifikasi.",
          cppd:
            "CPPD/cadangan publik: agregat dari stok gudang; lokasi utama operasional di Provinsi Maluku Utara adalah Gudang Bulog Ternate (ditambah pola CPPD / Cadangan Pemda / Badan Pangan).",
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat ringkasan publik",
      error: err.message,
    });
  }
}

export async function getInflasiTrend(req, res) {
  try {
    const days = clampDays(req.query?.days);
    const since = dateOnlyNDaysAgo(days);

    const rows = await InflasiHarian.findAll({
      where: { tanggal: { [Op.gte]: since } },
      attributes: [
        "tanggal",
        "indeks_laspeyres",
        "inflasi_dod_persen",
        "inflasi_mtd_persen",
        "inflasi_yoy_proksi_persen",
      ],
      order: [["tanggal", "ASC"]],
      limit: days + 3,
    });

    return res.json({
      success: true,
      data: rows.map((r) => ({
        tanggal: r.tanggal,
        inflasi_dod_persen: r.inflasi_dod_persen,
        inflasi_mtd_persen: r.inflasi_mtd_persen,
        inflasi_yoy_proksi_persen: r.inflasi_yoy_proksi_persen,
        indeks_laspeyres: r.indeks_laspeyres,
        coverage_komoditas_persen: null,
      })),
      meta: {
        days,
        since,
        metodologi: "Laspeyres-tipe (proksi operasional internal).",
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat tren inflasi publik",
      error: err.message,
    });
  }
}

export async function getHargaPanganTrend(req, res) {
  try {
    const days = clampDays(req.query?.days);
    const since = dateOnlyNDaysAgo(days);
    const komoditasKey = String(req.query?.komoditas_key || "").trim();

    if (!komoditasKey) {
      return res.status(400).json({
        success: false,
        message: "komoditas_key wajib diisi",
      });
    }

    const rows = await HargaPangan.findAll({
      where: {
        status: "terverifikasi",
        tanggal: { [Op.gte]: since },
        komoditas_key: komoditasKey,
      },
      attributes: [
        "tanggal",
        [fn("avg", col("harga_eceran")), "harga_avg"],
        [fn("count", col("id")), "n"],
      ],
      group: ["tanggal"],
      order: [["tanggal", "ASC"]],
      raw: true,
    });

    return res.json({
      success: true,
      data: rows.map((r) => ({
        tanggal: r.tanggal,
        harga_avg: r.harga_avg,
        n: Number(r.n || 0),
      })),
      meta: {
        komoditas_key: komoditasKey,
        days,
        since,
        satuan: "Rp/kg (rerata)",
        filter: "status=terverifikasi",
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat tren harga publik",
      error: err.message,
    });
  }
}

export async function listPublicDatasets(req, res) {
  try {
    const [latestHarga, latestInflasi, cppdSnap] = await Promise.all([
      HargaPangan.findOne({
        where: { status: "terverifikasi" },
        attributes: [[fn("max", col("tanggal")), "tanggal_terbaru"]],
        raw: true,
      }),
      InflasiHarian.findOne({
        order: [["tanggal", "DESC"]],
        attributes: ["tanggal"],
        raw: true,
      }),
      computePublicCppd(),
    ]);

    const datasets = [
      {
        id: "inflasi_harian_proksi",
        name: "Inflasi Harian (Proksi Internal)",
        description:
          "Snapshot indeks Laspeyres-tipe dan metrik inflasi harian (proksi operasional).",
        last_updated: latestInflasi?.tanggal || null,
        endpoints: {
          trend: "/api/public/inflasi/trend?days=30",
        },
        caution:
          "Inflasi resmi bulanan mengacu publikasi BPS; ini proksi untuk monitoring cepat.",
      },
      {
        id: "harga_pangan_harian_rerata",
        name: "Harga Pangan Harian (Rerata Terverifikasi)",
        description:
          "Rerata harga eceran harian per komoditas_key dari entri survei yang terverifikasi.",
        last_updated: latestHarga?.tanggal_terbaru || null,
        endpoints: {
          trend: "/api/public/harga/trend?komoditas_key=beras_medium&days=30",
          download_csv:
            "/api/public/datasets/harga-pangan.csv?komoditas_key=beras_medium&days=30",
        },
        params: {
          komoditas_key: "wajib",
          days: "opsional (default 30, max 366)",
        },
      },
      {
        id: "cppd_malut_utara",
        name: "CPPD — Cadangan Pangan Pemerintah Daerah Provinsi Maluku Utara",
        description:
          "Agregat volume stok per komoditas (tanggal pembaruan terakhir). Lokasi utama: Gudang Bulog Ternate; termasuk pola Bulog+Ternate, CPPD, Cadangan Pemda, Badan Pangan.",
        last_updated: cppdSnap?.tanggal_data || null,
        endpoints: {
          detail: "/api/public/cppd/summary",
        },
        caution:
          "Bukan pengungkapan lokasi strategis penuh; hanya ringkasan agregat sesuai kebijakan publikasi.",
      },
    ];

    return res.json({ success: true, data: datasets });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat daftar dataset publik",
      error: err.message,
    });
  }
}

export async function downloadHargaPanganCsv(req, res) {
  try {
    const days = clampDays(req.query?.days);
    const since = dateOnlyNDaysAgo(days);
    const komoditasKey = String(req.query?.komoditas_key || "").trim();

    if (!komoditasKey) {
      return res.status(400).json({
        success: false,
        message: "komoditas_key wajib diisi",
      });
    }

    const rows = await HargaPangan.findAll({
      where: {
        status: "terverifikasi",
        tanggal: { [Op.gte]: since },
        komoditas_key: komoditasKey,
      },
      attributes: [
        "tanggal",
        [fn("avg", col("harga_eceran")), "harga_avg"],
        [fn("count", col("id")), "n"],
      ],
      group: ["tanggal"],
      order: [["tanggal", "ASC"]],
      raw: true,
    });

    const data = rows.map((r) => ({
      tanggal: r.tanggal,
      komoditas_key: komoditasKey,
      harga_avg: r.harga_avg,
      n: Number(r.n || 0),
      satuan: "Rp/kg",
      filter: "status=terverifikasi",
    }));

    const parser = new Json2CsvParser({
      fields: ["tanggal", "komoditas_key", "harga_avg", "n", "satuan", "filter"],
    });
    const csv = parser.parse(data);

    const filename = `harga_pangan_${komoditasKey}_${since}_sd_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal download CSV harga pangan",
      error: err.message,
    });
  }
}

