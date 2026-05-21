import express from 'express'
import {
  exportReportController,
  getReportTypesController,
  previewReportController
} from '../controllers/reportController.js'
import { requireAuth, requirePermissions } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth)

router.get('/types', requirePermissions('reports.read'), getReportTypesController)
router.get('/:type/preview', requirePermissions('reports.read'), previewReportController)
router.get('/:type/export', requirePermissions('reports.export'), exportReportController)

export default router
