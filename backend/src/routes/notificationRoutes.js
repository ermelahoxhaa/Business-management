import express from 'express'
import {
  getNotificationsController,
  markAllReadController,
  markReadController
} from '../controllers/notificationController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth)

router.get('/', getNotificationsController)
router.patch('/read-all', markAllReadController)
router.patch('/:id/read', markReadController)

export default router
