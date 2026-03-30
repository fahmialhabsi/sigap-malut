import assert from "assert";
import { normalisasiBobot, KOMODITAS_KEY_BOBOT } from "../config/bpsPanganBobot.js";

describe("Metodologi inflasi Laspeyres-tipe (selaras konsep IHK BPS)", () => {
  it("bobot ternormalisasi ke jumlah 1 untuk subset komoditas", () => {
    const w = normalisasiBobot(new Set(["beras_medium", "minyak"]));
    const s = Object.values(w).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(s - 1) < 1e-9, `jumlah bobot harus 1, dapat ${s}`);
    const expectedBeras =
      KOMODITAS_KEY_BOBOT.beras_medium /
      (KOMODITAS_KEY_BOBOT.beras_medium + KOMODITAS_KEY_BOBOT.minyak);
    assert.ok(Math.abs(w.beras_medium - expectedBeras) < 1e-9);
  });

  it("indeks = 100 jika semua harga sama dengan harga acuan", () => {
    const pT = { beras_medium: 10000, minyak: 15000 };
    const p0 = { beras_medium: 10000, minyak: 15000 };
    const keys = Object.keys(pT).filter((k) => p0[k] > 0);
    const w = normalisasiBobot(new Set(keys));
    let sum = 0;
    for (const k of keys) {
      sum += w[k] * (pT[k] / p0[k]);
    }
    const I = 100 * sum;
    assert.strictEqual(I, 100);
  });

  it("indeks naik proporsional relatif harga (contoh sederhana)", () => {
    const pT = { beras_medium: 11000 };
    const p0 = { beras_medium: 10000 };
    const w = normalisasiBobot(new Set(["beras_medium"]));
    const I = 100 * w.beras_medium * (pT.beras_medium / p0.beras_medium);
    assert.ok(Math.abs(I - 110) < 1e-9);
  });
});
