/**
 * export.js — Utilitas export data ke CSV, Excel (SheetJS), dan PDF (jsPDF + AutoTable)
 */

// ── CSV ─────────────────────────────────────────────────
export function exportToCSV(data, filename = "export.csv") {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) =>
    Object.values(row)
      .map((v) => {
        const str = v === null || v === undefined ? "" : String(v);
        // Escape tanda kutip dan bungkus dalam kutip jika ada koma/newline
        return str.includes(",") || str.includes("\n") || str.includes('"')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      })
      .join(",")
  );
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename);
}

// ── Excel (SheetJS) ──────────────────────────────────────
export async function exportToExcel(data, filename = "export.xlsx", sheetName = "Data") {
  if (!data || data.length === 0) return;
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

// ── PDF (jsPDF + AutoTable) ──────────────────────────────
export async function exportToPDF(data, filename = "export.pdf", title = "Laporan Data") {
  if (!data || data.length === 0) return;
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Header
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, 14, 22);

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const v = row[h];
      return v === null || v === undefined ? "" : String(v);
    })
  );

  autoTable(doc, {
    startY: 27,
    head: [headers],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  doc.save(filename);
}

// ── Internal ─────────────────────────────────────────────
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
