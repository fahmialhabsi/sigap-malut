// frontend/src/utils/unitMap.js
// Mapping unit display name -> canonical unit_id (seed values)
export const unitNameToId = {
  Sekretariat: "79ad8fa7-e345-49ac-a4bc-da62c9bd3963",
  "Bidang Distribusi": "ff0f2ba0-321f-4305-9f5d-a013f7b88fbb",
  "Bidang Ketersediaan": "some-uuid-for-ketersediaan", // tambahkan sesuai data master
  "Bidang Konsumsi": "another-uuid-for-konsumsi", // tambahkan sesuai data master
  // Tambahkan mapping lain sesuai seeders / data master
};

// Reverse mapping: unit_id -> display name (auto-generated)
export const unitIdToName = Object.fromEntries(
  Object.entries(unitNameToId).map(([name, id]) => [
    String(id).toLowerCase(),
    name,
  ]),
);

export default unitNameToId;
