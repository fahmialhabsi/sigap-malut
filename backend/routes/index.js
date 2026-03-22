// =====================================================
// AUTO-GENERATED ROUTE INDEX
// Generated: 2026-03-19T23:39:47.336Z
// Total Routes: 84
// =====================================================

import BDSBMBRoutes from "./BDS-BMB.js";
import BDSCPDRoutes from "./BDS-CPD.js";
import BDSEVLRoutes from "./BDS-EVL.js";
import BDSHRGRoutes from "./BDS-HRG.js";
import BDSKBJRoutes from "./BDS-KBJ.js";
import BDSLAPRoutes from "./BDS-LAP.js";
import BDSMONRoutes from "./BDS-MON.js";
import BKSBMBRoutes from "./BKS-BMB.js";
import BKSDVRRoutes from "./BKS-DVR.js";
import BKSEVLRoutes from "./BKS-EVL.js";
import BKSKBJRoutes from "./BKS-KBJ.js";
import BKSKMNRoutes from "./BKS-KMN.js";
import BKSLAPRoutes from "./BKS-LAP.js";
import BKTBMBRoutes from "./BKT-BMB.js";
import BKTFSLRoutes from "./BKT-FSL.js";
import BKTKBJRoutes from "./BKT-KBJ.js";
import BKTKRWRoutes from "./BKT-KRW.js";
import BKTMEVRoutes from "./BKT-MEV.js";
import BKTPGDRoutes from "./BKT-PGD.js";
import RoleRoutes from "./Role.js";
import SEKADMRoutes from "./SEK-ADM.js";
import SEKASTRoutes from "./SEK-AST.js";
import SEKHUMRoutes from "./SEK-HUM.js";
import SEKKBJRoutes from "./SEK-KBJ.js";
import SEKKEPRoutes from "./SEK-KEP.js";
import SEKKEURoutes from "./SEK-KEU.js";
import SEKLDSRoutes from "./SEK-LDS.js";
import SEKLKSRoutes from "./SEK-LKS.js";
import SEKLKTRoutes from "./SEK-LKT.js";
import SEKLUPRoutes from "./SEK-LUP.js";
import SEKRENRoutes from "./SEK-REN.js";
import SEKRMHRoutes from "./SEK-RMH.js";
import UPTADMRoutes from "./UPT-ADM.js";
import UPTASTRoutes from "./UPT-AST.js";
import UPTINSRoutes from "./UPT-INS.js";
import UPTKEPRoutes from "./UPT-KEP.js";
import UPTKEURoutes from "./UPT-KEU.js";
import UPTMTURoutes from "./UPT-MTU.js";
import UPTTKNRoutes from "./UPT-TKN.js";
import UserRoutes from "./User.js";
import User_legacyRoutes from "./User_legacy.js";
import WorkflowHistoryRoutes from "./WorkflowHistory.js";
import WorkflowInstanceRoutes from "./WorkflowInstance.js";
import approvalRoutes from "./approval.js";
import approvalLogRoutes from "./approvalLog.js";
import approvalWorkflowRoutes from "./approvalWorkflow.js";
import audittrailRoutes from "./audit-trail.js";
import auditLogRoutes from "./auditLog.js";
import auditLogControllerRoutes from "./auditLogController.js";
import authRoutes from "./auth.js";
import authControllerRoutes from "./authController.js";
import bidangRoutes from "./bidang.js";
import bypassDetectionRoutes from "./bypassDetection.js";
import caseRoutes from "./case.js";
import chatbotRoutes from "./chatbot.js";
import commentRoutes from "./comment.js";
import complianceRoutes from "./compliance.js";
import dataRoutes from "./data.js";
import dataIntegrationLogRoutes from "./dataIntegrationLog.js";
import integrationLogRoutes from "./integrationLog.js";
import integrationLogControllerRoutes from "./integrationLogController.js";
import kgbRoutes from "./kgb.js";
import kgbControllerRoutes from "./kgbController.js";
import komoditasRoutes from "./komoditas.js";
import komoditasControllerRoutes from "./komoditasController.js";
import layananRoutes from "./layanan.js";
import masterDataSyncRoutes from "./masterDataSync.js";
import masterDataSyncControllerRoutes from "./masterDataSyncController.js";
import moduleGeneratorRoutes from "./moduleGenerator.js";
import moduleGeneratorControllerRoutes from "./moduleGeneratorController.js";
import modulesRoutes from "./modules.js";
import notificationRoutes from "./notification.js";
import pegawaiRoutes from "./pegawai.js";
import pegawaiControllerRoutes from "./pegawaiController.js";
import perintahRoutes from "./perintah.js";
import reminderRoutes from "./reminder.js";
import reportRoutes from "./report.js";
import stokRoutes from "./stok.js";
import stokControllerRoutes from "./stokController.js";
import tablesRoutes from "./tables.js";
import workflowstatusRoutes from "./workflow-status.js";
import workflowRoutes from "./workflow.js";
import workflowControllerRoutes from "./workflowController.js";
import workflowTransitionLogRoutes from "./workflowTransitionLog.js";
import workflowsRoutes from "./workflows.js";
import { protect } from "../middleware/auth.js";
import { createReplicationPilotGuard } from "../middleware/uptdPilotGuard.js";

