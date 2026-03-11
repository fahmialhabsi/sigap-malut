// backend/utils/auditLogger.js
// Utility for writing audit log entries to public.audit_log table.
// All task state transitions must call writeAuditLog to ensure traceability.

import { sequelize } from "../config/database.js";

/**
 * Returns a SQL expression that generates a UUID v4 value,
 * compatible with both PostgreSQL and SQLite.
 */
function uuidExpression() {
  if (sequelize.getDialect() === "postgres") {
    return "gen_random_uuid()";
  }
  // SQLite: construct a UUID v4 using randomblob
  return (
    "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||" +
    " substr(lower(hex(randomblob(2))),2) || '-' ||" +
    " substr('89ab',abs(random()) % 4 + 1, 1) ||" +
    " substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"
  );
}

/**
 * Write an audit log entry.
 * @param {object} params
 * @param {string} params.module       - Module name (e.g. 'tasks')
 * @param {string} params.entity_id    - Primary key of the affected entity
 * @param {string} params.action       - Transition/action name (e.g. 'ASSIGN', 'ACCEPT')
 * @param {object} [params.data_old]   - Snapshot before the change
 * @param {object} [params.data_new]   - Snapshot after the change
 * @param {number} [params.actor_id]   - ID of the user performing the action
 * @param {string} [params.ip_address] - Requester IP address
 */
export async function writeAuditLog({
  module,
  entity_id,
  action,
  data_old = null,
  data_new = null,
  actor_id = null,
  ip_address = null,
}) {
  try {
    await sequelize.query(
      `INSERT INTO audit_log
         (id, module, entity_id, action, actor_id, data_old, data_new, ip_address, created_at)
       VALUES
         (${uuidExpression()},
          :module, :entity_id, :action, :actor_id, :data_old, :data_new, :ip_address, CURRENT_TIMESTAMP)`,
      {
        replacements: {
          module,
          entity_id: String(entity_id),
          action,
          actor_id: actor_id ?? null,
          data_old: data_old ? JSON.stringify(data_old) : null,
          data_new: data_new ? JSON.stringify(data_new) : null,
          ip_address: ip_address ?? null,
        },
      },
    );
  } catch (err) {
    // Audit failures must not block business logic — log only
    console.error("[auditLogger] Failed to write audit log:", err.message);
  }
}

/**
 * Helper to queue a notification (email/in-app) via notification_queue table.
 * @param {object} params
 * @param {number} params.recipient_id
 * @param {string} [params.channel='in_app']
 * @param {string} [params.subject]
 * @param {string} [params.body]
 * @param {object} [params.metadata]
 */
export async function queueNotification({
  recipient_id,
  channel = "in_app",
  subject = "",
  body = "",
  metadata = null,
}) {
  try {
    await sequelize.query(
      `INSERT INTO notification_queue
         (id, recipient_id, channel, subject, body, status, metadata, created_at, updated_at)
       VALUES
         (${uuidExpression()},
          :recipient_id, :channel, :subject, :body, 'pending', :metadata, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      {
        replacements: {
          recipient_id: recipient_id ?? null,
          channel,
          subject,
          body,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      },
    );
  } catch (err) {
    console.error("[auditLogger] Failed to queue notification:", err.message);
  }
}
