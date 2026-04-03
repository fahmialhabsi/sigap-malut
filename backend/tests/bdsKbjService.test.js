import assert from "node:assert/strict";
import {
  buildSarprasKelembagaanSummary,
  normalizeBdsKbjPayload,
} from "../services/bdsKbjService.js";

describe("bdsKbjService", () => {
  it("normalizes komoditas and derives jenis data", () => {
    const payload = normalizeBdsKbjPayload({
      tahun: "2026",
      jenis_kebijakan: "Peta Distribusi",
      komoditas_distribusi: "Beras, Jagung\nCabai",
      titik_distribusi: "Gudang Sofifi",
    });

    assert.equal(payload.tahun, 2026);
    assert.deepEqual(payload.komoditas_distribusi, ["Beras", "Jagung", "Cabai"]);
    assert.equal(payload.layanan_id, "LY078");
    assert.equal(payload.jenis_data, "Sarpras Distribusi");
  });

  it("builds sarpras and kelembagaan summary", () => {
    const summary = buildSarprasKelembagaanSummary([
      {
        komoditas_distribusi: ["Beras", "Gula"],
        wilayah_distribusi: "Ternate, Tidore",
        titik_distribusi: "Gudang Sofifi",
        jalur_distribusi_utama: "Sofifi - Ternate",
        stakeholder_terlibat: "BULOG, Distributor",
      },
      {
        komoditas_distribusi: ["Jagung"],
        hasil_sinkronisasi: "Rapat lintas sektor",
        pedoman_teknis: "Ada",
      },
    ]);

    assert.equal(summary.total_dokumen, 2);
    assert.equal(summary.dokumen_sarpras, 1);
    assert.equal(summary.dokumen_kelembagaan, 2);
    assert.equal(summary.dokumen_pedoman, 1);
    assert.equal(summary.komoditas.length, 3);
    assert.equal(summary.stakeholder.includes("BULOG"), true);
  });
});
