import { randomUUID } from "crypto";
import Task from "../models/Task.js";
import InstruksiGubernur from "../models/InstruksiGubernur.js";
import { resolveExecutionThreadIdForTask } from "./executionThreadService.js";

let registered = false;

export function registerExecutionThreadHooks() {
  if (registered) return;
  registered = true;

  InstruksiGubernur.beforeCreate((inst) => {
    if (!inst.getDataValue("execution_thread_id")) {
      inst.setDataValue("execution_thread_id", randomUUID());
    }
  });

  Task.beforeValidate(async (task, options) => {
    if (!task.isNewRecord) return;
    const sp = task.sumber_perintah_kadin;
    if (sp != null && Number(sp) > 0) {
      const Parent = await Task.findByPk(Number(sp), {
        transaction: options.transaction,
      });
      if (!Parent) {
        throw new Error(
          "Task turunan wajib merujuk task induk yang ada (sumber_perintah_kadin).",
        );
      }
    }
  });

  Task.beforeCreate(async (task, options) => {
    const tid = await resolveExecutionThreadIdForTask(task, options);
    if (!task.getDataValue("execution_thread_id")) {
      task.setDataValue("execution_thread_id", tid);
    }
  });
}
