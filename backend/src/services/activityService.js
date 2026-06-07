import Activity from '../mongo/Activity.js'
import { isDbReady } from '../mongo/ready.js'

export const logActivity = async ({ userId, action, entityType, entityId, message }) => {
  if (!isDbReady()) return null

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
  if (!isDbReady()) return []

  return Activity.find({ user_id: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
}

const startOfToday = () => {
  const value = new Date()
  value.setHours(0, 0, 0, 0)
  return value
}

const daysAgo = (days) => {
  const value = new Date()
  value.setDate(value.getDate() - days)
  return value
}

export const getActivityStats = async ({ userId, role }) => {
  if (!isDbReady()) {
    return {
      recentCount: 0,
      todayCount: 0,
      activeUsers: 0,
      scope: role === 'admin' ? 'platform' : 'personal'
    }
  }

  const sevenDaysAgo = daysAgo(7)
  const today = startOfToday()

  if (role === 'admin') {
    const [recentCount, todayCount, activeUsers] = await Promise.all([
      Activity.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Activity.countDocuments({ createdAt: { $gte: today } }),
      Activity.distinct('user_id', { createdAt: { $gte: sevenDaysAgo } })
    ])

    return {
      recentCount,
      todayCount,
      activeUsers: activeUsers.length,
      scope: 'platform'
    }
  }

  const [recentCount, todayCount] = await Promise.all([
    Activity.countDocuments({ user_id: userId, createdAt: { $gte: sevenDaysAgo } }),
    Activity.countDocuments({ user_id: userId, createdAt: { $gte: today } })
  ])

  return {
    recentCount,
    todayCount,
    activeUsers: recentCount > 0 ? 1 : 0,
    scope: 'personal'
  }
}
