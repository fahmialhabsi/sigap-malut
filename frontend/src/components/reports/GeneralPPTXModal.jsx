/**
 * GeneralPPTXModal — ekspor slide PPTX generik dari data apapun
 * Dokumen sumber: 05-Dashboard-Template-Standar.md
 *
 * Props:
 *   title      : string — judul laporan
 *   slides     : Array<{ heading, bullets: string[], tableRows?: string[][] }>
 *   onClose    : () => void
 *
 * Catatan: pptxgenjs sudah ada di package.json frontend
 */

import { useState } from "react";
import toast from "react-hot-toast";

export default function GeneralPPTXModal({ title = "Laporan SIGAP MALUT", slides = [], onClose }) {
  const [loading, setLoading] = useState(false);
  const [reportTitle, setReportTitle] = useState(title);
  const [footerText, setFooterText] = useState("Dinas Pangan Maluku Utara — SIGAP MALUT");

  const handleExport = async () => {
    setLoading(true);
    try {
      const pptxgen = (await import("pptxgenjs")).default;
      const prs = new pptxgen();

      prs.layout = "LAYOUT_WIDE";
      prs.author = "SIGAP MALUT";
      prs.company = "Dinas Pangan Maluku Utara";
      prs.subject = reportTitle;
      prs.title = reportTitle;

      // Warna brand
      const PRIMARY = "0B5FFF";
      const WHITE = "FFFFFF";
      const DARK = "1E293B";
      const LIGHT_BG = "F1F5F9";

      // ── Slide 1: Cover ──────────────────────────────────────────────────────
      const cover = prs.addSlide();
      cover.background = { color: PRIMARY };
      cover.addText(reportTitle, {
        x: 1, y: 1.5, w: "80%", h: 1.5,
        fontSize: 36, bold: true, color: WHITE, align: "center",
      });
      cover.addText(footerText, {
        x: 1, y: 3.5, w: "80%", h: 0.5,
        fontSize: 16, color: "BFD4FF", align: "center",
      });
      cover.addText(new Date().toLocaleDateString("id-ID", {
        day: "2-digit", month: "long", year: "numeric",
      }), {
        x: 1, y: 4.2, w: "80%", h: 0.5,
        fontSize: 14, color: "BFD4FF", align: "center",
      });

      // ── Content slides ───────────────────────────────────────────────────────
      const slidesData = slides.length > 0 ? slides : [
        { heading: "Tidak ada data slide", bullets: ["Tidak ada konten yang diberikan."] },
      ];

      slidesData.forEach((s, idx) => {
        const slide = prs.addSlide();
        slide.background = { color: LIGHT_BG };

        // Header bar
        slide.addShape(prs.ShapeType.rect, {
          x: 0, y: 0, w: "100%", h: 0.7,
          fill: { color: PRIMARY },
        });
        slide.addText(s.heading || `Slide ${idx + 2}`, {
          x: 0.3, y: 0.1, w: "75%", h: 0.5,
          fontSize: 18, bold: true, color: WHITE,
        });
        // Slide number
        slide.addText(`${idx + 2}`, {
          x: 8.5, y: 0.1, w: 0.8, h: 0.5,
          fontSize: 14, color: WHITE, align: "right",
        });

        // Bullets
        if (s.bullets?.length > 0) {
          const bulletLines = s.bullets.map((b) => ({
            text: b,
            options: { bullet: true, fontSize: 14, color: DARK, breakLine: true },
          }));
          slide.addText(bulletLines, {
            x: 0.5, y: 0.9, w: "90%", h: 3.5,
            align: "left", valign: "top",
          });
        }

        // Table (opsional)
        if (s.tableRows?.length > 0) {
          slide.addTable(s.tableRows.map((row, ri) =>
            row.map((cell) => ({
              text: cell,
              options: {
                fill: { color: ri === 0 ? PRIMARY : ri % 2 === 0 ? "E2E8F0" : WHITE },
                color: ri === 0 ? WHITE : DARK,
                fontSize: 11, bold: ri === 0,
                border: { pt: 0.5, color: "CBD5E1" },
              },
            }))
          ), { x: 0.5, y: 2.5, w: 9, colW: [3, 3, 3] });
        }

        // Footer
        slide.addText(footerText, {
          x: 0.3, y: 5.3, w: "70%", h: 0.3,
          fontSize: 9, color: "94A3B8",
        });
      });

      // ── Slide terakhir: Penutup ──────────────────────────────────────────────
      const last = prs.addSlide();
      last.background = { color: PRIMARY };
      last.addText("Terima Kasih", {
        x: 1, y: 2, w: "80%", h: 1,
        fontSize: 36, bold: true, color: WHITE, align: "center",
      });
      last.addText(footerText, {
        x: 1, y: 3.2, w: "80%", h: 0.5,
        fontSize: 14, color: "BFD4FF", align: "center",
      });

      const filename = `${reportTitle.replace(/\s+/g, "_")}_${Date.now()}.pptx`;
      await prs.writeFile({ fileName: filename });
      toast.success(`File ${filename} berhasil diunduh`);
      onClose();
    } catch (err) {
      console.error("PPTX export error:", err);
      toast.error("Gagal mengekspor PPTX: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between rounded-t-2xl"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <h2 className="text-white font-bold text-lg">📊 Ekspor Laporan PPTX</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl">
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Judul Laporan
            </label>
            <input
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Judul laporan..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Footer / Instansi
            </label>
            <input
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Nama instansi..."
            />
          </div>

          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-700 mb-1">Ringkasan konten:</p>
            <p>Cover + {(slides.length || 1)} slide konten + penutup = <strong>{(slides.length || 1) + 2} slide total</strong></p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleExport}
              disabled={loading || !reportTitle.trim()}
              className="flex-1 py-2.5 rounded-xl text-white font-semibold disabled:opacity-60 transition"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {loading ? "Mengekspor..." : "⬇ Unduh PPTX"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
