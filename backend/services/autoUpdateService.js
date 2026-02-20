// Auto-update workflow: trigger update to related modules after main data changes
import BdsCpd from "../models/BDS-CPD.js";

export async function triggerAfterKomoditasUpdate(instance, options) {
  // Example: update all BdsCpd records with this komoditas_id
  if (!instance.id) return;
  await BdsCpd.update(
    { nama_komoditas: instance.nama },
    { where: { komoditas_id: instance.id } },
  );
  // TODO: Add more logic for other modules if needed
}

// Add more triggers for ASN, UPTD, etc as needed
