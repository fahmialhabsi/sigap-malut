// Pelaksana: data lapangan umum + harga pasar (Bidang Distribusi) — persist ke harga_pangan
import { Op } from "sequelize";
import {
  findByUserAndDate,
  coverageForUser,
  yesterdayBarisForUser,
} from "../services/hargaPanganRepository.js";
import { submitHargaPanganBatch } from "../services/hargaPanganService.js";

import ProduksiPangan from "../models/ProduksiPangan.js";
import StokPangan from "../models/StokPangan.js";
import KerawananPangan from "../models/KerawananPangan.js";
import Task from "../models/Task.js";
import TaskAssignment from "../models/TaskAssignment.js";
import User from "../models/User.js";
import KonsumsiPangan from "../models/KonsumsiPangan.js";
import SppgPenerima from "../models/SppgPenerima.js";
import SppgDistribusi from "../models/SppgDistribusi.js";
import InspeksiKeamanan from "../models/InspeksiKeamanan.js";
import HargaPangan from "../models/HargaPangan.js";
import sequelize from "../config/database.js";
import SuratMasuk from "../models/SuratMasuk.js";
import Disposisi from "../models/Disposisi.js";
import ApprovalSekretariat from "../models/ApprovalSekretariat.js";
import SertifikasiPangan from "../models/SertifikasiPangan.js";
import UjiLaboratorium from "../models/UjiLaboratorium.js";
import HasilUjiKimia from "../models/HasilUjiKimia.js";
import HasilUjiMikrobiologi from "../models/HasilUjiMikrobiologi.js";
import HasilUjiFisik from "../models/HasilUjiFisik.js";

async function pickKasubagTuUptd() {
  const u = await User.findOne({
    where: {
      unit_kerja: { [Op.like]: "%UPTD%" },
      role: { [Op.or]: ["kasubag_uptd", "subbag_tata_usaha", "kasubbag_tata_usaha"] },
    },
    order: [["id", "ASC"]],
  }).catch(() => null);
  if (u) return u;
  const byUnit = await User.findOne({
    where: { unit_kerja: { [Op.like]: "%UPTD_TU%" } },
    order: [["id", "ASC"]],
  }).catch(() => null);
  return byUnit;
}

async function pickKasiUptdMutu() {
  const u = await User.findOne({
    where: {
      unit_kerja: { [Op.like]: "%UPTD%" },
      role: { [Op.or]: ["seksi_manajemen_mutu", "kasi_mutu", "kasi_uptd"] },
    },
    order: [["id", "ASC"]],
  }).catch(() => null);
  if (u) return u;
  const byUnit = await User.findOne({
    where: { unit_kerja: { [Op.like]: "%UPTD_Mutu%" } },
    order: [["id", "ASC"]],
  }).catch(() => null);
  return byUnit;
}

async function pickKasiUptdTeknis() {
  const u = await User.findOne({
    where: {
      unit_kerja: { [Op.like]: "%UPTD%" },
      role: { [Op.or]: ["seksi_manajemen_teknis", "kasi_teknis", "kasi_uptd"] },
    },
    order: [["id", "ASC"]],
  }).catch(() => null);
  if (u) return u;
  const byUnit = await User.findOne({
    where: { unit_kerja: { [Op.like]: "%UPTD_Teknis%" } },
    order: [["id", "ASC"]],
  }).catch(() => null);
  return byUnit;
}

const RETURN_APPROVAL_STATUSES = [
  "dikembalikan_kasubag",
  "dikembalikan_jf",
  "dikembalikan_sekretaris",
];

function catatanFromApprovalRow(appr) {
  if (!appr) return null;
  const st = appr.status;
  if (st === "dikembalikan_kasubag") return appr.catatan_kasubag ?? null;
  if (st === "dikembalikan_jf") return appr.catatan_jf ?? null;
  if (st === "dikembalikan_sekretaris") return appr.catatan_sekretaris ?? null;
  return null;
}

/**
 * Dereference metadata Task ke domain e-Office / approval sekretariat (bukan hanya catatan di task).
 */
async function tryEofficeDereference(metadata, task, actor) {
  const uid = Number(actor.id);
  const meta = metadata || {};

  let apprId = meta.approval_id ?? meta.approval_sekretariat_id;
  if (!apprId && meta.ref?.table === "approval_sekretariat" && Array.isArray(meta.ref.ids)) {
    apprId = Number(meta.ref.ids[0]);
  }
  if (Number.isFinite(apprId)) {
    const appr = await ApprovalSekretariat.findByPk(apprId).catch(() => null);
    if (appr && appr.submitted_by === uid && RETURN_APPROVAL_STATUSES.includes(appr.status)) {
      return {
        tipe: "approval_sekretariat",
        sub_type: appr.jenis,
        ringkas: appr.judul,
        catatan_revisi: catatanFromApprovalRow(appr) ?? task.catatan_verifikasi ?? null,
        source: "approval_sekretariat",
        approval_id: appr.id,
      };
    }
  }

  let sid = meta.surat_masuk_id;
  if (!sid && meta.ref?.table === "surat_masuk" && Array.isArray(meta.ref.ids)) {
    sid = Number(meta.ref.ids[0]);
  }
  if (Number.isFinite(sid)) {
    const sm = await SuratMasuk.findByPk(sid).catch(() => null);
    // Task returned_to_pelaksana milik actor; metadata surat adalah rujukan tepercaya
    if (sm) {
      return {
        tipe: "surat_masuk",
        sub_type: sm.jenis_surat,
        ringkas: sm.perihal ? String(sm.perihal).slice(0, 160) : sm.nomor_agenda,
        catatan_revisi: sm.keterangan || task.catatan_verifikasi || null,
        source: "surat_masuk",
      };
    }
  }

  let did = meta.disposisi_id;
  if (!did && meta.ref?.table === "disposisi" && Array.isArray(meta.ref.ids)) {
    did = Number(meta.ref.ids[0]);
  }
  if (Number.isFinite(did)) {
    const disp = await Disposisi.findByPk(did).catch(() => null);
    if (disp && disp.kepada_user_id === uid) {
      return {
        tipe: "disposisi",
        sub_type: null,
        ringkas: disp.instruksi ? String(disp.instruksi).slice(0, 160) : null,
        catatan_revisi: disp.catatan || task.catatan_verifikasi || null,
        source: "disposisi",
      };
    }
  }

  return null;
}

