/**
 * Rentang harga realistis per komoditas_key (Rupiah / satuan form).
 * Digabung dengan default; override per-key opsional.
 * ENV: HARGA_ANOMALY_DOD_PCT — ambang lonjakan vs harga hari sebelumnya (default 50).
 */

export const DEFAULT_HARGA_RULE = { min: 500, max: 500_000 };

/** Override per key yang ada di bobot / form SIGAP */
export const HARGA_RULES_BY_KEY = {
  beras_medium: { min: 4_000, max: 35_000 },
  beras_premium: { min: 6_000, max: 50_000 },
  minyak: { min: 8_000, max: 35_000 },
  gula: { min: 8_000, max: 25_000 },
  daging_ayam: { min: 20_000, max: 120_000 },
  telur: { min: 1_000, max: 50_000 },
  cabai: { min: 10_000, max: 200_000 },
  bawang: { min: 8_000, max: 80_000 },
  terigu: { min: 8_000, max: 30_000 },
};

/** Plafon absolut penolakan (bukan anomali — data ditolak) */
export const HARGA_ABSOLUTE_MAX = 10_000_000;
export const HARGA_ABSOLUTE_MIN = 1;

export function getHargaRuleForKey(komoditasKey) {
  if (!komoditasKey) return { ...DEFAULT_HARGA_RULE };
  const o = HARGA_RULES_BY_KEY[komoditasKey];
  if (!o) return { ...DEFAULT_HARGA_RULE };
  return {
    min: o.min ?? DEFAULT_HARGA_RULE.min,
    max: o.max ?? DEFAULT_HARGA_RULE.max,
  };
}

export function getAnomalyDayOverDayPct() {
  const n = Number(process.env.HARGA_ANOMALY_DOD_PCT);
  return Number.isFinite(n) && n > 0 ? n : 50;
}
