import express from 'express'
import {
  createTaskController,
  getAllTasksController,
  getMyTasksController,
  getTaskByIdController,
  getTasksByAssignedUserController,
  getTasksByProjectController,
  updateMyTaskStatusController,
  updateTaskController,
  deleteTaskController
} from '../controllers/taskController.js'
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth)
router.get('/my-tasks', requireRoles(['employee']), getMyTasksController)
router.patch('/:id/status', requireRoles(['employee']), updateMyTaskStatusController)
router.get('/', requireRoles(['admin', 'team_leader']), getAllTasksController)
router.post('/', requireRoles(['admin', 'team_leader']), createTaskController)
router.get('/project/:projectId', requireRoles(['admin', 'team_leader']), getTasksByProjectController)
router.get('/user/:userId', requireRoles(['admin', 'team_leader']), getTasksByAssignedUserController)
router.get('/:id', requireRoles(['admin', 'team_leader']), getTaskByIdController)
router.put('/:id', requireRoles(['admin', 'team_leader']), updateTaskController)
router.delete('/:id', requireRoles(['admin', 'team_leader']), deleteTaskController)

export default router

