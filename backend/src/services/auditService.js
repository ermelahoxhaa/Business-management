import AuditLog from '../models/AuditLog.js'

export const logAudit = async ({
  userId,
  action,
  entityType,
  entityId = null,
  metadata = null,
  ipAddress = null
}) => {
  try {
    await AuditLog.create({
      user_id: userId || null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      ip_address: ipAddress
    })
  } catch {
    return null
  }
}
