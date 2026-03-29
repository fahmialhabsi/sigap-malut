// backend/controllers/sekretaris/approvalQueueController.js
// Approval queue 5-tab Sekretaris: Kasubag | JF Perencanaan | JF Keuangan | Bendahara | Bidang+UPTD

import { Op } from "sequelize";
import ApprovalSekretariat from "../../models/ApprovalSekretariat.js";
import NotifikasiSekretaris from "../../models/NotifikasiSekretaris.js";
import User from "../../models/User.js";

const TAB_ASAL = {
  kasubag: ["kasubag_umum_kepeg"],
  jf_perencanaan: ["jf_perencanaan"],
  jf_keuangan: ["jf_keuangan", "jf_lainnya"],
  bendahara: ["bendahara_pengeluaran", "bendahara_gaji", "bendahara_barang"],
  bidang_uptd: ["bidang_ketersediaan", "bidang_distribusi", "bidang_konsumsi", "uptd"],
};

// GET /api/sekretaris/approval?tab=kasubag&status=menunggu_persetujuan_sekretaris
export const getApprovalQueue = async (req, res) => {
  try {
    const { tab, status, page = 1, limit = 20 } = req.query;
    const where = { deleted_at: null };

    if (tab && TAB_ASAL[tab]) {
      where.asal_unit = { [Op.in]: TAB_ASAL[tab] };
    }
    if (status) {
      where.status = status;
    } else {
      // Default: tampilkan yang menunggu persetujuan atau baru masuk
      where.status = {
        [Op.in]: [
          "menunggu_persetujuan_sekretaris",
          "menunggu_verifikasi_kasubag",
          "menunggu_analisa_jf",
        ],
      };
    }

    const offset = (Number(page) - 1) * Number(limit);
    const { count, rows } = await ApprovalSekretariat.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: Number(limit),
      offset,
      raw: true,
    });

    // Enrich dengan info pengaju (nama)
    const userIds = [...new Set(rows.map((r) => r.submitted_by).filter(Boolean))];
    const users = userIds.length
      ? await User.findAll({
          where: { id: { [Op.in]: userIds } },
          attributes: ["id", "name", "username"],
          raw: true,
        }).catch(() => [])
      : [];
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const enriched = rows.map((r) => ({
      ...r,
      pengaju_info: userMap[r.submitted_by] || null,
      is_revisi: r.revisi_ke > 0,
    }));

    // Hitung badge per tab
    const badges = {};
    for (const [tabKey, asalArr] of Object.entries(TAB_ASAL)) {
      badges[tabKey] = await ApprovalSekretariat.count({
        where: {
          asal_unit: { [Op.in]: asalArr },
          status: "menunggu_persetujuan_sekretaris",
          deleted_at: null,
        },
      }).catch(() => 0);
    }

    res.json({ success: true, data: enriched, total: count, badges });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/sekretaris/approval/:id
