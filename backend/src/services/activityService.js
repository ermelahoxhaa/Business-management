import mongoose from 'mongoose'
import Activity from '../mongo/Activity.js'

const mongoReady = () => mongoose.connection.readyState === 1

export const logActivity = async ({ userId, action, entityType, entityId, message }) => {
  if (!mongoReady()) return null

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
  if (!mongoReady()) return []

  return Activity.find({ user_id: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
}
