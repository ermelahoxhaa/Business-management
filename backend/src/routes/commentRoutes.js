import express from 'express'
import {
  createCommentController,
  getCommentsByTaskController,
  updateCommentController,
  deleteCommentController
} from '../controllers/commentController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth)
router.post('/', createCommentController)
router.get('/task/:taskId', getCommentsByTaskController)
router.put('/:id', updateCommentController)
router.delete('/:id', deleteCommentController)

export default router
