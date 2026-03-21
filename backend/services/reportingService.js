// Mock backend/services/reportingService.js
export async function exportPDF() {
  return { buffer: Buffer.from("mock pdf") };
}

export async function exportExcel() {
  return { buffer: Buffer.from("mock excel") };
}

export async function validatePublicAccess() {
  return true;
}

export default { exportPDF, exportExcel, validatePublicAccess };
