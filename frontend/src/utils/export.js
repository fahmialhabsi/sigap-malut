export function exportToCSV(data, filename = "export.csv") {
  const csv = data.map((row) => Object.values(row).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export function exportToPDF(data, filename = "export.pdf") {
  // Template: gunakan jsPDF jika ingin PDF statis
}

export function exportToExcel(data, filename = "export.xlsx") {
  // Template: tambahkan logic xlsx-js atau SheetJS jika perlu
}
