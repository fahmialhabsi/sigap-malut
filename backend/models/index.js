// backend/models/index.js
// Memastikan semua model terdaftar dan asosiasi siap sebelum digunakan

import sequelize from "../config/database.js";

// Import semua model hasil generator dan model manual
import Komoditas from "./komoditas.js";
import Kgb from "./kgb.js";
import Stok from "./stok.js";
import Role from "./Role.js";
import User from "./User.js";
import DataIntegrationLog from "./dataIntegrationLog.js";
import AuditLog from "./auditLog.js";
import BypassDetection from "./bypassDetection.js";
import ApprovalLog from "./approvalLog.js";
import ApprovalWorkflow from "./approvalWorkflow.js";
import Workflow from "./workflow.js";
import WorkflowInstance from "./WorkflowInstance.js";
import WorkflowHistory from "./WorkflowHistory.js";
import WorkflowTransitionLog from "./workflowTransitionLog.js";

// Import seluruh model hasil generator (SEK-*, BKT-*, BDS-*, BKS-*, UPT-*)
import SekAdm from "./SEK-ADM.js";
import SekAst from "./SEK-AST.js";
import SekHum from "./SEK-HUM.js";
import SekKbj from "./SEK-KBJ.js";
import SekKep from "./SEK-KEP.js";
import SekKeu from "./SEK-KEU.js";
import SekLds from "./SEK-LDS.js";
import SekLks from "./SEK-LKS.js";
import SekLkt from "./SEK-LKT.js";
import SekLup from "./SEK-LUP.js";
import SekRen from "./SEK-REN.js";
import SekRmh from "./SEK-RMH.js";

import BdsBmb from "./BDS-BMB.js";
import BdsCpd from "./BDS-CPD.js";
import BdsEvl from "./BDS-EVL.js";
import BdsHrg from "./BDS-HRG.js";
import BdsKbj from "./BDS-KBJ.js";
import BdsLap from "./BDS-LAP.js";
import BdsMon from "./BDS-MON.js";

import BktBmb from "./BKT-BMB.js";
import BktFsl from "./BKT-FSL.js";
import BktKbj from "./BKT-KBJ.js";
import BktKrw from "./BKT-KRW.js";
import BktMev from "./BKT-MEV.js";
import BktPgd from "./BKT-PGD.js";

import BksBmb from "./BKS-BMB.js";
import BksDvr from "./BKS-DVR.js";
import BksEvl from "./BKS-EVL.js";
import BksKbj from "./BKS-KBJ.js";
import BksKmn from "./BKS-KMN.js";
import BksLap from "./BKS-LAP.js";

import UptAdm from "./UPT-ADM.js";
import UptAst from "./UPT-AST.js";
import UptIns from "./UPT-INS.js";
import UptKep from "./UPT-KEP.js";
import UptKeu from "./UPT-KEU.js";
import UptMtu from "./UPT-MTU.js";
import UptTkn from "./UPT-TKN.js";

// Import model surat menyurat (e-Office M011-M013)
import SuratMasuk from "./SuratMasuk.js";
import SuratKeluar from "./SuratKeluar.js";
import Disposisi from "./Disposisi.js";
import AgendaSurat from "./AgendaSurat.js";
import ArsipSurat from "./ArsipSurat.js";

// New Sekretaris models
import Task from "./Task.js";
import ApprovalSekretariat from "./ApprovalSekretariat.js";
import SkpPenilaianSekretaris from "./SkpPenilaianSekretaris.js";
import LaporanKonsolidasiSekretaris from "./LaporanKonsolidasiSekretaris.js";
import NotifikasiSekretaris from "./NotifikasiSekretaris.js";

// Kasubag Umum & Kepegawaian (Prompt 4) models
import KgbTracking from "./KgbTracking.js";
import PangkatTracking from "./PangkatTracking.js";
import AbsensiHarian from "./AbsensiHarian.js";
import Cuti from "./Cuti.js";
import PerjalananDinas from "./PerjalananDinas.js";
import Diklat from "./Diklat.js";
import DiklatPeserta from "./DiklatPeserta.js";
import SkpPenilaianKasubag from "./SkpPenilaianKasubag.js";
import NotifikasiKasubag from "./NotifikasiKasubag.js";
import UserHierarchy from "./UserHierarchy.js";

// JF Sekretariat (Prompt 5/6) models
import AnalisaPerencanaan from "./AnalisaPerencanaan.js";
import Renstra from "./Renstra.js";
import Renja from "./Renja.js";
import Monev from "./Monev.js";
import Lakip from "./Lakip.js";

