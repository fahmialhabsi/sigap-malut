import assert from "node:assert/strict";
import {
  buildCppdStatusSummary,
  normalizeBdsCpdPayload,
} from "../services/bdsCpdService.js";

describe("bdsCpdService", () => {
  it("normalizes stok akhir, persentase target, and status stok", () => {
    const payload = normalizeBdsCpdPayload({
      kebutuhan_cppd: "100",
      stok_awal_bulan: "10",
      penerimaan_bulan_ini: "25",
      penyaluran_bulan_ini: "5",
    });

    assert.equal(payload.target_stok, 100);
    assert.equal(payload.stok_akhir_bulan, 30);
    assert.equal(payload.persentase_terhadap_target, 30);
    assert.equal(payload.status_stok, "Kritis");
  });

  it("summarizes latest cppd rows by commodity", () => {
    const summary = buildCppdStatusSummary([
      {
        id: 1,
        komoditas_id: 1,
        nama_komoditas: "Beras",
        target_stok: 100,
        stok_akhir_bulan: 40,
        periode: "2026-01-01",
        updated_at: "2026-01-02T00:00:00.000Z",
      },
      {
        id: 2,
        komoditas_id: 1,
        nama_komoditas: "Beras",
        target_stok: 100,
        stok_akhir_bulan: 90,
        periode: "2026-02-01",
        updated_at: "2026-02-02T00:00:00.000Z",
      },
      {
        id: 3,
        komoditas_id: 2,
        nama_komoditas: "Jagung",
        target_stok: 50,
        stok_akhir_bulan: 20,
        periode: "2026-02-01",
        updated_at: "2026-02-02T00:00:00.000Z",
      },
    ]);

    assert.equal(summary.stok_cadangan.length, 2);
    assert.equal(summary.stok_cadangan[0].komoditas, "Jagung");
    assert.equal(summary.stok_cadangan[0].status, "kritis");
    assert.equal(summary.stok_cadangan[1].komoditas, "Beras");
    assert.equal(summary.stok_cadangan[1].status, "aman");
    assert.equal(summary.status_keseluruhan, "kritis");
  });
});
