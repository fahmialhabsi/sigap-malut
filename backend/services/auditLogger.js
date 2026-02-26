/**
 * Simple audit logger service: writes audit records to DB if model exists,
 * otherwise logs to console. Fields: id, user_id, action, entity, entity_id, meta, timestamp
 */
const { v4: uuidv4 } = require("uuid");

async function log(app, { userId, action, entity, entityId, meta }) {
  const models = app.get("models") || {};
  if (models.AuditLog) {
    return models.AuditLog.create({
      id: uuidv4(),
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
      meta: JSON.stringify(meta || {}),
      timestamp: new Date(),
    });
  }
  console.info("audit", { userId, action, entity, entityId, meta });
  return true;
}

module.exports = { log };
