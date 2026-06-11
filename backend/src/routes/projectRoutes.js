import express from 'express'
import {
  addProjectMemberController,
  createProjectController,
  getAllProjectsController,
  getMyProjectsController,
  getProjectByIdController,
  getProjectMembersController,
  updateProjectController,
  deleteProjectController,
  removeProjectMemberController
} from '../controllers/projectController.js'
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', requireAuth, getAllProjectsController)
router.get('/my-projects', requireAuth, requireRoles(['employee']), getMyProjectsController)
router.post('/', requireAuth, requireRoles(['admin', 'team_leader']), createProjectController)
router.get('/:id/members', requireAuth, requireRoles(['admin', 'team_leader']), getProjectMembersController)
router.post('/:id/members', requireAuth, requireRoles(['admin', 'team_leader']), addProjectMemberController)
router.delete('/:id/members/:memberId', requireAuth, requireRoles(['admin', 'team_leader']), removeProjectMemberController)
router.get('/:id', requireAuth, getProjectByIdController)
router.put('/:id', requireAuth, requireRoles(['admin', 'team_leader']), updateProjectController)
router.delete('/:id', requireAuth, requireRoles(['admin']), deleteProjectController)

export default router
