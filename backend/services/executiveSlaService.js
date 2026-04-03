import { loadExecutiveGovernance } from "./executiveGovernanceLoader.js";

/**
 * Status SLA operasional untuk satu baris instruksi (bukan duplikasi reminder H-n).
 */
export function evaluateInstructionSla(row) {
  const cfg = loadExecutiveGovernance();
  const st = String(row?.status || "").toLowerCase();
  const jenis = String(row?.jenis || "instruksi").toLowerCase();
  const exp =
    cfg.response_expectations_by_jenis?.[jenis] ||
    cfg.response_expectations_by_jenis?.instruksi ||
    {};

  if (st === "selesai" || st === "draf") {
    return {
      code: st === "selesai" ? "selesai" : "draf",
      label: st === "selesai" ? "Selesai" : "Draf",
      at_risk: false,
    };
  }

  const now = new Date();
  const deadline = row?.deadline ? new Date(`${String(row.deadline).slice(0, 10)}T23:59:59`) : null;
  let terlambat_kalender = false;
  if (deadline && !Number.isNaN(deadline.getTime()) && now > deadline) {
    terlambat_kalender = true;
  }

  let at_risk = false;
  const terbit = row?.created_at ? new Date(row.created_at) : null;
  const baca = row?.dibaca_at ? new Date(row.dibaca_at) : null;
  const maxBacaJam = Number(exp.kadis_baca_maks_jam_setelah_terbit || 48);
  const maxProsesJam = Number(exp.mulai_proses_maks_jam_setelah_baca || 72);

  if (st === "diterbitkan" && terbit) {
    const jam = (now - terbit) / 3600000;
    if (jam > maxBacaJam) at_risk = true;
  }
  if (st === "dibaca" && baca) {
    const jam = (now - baca) / 3600000;
    if (jam > maxProsesJam) at_risk = true;
  }

  if (terlambat_kalender || st === "terlambat") {
    return {
      code: "terlambat",
      label: "Terlambat",
      at_risk: true,
      terlambat_kalender,
    };
  }
  if (at_risk) {
    return { code: "at_risk", label: "Berisiko (respons)", at_risk: true };
  }
  return { code: "on_track", label: "On track", at_risk: false };
}

/** SLA pengajuan ke Gubernur: usia vs batas kebijakan. */
export function evaluatePengajuanSla(row) {
  const cfg = loadExecutiveGovernance();
  const batas = Number(cfg.pengajuan_ke_gubernur?.batas_menunggu_keputusan_hari || 14);
  const st = String(row?.status || "");
  if (["disetujui", "ditolak"].includes(st)) {
    return { code: "selesai", label: "Selesai", at_risk: false };
  }
  if (st === "dikembalikan") {
    return { code: "revisi", label: "Revisi", at_risk: false };
  }
  const created = row?.created_at ? new Date(row.created_at) : new Date();
  const usiaHari = Math.floor((Date.now() - created) / 86400000);
  if (usiaHari >= batas) {
    return { code: "gagal_operasional", label: "Melewati batas tunggu", at_risk: true, usia_hari: usiaHari };
  }
  if (usiaHari >= batas - 1) {
    return { code: "kritis", label: "Hampir batas", at_risk: true, usia_hari: usiaHari };
  }
  return { code: "menunggu", label: "Menunggu", at_risk: false, usia_hari: usiaHari };
}
