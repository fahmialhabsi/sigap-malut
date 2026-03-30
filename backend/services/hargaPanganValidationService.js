import {
  getHargaRuleForKey,
  getAnomalyDayOverDayPct,
  HARGA_ABSOLUTE_MAX,
  HARGA_ABSOLUTE_MIN,
} from "../config/hargaPanganRules.js";

/**
 * Validasi keras: gagal request — data tidak boleh masuk DB.
 * Asumsi: komoditas_key wajib untuk baris survei agar aturan per-komoditas & inflasi konsisten.
 */
export function validateHargaBarisHard(
  { harga_eceran, komoditas_key },
  { requireKomoditasKey = true } = {},
) {
  const errors = [];
  const h = Number(harga_eceran);
  if (!Number.isFinite(h)) {
    errors.push({ code: "harga_tidak_valid", message: "harga_eceran harus angka" });
  } else if (h < HARGA_ABSOLUTE_MIN || h > HARGA_ABSOLUTE_MAX) {
    errors.push({
      code: "harga_di_luar_plafon",
      message: `Harga harus antara ${HARGA_ABSOLUTE_MIN} dan ${HARGA_ABSOLUTE_MAX}`,
    });
  }
  if (requireKomoditasKey) {
    const k = komoditas_key != null ? String(komoditas_key).trim() : "";
    if (!k) {
      errors.push({ code: "komoditas_key_wajib", message: "komoditas_key wajib" });
    }
  }
  return errors;
}

/**
 * Validasi lunak / bisnis: di luar rentang konfigurasi atau lonjakan DoD → is_anomaly, tetap disimpan.
 */
export function validateHargaBarisSoft({ harga_eceran, komoditas_key }, { yesterdayPrice }) {
  const reasons = [];
  const h = Number(harga_eceran);
  const key = komoditas_key != null ? String(komoditas_key).trim() : "";
  const rule = getHargaRuleForKey(key);
  if (h < rule.min || h > rule.max) {
    reasons.push({
      code: "di_luar_rentang_konfigurasi",
      detail: { min: rule.min, max: rule.max, harga: h, key },
    });
  }
  const pctAmbang = getAnomalyDayOverDayPct();
  if (yesterdayPrice != null && Number(yesterdayPrice) > 0) {
    const y = Number(yesterdayPrice);
    const ch = Math.abs((h - y) / y) * 100;
    if (ch > pctAmbang) {
      reasons.push({
        code: "lonjakan_harian",
        detail: {
          persen_perubahan: Number(ch.toFixed(2)),
          ambang_persen: pctAmbang,
          harga_kemarin: y,
        },
      });
    }
  }
  return {
    is_anomaly: reasons.length > 0,
    anomaly_reason: reasons.length > 0 ? JSON.stringify({ reasons }) : null,
  };
}
