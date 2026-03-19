import integrationService from "../services/integrationService.js";
export const getSyncStats = async (req, res) => {
  try {
    const unitKerja = req.query.unit || "master-data";
    const stats = await integrationService.getIntegrationStats(unitKerja);
    res.json({ success: true, stats });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Gagal ambil statistik sinkronisasi.",
        error: err.message,
      });
  }
};
import { startMasterDataSync } from "../services/masterDataSyncService.js";

export const triggerMasterDataSync = async (req, res) => {
  try {
    await startMasterDataSync();
    res.json({ success: true, message: "Sinkronisasi master-data dimulai." });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal trigger sinkronisasi.",
      error: err.message,
    });
  }
};

export const syncOnce = async (req, res) => {
  try {
    const { syncMasterData } =
      await import("../services/masterDataSyncService.js");
    await syncMasterData();
    res.json({ success: true, message: "Sinkronisasi master-data selesai." });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal sinkronisasi.",
      error: err.message,
    });
  }
};
