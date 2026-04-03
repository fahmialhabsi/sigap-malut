import assert from "node:assert/strict";
import {
  deriveStatusInflasi,
  normalizeBdsLapPayload,
} from "../services/bdsLapService.js";

describe("bdsLapService", () => {
  it("derives status inflasi and serapan", () => {
    const payload = normalizeBdsLapPayload({
      periode: "2026-04-01",
      inflasi_pangan: "2.9",
      anggaran_program: "100",
      realisasi_anggaran: "55",
    });

    assert.equal(payload.bulan, 4);
    assert.equal(payload.tahun, 2026);
    assert.equal(payload.persentase_serapan, 55);
    assert.equal(payload.status_inflasi, "Warning");
  });

  it("classifies alert when inflasi exceeds target materially", () => {
    assert.equal(deriveStatusInflasi(3.2, 2.5), "Alert");
    assert.equal(deriveStatusInflasi(2.1, 2.5), "On Target");
  });
});
