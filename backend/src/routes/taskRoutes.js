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

const router = express.Router()

router.post('/', createTaskController)
router.get('/', getAllTasksController)
router.get('/:id', getTaskByIdController)
router.get('/project/:projectId', getTasksByProjectController)
router.get('/user/:userId', getTasksByAssignedUserController)
router.put('/:id', updateTaskController)
router.delete('/:id', deleteTaskController)

export default router

