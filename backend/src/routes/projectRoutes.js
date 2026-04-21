import express from 'express'
import {
  createProjectController,
  getAllProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController
} from '../controllers/projectController.js'

const router = express.Router()

router.post('/', createProjectController)
router.get('/', getAllProjectsController)
router.get('/:id', getProjectByIdController)
router.put('/:id', updateProjectController)
router.delete('/:id', deleteProjectController)

export default router
