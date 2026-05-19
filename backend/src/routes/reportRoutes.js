import express from 'express'
import {
  exportReportController,
  getReportTypesController,
  previewReportController
} from '../controllers/reportController.js'
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth, requireRoles(['admin', 'team_leader']))

router.get('/types', getReportTypesController)
router.get('/:type/preview', previewReportController)
router.get('/:type/export', exportReportController)

export default router
