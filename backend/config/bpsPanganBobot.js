/**
 * Bobot relatif komoditas pangan pokok untuk agregasi indeks Laspeyres-tipe.
 *
 * BPS menghitung IHK resmi dengan metode Laspeyres (tahun dasar terbaru) dan
 * pola konsumsi nasional. Bobot di sini adalah **aproksimasi** untuk indeks
 * operasional harian SIGAP — wajib diselaraskan dengan publikasi BPS / SKPD
 * setempat jika dipakai untuk laporan resmi.
 *
 * Rumus indeks (setelah harga acuan p_k0 terbentuk):
 *   I_t = 100 * Σ_k w_k * (p_k,t / p_k,0)
 * dengan Σ_k w_k = 1. Ini setara struktur indeks harga dengan bobot tetap
 * (interpretasi Laspeyres pada relatif harga).
 *
 * @see https://www.bps.go.id/ — Indeks Harga Konsumen (metodologi IHK)
 */
export const KOMODITAS_KEY_BOBOT = {
  beras_medium: 0.22,
  beras_premium: 0.08,
  minyak: 0.16,
  gula: 0.1,
  daging_ayam: 0.12,
  telur: 0.08,
  cabai: 0.08,
  bawang: 0.08,
  terigu: 0.08,
};

/** Normalisasi bobot agar jumlah = 1 untuk subset komoditas yang ada data-nya */
export function normalisasiBobot(keysWithData) {
  const keys = Array.from(keysWithData).filter((k) => KOMODITAS_KEY_BOBOT[k] != null);
  if (keys.length === 0) return {};
  const sum = keys.reduce((s, k) => s + KOMODITAS_KEY_BOBOT[k], 0);
  const out = {};
  keys.forEach((k) => {
    out[k] = KOMODITAS_KEY_BOBOT[k] / sum;
  });
  return out;
}