// JF Keuangan / PPK (Prompt 6) models
import Spj from "./Spj.js";
import Dpa from "./Dpa.js";
import Rka from "./Rka.js";
import RealisasiAnggaran from "./RealisasiAnggaran.js";
import AnalisaKeuangan from "./AnalisaKeuangan.js";
import UangPersediaan from "./UangPersediaan.js";
import BukuKasUmum from "./BukuKasUmum.js";
import DaftarGaji from "./DaftarGaji.js";
import AsetBarang from "./AsetBarang.js";
import PenerimaanBarang from "./PenerimaanBarang.js";
import PemeliharaanAset from "./PemeliharaanAset.js";
import LaporanKerusakanAset from "./LaporanKerusakanAset.js";
import SubChecklistTugas from "./SubChecklistTugas.js";

// Prompt 1 — Gubernur models
import InstruksiGubernur from "./InstruksiGubernur.js";
import PengajuanKeGubernur from "./PengajuanKeGubernur.js";
import KpiKepalaDinas from "./KpiKepalaDinas.js";
import NotifikasiGubernur from "./NotifikasiGubernur.js";
import PengajuanKeKepalaDinas from "./PengajuanKeKepalaDinas.js";

// Asosiasi Foreign Key Komoditas
BdsCpd.belongsTo(Komoditas, { foreignKey: "komoditas_id", as: "komoditas" });
BdsHrg.belongsTo(Komoditas, { foreignKey: "komoditas_id", as: "komoditas" });
BdsMon.belongsTo(Komoditas, { foreignKey: "komoditas_id", as: "komoditas" });

// Associate new models
ApprovalSekretariat.associate?.(sequelize.models);
SkpPenilaianSekretaris.associate?.(sequelize.models);
LaporanKonsolidasiSekretaris.associate?.(sequelize.models);
NotifikasiSekretaris.associate?.(sequelize.models);

// Daftarkan asosiasi foreign key jika diperlukan
if (typeof BdsCpd.associate === "function") BdsCpd.associate(sequelize.models);
if (typeof BdsHrg.associate === "function") BdsHrg.associate(sequelize.models);
if (typeof BdsMon.associate === "function") BdsMon.associate(sequelize.models);

// Export semua model
export {
  sequelize,
  Komoditas,
  Kgb,
  Stok,
  Role,
  User,
  DataIntegrationLog,
  AuditLog,
  BypassDetection,
  ApprovalLog,
  ApprovalWorkflow,
  Workflow,
  WorkflowInstance,
  WorkflowHistory,
  WorkflowTransitionLog,
  SekAdm,
  SekAst,
  SekHum,
  SekKbj,
  SekKep,
  SekKeu,
  SekLds,
  SekLks,
  SekLkt,
  SekLup,
  SekRen,
  SekRmh,
  BdsBmb,
  BdsCpd,
  BdsEvl,
  BdsHrg,
  BdsKbj,
  BdsLap,
  BdsMon,
  BktBmb,
  BktFsl,
  BktKbj,
  BktKrw,
  BktMev,
  BktPgd,
  BksBmb,
  BksDvr,
  BksEvl,
  BksKbj,
  BksKmn,
  BksLap,
  UptAdm,
  UptAst,
  UptIns,
  UptKep,
  UptKeu,
  UptMtu,
  UptTkn,
  SuratMasuk,
  SuratKeluar,
  Disposisi,
  AgendaSurat,
  ArsipSurat,
  Task,
  ApprovalSekretariat,
  SkpPenilaianSekretaris,
  LaporanKonsolidasiSekretaris,
  NotifikasiSekretaris,
  KgbTracking,
  PangkatTracking,
  AbsensiHarian,
  Cuti,
  PerjalananDinas,
  Diklat,
  DiklatPeserta,
  SkpPenilaianKasubag,
  NotifikasiKasubag,
  UserHierarchy,
  AnalisaPerencanaan,
  Renstra,
  Renja,
  Monev,
  Lakip,
  Spj,
  Dpa,
  Rka,
  RealisasiAnggaran,
  AnalisaKeuangan,
  UangPersediaan,
  BukuKasUmum,
  DaftarGaji,
  AsetBarang,
  PenerimaanBarang,
  PemeliharaanAset,
  LaporanKerusakanAset,
  SubChecklistTugas,
  InstruksiGubernur,
  PengajuanKeGubernur,
  KpiKepalaDinas,
  NotifikasiGubernur,
  PengajuanKeKepalaDinas,
};
export default sequelize;

