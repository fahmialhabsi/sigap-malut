// Mock generateModule.js
export default async function generateModule(config) {
  // Simulasi pembuatan modul dinamis
  return {
    success: true,
    module: {
      name: config.name,
      fields: config.fields,
      permissions: config.permissions,
      relations: config.relations,
    },
  };
}
