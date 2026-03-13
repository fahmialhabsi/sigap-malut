import {
  generateModuleBlueprint,
  listMasterDataModules,
} from "../services/moduleGeneratorService.js";

export const moduleGenerate = async (req, res) => {
  try {
    const generatedModule = await generateModuleBlueprint(req.body || {});

    return res.json({
      success: true,
      message: "Module blueprint generated from master-data",
      generatedModule,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message:
        status === 404
          ? "Module tidak ditemukan di master-data"
          : "Gagal membuat blueprint module",
      error: error.message,
    });
  }
};

export const listDynamicModules = async (_req, res) => {
  try {
    const modules = await listMasterDataModules();
    return res.json({ success: true, ...modules });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal membaca registry module dari master-data",
      error: error.message,
    });
  }
};