export const getApprovalDetail = async (req, res) => {
  try {
    const item = await ApprovalSekretariat.findByPk(req.params.id, { raw: true });
    if (!item) return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan." });

    // Riwayat revisi
    const riwayat = [];
    let cur = item;
    while (cur?.revisi_dari) {
      const prev = await ApprovalSekretariat.findByPk(cur.revisi_dari, { raw: true }).catch(() => null);
      if (!prev) break;
      riwayat.push(prev);
      cur = prev;
    }

    res.json({ success: true, data: { ...item, riwayat_revisi: riwayat } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/sekretaris/approval/:id/putuskan
// body: { aksi: "setuju"|"kembalikan"|"tolak", catatan: "..." }
export const putuskanApproval = async (req, res) => {
  const { aksi, catatan } = req.body || {};
  const sekretarisId = req.user?.id;

  if (!["setuju", "kembalikan", "tolak"].includes(aksi)) {
    return res.status(400).json({ success: false, message: "Aksi tidak valid. Gunakan: setuju, kembalikan, tolak." });
  }
  if (aksi !== "setuju" && !catatan?.trim()) {
    return res.status(400).json({ success: false, message: "Catatan wajib diisi saat kembalikan/tolak." });
  }

  try {
    const item = await ApprovalSekretariat.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan." });

    const statusMap = { setuju: "disetujui", kembalikan: "dikembalikan_sekretaris", tolak: "ditolak" };
    await item.update({
      status: statusMap[aksi],
      catatan_sekretaris: catatan || null,
      diputuskan_at: new Date(),
      diputuskan_oleh: sekretarisId,
    });

    // Kirim notifikasi balik ke pengaju jika kembalikan/tolak
    if (["kembalikan", "tolak"].includes(aksi)) {
      const jenisNotif = aksi === "kembalikan" ? "approval_masuk_kasubag" : "approval_masuk_kasubag";
      await NotifikasiSekretaris.create({
        user_id: item.submitted_by,
        jenis: jenisNotif,
        judul: `Dokumen "${item.judul}" ${aksi === "kembalikan" ? "dikembalikan" : "ditolak"} oleh Sekretaris`,
        isi: catatan || "",
        referensi_id: item.id,
        referensi_tabel: "approval_sekretariat",
        prioritas: "tinggi",
      }).catch(() => {});
    }

    res.json({ success: true, message: `Dokumen berhasil di${aksi}.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/sekretaris/approval/:id/teruskan-kadin
export const teruskankKaDin = async (req, res) => {
  try {
    const item = await ApprovalSekretariat.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan." });
    if (item.status !== "disetujui") {
      return res.status(400).json({ success: false, message: "Dokumen harus disetujui dulu sebelum diteruskan ke Kepala Dinas." });
    }

    await item.update({ status: "diteruskan_ke_kadin" });
    res.json({ success: true, message: "Dokumen diteruskan ke Kepala Dinas." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/sekretaris/approval/:id/riwayat-revisi
export const getRiwayatRevisi = async (req, res) => {
  try {
    const item = await ApprovalSekretariat.findByPk(req.params.id, { raw: true });
    if (!item) return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan." });

    // Kumpulkan semua versi sebelumnya
    const chain = [item];
    let cur = item;
    for (let i = 0; i < 20 && cur?.revisi_dari; i++) {
      const prev = await ApprovalSekretariat.findByPk(cur.revisi_dari, { raw: true }).catch(() => null);
      if (!prev) break;
      chain.push(prev);
      cur = prev;
    }

    res.json({ success: true, data: chain, total_revisi: item.revisi_ke });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/sekretaris/approval — Buat pengajuan baru ke Sekretaris (dipakai oleh bawahan)
export const submitApproval = async (req, res) => {
  const { judul, jenis, asal_unit, lampiran_url, task_id, perlu_analisa_jf } = req.body || {};
  const submittedBy = req.user?.id;

  if (!judul || !jenis || !asal_unit) {
    return res.status(400).json({ success: false, message: "judul, jenis, asal_unit wajib diisi." });
  }

  try {
    // Auto-generate nomor dokumen
    const year = new Date().getFullYear();
    const count = await ApprovalSekretariat.count().catch(() => 0);
    const nomor = `SEK-APP-${year}-${String(count + 1).padStart(4, "0")}`;

    const item = await ApprovalSekretariat.create({
      nomor_dokumen: nomor,
      judul,
      jenis,
      asal_unit,
      submitted_by: submittedBy,
      lampiran_url: lampiran_url || null,
      task_id: task_id || null,
      perlu_analisa_jf: perlu_analisa_jf || false,
      status: "menunggu_verifikasi_kasubag",
    });

    // Notifikasi ke Sekretaris
    const sekretarisUsers = await User.findAll({
      where: { deleted_at: null },
      raw: true,
    }).catch(() => []);
    // Cari user dengan role sekretaris (simple check on roleName/role field)
    for (const u of sekretarisUsers) {
      const role = (u.roleName || u.role || "").toLowerCase();
      if (role === "sekretaris") {
        await NotifikasiSekretaris.create({
          user_id: u.id,
          jenis: "approval_masuk_kasubag",
          judul: `Pengajuan baru: ${judul}`,
          isi: `Dari ${asal_unit}`,
          referensi_id: item.id,
          referensi_tabel: "approval_sekretariat",
          prioritas: "normal",
        }).catch(() => {});
      }
    }

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
