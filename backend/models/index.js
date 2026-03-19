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

// Asosiasi Foreign Key Komoditas
BdsCpd.belongsTo(Komoditas, { foreignKey: "komoditas_id", as: "komoditas" });
BdsHrg.belongsTo(Komoditas, { foreignKey: "komoditas_id", as: "komoditas" });
BdsMon.belongsTo(Komoditas, { foreignKey: "komoditas_id", as: "komoditas" });

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
};
export default sequelize;
