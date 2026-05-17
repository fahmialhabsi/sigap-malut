import { Renja, Rkpd } from "../models/index.js";

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Menautkan baris RKPD lama (renja_id kosong) ke Renja berdasarkan tahun + kecocokan teks program/kegiatan/sub-kegiatan.
 * @param {{ dryRun?: boolean, limit?: number }} opts
 */
export async function linkRenjaToRkpd(opts = {}) {
  const dryRun = Boolean(opts.dryRun);
  const limit = Math.min(Math.max(Number(opts.limit) || 500, 1), 5000);

  const orphans = await Rkpd.findAll({
    where: { renja_id: null },
    limit,
    order: [["id", "ASC"]],
  });

  const linked = [];
  const skipped = [];

  for (const rk of orphans) {
    const tahun = rk.tahun;
    const sub = norm(rk.nama_sub_kegiatan);
    const ind = norm(rk.indikator);

    const candidates = await Renja.findAll({
      where: { tahun },
      limit: 200,
      order: [["id", "ASC"]],
    });

    let best = null;
    let bestScore = 0;

    for (const r of candidates) {
      const p = norm(r.program);
      const k = norm(r.kegiatan);
      const j = norm(r.judul);
      let score = 0;
      if (sub && k && (sub.includes(k) || k.includes(sub))) score += 3;
      if (sub && p && sub.includes(p)) score += 2;
      if (ind && k && (ind.includes(k) || k.includes(ind))) score += 2;
      if (sub && j && sub.includes(j)) score += 1;
      if (score > bestScore) {
        bestScore = score;
        best = r;
      }
    }

    if (best && bestScore >= 2) {
      linked.push({
        rkpd_id: rk.id,
        renja_id: best.id,
        score: bestScore,
        dryRun,
      });
      if (!dryRun) {
        await rk.update({ renja_id: best.id });
      }
    } else {
      skipped.push({ rkpd_id: rk.id, tahun, reason: "no_confident_match" });
    }
  }

  return { dryRun, examined: orphans.length, linked: linked.length, details: linked, skipped };
}

export default { linkRenjaToRkpd };
