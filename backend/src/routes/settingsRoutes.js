import express from 'express'
import {
  changePasswordController,
  getAccountSettingsController,
  getCompanySettingsController,
  getNotificationPreferencesController,
  updateCompanySettingsController,
  updateNotificationPreferencesController,
  updateProfileController
} from '../controllers/settingsController.js'
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth)
router.get('/account', getAccountSettingsController)
router.put('/profile', updateProfileController)
router.put('/password', changePasswordController)
router.get('/preferences', getNotificationPreferencesController)
router.put('/preferences', updateNotificationPreferencesController)
router.get('/company', getCompanySettingsController)
router.put('/company', requireRoles(['admin']), updateCompanySettingsController)

export default router
