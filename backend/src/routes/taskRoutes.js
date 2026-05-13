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
router.post('/', createTaskController)
router.get('/', getAllTasksController)
router.get('/my-tasks', requireRoles(['employee']), getMyTasksController)
router.get('/project/:projectId', getTasksByProjectController)
router.get('/user/:userId', getTasksByAssignedUserController)
router.get('/:id', getTaskByIdController)
router.patch('/:id/status', requireRoles(['employee']), updateMyTaskStatusController)
router.put('/:id', updateTaskController)
router.delete('/:id', deleteTaskController)

export default router

