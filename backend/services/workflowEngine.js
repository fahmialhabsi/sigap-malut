import { Op } from "sequelize";
import { sequelize } from "../config/database.js";
import ApprovalLog from "../models/approvalLog.js";
import AuditLog from "../models/auditLog.js";
import WorkflowHistory from "../models/WorkflowHistory.js";
import WorkflowInstance from "../models/WorkflowInstance.js";

const PILOT_WORKFLOW_TEMPLATE = {
  states: [
    "draft",
    "diajukan",
    "diverifikasi",
    "disetujui",
    "ditolak",
    "selesai",
    "arsip",
  ],
  transitions: {
    draft: ["diajukan"],
    diajukan: ["diverifikasi", "ditolak"],
    diverifikasi: ["disetujui", "ditolak"],
    disetujui: ["selesai"],
    ditolak: ["diajukan"],
    selesai: ["arsip"],
  },
};

const workflows = {
  default_workflow: {
    states: [
      "draft",
      "diajukan",
      "diverifikasi",
      "disetujui",
      "ditolak",
      "selesai",
      "arsip",
    ],
    transitions: {
      draft: ["diajukan"],
      diajukan: ["diverifikasi", "ditolak"],
      diverifikasi: ["disetujui", "ditolak"],
      disetujui: ["selesai"],
      ditolak: ["diajukan"],
      selesai: ["arsip"],
    },
  },
  "SEK-ADM": PILOT_WORKFLOW_TEMPLATE,
  "SEK-KEU": PILOT_WORKFLOW_TEMPLATE,
  "BKT-KBJ": PILOT_WORKFLOW_TEMPLATE,
  "BDS-HRG": PILOT_WORKFLOW_TEMPLATE,
  "BKS-DVR": PILOT_WORKFLOW_TEMPLATE,
};

function getWorkflowDefinition(moduleId) {
  const normalizedModuleId = normalizeModuleId(moduleId);
  return workflows[normalizedModuleId] || workflows.default_workflow;
}

function validateTransition(moduleId, fromState, toState) {
  const definition = getWorkflowDefinition(moduleId);
  const normalizedFrom = String(fromState || "draft").toLowerCase();
  const normalizedTo = String(toState || "").toLowerCase();

  if (!normalizedTo) {
    throw new Error("State tujuan workflow wajib diisi");
  }

  if (!definition.states.includes(normalizedTo)) {
    throw new Error(
      `State '${normalizedTo}' tidak valid untuk modul ${normalizeModuleId(moduleId)}`,
    );
  }

  if (normalizedFrom === normalizedTo) {
    return;
  }

  const allowedTargets = definition.transitions[normalizedFrom] || [];
  if (!allowedTargets.includes(normalizedTo)) {
    throw new Error(
      `Transisi workflow tidak valid: ${normalizedFrom} -> ${normalizedTo} (${normalizeModuleId(moduleId)})`,
    );
  }
}

function normalizeModuleId(moduleId) {
  return String(moduleId || "general")
    .trim()
    .toUpperCase();
}

function normalizeEntityId(entityId) {
  if (entityId === undefined || entityId === null || entityId === "") {
    return "global";
  }
  return String(entityId);
}

function normalizeActor(user = {}) {
  return {
    id: user.id || user.user_id || user.pegawai_id || null,
    username: user.username || user.name || user.email || "system",
    role: user.role || user.roleName || "unknown",
  };
}

function mapInstanceStatus(toState) {
  const next = String(toState || "").toLowerCase();
  if (["selesai", "arsip", "closed", "approved", "disetujui"].includes(next)) {
    return "completed";
  }
  if (["ditolak", "rejected"].includes(next)) {
    return "rejected";
  }
  return "active";
}

async function getOrCreateInstance({
  moduleId,
  entityId,
  actor,
  initialState = "draft",
  transaction,
}) {
  const normalizedModuleId = normalizeModuleId(moduleId);
  const normalizedEntityId = normalizeEntityId(entityId);

  let instance = await WorkflowInstance.findOne({
    where: {
      module_id: normalizedModuleId,
      entity_id: normalizedEntityId,
      status: { [Op.in]: ["active", "rejected"] },
    },
    order: [["created_at", "DESC"]],
    transaction,
  });

  if (!instance) {
    instance = await WorkflowInstance.create(
      {
        module_id: normalizedModuleId,
        entity_id: normalizedEntityId,
        current_state: initialState,
        status: mapInstanceStatus(initialState),
        current_role: actor.role,
        submitted_by: actor.id ? String(actor.id) : null,
        metadata: { source: "workflowEngine" },
      },
      { transaction },
    );
  }

  return instance;
}