async function pickJfKetersediaan() {
  // Minimal: pilih 1 JF di unit ketersediaan. (Nanti bisa round-robin / hierarchy)
  const jf = await User.findOne({
    where: {
      role: "jabatan_fungsional",
    },
    order: [["id", "ASC"]],
  }).catch(() => null);

  // fallback: cari by unit kerja mengandung ketersediaan (jika role berbeda)
  if (jf) return jf;
  const jfByUnit = await User.findOne({
    where: {
      unit_kerja: { [Op.like]: "%ketersediaan%" },
    },
    order: [["id", "ASC"]],
  }).catch(() => null);
  return jfByUnit;
}

async function pickJfKonsumsi() {
  const jf = await User.findOne({
    where: {
      role: "jabatan_fungsional",
      unit_kerja: { [Op.like]: "%konsumsi%" },
    },
    order: [["id", "ASC"]],
  }).catch(() => null);
  if (jf) return jf;
  const jfByUnit = await User.findOne({
    where: { unit_kerja: { [Op.like]: "%konsumsi%" } },
    order: [["id", "ASC"]],
  }).catch(() => null);
  return jfByUnit;
}

export async function postDataPangan(req, res) {
  try {
    const actor = req.user;
    if (!actor?.id) return res.status(401).json({ error: "unauthenticated" });

    const unitKerja = String(actor.unit_kerja || "").toLowerCase();
    if (!unitKerja.includes("ketersediaan")) {
      return res.status(403).json({
        error: "forbidden",
        code: "UNIT_NOT_SUPPORTED",
        message: "Endpoint ini khusus Pelaksana Bidang Ketersediaan.",
      });
    }

    const { tipe, submit_to = "jf", target_role, target_user_id } = req.body || {};

    // Chain-of-command enforcement: pelaksana tidak boleh menentukan target selain JF.
    if (target_role && String(target_role).toLowerCase() !== "jf") {
      return res.status(403).json({
        error: "forbidden",
        code: "CHAIN_OF_COMMAND_VIOLATION",
        message:
          "Pelaksana hanya boleh submit data ke JF (wajib). Tidak boleh bypass ke Kabid/Sekretaris/KaDin.",
      });
    }
    if (submit_to && String(submit_to).toLowerCase() !== "jf") {
      return res.status(403).json({
        error: "forbidden",
        code: "CHAIN_OF_COMMAND_VIOLATION",
        message:
          "Pelaksana hanya boleh submit data ke JF (wajib). Tidak boleh bypass ke Kabid/Sekretaris/KaDin.",
      });
    }

    const jf = target_user_id
      ? await User.findByPk(Number(target_user_id)).catch(() => null)
      : await pickJfKetersediaan();
    if (!jf) {
      return res.status(422).json({
        error: "no_jf_available",
        message:
          "Tidak ditemukan JF Ketersediaan untuk menerima verifikasi. Tambahkan user JF dulu.",
      });
    }

    const now = new Date();
    let saved = null;
    let ringkas = "";

    if (tipe === "produksi") {
      const {
        periode_bulan,
        periode_tahun,
        kabupaten_kota,
        komoditas_id,
        volume_produksi,
        satuan = "ton",
        sumber_data,
        catatan,
      } = req.body;
      if (
        !periode_bulan ||
        !periode_tahun ||
        !kabupaten_kota ||
        !komoditas_id ||
        volume_produksi == null ||
        !sumber_data
      ) {
        return res.status(400).json({ error: "field_wajib_kurang" });
      }
      saved = await ProduksiPangan.create({
        periode_bulan: Number(periode_bulan),
        periode_tahun: Number(periode_tahun),
        kabupaten_kota: String(kabupaten_kota),
        komoditas_id: Number(komoditas_id),
        volume_produksi: Number(volume_produksi),
        satuan: String(satuan),
        sumber_data: String(sumber_data),
        catatan: catatan ?? null,
        diinput_oleh: actor.id,
        status: "draft",
        created_at: now,
        updated_at: now,
      });
      ringkas = `${kabupaten_kota} · komoditas#${komoditas_id} · ${Number(volume_produksi).toLocaleString(
        "id-ID",
      )} ${satuan}`;
    } else if (tipe === "stok") {
      const {
        tanggal_update,
        lokasi_gudang,
        kabupaten_kota,
        komoditas_id,
        volume_stok,
        satuan = "ton",
        estimasi_hari,
      } = req.body;
      if (
        !tanggal_update ||
        !lokasi_gudang ||
        !kabupaten_kota ||
        !komoditas_id ||
        volume_stok == null
      ) {
        return res.status(400).json({ error: "field_wajib_kurang" });
      }
      saved = await StokPangan.create({
        tanggal_update,
        lokasi_gudang: String(lokasi_gudang),
        kabupaten_kota: String(kabupaten_kota),
        komoditas_id: Number(komoditas_id),
        volume_stok: Number(volume_stok),
        satuan: String(satuan),
        estimasi_hari: estimasi_hari != null ? Number(estimasi_hari) : null,
        status_stok: "aman",
        diinput_oleh: actor.id,
        created_at: now,
        updated_at: now,
      });
      ringkas = `${kabupaten_kota} · ${lokasi_gudang} · komoditas#${komoditas_id} · ${Number(volume_stok).toLocaleString(
        "id-ID",
      )} ${satuan}`;
    } else if (tipe === "kerawanan") {
      const {
        periode,
        kabupaten_kota,
        kecamatan,
        skor_kerawanan,
        status_kerawanan,
        aspek_stok,
        aspek_akses,
        aspek_pemanfaatan,
        aspek_stabilitas,
        jumlah_penduduk_terdampak,
        catatan,
      } = req.body;
      if (!periode || !kabupaten_kota || !status_kerawanan) {
        return res.status(400).json({ error: "field_wajib_kurang" });
      }
      saved = await KerawananPangan.create({
        periode: String(periode),
        kabupaten_kota: String(kabupaten_kota),
        kecamatan: kecamatan ?? null,
        skor_kerawanan: skor_kerawanan != null ? Number(skor_kerawanan) : null,
        status_kerawanan: String(status_kerawanan),
        aspek_stok: aspek_stok != null ? Number(aspek_stok) : null,
        aspek_akses: aspek_akses != null ? Number(aspek_akses) : null,
        aspek_pemanfaatan: aspek_pemanfaatan != null ? Number(aspek_pemanfaatan) : null,
        aspek_stabilitas: aspek_stabilitas != null ? Number(aspek_stabilitas) : null,
        jumlah_penduduk_terdampak:
          jumlah_penduduk_terdampak != null ? Number(jumlah_penduduk_terdampak) : null,
        catatan: catatan ?? null,
        diinput_oleh: actor.id,
        created_at: now,
        updated_at: now,
      });
      ringkas = `${kabupaten_kota}${kecamatan ? `/${kecamatan}` : ""} · ${status_kerawanan}${
        skor_kerawanan != null ? ` · skor ${skor_kerawanan}` : ""
      }`;
    } else {
      return res.status(400).json({
        error: "tipe_tidak_valid",
        allowed: ["produksi", "stok", "kerawanan"],
      });
    }

    // Buat task verifikasi ke JF (wajib, tidak bisa bypass)
    const task = await Task.create({
      title: `Verifikasi data ${tipe} (Pelaksana)`,
      description: `Data masuk untuk verifikasi teknis oleh JF. Ringkas: ${ringkas}`,
      modul_id: "BKT",
      layanan_id: "DATA_PANGAN",
      created_by: actor.id,
      status: "submitted_to_jf",
      metadata: {
        kind: "data_pangan",
        tipe,
        table:
          tipe === "produksi"
            ? "produksi_pangan"
            : tipe === "stok"
              ? "stok_pangan"
              : "kerawanan_pangan",
        row_id: saved?.id,
        ringkas,
      },
    });
    await TaskAssignment.create({
      task_id: task.id,
      assignee_role: "jabatan_fungsional",
      assignee_user_id: jf.id,
      assigned_by: actor.id,
      status: "assigned",
    });

    res.status(201).json({
      data: {
        ...((saved?.toJSON && saved.toJSON()) || saved),
        tipe,
        ringkas,
        submitted_task_id: task.id,
        submitted_to_jf_id: jf.id,
      },
    });
  } catch (e) {
    console.error("[pelaksanaBidang] postDataPangan:", e);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function postDataKonsumsi(req, res) {
  try {
    const actor = req.user;
    if (!actor?.id) return res.status(401).json({ error: "unauthenticated" });

    const unitKerja = String(actor.unit_kerja || "").toLowerCase();
    if (!unitKerja.includes("konsumsi")) {
      return res.status(403).json({
        error: "forbidden",
        code: "UNIT_NOT_SUPPORTED",
        message: "Endpoint ini khusus Pelaksana Bidang Konsumsi.",
      });
    }

    const { sub_type, submit_to = "jf", target_role, target_user_id, status } =
      req.body || {};

    if (target_role && String(target_role).toLowerCase() !== "jf") {
      return res.status(403).json({
        error: "forbidden",
        code: "CHAIN_OF_COMMAND_VIOLATION",
        message:
          "Pelaksana hanya boleh submit data ke JF (wajib). Tidak boleh bypass ke Kabid/Sekretaris/KaDin.",
      });
    }
    if (submit_to && String(submit_to).toLowerCase() !== "jf") {
      return res.status(403).json({
        error: "forbidden",
        code: "CHAIN_OF_COMMAND_VIOLATION",
        message:
          "Pelaksana hanya boleh submit data ke JF (wajib). Tidak boleh bypass ke Kabid/Sekretaris/KaDin.",
      });
    }

    const st = String(sub_type || "").toLowerCase();
    if (!["survei", "inspeksi", "sppg"].includes(st)) {
      return res.status(400).json({ error: "invalid_sub_type" });
    }

    const jf = target_user_id
      ? await User.findByPk(Number(target_user_id)).catch(() => null)
      : await pickJfKonsumsi();
    if (!jf) {
      return res.status(422).json({
        error: "no_jf_available",
        message:
          "Tidak ditemukan JF Konsumsi untuk menerima verifikasi. Tambahkan user JF dulu.",
      });
    }

    const now = new Date();
    let ringkas = "";
    const ref = { table: null, ids: [] };

    if (st === "survei") {
      const periode_tahun = Number(req.body?.periode_tahun || new Date().getFullYear());
      const kabupaten_kota = String(req.body?.kabupaten_kota || "").trim();
      const nilai = req.body?.nilai && typeof req.body.nilai === "object" ? req.body.nilai : {};
      if (!kabupaten_kota) return res.status(400).json({ error: "field_wajib_kurang" });

      const createdIds = [];
      for (const [kelompok_pangan, gram] of Object.entries(nilai)) {
        const v = gram === "" || gram == null ? null : Number(gram);
        const row = await KonsumsiPangan.create({
          periode_tahun,
          kabupaten_kota,
          kelompok_pangan: String(kelompok_pangan),
          konsumsi_gram_per_kapita: v,
          sumber_data: "survei_dinas",
          diinput_oleh: actor.id,
          status: "draft",
          created_at: now,
          updated_at: now,
        });
        createdIds.push(row.id);
      }
      ref.table = "konsumsi_pangan";
      ref.ids = createdIds;
      ringkas = `${kabupaten_kota} · ${req.body?.periode_bulan || "—"}/${periode_tahun} · item:${createdIds.length}`;
    } else if (st === "inspeksi") {
      const tanggal_inspeksi = req.body?.tanggal_inspeksi;
      const lokasi = String(req.body?.lokasi || "").trim();
      const kabupaten_kota = String(req.body?.kabupaten_kota || "").trim();
      const metode_inspeksi = String(req.body?.metode_inspeksi || "").trim();
      const status_temuan = String(req.body?.status_temuan || "").trim();
      if (!tanggal_inspeksi || !lokasi || !kabupaten_kota || !metode_inspeksi || !status_temuan) {
        return res.status(400).json({ error: "field_wajib_kurang" });
      }
      const row = await InspeksiKeamanan.create({
        tanggal_inspeksi,
        lokasi,
        kabupaten_kota,
        jenis_pangan: req.body?.jenis_pangan ?? null,
        metode_inspeksi,
        temuan: req.body?.temuan ?? null,
        status_temuan,
        rekomendasi: req.body?.rekomendasi ?? null,
        perlu_uji_lab: String(req.body?.perlu_uji_lab || "tidak").toLowerCase() === "ya",
        foto_url: req.body?.foto_url ?? null,
        status: "draft",
        dilakukan_oleh: actor.id,
        created_at: now,
        updated_at: now,
      });
      ref.table = "inspeksi_keamanan";
      ref.ids = [row.id];
      ringkas = `${lokasi} · ${tanggal_inspeksi} · ${status_temuan}`;
    } else {
      const periode_bulan = Number(req.body?.periode_bulan || new Date().getMonth() + 1);
      const periode_tahun = Number(req.body?.periode_tahun || new Date().getFullYear());
      const nama_satuan = String(req.body?.nama_satuan || "").trim();
      const kabupaten_kota = String(req.body?.kabupaten_kota || "").trim();
      if (!nama_satuan || !kabupaten_kota) return res.status(400).json({ error: "field_wajib_kurang" });

      // minimal: auto-upsert penerima berdasar nama_satuan+kota
      let penerima = await SppgPenerima.findOne({
        where: { nama_satuan, kabupaten_kota },
      }).catch(() => null);
      if (!penerima) {
        penerima = await SppgPenerima.create({
          kabupaten_kota,
          nama_satuan,
          jenis_satuan: "sekolah",
          jumlah_penerima: Number(req.body?.penerima_terdaftar || 0) || 0,
          status_aktif: true,
          tanggal_daftar: new Date().toISOString().slice(0, 10),
          diinput_oleh: actor.id,
          created_at: now,
          updated_at: now,
        });
      }

      const komoditas = Array.isArray(req.body?.komoditas) ? req.body.komoditas : [];
      const row = await SppgDistribusi.create({
        periode_bulan,
        periode_tahun,
        sppg_penerima_id: penerima.id,
        jumlah_penerima_terealisasi:
          req.body?.jumlah_penerima_terealisasi != null
            ? Number(req.body.jumlah_penerima_terealisasi)
            : null,
        komoditas_distribusi: JSON.stringify(komoditas),
        tanggal_distribusi: req.body?.tanggal_distribusi ?? null,
        status_distribusi: req.body?.status_distribusi ?? "belum",
        catatan: req.body?.catatan ?? null,
        diinput_oleh: actor.id,
        status: "draft",
        created_at: now,
        updated_at: now,
      });
      ref.table = "sppg_distribusi";
      ref.ids = [row.id];
      ringkas = `${nama_satuan} · ${periode_bulan}/${periode_tahun} · real:${req.body?.jumlah_penerima_terealisasi || "—"}`;
    }

    const task = await Task.create({
      title:
        st === "survei"
          ? "Data Survei Konsumsi Pangan (PPH)"
          : st === "inspeksi"
            ? "Laporan Inspeksi Keamanan Pangan"
            : "Data Realisasi SPPG",
      description: "Data lapangan Pelaksana untuk verifikasi JF (wajib).",
      modul_id: "KNS-DATA",
      created_by: actor.id,
      status: status === "draft" ? "draft" : "submitted_to_jf",
      metadata: {
        domain: "konsumsi",
        sub_type: st,
        ringkas,
        ref,
      },
      created_at: now,
      updated_at: now,
    });

    await TaskAssignment.create({
      task_id: task.id,
      assignee_role: "jf_konsumsi",
      assignee_user_id: jf.id,
      assigned_by: actor.id,
      status: "assigned",
    });

    res.status(201).json({
      success: true,
      data: {
        id: task.id,
        tipe: "data_konsumsi",
        sub_type: st,
        tanggal: task.created_at,
        ringkas,
        status: task.status,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getDataKonsumsiRiwayat(req, res) {
  try {
    const actor = req.user;
    if (!actor?.id) return res.status(401).json({ error: "unauthenticated" });

    const limit = Number(req.query?.limit || 10);
    const rows = await Task.findAll({
      where: { created_by: actor.id, modul_id: "KNS-DATA" },
      order: [["created_at", "DESC"]],
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 50) : 10,
    }).catch(() => []);

    res.json({
      data: rows.map((t) => ({
        id: t.id,
        tipe: "data_konsumsi",
        sub_type: t.metadata?.sub_type ?? null,
        tanggal: t.created_at,
        ringkas: t.metadata?.ringkas ?? null,
        status: t.status,
      })),
      total: rows.length,
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

// === UPTD: Pelaksana TU ===
// POST /api/pelaksana/uptd/tu/admin
export async function postUptdAdminTu(req, res) {
  try {
    const actor = req.user;
    if (!actor?.id) return res.status(401).json({ error: "unauthenticated" });
    const unit = String(actor.unit_kerja || "").toLowerCase();
    if (!unit.includes("uptd_tu")) {
      return res.status(403).json({
        error: "forbidden",
        message: "Endpoint ini khusus Pelaksana TU UPTD.",
      });
    }

    const { title, description, ringkas } = req.body || {};
    if (!title) return res.status(400).json({ error: "title_required" });

    const kasubag = await pickKasubagTuUptd();
    if (!kasubag?.id) {
      return res.status(500).json({
        error: "no_kasubag_tu",
        message: "Kasubag TU UPTD belum terdaftar.",
      });
    }

    const task = await Task.create({
      title: String(title).slice(0, 255),
      description: description ? String(description).slice(0, 2000) : null,
      modul_id: "UPTD-TU",
      module: "UPTD_TU",
      source_unit: "UPTD",
      created_by: actor.id,
      status: "assigned",
      metadata: {
        kind: "uptd_admin_tu",
        ringkas: ringkas ? String(ringkas).slice(0, 200) : null,
      },
    }).catch(() => null);
    if (!task) return res.status(500).json({ error: "create_task_failed" });

    await TaskAssignment.create({
      task_id: task.id,
      assignee_role: "kasubag_uptd",
      assignee_user_id: kasubag.id,
      assigned_by: actor.id,
      status: "assigned",
    }).catch(() => null);

    return res.status(201).json({ success: true, data: { task_id: task.id } });
  } catch (e) {
    return res.status(500).json({ error: "internal_server_error" });
  }
}

// GET /api/pelaksana/uptd/tu/admin/riwayat
export async function getUptdAdminTuRiwayat(req, res) {
  try {
    const actor = req.user;
    if (!actor?.id) return res.status(401).json({ error: "unauthenticated" });
    const unit = String(actor.unit_kerja || "").toLowerCase();
    if (!unit.includes("uptd_tu")) {
      return res.status(403).json({ error: "forbidden" });
    }
    const limit = Number(req.query?.limit || 10);
    const rows = await Task.findAll({
      where: { created_by: actor.id, modul_id: "UPTD-TU" },
      order: [["created_at", "DESC"]],
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 50) : 10,
    }).catch(() => []);

    return res.json({
      data: rows.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        created_at: t.created_at,
        ringkas: t.metadata?.ringkas ?? null,
      })),
      total: rows.length,
    });
  } catch {
    return res.status(500).json({ error: "internal_server_error" });
  }
}

// === UPTD: Pelaksana Mutu (sertifikasi/audit) ===
// POST /api/pelaksana/uptd/mutu/sertifikasi
export async function postUptdSertifikasi(req, res) {
  try {
    const actor = req.user;
    if (!actor?.id) return res.status(401).json({ error: "unauthenticated" });
    const unit = String(actor.unit_kerja || "").toLowerCase();
    if (!unit.includes("uptd_mutu")) {
      return res.status(403).json({
        error: "forbidden",
        message: "Endpoint ini khusus Pelaksana Mutu UPTD.",
      });
    }

    const {
      jenis_sertifikasi,
      nama_pemohon,
      produk_pangan,
      alamat_usaha,
      tanggal_permohonan,
      catatan,
    } = req.body || {};

    if (!jenis_sertifikasi || !nama_pemohon) {
      return res.status(400).json({ error: "jenis_sertifikasi_and_nama_pemohon_required" });
    }

    const row = await SertifikasiPangan.create({
      nomor_sertifikat: null,
      jenis_sertifikasi: String(jenis_sertifikasi).slice(0, 20),
      nama_pemohon: String(nama_pemohon).slice(0, 255),
      jenis_usaha: null,
      alamat_usaha: alamat_usaha ? String(alamat_usaha).slice(0, 2000) : null,
      produk_pangan: produk_pangan ? String(produk_pangan).slice(0, 255) : null,
      status: "permohonan_masuk",
      tanggal_permohonan: tanggal_permohonan || new Date().toISOString().slice(0, 10),
      tanggal_terbit: null,
      tanggal_kadaluwarsa: null,
      ditugaskan_kasi_id: null,
      dokumen_permohonan_url: null,
      laporan_audit_url: null,
      sertifikat_url: null,
      catatan: catatan ? String(catatan).slice(0, 2000) : null,
      dibuat_oleh: actor.id,
      created_at: new Date(),
    }).catch(() => null);

    if (!row?.id) return res.status(500).json({ error: "create_sertifikasi_failed" });

    const kasi = await pickKasiUptdMutu();
    if (!kasi?.id) {
      return res.status(500).json({ error: "no_kasi_mutu", message: "Kasi Mutu UPTD belum terdaftar." });
    }

    const task = await Task.create({
      title: `Sertifikasi ${row.jenis_sertifikasi} — ${row.nama_pemohon}`.slice(0, 255),
      description: row.produk_pangan ? `Produk: ${row.produk_pangan}` : null,
      modul_id: "UPTD-MUTU",
      module: "UPTD_Mutu",
      source_unit: "UPTD",
      created_by: actor.id,
      status: "assigned",
      metadata: {
        table: "sertifikasi_pangan",
        row_id: row.id,
        kind: "uptd_sertifikasi",
        ringkas: `${row.nama_pemohon}${row.produk_pangan ? ` · ${row.produk_pangan}` : ""}`.slice(0, 200),
      },
    }).catch(() => null);

    if (task?.id) {
      await TaskAssignment.create({
        task_id: task.id,
        assignee_role: "kasi_uptd",
        assignee_user_id: kasi.id,
        assigned_by: actor.id,
        status: "assigned",
      }).catch(() => null);
    }

    return res.status(201).json({ success: true, data: { id: row.id, task_id: task?.id ?? null } });
  } catch {
    return res.status(500).json({ error: "internal_server_error" });
  }
}

// === UPTD: Pelaksana Teknis (hasil uji lab) ===
// POST /api/pelaksana/uptd/teknis/uji-lab
export async function postUptdUjiLab(req, res) {
  try {
    const actor = req.user;
    if (!actor?.id) return res.status(401).json({ error: "unauthenticated" });
    const unit = String(actor.unit_kerja || "").toLowerCase();
    if (!unit.includes("uptd_teknis")) {
      return res.status(403).json({
        error: "forbidden",
        message: "Endpoint ini khusus Pelaksana Teknis UPTD.",
      });
    }

    const { jenis, nomor_order, uji_lab_id, items } = req.body || {};
    const j = String(jenis || "").toLowerCase();
    if (!["kimia", "mikrobiologi", "fisik"].includes(j)) {
      return res.status(400).json({ error: "jenis_invalid" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items_required" });
    }

    let uji = null;
    if (uji_lab_id) {
      uji = await UjiLaboratorium.findByPk(Number(uji_lab_id)).catch(() => null);
    } else if (nomor_order) {
      uji = await UjiLaboratorium.findOne({ where: { nomor_order: String(nomor_order) } }).catch(() => null);
    }

    if (!uji) {
      const nomor = `ORD-${new Date().getFullYear()}-${Date.now()}`.slice(0, 50);
      uji = await UjiLaboratorium.create({
        nomor_order: nomor,
        tanggal_terima: new Date().toISOString().slice(0, 10),
        asal_permintaan: "internal_uptd",
        ref_koordinasi_id: null,
        nama_pemohon: "Internal UPTD",
        jenis_sampel: "—",
        deskripsi_sampel: null,
        jumlah_sampel: 1,
        jenis_uji: j,
        prioritas: "normal",
        status: "dalam_proses",
        tanggal_mulai: new Date().toISOString().slice(0, 10),
        tanggal_target: null,
        tanggal_selesai: null,
        ditugaskan_kasi_id: null,
        ditugaskan_jf_id: null,
        laporan_url: null,
        diterima_oleh: actor.id,
        created_at: new Date(),
      }).catch(() => null);
    }

    if (!uji?.id) return res.status(500).json({ error: "uji_lab_not_found_or_create_failed" });

    const normItems = items.slice(0, 50).map((it) => ({
      uji_lab_id: uji.id,
      parameter: String(it.parameter || "").slice(0, 100),
      nilai_terukur: it.nilai_terukur ?? null,
      satuan: it.satuan ? String(it.satuan).slice(0, 30) : null,
      batas_max_snk: it.batas_max_snk ?? null,
      batas_snk: it.batas_snk ? String(it.batas_snk).slice(0, 100) : null,
      status_hasil: it.status_hasil ? String(it.status_hasil).slice(0, 30) : "perlu_verifikasi",
      metode_uji: it.metode_uji ? String(it.metode_uji).slice(0, 100) : null,
      catatan: it.catatan ? String(it.catatan).slice(0, 2000) : null,
      diuji_oleh: actor.id,
      diverifikasi_oleh: null,
    }));

    if (j === "kimia") {
      await HasilUjiKimia.bulkCreate(
        normItems.map(({ batas_snk, ...rest }) => rest),
      ).catch(() => null);
    } else if (j === "mikrobiologi") {
      await HasilUjiMikrobiologi.bulkCreate(
        normItems.map(({ batas_snk, ...rest }) => rest),
      ).catch(() => null);
    } else {
      await HasilUjiFisik.bulkCreate(
        normItems.map(({ batas_max_snk, metode_uji, ...rest }) => ({
          ...rest,
          batas_snk: rest.batas_snk || null,
        })),
      ).catch(() => null);
    }

    const kasi = await pickKasiUptdTeknis();
    if (kasi?.id) {
      const task = await Task.create({
        title: `Hasil uji ${j} — ${uji.nomor_order}`.slice(0, 255),
        description: `Jumlah parameter: ${normItems.length}`,
        modul_id: "UPTD-TEKNIS",
        module: "UPTD_Teknis",
        source_unit: "UPTD",
        created_by: actor.id,
        status: "assigned",
        metadata: {
          ref: { table: "uji_laboratorium", ids: [uji.id] },
          kind: "uptd_uji_lab",
          sub_type: j,
          ringkas: `${uji.nomor_order} · ${normItems.length} parameter`.slice(0, 200),
        },
      }).catch(() => null);
      if (task?.id) {
        await TaskAssignment.create({
          task_id: task.id,
          assignee_role: "kasi_uptd",
          assignee_user_id: kasi.id,
          assigned_by: actor.id,
          status: "assigned",
        }).catch(() => null);
      }
    }

    return res.status(201).json({ success: true, data: { uji_lab_id: uji.id, nomor_order: uji.nomor_order } });
  } catch {
    return res.status(500).json({ error: "internal_server_error" });
  }
}

// GET /api/pelaksana/uptd/mutu/sertifikasi/riwayat
export async function getUptdSertifikasiRiwayat(req, res) {
  try {
    const actor = req.user;
    if (!actor?.id) return res.status(401).json({ error: "unauthenticated" });
    const unit = String(actor.unit_kerja || "").toLowerCase();
    if (!unit.includes("uptd_mutu")) {
      return res.status(403).json({ error: "forbidden" });
    }
    const limit = Number(req.query?.limit || 10);
    const rows = await SertifikasiPangan.findAll({
      where: { dibuat_oleh: actor.id },
      order: [["created_at", "DESC"]],
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 50) : 10,
    }).catch(() => []);
    return res.json({
      data: rows.map((r) => ({
        id: r.id,
        jenis_sertifikasi: r.jenis_sertifikasi,
        nama_pemohon: r.nama_pemohon,
        produk_pangan: r.produk_pangan,
        status: r.status,
        tanggal_permohonan: r.tanggal_permohonan,
        created_at: r.created_at,
      })),
      total: rows.length,
    });
  } catch {
    return res.status(500).json({ error: "internal_server_error" });
  }
}

// GET /api/pelaksana/uptd/teknis/uji-lab/riwayat
export async function getUptdUjiLabRiwayat(req, res) {
  try {
    const actor = req.user;
    if (!actor?.id) return res.status(401).json({ error: "unauthenticated" });
    const unit = String(actor.unit_kerja || "").toLowerCase();
    if (!unit.includes("uptd_teknis")) {
      return res.status(403).json({ error: "forbidden" });
    }
    const limit = Number(req.query?.limit || 10);
    const rows = await UjiLaboratorium.findAll({
      where: { diterima_oleh: actor.id },
      order: [["created_at", "DESC"]],
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 50) : 10,
    }).catch(() => []);
    return res.json({
      data: rows.map((r) => ({
        id: r.id,
        nomor_order: r.nomor_order,
        jenis_uji: r.jenis_uji,
        status: r.status,
        tanggal_terima: r.tanggal_terima,
        tanggal_mulai: r.tanggal_mulai,
        tanggal_selesai: r.tanggal_selesai,
        created_at: r.created_at,
      })),
      total: rows.length,
    });
  } catch {
    return res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getDikembalikanSaya(req, res) {
  try {
    const actor = req.user;
    if (!actor?.id) return res.status(401).json({ error: "unauthenticated" });

    const unitKerja = String(actor.unit_kerja || "").toLowerCase();
    const limit = Number(req.query?.limit || 10);

    // Distribusi: dari harga_pangan yang status dikembalikan (group by batch_id)
    if (unitKerja.includes("distribusi")) {
      const rows = await HargaPangan.findAll({
        attributes: [
          "batch_id",
          [sequelize.fn("MAX", sequelize.col("updated_at")), "updated_at"],
          [sequelize.fn("MAX", sequelize.col("catatan_verifikasi")), "catatan_revisi"],
          [sequelize.fn("COUNT", sequelize.col("id")), "jumlah_baris"],
        ],
        where: { diinput_oleh: actor.id, status: "dikembalikan" },
        group: ["batch_id"],
        order: [[sequelize.fn("MAX", sequelize.col("updated_at")), "DESC"]],
        limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 50) : 10,
        raw: true,
      }).catch(() => []);

      return res.json({
        data: rows.map((r) => ({
          id: r.batch_id,
          tipe: "harga_pasar",
          sub_type: "harga_pasar",
          tanggal: r.updated_at,
          ringkas: r.jumlah_baris ? `${r.jumlah_baris} baris komoditas` : "",
          catatan_revisi: r.catatan_revisi ?? null,
          source: "harga_pangan",
        })),
        total: rows.length,
      });
    }

    // Ketersediaan/Konsumsi/Other: dari Task returned_to_pelaksana
    const tasks = await Task.findAll({
      where: { created_by: actor.id, status: "returned_to_pelaksana" },
      order: [["returned_at", "DESC"]],
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 50) : 10,
    }).catch(() => []);

    const out = [];
    for (const t of tasks) {
      const meta = t.metadata || {};
      const when = t.returned_at || t.updated_at || t.created_at;

      // Konsumsi: metadata.ref {table, ids}
      if (unitKerja.includes("konsumsi") && meta?.ref?.table && Array.isArray(meta.ref.ids)) {
        const table = meta.ref.table;
        const ids = meta.ref.ids.map((x) => Number(x)).filter((x) => Number.isFinite(x));
        let catatan_revisi = null;
        if (table === "konsumsi_pangan" && ids.length) {
          const row = await KonsumsiPangan.findOne({ where: { id: ids[0] } }).catch(() => null);
          catatan_revisi = row?.catatan_revisi ?? null;
        } else if (table === "sppg_distribusi" && ids.length) {
          const row = await SppgDistribusi.findOne({ where: { id: ids[0] } }).catch(() => null);
          catatan_revisi = row?.catatan_revisi ?? null;
        } else if (table === "inspeksi_keamanan" && ids.length) {
          const row = await InspeksiKeamanan.findOne({ where: { id: ids[0] } }).catch(() => null);
          catatan_revisi = row?.catatan_revisi ?? null;
        }
        out.push({
          id: t.id,
          tipe: "data_konsumsi",
          sub_type: meta?.sub_type ?? null,
          tanggal: when,
          ringkas: meta?.ringkas ?? null,
          catatan_revisi: catatan_revisi ?? t.catatan_verifikasi ?? null,
          source: table,
        });
        continue;
      }

      // Ketersediaan: metadata.table + row_id
      if (unitKerja.includes("ketersediaan") && meta?.table && meta?.row_id) {
        const table = meta.table;
        const rowId = Number(meta.row_id);
        let catatan_revisi = null;
        if (table === "produksi_pangan") {
          const row = await ProduksiPangan.findByPk(rowId).catch(() => null);
          catatan_revisi = row?.catatan_revisi ?? null;
        } else if (table === "stok_pangan") {
          const row = await StokPangan.findByPk(rowId).catch(() => null);
          catatan_revisi = row?.catatan_revisi ?? null;
        } else if (table === "kerawanan_pangan") {
          const row = await KerawananPangan.findByPk(rowId).catch(() => null);
          catatan_revisi = row?.catatan_revisi ?? null;
        }
        out.push({
          id: t.id,
          tipe: "data_pangan",
          sub_type: meta?.tipe ?? null,
          tanggal: when,
          ringkas: meta?.ringkas ?? null,
          catatan_revisi: catatan_revisi ?? t.catatan_verifikasi ?? null,
          source: table,
        });
        continue;
      }

      // Sekretariat / e-Office: approval_sekretariat, surat_masuk, disposisi
      const eoffice = await tryEofficeDereference(meta, t, actor);
      if (eoffice) {
        out.push({
          id: t.id,
          tanggal: when,
          ...eoffice,
        });
        continue;
      }

      // Fallback: sek/umum
      out.push({
        id: t.id,
        tipe: meta?.kind ?? "task",
        sub_type: meta?.tipe ?? meta?.sub_type ?? null,
        tanggal: when,
        ringkas: meta?.ringkas ?? null,
        catatan_revisi: t.catatan_verifikasi ?? null,
        source: "task",
      });
    }

    // Bendahara & unit Sekretariat: dokumen dikembalikan di approval_sekretariat tanpa metadata.task yang konsisten
    const roleLower = String(actor.role || actor.roleName || "").toLowerCase();
    const bendaharaLike =
      roleLower.includes("bendahara") ||
      unitKerja.includes("bendahara") ||
      unitKerja.includes("pengeluaran") ||
      unitKerja.includes("bendahara gaji") ||
      unitKerja.includes("bendahara barang");
    const sekretariatLike = unitKerja.includes("sekretariat");

    if (bendaharaLike || sekretariatLike) {
      const seenApproval = new Set(
        out.map((o) => o.approval_id).filter((x) => Number.isFinite(Number(x))),
      );
      const extra = await ApprovalSekretariat.findAll({
        where: {
          submitted_by: actor.id,
          status: { [Op.in]: RETURN_APPROVAL_STATUSES },
        },
        order: [["updated_at", "DESC"]],
        limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 50) : 10,
      }).catch(() => []);

      for (const appr of extra) {
        if (seenApproval.has(appr.id)) continue;
        seenApproval.add(appr.id);
        const whenA = appr.updated_at || appr.created_at;
        out.push({
          id: `approval-${appr.id}`,
          tipe: "approval_sekretariat",
          sub_type: appr.jenis,
          tanggal: whenA,
          ringkas: appr.judul,
          catatan_revisi: catatanFromApprovalRow(appr),
          source: "approval_sekretariat",
          approval_id: appr.id,
        });
      }
    }

    out.sort((a, b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0));
    const capped = out.slice(0, Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 50) : 10);

    return res.json({ data: capped, total: capped.length });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getDataPanganRiwayat(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ error: "unauthenticated" });

    const [prod, stok, krw] = await Promise.all([
      ProduksiPangan.findAll({
        where: { diinput_oleh: uid },
        order: [["created_at", "DESC"]],
        limit,
      }).catch(() => []),
      StokPangan.findAll({
        where: { diinput_oleh: uid },
        order: [["created_at", "DESC"]],
        limit,
      }).catch(() => []),
      KerawananPangan.findAll({
        where: { diinput_oleh: uid },
        order: [["created_at", "DESC"]],
        limit,
      }).catch(() => []),
    ]);

    const norm = [];
    prod.forEach((r) => {
      norm.push({
        id: r.id,
        tipe: "produksi",
        komoditas: `komoditas#${r.komoditas_id}`,
        tanggal: `${r.periode_tahun}-${String(r.periode_bulan).padStart(2, "0")}-01`,
        ringkas: `${r.kabupaten_kota} · ${r.volume_produksi} ${r.satuan}`,
        created_at: r.created_at,
      });
    });
    stok.forEach((r) => {
      norm.push({
        id: r.id,
        tipe: "stok",
        komoditas: `komoditas#${r.komoditas_id}`,
        tanggal: r.tanggal_update,
        ringkas: `${r.kabupaten_kota} · ${r.lokasi_gudang} · ${r.volume_stok} ${r.satuan}`,
        created_at: r.created_at,
      });
    });
    krw.forEach((r) => {
      norm.push({
        id: r.id,
        tipe: "kerawanan",
        tanggal: r.periode,
        ringkas: `${r.kabupaten_kota}${r.kecamatan ? `/${r.kecamatan}` : ""} · ${
          r.status_kerawanan
        }`,
        created_at: r.created_at,
      });
    });

    norm.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({ data: norm.slice(0, limit) });
  } catch (e) {
    console.error("[pelaksanaBidang] getDataPanganRiwayat:", e);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function postHargaPasar(req, res) {
  try {
    const {
      tanggal,
      pasar_id,
      pasar_nama,
      kabupaten_kota,
      sumber_data,
      baris,
      status = "submitted_to_jf",
    } = req.body;

    if (!tanggal || !baris || !Array.isArray(baris)) {
      return res.status(400).json({ error: "tanggal_dan_baris_wajib" });
    }

    const actor = { id: req.user?.id, role: req.user?.role };
    const result = await submitHargaPanganBatch(
      {
        tanggal,
        pasar_id,
        pasar_nama,
        kabupaten_kota,
        sumber_data,
        baris,
        status,
        diinput_oleh: req.user?.id,
      },
      actor,
    );

    if (!result.ok) {
      if (result.hardErrors?.length) {
        return res.status(400).json({ error: "validasi_gagal", details: result.hardErrors });
      }
      return res.status(400).json({ error: result.error || "bad_request" });
    }

    res.status(201).json({
      data: {
        id: result.batch_id,
        batch_id: result.batch_id,
        tanggal,
        pasar_id,
        pasar_nama,
        jumlah_baris: result.rows.length,
        status,
        anomaly_count: result.anomaly_count,
        requires_manual_verify: result.anomaly_count > 0,
      },
    });
  } catch (e) {
    console.error("[pelaksanaBidang] postHargaPasar:", e);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getHargaPasarHariIni(req, res) {
  const uid = req.user?.id;
  const today = new Date().toISOString().split("T")[0];
  const rows = await findByUserAndDate(uid, today);
  res.json({ data: rows, tanggal: today });
}

export async function getHargaPasarCoverage(req, res) {
  const uid = req.user?.id;
  const today = new Date().toISOString().split("T")[0];
  const assignedTotal = Number(req.query.total_pasar) || 3;
  const data = await coverageForUser(uid, today, assignedTotal);
  res.json({ data });
}

export async function getHargaPasarKemarin(req, res) {
  const uid = req.user?.id;
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.toISOString().split("T")[0];
  const baris = await yesterdayBarisForUser(uid, y);
  res.json({ data: baris });
}
