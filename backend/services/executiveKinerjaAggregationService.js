import { InstruksiGubernur } from "../models/index.js";
import { getKepalaDinasUsers } from "./gubernurUserService.js";

const LABEL_KADIS_PANGAN = "Kepala Dinas Pangan";

function scoreBucket(b) {
  const selesaiRatio = b.total ? b.selesai / b.total : 0;
  const terlambatRatio = b.total ? b.terlambat / b.total : 0;
  let skor = Math.round(100 * selesaiRatio - 25 * terlambatRatio);
  if (skor < 0) skor = 0;
  if (skor > 100) skor = 100;
  let kategori = "Baik";
  let warna = "hijau";
  if (skor < 50) {
    kategori = "Perlu perhatian";
    warna = "merah";
  } else if (skor < 75) {
    kategori = "Cukup";
    warna = "kuning";
  }
  return { skor, kategori, warna_indikator: warna };
}

/**
 * Satu ringkasan kinerja untuk jabatan Kepala Dinas Pangan (bukan per user_id),
 * agar instruksi lama dengan assigned_to berbeda / lookup nama gagal tidak membuat dua kartu.
 */
export async function getKinerjaKadisAggregation(gubernurId) {
  const rows = await InstruksiGubernur.findAll({
    where: { created_by: gubernurId },
    attributes: ["assigned_to", "status", "deadline", "selesai_at"],
  });

  if (rows.length === 0) return [];

  const kadins = await getKepalaDinasUsers();
  const primaryId =
    kadins[0]?.id != null ? Number(kadins[0].id) : null;
  const pejabatNama =
    kadins.length === 1
      ? kadins[0].nama_lengkap ||
        kadins[0].name ||
        kadins[0].username ||
        null
      : null;

  const merged = {
    assigned_to: primaryId,
    total: 0,
    selesai: 0,
    terlambat: 0,
    aktif: 0,
  };

  for (const r of rows) {
    merged.total += 1;
    const st = String(r.status || "");
    if (st === "selesai") merged.selesai += 1;
    if (st === "terlambat") merged.terlambat += 1;
    if (["diterbitkan", "dibaca", "diproses", "terlambat"].includes(st)) {
      merged.aktif += 1;
    }
  }

  const { skor, kategori, warna_indikator } = scoreBucket(merged);

  return [
    {
      ...merged,
      nama_penerima: LABEL_KADIS_PANGAN,
      pejabat_nama: pejabatNama,
      skor,
      kategori,
      warna_indikator,
    },
  ];
}
