import express from 'express'
import {
  createDepartmentController,
  getDepartmentsController
} from '../controllers/departmentController.js'
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth)
router.get('/', requireRoles(['admin', 'team_leader']), getDepartmentsController)
router.post('/', requireRoles(['admin']), createDepartmentController)

export default router
