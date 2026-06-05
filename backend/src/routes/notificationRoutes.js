import express from 'express'
import {
  getNotificationsController,
  markAllReadController,
  markReadController,
  sendNotificationsController
} from '../controllers/notificationController.js'
import { requireAuth, requirePermissions } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth)

router.get('/', getNotificationsController)
router.post('/send', requirePermissions('notifications.send'), sendNotificationsController)
router.patch('/read-all', markAllReadController)
router.patch('/:id/read', markReadController)

export default router
