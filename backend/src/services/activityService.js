import Activity from '../mongo/Activity.js'

export const logActivity = async ({ userId, action, entityType, entityId, message }) => {
  try {
    return await Activity.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      message
    })
  } catch {
    return null
  }
}

export const getRecentActivity = async (userId, limit = 30) => {
  return Activity.find({ user_id: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
}
