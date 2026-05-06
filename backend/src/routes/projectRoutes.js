import express from 'express'
import {
  createProjectController,
  getAllProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController
} from '../controllers/projectController.js'
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', requireAuth, getAllProjectsController)
router.get('/:id', requireAuth, getProjectByIdController)
router.post('/', requireAuth, requireRoles(['team_leader']), createProjectController)
router.put('/:id', requireAuth, requireRoles(['admin', 'team_leader']), updateProjectController)
router.delete('/:id', requireAuth, requireRoles(['admin']), deleteProjectController)

export default router
