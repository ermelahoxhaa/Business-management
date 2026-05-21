import express from 'express'
import multer from 'multer'
import {
  exportEntityController,
  importEntityController
} from '../controllers/dataTransferController.js'
import { requireAuth, requirePermissions } from '../middleware/authMiddleware.js'

const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
})

router.use(requireAuth)

router.get('/:entity/export', requirePermissions('data_transfer.export'), exportEntityController)
router.post('/:entity/import', requirePermissions('data_transfer.import'), upload.single('file'), importEntityController)

export default router
