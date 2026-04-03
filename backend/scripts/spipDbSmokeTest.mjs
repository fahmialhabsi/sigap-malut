import { sequelize, testConnection } from "../config/database.js";
import "../models/SpipRiskRegister.js";
import "../models/SpipRtp.js";
import "../models/SpipMonitoring.js";
import "../models/SpipEvidenceLink.js";

import SpipRiskRegister from "../models/SpipRiskRegister.js";
import SpipRtp from "../models/SpipRtp.js";
import SpipMonitoring from "../models/SpipMonitoring.js";
import SpipEvidenceLink from "../models/SpipEvidenceLink.js";
import { buildSpipWorkbookFromDb } from "../services/spipDbReportService.js";

async function main() {
  await testConnection();
  await sequelize.sync();

  const now = new Date();
  const y = now.getFullYear();
  const today = now.toISOString().slice(0, 10);

  const risk = await SpipRiskRegister.create({
    unit_kerja: "Sekretariat",
    periode_tahun: y,
    kode_risiko: `RISK-${y}-001`,
    nama_risiko: "Keterlambatan penyusunan laporan SPIP",
    kategori_risiko: "Operasional",
    sasaran_konteks: "Tata kelola & kepatuhan pelaporan",
    proses_bisnis_konteks: "Penyusunan laporan dan tindak lanjut",
    pemilik_risiko: "Sekretaris",
    status: "active",
  });

  const rtp = await SpipRtp.create({
    risk_id: risk.id,
    uraian_rtp: "Menyusun jadwal kerja, PIC, dan checklist evidence minimal mingguan.",
    penanggung_jawab: "JF Perencanaan",
    target_tanggal: today,
    status: "in_progress",
  });

  const mon = await SpipMonitoring.create({
    risk_id: risk.id,
    jenis: "kegiatan_pengendalian",
    tanggal: today,
    uraian: "Review bukti aktivitas (audit log, approval log, SPJ, aset) periode berjalan",
    hasil: "Bukti tersedia dan tervalidasi",
    nilai: 1,
  });

  await SpipEvidenceLink.create({
    spip_ref_type: "risk",
    spip_ref_id: risk.id,
    sumber_modul: "manual",
    sumber_tabel: null,
    sumber_id: "SMOKE-1",
    judul: "Bukti contoh (smoke test)",
    url: null,
    occurred_at: new Date(),
    created_by: "system",
    created_at: new Date(),
  });

  const { workbook } = await buildSpipWorkbookFromDb({
    granularity: "day",
    date: today,
  });

  const outFile = `spip-smoke-${today}.xlsx`;
  await workbook.xlsx.writeFile(outFile);

  // eslint-disable-next-line no-console
  console.log(`✅ SPIP DB smoke report generated: ${outFile}`);
  // eslint-disable-next-line no-console
  console.log(`   risk_id=${risk.id} rtp_id=${rtp.id} monitoring_id=${mon.id}`);
}

main()
  .then(() => sequelize.close())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error("❌ Smoke test failed:", e);
    try {
      await sequelize.close();
    } catch {
      // ignore
    }
    process.exit(1);
  });

