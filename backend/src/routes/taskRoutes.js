import express from 'express'
import {
  createTaskController,
  getAllTasksController,
  getTaskByIdController,
  getTasksByAssignedUserController,
  getTasksByProjectController,
  updateTaskController,
  deleteTaskController
} from '../controllers/taskController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth)
router.post('/', createTaskController)
router.get('/', getAllTasksController)
router.get('/project/:projectId', getTasksByProjectController)
router.get('/user/:userId', getTasksByAssignedUserController)
router.get('/:id', getTaskByIdController)
router.put('/:id', updateTaskController)
router.delete('/:id', deleteTaskController)

export default router

