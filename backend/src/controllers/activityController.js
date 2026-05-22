import { getRecentActivity } from '../services/activityService.js'

export const getActivityController = async (req, res) => {
  try {
    const items = await getRecentActivity(req.user.id)
    res.json(items)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
