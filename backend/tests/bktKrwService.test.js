import assert from "node:assert/strict";
import { normalizeBktKrwPayload } from "../services/bktKrwService.js";

describe("bktKrwService", () => {
  it("menurunkan persentase kemiskinan, skor, dan status wilayah", () => {
    const payload = normalizeBktKrwPayload({
      tingkat_kerawanan: "Prioritas 2",
      jumlah_kk: "200",
      jumlah_kk_miskin: "50",
      indikator_ketersediaan_pangan: "60",
      indikator_akses_pangan: "55",
      indikator_pemanfaatan_pangan: "50",
      indikator_kerawanan_kesehatan: "45",
    });

    assert.equal(payload.persentase_kemiskinan, 25);
    assert.equal(payload.skor_kerawanan, 52.5);
    assert.equal(payload.status_ketersediaan, "Rawan");
  });
});
