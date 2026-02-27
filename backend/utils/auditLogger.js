export async function logAudit({
  userId,
  action,
  entityId,
  before,
  after,
  workflow,
}) {
  const record = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    entityId,
    before,
    after,
    workflow,
  };
  try {
    // For now write to console; later persist to audit_log table
    console.info("AUDIT", JSON.stringify(record));
  } catch (err) {
    console.error("Failed to write audit log", err);
  }
}

export default { logAudit };