async function createHistory({
  instance,
  fromState,
  toState,
  action,
  actor,
  notes,
  payload,
  transaction,
}) {
  return WorkflowHistory.create(
    {
      workflow_instance_id: instance.id,
      module_id: instance.module_id,
      entity_id: instance.entity_id,
      from_state: fromState,
      to_state: toState,
      action,
      actor_id: actor.id ? String(actor.id) : null,
      actor_role: actor.role,
      notes: notes || null,
      payload: payload || null,
      created_at: new Date(),
    },
    { transaction },
  );
}

async function appendApprovalLog({
  workflowId,
  actor,
  action,
  notes,
  transaction,
}) {
  return ApprovalLog.create(
    {
      workflow_id: workflowId,
      approver_id: actor.id ? Number.parseInt(actor.id, 10) || 0 : 0,
      approver_role: actor.role || "unknown",
      approval_level: 1,
      action,
      notes: notes || null,
      created_at: new Date(),
    },
    { transaction },
  );
}

async function appendAuditLog({
  moduleId,
  entityId,
  action,
  actor,
  detail,
  payload,
  transaction,
}) {
  return AuditLog.create(
    {
      modul: moduleId || "WORKFLOW",
      entitas_id: normalizeEntityId(entityId),
      aksi: action,
      data_lama: null,
      data_baru: payload || { detail },
      pegawai_id: actor.id ? String(actor.id) : "system",
      created_at: new Date(),
    },
    { transaction },
  );
}

async function transitionWorkflow({
  moduleId,
  entityId,
  toState,
  detail,
  user,
  action = "WORKFLOW_STATUS",
}) {
  const actor = normalizeActor(user);

  return sequelize.transaction(async (transaction) => {
    const instance = await getOrCreateInstance({
      moduleId,
      entityId,
      actor,
      initialState: "draft",
      transaction,
    });

    const fromState = instance.current_state;
    validateTransition(moduleId, fromState, toState);

    await instance.update(
      {
        current_state: toState,
        status: mapInstanceStatus(toState),
        current_role: actor.role,
        closed_at: mapInstanceStatus(toState) === "active" ? null : new Date(),
      },
      { transaction },
    );

    const history = await createHistory({
      instance,
      fromState,
      toState,
      action,
      actor,
      notes: detail,
      payload: { moduleId, entityId, toState },
      transaction,
    });

    return { instance, history, actor };
  });
}

function toApprovalView(log, instance) {
  return {
    id: log.id,
    user: log.approver_role,
    modulId: instance?.module_id || "UNKNOWN",
    dataId: instance?.entity_id || null,
    status: log.action,
    detail: log.notes,
    time: log.created_at,
  };
}

function toWorkflowView(history) {
  return {
    id: history.id,
    user: history.actor_role,
    modulId: history.module_id,
    dataId: history.entity_id,
    status: history.to_state,
    detail: history.notes,
    time: history.created_at,
  };
}

export async function submitApproval({ user, modulId, dataId, detail }) {
  const normalizedModuleId = normalizeModuleId(modulId);
  const { instance, actor } = await transitionWorkflow({
    moduleId: normalizedModuleId,
    entityId: dataId,
    toState: "diajukan",
    detail,
    user,
    action: "APPROVAL_SUBMIT",
  });

  await sequelize.transaction(async (transaction) => {
    await appendApprovalLog({
      workflowId: instance.id,
      actor,
      action: "diajukan",
      notes: detail,
      transaction,
    });

    await appendAuditLog({
      moduleId: normalizedModuleId,
      entityId: dataId,
      action: "SUBMIT_APPROVAL",
      actor,
      detail,
      payload: { status: "diajukan" },
      transaction,
    });
  });

  return {
    user: actor.username,
    modulId: normalizedModuleId,
    dataId: normalizeEntityId(dataId),
    status: "diajukan",
    detail,
    time: new Date().toISOString(),
  };
}

