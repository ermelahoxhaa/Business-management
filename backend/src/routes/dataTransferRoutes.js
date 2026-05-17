import express from 'express'
import multer from 'multer'
import {
  exportEntityController,
  importEntityController
} from '../controllers/dataTransferController.js'
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js'

const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
})

router.use(requireAuth, requireRoles(['admin', 'team_leader']))

router.get('/:entity/export', exportEntityController)
router.post('/:entity/import', upload.single('file'), importEntityController)

export default router
