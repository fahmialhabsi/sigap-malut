// backend/controllers/dashboardBendaharaController.js
// Dashboard endpoints untuk Bendahara Pengeluaran

const safe = (v, fb = 0) => (v == null || Number.isNaN(Number(v)) ? fb : Number(v));
const TAHUN = new Date().getFullYear();
const BULAN = new Date().getMonth() + 1;

// ── GET /dashboard/bendahara/summary ─────────────────────────────────────────
export const getBendaharaSummary = async (_req, res) => {
  try {
    const db = (await import("../config/database.js")).default;
    const { QueryTypes } = await import("sequelize");

    // SPJ pending verifikasi
    const pendingRows = await db
      .query(
        `SELECT COUNT(*) AS cnt FROM spj
         WHERE status IN ('submitted','diajukan')
           AND (deleted_at IS NULL)`,
        { type: QueryTypes.SELECT }
      )
      .catch(() => [{ cnt: 0 }]);
    const spj_pending = Number(pendingRows[0]?.cnt || 0);

    // SPJ diverifikasi bulan ini
    const verRows = await db
      .query(
        `SELECT COUNT(*) AS cnt FROM spj
         WHERE status IN ('verified','diverifikasi')
           AND strftime('%Y', verified_at) = ?
           AND strftime('%m', verified_at) = ?
           AND (deleted_at IS NULL)`,
        { replacements: [String(TAHUN), String(BULAN).padStart(2, "0")], type: QueryTypes.SELECT }
      )
      .catch(() => [{ cnt: 0 }]);
    const spj_verified = Number(verRows[0]?.cnt || 0);

    // Total pengeluaran bulan ini (dari SPJ yg diverifikasi)
    const keluarRows = await db
      .query(
        `SELECT COALESCE(SUM(total_anggaran), 0) AS total FROM spj
         WHERE status IN ('verified','diverifikasi','sp2d_cair','spm_diterbitkan')
           AND strftime('%Y-%m', created_at) = ?
           AND (deleted_at IS NULL)`,
        { replacements: [`${TAHUN}-${String(BULAN).padStart(2, "0")}`], type: QueryTypes.SELECT }
      )
      .catch(() => [{ total: 0 }]);
    const total_keluar_bulan = safe(keluarRows[0]?.total);

    res.json({
      success: true,
      data: {
        spj_pending,
        spj_verified,
        total_keluar_bulan,
        saldo_kas:   null, // diisi dari sistem keuangan eksternal
        saldo_bank:  null,
        up_saldo:    null,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── GET /dashboard/bendahara/kas-saldo ───────────────────────────────────────
export const getKasSaldo = async (_req, res) => {
  try {
    // Placeholder — kas saldo biasanya dari sistem SIMDA/SIPKD eksternal
    // Kembalikan array kosong agar frontend pakai static fallback
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── PUT /spj/:id/verify (bendahara verify) ────────────────────────────────────
export const verifySpj = async (req, res) => {
  try {
    const db = (await import("../config/database.js")).default;
    const { QueryTypes } = await import("sequelize");

    const rows = await db
      .query(`SELECT id, status FROM spj WHERE id = ? AND deleted_at IS NULL`, {
        replacements: [req.params.id], type: QueryTypes.SELECT,
      })
      .catch(() => []);

    if (!rows.length) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan." });
    if (!["submitted", "diajukan"].includes(rows[0].status)) {
      return res.status(400).json({ success: false, message: "SPJ tidak dalam status yang bisa diverifikasi." });
    }

    await db.query(
      `UPDATE spj SET status = 'verified', verified_by = ?, verified_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      { replacements: [req.user?.id || null, req.params.id], type: QueryTypes.UPDATE }
    );

    res.json({ success: true, message: "SPJ berhasil diverifikasi." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── PUT /spj/:id/reject (bendahara tolak) ─────────────────────────────────────
export const rejectSpj = async (req, res) => {
  try {
    const db = (await import("../config/database.js")).default;
    const { QueryTypes } = await import("sequelize");

    const { catatan_verifikasi } = req.body;
    await db.query(
      `UPDATE spj SET status = 'rejected', catatan_verifikasi = ?, verified_by = ?,
       verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND deleted_at IS NULL`,
      { replacements: [catatan_verifikasi || null, req.user?.id || null, req.params.id], type: QueryTypes.UPDATE }
    );

    res.json({ success: true, message: "SPJ ditolak." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── PUT /spj/:id/bayar (catat pembayaran) ─────────────────────────────────────
export const bayarSpj = async (req, res) => {
  try {
    const db = (await import("../config/database.js")).default;
    const { QueryTypes } = await import("sequelize");

    await db.query(
      `UPDATE spj SET status = 'lunas', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND deleted_at IS NULL`,
      { replacements: [req.params.id], type: QueryTypes.UPDATE }
    );

    res.json({ success: true, message: "Pembayaran dicatat." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
