import { getKepalaDinasUsers } from "../../services/gubernurUserService.js";

/**
 * Daftar user yang boleh menerima instruksi gubernur (peran Kepala Dinas).
 */
export async function listKepalaDinasAssignees(req, res) {
  try {
    const rows = await getKepalaDinasUsers();
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal daftar Kepala Dinas",
      error: err.message,
    });
  }
}
