export const moduleGenerate = async (req, res) => {
  // Patch: Simulasikan generate, bisa ganti menjadi logic sesungguhnya
  const { label, schema, api, permissions, template } = req.body;
  // Save module, create tables, routes, etc. (or just mock for now)
  return res.json({
    success: true,
    message: "Module generated successfully",
    generatedModule: { label, schema, api, permissions, template },
  });
};

export const listDynamicModules = async (req, res) => {
  // PATCH: return list all generated modules
  return res.json({
    success: true,
    modules: [
      {
        id: "mod_test",
        label: "Test Module",
        schema: [],
        api: {},
        permissions: [],
      },
      // dst...
    ],
  });
};
