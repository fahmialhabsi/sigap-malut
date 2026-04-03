import Task from "../models/Task.js";
import BdsBmb from "../models/BDS-BMB.js";
import BdsCpd from "../models/BDS-CPD.js";
import BdsEvl from "../models/BDS-EVL.js";
import BdsHrg from "../models/BDS-HRG.js";
import BdsKbj from "../models/BDS-KBJ.js";
import BdsLap from "../models/BDS-LAP.js";
import BdsMon from "../models/BDS-MON.js";
import BktBmb from "../models/BKT-BMB.js";
import BktFsl from "../models/BKT-FSL.js";
import BktKbj from "../models/BKT-KBJ.js";
import BktKrw from "../models/BKT-KRW.js";
import BktMev from "../models/BKT-MEV.js";
import BktPgd from "../models/BKT-PGD.js";
import BksBmb from "../models/BKS-BMB.js";
import BksDvr from "../models/BKS-DVR.js";
import BksEvl from "../models/BKS-EVL.js";
import BksKbj from "../models/BKS-KBJ.js";
import BksKmn from "../models/BKS-KMN.js";
import BksLap from "../models/BKS-LAP.js";
import SekAdm from "../models/SEK-ADM.js";
import SekAst from "../models/SEK-AST.js";
import SekHum from "../models/SEK-HUM.js";
import SekKbj from "../models/SEK-KBJ.js";
import SekKep from "../models/SEK-KEP.js";
import SekKeu from "../models/SEK-KEU.js";
import SekLds from "../models/SEK-LDS.js";
import SekLks from "../models/SEK-LKS.js";
import SekLkt from "../models/SEK-LKT.js";
import SekLup from "../models/SEK-LUP.js";
import SekRen from "../models/SEK-REN.js";
import SekRmh from "../models/SEK-RMH.js";
import UptAdm from "../models/UPT-ADM.js";
import UptAst from "../models/UPT-AST.js";
import UptIns from "../models/UPT-INS.js";
import UptKep from "../models/UPT-KEP.js";
import UptKeu from "../models/UPT-KEU.js";
import UptMtu from "../models/UPT-MTU.js";
import UptTkn from "../models/UPT-TKN.js";
import Spj from "../models/Spj.js";
import SuratMasuk from "../models/SuratMasuk.js";
import SuratKeluar from "../models/SuratKeluar.js";

const OPS_MODELS = [
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
  UptAdm,
  UptAst,
  UptIns,
  UptKep,
  UptKeu,
  UptMtu,
  UptTkn,
  Spj,
  SuratMasuk,
  SuratKeluar,
];

let registered = false;

/**
 * Propagasi execution_thread_id dari Tasks saat task_id diisi.
 * Jika execution_thread_id sudah ada di payload, tidak ditimpa.
 */
export function registerOperationalExecutionThreadHooks() {
  if (registered) return;
  registered = true;

  for (const Model of OPS_MODELS) {
    if (!Model?.addHook) continue;
    const name = Model.tableName || Model.name || "op";

    Model.addHook("beforeSave", `operational_exec_thread_${name}`, async (inst, opts) => {
      const direct = inst.getDataValue("execution_thread_id");
      if (direct) return;
      const taskId = inst.getDataValue("task_id");
      if (taskId == null || !Number(taskId)) return;
      const task = await Task.findByPk(Number(taskId), {
        transaction: opts.transaction,
        attributes: ["id", "execution_thread_id"],
      });
      if (task?.getDataValue?.("execution_thread_id")) {
        inst.setDataValue("execution_thread_id", task.getDataValue("execution_thread_id"));
      }
    });
  }
}
