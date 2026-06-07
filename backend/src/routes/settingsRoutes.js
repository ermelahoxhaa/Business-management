import express from 'express'
import {
  getCompanySettingsController,
  updateCompanySettingsController
} from '../controllers/settingsController.js'
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth)
router.get('/company', getCompanySettingsController)
router.put('/company', requireRoles(['admin']), updateCompanySettingsController)

export default router
