import assert from "node:assert/strict";
import { normalizeBdsMonPayload } from "../services/bdsMonService.js";

describe("bdsMonService", () => {
  it("menurunkan status stok dari stok pasar dan stok normal", () => {
    const payload = normalizeBdsMonPayload({
      stok_pasar: "40",
      stok_normal: "100",
    });

    assert.equal(payload.status_stok, "Kritis");
  });
});
