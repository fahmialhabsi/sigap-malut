/**
 * exportMendagri.js
 *
 * Generator PPTX 6 slide untuk Laporan Mendagri sesuai spesifikasi
 * dokumen 03-spesifikasi-uiux-dashboard.md §7.2 & §13.
 *
 * Slide:
 *  1. Cover — instansi, periode, label "Bahan Rapat Koordinasi Mendagri"
 *  2. Ringkasan Eksekutif — big number inflasi + status + target
 *  3. Top 10 Kontributor Inflasi — tabel
 *  4. Tren Inflasi 6 Bulan — tabel bulanan
 *  5. Prediksi & Rekomendasi Kebijakan
 *  6. Penutup & Penandatangan — signatory block
 *
 * Options:
 *  data         {object}  — data inflasi (lihat DATA_SHAPE)
 *  periode      {string}  — "Maret 2026"
 *  template     {string}  — "formal_biru" | "modern_hijau" | "minimal"
 *  watermarkText {string} — teks watermark (kosong = tidak ada)
 *  signatory    {object}  — { nama, jabatan, nip, kota, tanggal }
 */

// ─── Templates ────────────────────────────────────────────────────────────────
export const MENDAGRI_TEMPLATES = {
  formal_biru: {
    id: "formal_biru",
    name: "Resmi (Biru)",
    preview: ["#1E40AF", "#DBEAFE"],
    headerBg: "1E40AF",
    headerText: "FFFFFF",
    coverBg: "1E3A8A",
    bodyBg: "FFFFFF",
    bodyText: "1E293B",
    accentEven: "EFF6FF",
    accentOdd: "FFFFFF",
    tableBg: "1E3A8A",
    tableText: "FFFFFF",
    wm: "BFDBFE",
  },
  modern_hijau: {
    id: "modern_hijau",
    name: "Modern (Hijau)",
    preview: ["#065F46", "#D1FAE5"],
    headerBg: "065F46",
    headerText: "FFFFFF",
    coverBg: "064E3B",
    bodyBg: "F0FDF4",
    bodyText: "064E3B",
    accentEven: "D1FAE5",
    accentOdd: "F0FDF4",
    tableBg: "065F46",
    tableText: "FFFFFF",
    wm: "A7F3D0",
  },
  minimal: {
    id: "minimal",
    name: "Minimal (Abu)",
    preview: ["#374151", "#F3F4F6"],
    headerBg: "374151",
    headerText: "FFFFFF",
    coverBg: "111827",
    bodyBg: "FFFFFF",
    bodyText: "111827",
    accentEven: "F3F4F6",
    accentOdd: "FFFFFF",
    tableBg: "374151",
    tableText: "FFFFFF",
    wm: "D1D5DB",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function statusLabel(status) {
  const m = {
    on_target: "ON TARGET ✓",
    warning: "WARNING ⚠",
    alert: "ALERT ✗",
  };
  return m[status] || String(status).toUpperCase();
}

function statusColor(status) {
  const m = { on_target: "059669", warning: "D97706", alert: "DC2626" };
  return m[status] || "64748B";
}

/** Tambahkan header bar di bagian atas slide */
function addHeader(slide, text, tc) {
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.6,
    fill: { color: tc.headerBg },
    line: { type: "none" },
  });
  slide.addText(text, {
    x: 0.3,
    y: 0.08,
    w: 9.4,
    h: 0.45,
    fontSize: 14,
    bold: true,
    color: tc.headerText,
  });
}

/** Tambahkan watermark teks diagonal di tengah slide */
function addWatermark(slide, text, tc) {
  if (!text) return;
  slide.addText(text, {
    x: 0,
    y: 1.5,
    w: "100%",
    h: 3,
    fontSize: 72,
    bold: true,
    color: tc.wm,
    rotate: 315,
    align: "center",
    valign: "middle",
  });
}

// ─── 6 Slide Builders ────────────────────────────────────────────────────────