const sekretariatPilotGuard = createReplicationPilotGuard({
  domainCode: "SEKRETARIAT_STANDARD_REPLIKA_UPTD",
  sourceUnit: "Sekretariat",
});

const ketersediaanPilotGuard = createReplicationPilotGuard({
  domainCode: "KETERSEDIAAN_STANDARD_REPLIKA_UPTD",
  sourceUnit: "Bidang Ketersediaan",
});

const distribusiPilotGuard = createReplicationPilotGuard({
  domainCode: "DISTRIBUSI_STANDARD_REPLIKA_UPTD",
  sourceUnit: "Bidang Distribusi",
});

const konsumsiPilotGuard = createReplicationPilotGuard({
  domainCode: "KONSUMSI_STANDARD_REPLIKA_UPTD",
  sourceUnit: "Bidang Konsumsi",
});

export default function registerRoutes(app) {
  console.log("📡 Registering API routes...\n");

  app.use("/api/bds-bmb", protect, distribusiPilotGuard, BDSBMBRoutes);
  app.use("/api/bds-cpd", protect, distribusiPilotGuard, BDSCPDRoutes);
  app.use("/api/bds-evl", protect, distribusiPilotGuard, BDSEVLRoutes);
  app.use("/api/bds-hrg", protect, distribusiPilotGuard, BDSHRGRoutes);
  app.use("/api/bds-kbj", protect, distribusiPilotGuard, BDSKBJRoutes);
  app.use("/api/bds-lap", protect, distribusiPilotGuard, BDSLAPRoutes);
  app.use("/api/bds-mon", protect, distribusiPilotGuard, BDSMONRoutes);
  app.use("/api/bks-bmb", protect, konsumsiPilotGuard, BKSBMBRoutes);
  app.use("/api/bks-dvr", protect, konsumsiPilotGuard, BKSDVRRoutes);
  app.use("/api/bks-evl", protect, konsumsiPilotGuard, BKSEVLRoutes);
  app.use("/api/bks-kbj", protect, konsumsiPilotGuard, BKSKBJRoutes);
  app.use("/api/bks-kmn", protect, konsumsiPilotGuard, BKSKMNRoutes);
  app.use("/api/bks-lap", protect, konsumsiPilotGuard, BKSLAPRoutes);
  app.use("/api/bkt-bmb", protect, ketersediaanPilotGuard, BKTBMBRoutes);
  app.use("/api/bkt-fsl", protect, ketersediaanPilotGuard, BKTFSLRoutes);
  app.use("/api/bkt-kbj", protect, ketersediaanPilotGuard, BKTKBJRoutes);
  app.use("/api/bkt-krw", protect, ketersediaanPilotGuard, BKTKRWRoutes);
  app.use("/api/bkt-mev", protect, ketersediaanPilotGuard, BKTMEVRoutes);
  app.use("/api/bkt-pgd", protect, ketersediaanPilotGuard, BKTPGDRoutes);
  app.use("/api/role", RoleRoutes);
  app.use("/api/sek-adm", protect, sekretariatPilotGuard, SEKADMRoutes);
  app.use("/api/sek-ast", protect, sekretariatPilotGuard, SEKASTRoutes);
  app.use("/api/sek-hum", protect, sekretariatPilotGuard, SEKHUMRoutes);
  app.use("/api/sek-kbj", protect, sekretariatPilotGuard, SEKKBJRoutes);
  app.use("/api/sek-kep", protect, sekretariatPilotGuard, SEKKEPRoutes);
  app.use("/api/sek-keu", protect, sekretariatPilotGuard, SEKKEURoutes);
  app.use("/api/sek-lds", protect, sekretariatPilotGuard, SEKLDSRoutes);
  app.use("/api/sek-lks", protect, sekretariatPilotGuard, SEKLKSRoutes);
  app.use("/api/sek-lkt", protect, sekretariatPilotGuard, SEKLKTRoutes);
  app.use("/api/sek-lup", protect, sekretariatPilotGuard, SEKLUPRoutes);
  app.use("/api/sek-ren", protect, sekretariatPilotGuard, SEKRENRoutes);
  app.use("/api/sek-rmh", protect, sekretariatPilotGuard, SEKRMHRoutes);
  app.use("/api/upt-adm", UPTADMRoutes);
  app.use("/api/upt-ast", UPTASTRoutes);
  app.use("/api/upt-ins", UPTINSRoutes);
  app.use("/api/upt-kep", UPTKEPRoutes);
  app.use("/api/upt-keu", UPTKEURoutes);
  app.use("/api/upt-mtu", UPTMTURoutes);
  app.use("/api/upt-tkn", UPTTKNRoutes);
  app.use("/api/user", UserRoutes);
  app.use("/api/user_legacy", User_legacyRoutes);
  app.use("/api/workflowhistory", WorkflowHistoryRoutes);
  app.use("/api/workflowinstance", WorkflowInstanceRoutes);
  app.use("/api/approval", approvalRoutes);
  app.use("/api/approvallog", approvalLogRoutes);
  app.use("/api/approvalworkflow", approvalWorkflowRoutes);
  app.use("/api/audit-trail", audittrailRoutes);
  app.use("/api/auditlog", auditLogRoutes);
  app.use("/api/auditlogcontroller", auditLogControllerRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/authcontroller", authControllerRoutes);
  app.use("/api/bidang", bidangRoutes);
  app.use("/api/bypassdetection", bypassDetectionRoutes);
  app.use("/api/case", caseRoutes);
  app.use("/api/chatbot", chatbotRoutes);
  app.use("/api/comment", commentRoutes);
  app.use("/api/compliance", complianceRoutes);
  app.use("/api/data", dataRoutes);
  app.use("/api/dataintegrationlog", dataIntegrationLogRoutes);
  app.use("/api/integrationlog", integrationLogRoutes);
  app.use("/api/integrationlogcontroller", integrationLogControllerRoutes);
  app.use("/api/kgb", kgbRoutes);
  app.use("/api/kgbcontroller", kgbControllerRoutes);
  app.use("/api/komoditas", komoditasRoutes);
  app.use("/api/komoditascontroller", komoditasControllerRoutes);
  app.use("/api/layanan", layananRoutes);
  app.use("/api/masterdatasync", masterDataSyncRoutes);
  app.use("/api/masterdatasynccontroller", masterDataSyncControllerRoutes);
  app.use("/api/modulegenerator", moduleGeneratorRoutes);
  app.use("/api/modulegeneratorcontroller", moduleGeneratorControllerRoutes);
  app.use("/api/modules", modulesRoutes);
  app.use("/api/notification", notificationRoutes);
  app.use("/api/pegawai", pegawaiRoutes);
  app.use("/api/pegawaicontroller", pegawaiControllerRoutes);
  app.use("/api/perintah", perintahRoutes);
  app.use("/api/reminder", reminderRoutes);
  app.use("/api/report", reportRoutes);
  app.use("/api/stok", stokRoutes);
  app.use("/api/stokcontroller", stokControllerRoutes);
  app.use("/api/tables", tablesRoutes);
  app.use("/api/workflow-status", workflowstatusRoutes);
  app.use("/api/workflow", workflowRoutes);
  app.use("/api/workflowcontroller", workflowControllerRoutes);
  app.use("/api/workflowtransitionlog", workflowTransitionLogRoutes);
  app.use("/api/workflows", workflowsRoutes);

  console.log("✅ 84 API routes registered\n");
}
