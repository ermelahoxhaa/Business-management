import express from 'express'
import { getActivityController, getActivityStatsController } from '../controllers/activityController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth)
router.get('/stats', getActivityStatsController)
router.get('/', getActivityController)

export default router