/** Slide 1 — Cover */
function buildCover(pptx, tc, periode, watermark) {
  const slide = pptx.addSlide();
  slide.background = { color: tc.coverBg };

  addWatermark(slide, watermark, { wm: "3B5DB8" }); // lighter version on dark bg

  // Logo text placeholder
  slide.addText("🏛", {
    x: 4.2,
    y: 0.5,
    w: 2,
    h: 1,
    fontSize: 48,
    align: "center",
  });

  slide.addText("LAPORAN INFLASI PANGAN", {
    x: 0.5,
    y: 1.6,
    w: 9,
    h: 0.9,
    fontSize: 30,
    bold: true,
    color: "FFFFFF",
    align: "center",
  });
  slide.addText("MALUKU UTARA", {
    x: 0.5,
    y: 2.4,
    w: 9,
    h: 0.7,
    fontSize: 24,
    bold: true,
    color: "BFDBFE",
    align: "center",
  });
  slide.addText("Bahan Rapat Koordinasi Pengendalian Inflasi — Kemendagri", {
    x: 0.5,
    y: 3.2,
    w: 9,
    h: 0.5,
    fontSize: 13,
    color: "93C5FD",
    align: "center",
    italic: true,
  });
  slide.addShape("rect", {
    x: 2,
    y: 3.85,
    w: 6,
    h: 0.04,
    fill: { color: "93C5FD" },
    line: { type: "none" },
  });
  slide.addText(`Periode: ${periode}`, {
    x: 0.5,
    y: 4.0,
    w: 9,
    h: 0.5,
    fontSize: 16,
    bold: true,
    color: "FFFFFF",
    align: "center",
  });
  slide.addText("Dinas Ketahanan Pangan — Pemerintah Provinsi Maluku Utara", {
    x: 0.5,
    y: 4.7,
    w: 9,
    h: 0.4,
    fontSize: 12,
    color: "93C5FD",
    align: "center",
  });
  slide.addText(
    `Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    {
      x: 0.5,
      y: 6.8,
      w: 9,
      h: 0.35,
      fontSize: 9,
      color: "93C5FD",
      align: "center",
    },
  );
  return slide;
}

/** Slide 2 — Ringkasan Eksekutif */
function buildRingkasan(pptx, tc, data, periode, watermark) {
  const slide = pptx.addSlide();
  slide.background = { color: tc.bodyBg };
  addWatermark(slide, watermark, tc);
  addHeader(slide, `Ringkasan Eksekutif — ${periode}`, tc);

  const inflasi = data.inflasi_persen ?? data.inflasiPangan ?? 0;
  const status = data.status || "on_target";

  slide.addText(`${Number(inflasi).toFixed(2)}%`, {
    x: 0.5,
    y: 0.9,
    w: 4,
    h: 2.5,
    fontSize: 72,
    bold: true,
    color: tc.headerBg,
    align: "center",
  });
  slide.addText("Inflasi Pangan (YoY)", {
    x: 0.5,
    y: 3.3,
    w: 4,
    h: 0.45,
    fontSize: 12,
    color: "64748B",
    align: "center",
  });
  slide.addText(statusLabel(status), {
    x: 0.8,
    y: 3.8,
    w: 3.5,
    h: 0.6,
    fontSize: 18,
    bold: true,
    color: statusColor(status),
    align: "center",
  });

  // Right column — info box
  const infoRows = [
    ["Keterangan", "Nilai"],
    ["Inflasi Pangan Periode Ini", `${Number(inflasi).toFixed(2)}%`],
    ["Target Nasional (Mendagri)", "≤ 3.5%"],
    ["Status", statusLabel(status)],
    [
      "Prediksi Bulan Depan",
      `${Number(data.prediksi?.bulan_depan ?? 0).toFixed(2)}%`,
    ],
    ["Confidence Prediksi", `${data.prediksi?.confidence ?? "-"}%`],
  ];
  const tblRows = infoRows.map((r, i) => {
    const isHead = i === 0;
    return r.map((cell) => ({
      text: cell,
      options: {
        bold: isHead,
        fill: isHead ? tc.tableBg : i % 2 === 0 ? tc.accentEven : tc.accentOdd,
        color: isHead ? tc.tableText : tc.bodyText,
        fontSize: 12,
      },
    }));
  });
  slide.addTable(tblRows, { x: 5, y: 0.9, w: 5, colW: [2.8, 2.2], rowH: 0.5 });
  return slide;
}

/** Slide 3 — Top 10 Kontributor */
function buildTop10(pptx, tc, data, watermark) {
  const slide = pptx.addSlide();
  slide.background = { color: tc.bodyBg };
  addWatermark(slide, watermark, tc);
  addHeader(slide, "Top 10 Kontributor Inflasi", tc);

  const top10 = (data.top_10 || data.contributors || []).slice(0, 10);
  const headRow = [
    {
      text: "No",
      options: {
        bold: true,
        fill: tc.tableBg,
        color: tc.tableText,
        fontSize: 11,
      },
    },
    {
      text: "Komoditas",
      options: {
        bold: true,
        fill: tc.tableBg,
        color: tc.tableText,
        fontSize: 11,
      },
    },
    {
      text: "Perubahan Harga (%)",
      options: {
        bold: true,
        fill: tc.tableBg,
        color: tc.tableText,
        fontSize: 11,
      },
    },
    {
      text: "Kontribusi (poin)",
      options: {
        bold: true,
        fill: tc.tableBg,
        color: tc.tableText,
        fontSize: 11,
      },
    },
  ];
  const dataRows = top10.map((r, i) => {
    const fill = i % 2 === 0 ? tc.accentEven : tc.accentOdd;
    const komoditas = r.komoditas || r.nama || "-";
    const perubahan = r.perubahan ?? r.tren ?? 0;
    const kontribusi = r.kontribusi ?? 0;
    return [
      {
        text: String(i + 1),
        options: { fill, color: tc.bodyText, fontSize: 11 },
      },
      { text: komoditas, options: { fill, color: tc.bodyText, fontSize: 11 } },
      {
        text: `${Number(perubahan).toFixed(2)}%`,
        options: { fill, color: tc.bodyText, fontSize: 11 },
      },
      {
        text: Number(kontribusi).toFixed(2),
        options: { fill, color: tc.bodyText, fontSize: 11 },
      },
    ];
  });
  slide.addTable([headRow, ...dataRows], {
    x: 0.5,
    y: 0.75,
    w: 9,
    colW: [0.6, 4.5, 2.2, 1.7],
    rowH: 0.44,
  });
  return slide;
}

/** Slide 4 — Tren 6 Bulan */
function buildTren(pptx, tc, data, watermark) {
  const slide = pptx.addSlide();
  slide.background = { color: tc.bodyBg };
  addWatermark(slide, watermark, tc);
  addHeader(slide, "Tren Inflasi Pangan 6 Bulan Terakhir", tc);

  const tren = data.trend_6bulan || data.tren6Bulan || [];
  slide.addText("Tabel Data Tren", {
    x: 0.5,
    y: 0.72,
    w: 9,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: tc.bodyText,
  });

  if (tren.length > 0) {
    const headRow = [
      {
        text: "Bulan",
        options: {
          bold: true,
          fill: tc.tableBg,
          color: tc.tableText,
          fontSize: 12,
        },
      },
      {
        text: "Inflasi (%)",
        options: {
          bold: true,
          fill: tc.tableBg,
          color: tc.tableText,
          fontSize: 12,
        },
      },
      {
        text: "Status",
        options: {
          bold: true,
          fill: tc.tableBg,
          color: tc.tableText,
          fontSize: 12,
        },
      },
    ];
    const dataRows = tren.map((r, i) => {
      const fill = i % 2 === 0 ? tc.accentEven : tc.accentOdd;
      const val = r.inflasi ?? r.nilai ?? 0;
      const sts = val > 5 ? "ALERT" : val > 3.5 ? "WARNING" : "ON TARGET";
      return [
        {
          text: r.bulan || String(i + 1),
          options: { fill, color: tc.bodyText, fontSize: 12 },
        },
        {
          text: `${Number(val).toFixed(2)}%`,
          options: { fill, color: tc.bodyText, fontSize: 12 },
        },
        {
          text: sts,
          options: {
            fill,
            color: val > 5 ? "DC2626" : val > 3.5 ? "D97706" : "059669",
            fontSize: 12,
          },
        },
      ];
    });
    slide.addTable([headRow, ...dataRows], {
      x: 1.5,
      y: 1.2,
      w: 7,
      colW: [2.5, 2, 2.5],
      rowH: 0.52,
    });
  } else {
    slide.addText("Data tren tidak tersedia untuk periode ini.", {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 0.5,
      fontSize: 13,
      color: "94A3B8",
      align: "center",
    });
  }

  slide.addText(
    "Catatan: Angka inflasi adalah inflasi year-on-year pangan Maluku Utara (BPS/BKP)",
    {
      x: 0.5,
      y: 6.7,
      w: 9,
      h: 0.3,
      fontSize: 9,
      color: "94A3B8",
      italic: true,
    },
  );
  return slide;
}

/** Slide 5 — Prediksi & Rekomendasi */
function buildPrediksi(pptx, tc, data, watermark) {
  const slide = pptx.addSlide();
  slide.background = { color: tc.bodyBg };
  addWatermark(slide, watermark, tc);
  addHeader(slide, "Prediksi & Rekomendasi Kebijakan", tc);

  const pred = data.prediksi || {};
  slide.addText(
    `Prediksi Inflasi Bulan Depan: ${Number(pred.bulan_depan ?? 0).toFixed(2)}%`,
    {
      x: 0.5,
      y: 0.78,
      w: 9,
      h: 0.55,
      fontSize: 16,
      bold: true,
      color: tc.headerBg,
    },
  );
  slide.addText(`Tingkat Keyakinan Model: ${pred.confidence ?? "-"}%`, {
    x: 0.5,
    y: 1.33,
    w: 9,
    h: 0.4,
    fontSize: 12,
    color: "64748B",
  });

  slide.addShape("rect", {
    x: 0.5,
    y: 1.85,
    w: 9,
    h: 0.04,
    fill: { color: tc.headerBg },
    line: { type: "none" },
  });
  slide.addText("Rekomendasi Intervensi Kebijakan:", {
    x: 0.5,
    y: 2.0,
    w: 9,
    h: 0.45,
    fontSize: 13,
    bold: true,
    color: tc.bodyText,
  });

  const rekoms = pred.rekomendasi || [];
  rekoms.slice(0, 3).forEach((r, i) => {
    const yBase = 2.55 + i * 1.35;
    slide.addText(`${i + 1}. ${r.title || r.judul || "-"}`, {
      x: 0.5,
      y: yBase,
      w: 9,
      h: 0.45,
      fontSize: 13,
      bold: true,
      color: tc.headerBg,
    });
    slide.addText(
      `Estimasi dampak: ${r.impact_est || r.dampak || "-"}   |   Estimasi biaya: ${r.cost_est || r.biaya || "-"}`,
      {
        x: 0.7,
        y: yBase + 0.45,
        w: 8.5,
        h: 0.35,
        fontSize: 11,
        color: "475569",
      },
    );
    if (Array.isArray(r.actions) && r.actions.length) {
      slide.addText(`Langkah: ${r.actions.join(", ")}`, {
        x: 0.7,
        y: yBase + 0.8,
        w: 8.5,
        h: 0.35,
        fontSize: 10,
        color: "64748B",
        italic: true,
      });
    }
  });

  if (rekoms.length === 0) {
    slide.addText("Tidak ada rekomendasi tersedia untuk periode ini.", {
      x: 0.5,
      y: 2.8,
      w: 9,
      h: 0.5,
      fontSize: 13,
      color: "94A3B8",
      align: "center",
    });
  }
  return slide;
}

/** Slide 6 — Penutup & Penandatangan */
function buildPenutup(pptx, tc, signatory, periode, watermark) {
  const slide = pptx.addSlide();
  slide.background = { color: tc.bodyBg };
  addWatermark(slide, watermark, tc);
  addHeader(slide, "Penutup & Penandatangan", tc);

  slide.addText("Penutup", {
    x: 0.5,
    y: 0.75,
    w: 9,
    h: 0.5,
    fontSize: 16,
    bold: true,
    color: tc.headerBg,
  });
  slide.addText(
    `Demikian laporan inflasi pangan Maluku Utara periode ${periode} ini disusun sebagai bahan ` +
      "koordinasi pada Rapat Pengendalian Inflasi bersama Kementerian Dalam Negeri. " +
      "Laporan ini bersifat resmi dan dapat digunakan sebagai referensi kebijakan.",
    {
      x: 0.5,
      y: 1.3,
      w: 9,
      h: 1.0,
      fontSize: 12,
      color: tc.bodyText,
      align: "justify",
    },
  );

  // Separator
  slide.addShape("rect", {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 0.04,
    fill: { color: tc.headerBg },
    line: { type: "none" },
  });

  // Signatory block
  const sig = signatory || {};
  const kota = sig.kota || "Ternate";
  const tanggal =
    sig.tanggal ||
    new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  slide.addText(`${kota}, ${tanggal}`, {
    x: 5.5,
    y: 2.7,
    w: 4,
    h: 0.45,
    fontSize: 12,
    align: "center",
    color: tc.bodyText,
  });
  slide.addText(sig.jabatan || "Kepala Dinas Ketahanan Pangan", {
    x: 5.5,
    y: 3.15,
    w: 4,
    h: 0.45,
    fontSize: 12,
    align: "center",
    color: tc.bodyText,
  });
  slide.addText("Provinsi Maluku Utara", {
    x: 5.5,
    y: 3.55,
    w: 4,
    h: 0.35,
    fontSize: 11,
    align: "center",
    color: "64748B",
  });

  // Signature space
  slide.addShape("rect", {
    x: 5.9,
    y: 4.0,
    w: 3.2,
    h: 1.0,
    fill: { color: "F8FAFC" },
    line: { color: "D1D5DB", width: 0.5 },
  });
  slide.addText("(tanda tangan & stempel)", {
    x: 5.9,
    y: 4.3,
    w: 3.2,
    h: 0.4,
    fontSize: 9,
    color: "CBD5E1",
    align: "center",
    italic: true,
  });

  slide.addText(sig.nama || "____________________________", {
    x: 5.5,
    y: 5.1,
    w: 4,
    h: 0.45,
    fontSize: 13,
    bold: true,
    align: "center",
    color: tc.bodyText,
  });
  if (sig.nip) {
    slide.addText(`NIP. ${sig.nip}`, {
      x: 5.5,
      y: 5.55,
      w: 4,
      h: 0.35,
      fontSize: 11,
      align: "center",
      color: "64748B",
    });
  }

  // Distribusi (footer)
  slide.addText(
    "Dokumen ini dibuat secara otomatis oleh SIGAP-MALUT • Dinas Ketahanan Pangan Provinsi Maluku Utara",
    {
      x: 0.5,
      y: 6.75,
      w: 9,
      h: 0.3,
      fontSize: 8,
      color: "94A3B8",
      align: "center",
      italic: true,
    },
  );
  return slide;
}

// ─── Main Export ─────────────────────────────────────────────────────────────

/**
 * Buat dan unduh file PPTX 6 slide Laporan Mendagri.
 *
 * @param {object} options
 * @param {object} options.data          — data inflasi
 * @param {string} options.periode       — "Maret 2026"
 * @param {string} options.template      — "formal_biru" | "modern_hijau" | "minimal"
 * @param {string} options.watermarkText — teks watermark, kosong = tidak ada
 * @param {object} options.signatory     — { nama, jabatan, nip, kota, tanggal }
 */
export async function generateMendagriPPTX({
  data = {},
  periode = "—",
  template = "formal_biru",
  watermarkText = "",
  signatory = {},
}) {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 10 x 7.5 inches

  const tc = MENDAGRI_TEMPLATES[template] || MENDAGRI_TEMPLATES.formal_biru;
  const wm = watermarkText.trim();

  // Build all 6 slides
  buildCover(pptx, tc, periode, wm);
  buildRingkasan(pptx, tc, data, periode, wm);
  buildTop10(pptx, tc, data, wm);
  buildTren(pptx, tc, data, wm);
  buildPrediksi(pptx, tc, data, wm);
  buildPenutup(pptx, tc, signatory, periode, wm);

  const safePeriode = periode.replace(/\s+/g, "_").replace(/[^\w_]/g, "");
  await pptx.writeFile({
    fileName: `Mendagri_Inflasi_Pangan_${safePeriode}.pptx`,
  });
}