export async function updateApproval({
  user,
  modulId,
  dataId,
  status,
  detail,
}) {
  const normalizedModuleId = normalizeModuleId(modulId);
  const normalizedStatus = status || "diverifikasi";
  const { instance, actor } = await transitionWorkflow({
    moduleId: normalizedModuleId,
    entityId: dataId,
    toState: normalizedStatus,
    detail,
    user,
    action: "APPROVAL_UPDATE",
  });

  await sequelize.transaction(async (transaction) => {
    await appendApprovalLog({
      workflowId: instance.id,
      actor,
      action: normalizedStatus,
      notes: detail,
      transaction,
    });

    await appendAuditLog({
      moduleId: normalizedModuleId,
      entityId: dataId,
      action: "UPDATE_APPROVAL",
      actor,
      detail,
      payload: { status: normalizedStatus },
      transaction,
    });
  });

  return {
    user: actor.username,
    modulId: normalizedModuleId,
    dataId: normalizeEntityId(dataId),
    status: normalizedStatus,
    detail,
    time: new Date().toISOString(),
  };
}

export async function listApprovals(limit = 500) {
  const logs = await ApprovalLog.findAll({
    order: [["created_at", "DESC"]],
    limit,
  });

  if (!logs.length) return [];

  const workflowIds = [...new Set(logs.map((log) => log.workflow_id))];
  const instances = await WorkflowInstance.findAll({
    where: { id: workflowIds },
  });
  const instanceMap = new Map(
    instances.map((instance) => [instance.id, instance]),
  );

  return logs.map((log) =>
    toApprovalView(log, instanceMap.get(log.workflow_id)),
  );
}

export async function clearApprovals() {
  await ApprovalLog.destroy({ where: {} });
}

export async function trackWorkflowStatus({
  user,
  modulId,
  dataId,
  status,
  detail,
}) {
  const normalizedModuleId = normalizeModuleId(modulId);
  const normalizedStatus = status || "draft";
  const { actor } = await transitionWorkflow({
    moduleId: normalizedModuleId,
    entityId: dataId,
    toState: normalizedStatus,
    detail,
    user,
    action: "WORKFLOW_STATUS",
  });

  await appendAuditLog({
    moduleId: normalizedModuleId,
    entityId: dataId,
    action: "WORKFLOW_STATUS",
    actor,
    detail,
    payload: { status: normalizedStatus },
  });

  return {
    user: actor.username,
    modulId: normalizedModuleId,
    status: normalizedStatus,
    detail,
    time: new Date().toISOString(),
  };
}

export async function listWorkflowStatus(limit = 500) {
  const logs = await WorkflowHistory.findAll({
    where: { action: "WORKFLOW_STATUS" },
    order: [["created_at", "DESC"]],
    limit,
  });

  return logs.map(toWorkflowView);
}

export async function clearWorkflowStatus() {
  await WorkflowHistory.destroy({ where: { action: "WORKFLOW_STATUS" } });
}

export async function writeAuditTrail({ user, action, detail }) {
  const actor = normalizeActor(user);
  await appendAuditLog({
    moduleId: "AUDIT",
    entityId: `${Date.now()}`,
    action: action || "UNKNOWN",
    actor,
    detail,
    payload: { user: actor.username },
  });

  return {
    user: actor.username,
    role: actor.role,
    action,
    detail,
    time: new Date().toISOString(),
  };
}

export async function listAuditTrail(limit = 500) {
  const logs = await AuditLog.findAll({
    order: [["created_at", "DESC"]],
    limit,
  });

  return logs.map((log) => ({
    id: log.id,
    user: log.pegawai_id,
    role: log.modul,
    action: log.aksi,
    detail: (log.data_baru && log.data_baru.detail) || null,
    time: log.created_at,
  }));
}

export async function clearAuditTrail() {
  await AuditLog.destroy({ where: {} });
}

// Backward-compatible helper for legacy callers.
export async function performTransition({
  workflowId,
  instance,
  to,
  user,
  note,
}) {
  const moduleId = workflowId || instance?.module_id || "GENERAL";
  const entityId = instance?.entity_id || instance?.id || "global";
  await transitionWorkflow({
    moduleId,
    entityId,
    toState: to,
    detail: note,
    user,
    action: "LEGACY_TRANSITION",
  });

  return true;
}

export { workflows };
