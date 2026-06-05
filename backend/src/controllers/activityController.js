import { getActivityStats, getRecentActivity } from '../services/activityService.js'

export const getActivityController = async (req, res) => {
  try {
    const items = await getRecentActivity(req.user.id)
    res.json(items)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const getActivityStatsController = async (req, res) => {
  try {
    const stats = await getActivityStats({
      userId: req.user.id,
      role: req.user.role
    })
    res.json(stats)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
