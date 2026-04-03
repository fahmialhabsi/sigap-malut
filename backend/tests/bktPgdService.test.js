import assert from "node:assert/strict";
import {
  buildKetersediaanEwsPanel,
  buildKetersediaanSummary,
  buildNeracaPanganDetail,
  normalizeBktPgdPayload,
} from "../services/bktPgdService.js";

describe("bktPgdService", () => {
  it("menurunkan neraca, status ketersediaan, dan early warning", () => {
    const payload = normalizeBktPgdPayload({
      produksi_total: "120",
      stok_awal: "15",
      pasokan_luar_daerah: "10",
      konsumsi_estimasi: "160",
      validitas_data: "Perlu Verifikasi",
    });

    assert.equal(payload.pasokan_lokal, 120);
    assert.equal(payload.total_pasokan, 145);
    assert.equal(payload.surplus_defisit, -15);
    assert.equal(payload.status_ketersediaan, "Menipis");
    assert.equal(payload.early_warning_status, "Siaga");
  });

  it("membangun summary dan panel EWS dari data terbaru", () => {
    const pgdRows = [
      normalizeBktPgdPayload({
        id: 1,
        komoditas_id: 1,
        nama_komoditas: "Beras",
        periode: "2026-03-01",
        jenis_pengendalian: "Neraca Pangan",
        produksi_total: 100,
        stok_awal: 20,
        konsumsi_estimasi: 140,
        validitas_data: "Valid",
      }),
      normalizeBktPgdPayload({
        id: 2,
        komoditas_id: 2,
        nama_komoditas: "Jagung",
        periode: "2026-03-01",
        jenis_pengendalian: "Neraca Pangan",
        produksi_total: 90,
        stok_awal: 10,
        konsumsi_estimasi: 60,
        validitas_data: "Perlu Verifikasi",
      }),
    ];
    const krwRows = [
      {
        id: 1,
        kabupaten: "Ternate",
        status_ketersediaan: "Rawan",
        periode: "2026-03-01",
      },
    ];

    const summary = buildKetersediaanSummary(pgdRows, krwRows);
    const ews = buildKetersediaanEwsPanel(pgdRows, krwRows);
    const neraca = buildNeracaPanganDetail(pgdRows, "2026-03");

    assert.equal(summary.neraca_pangan.status, "tersedia");
    assert.equal(summary.kabupaten_rawan, 1);
    assert.equal(summary.validitas_data.perlu_verifikasi, 1);
    assert.equal(ews.alert_aktif > 0, true);
    assert.equal(neraca.komoditas.length, 2);
  });
});
