// =====================================================
// AUTO-GENERATED ROUTE INDEX
// Generated: 2026-02-17T19:37:29.473Z
// Total Routes: 38
// =====================================================

import BDSBMBRoutes from "./BDS-BMB.js";
import chatbotRoutes from "./chatbot.js";
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
import approvalRoutes from "./approval.js";
import reminderRoutes from "./reminder.js";
import caseRoutes from "./case.js";
import commentRoutes from "./comment.js";
import reportRoutes from "./report.js";
import auditTrailRoutes from "./audit-trail.js";
import workflowStatusRoutes from "./workflow-status.js";
import notificationRoutes from "./notification.js";
import perintahRoutes from "./perintah.js";
import pegawaiRoutes from "./pegawai.js";
import komoditasRoutes from "./komoditas.js";

export default function registerRoutes(app) {
  console.log("📡 Registering API routes...\n");

  app.use("/api/chatbot", chatbotRoutes);
  app.use("/api/bds-bmb", BDSBMBRoutes);
  app.use("/api/bds-cpd", BDSCPDRoutes);
  app.use("/api/bds-evl", BDSEVLRoutes);
  app.use("/api/bds-hrg", BDSHRGRoutes);
  app.use("/api/bds-kbj", BDSKBJRoutes);
  app.use("/api/bds-lap", BDSLAPRoutes);
  app.use("/api/bds-mon", BDSMONRoutes);
  app.use("/api/bks-bmb", BKSBMBRoutes);
  app.use("/api/bks-dvr", BKSDVRRoutes);
  app.use("/api/bks-evl", BKSEVLRoutes);
  app.use("/api/bks-kbj", BKSKBJRoutes);
  app.use("/api/bks-kmn", BKSKMNRoutes);
  app.use("/api/bks-lap", BKSLAPRoutes);
  app.use("/api/bkt-bmb", BKTBMBRoutes);
  app.use("/api/bkt-fsl", BKTFSLRoutes);
  app.use("/api/bkt-kbj", BKTKBJRoutes);
  app.use("/api/bkt-krw", BKTKRWRoutes);
  app.use("/api/bkt-mev", BKTMEVRoutes);
  app.use("/api/bkt-pgd", BKTPGDRoutes);
  app.use("/api/sek-adm", SEKADMRoutes);
  app.use("/api/sek-ast", SEKASTRoutes);
  app.use("/api/sek-hum", SEKHUMRoutes);
  app.use("/api/sek-kbj", SEKKBJRoutes);
  app.use("/api/sek-kep", SEKKEPRoutes);
  app.use("/api/sek-keu", SEKKEURoutes);
  app.use("/api/sek-lds", SEKLDSRoutes);
  app.use("/api/sek-lks", SEKLKSRoutes);
  app.use("/api/sek-lkt", SEKLKTRoutes);
  app.use("/api/sek-lup", SEKLUPRoutes);
  app.use("/api/sek-ren", SEKRENRoutes);
  app.use("/api/sek-rmh", SEKRMHRoutes);
  app.use("/api/upt-adm", UPTADMRoutes);
  app.use("/api/upt-ast", UPTASTRoutes);
  app.use("/api/upt-ins", UPTINSRoutes);
  app.use("/api/upt-kep", UPTKEPRoutes);
  app.use("/api/upt-keu", UPTKEURoutes);
  app.use("/api/upt-mtu", UPTMTURoutes);
  app.use("/api/upt-tkn", UPTTKNRoutes);
  app.use("/approval", approvalRoutes);
  app.use("/reminder", reminderRoutes);
  app.use("/case", caseRoutes);
  app.use("/comment", commentRoutes);
  app.use("/report", reportRoutes);
  app.use("/audit-trail", auditTrailRoutes);
  app.use("/workflow-status", workflowStatusRoutes);
  app.use("/notification", notificationRoutes);
  app.use("/perintah", perintahRoutes);

  // Master Data Lookup
  app.use("/api/pegawai", pegawaiRoutes);
  app.use("/api/komoditas", komoditasRoutes);

  console.log("✅ 38 API routes registered\n");
}
