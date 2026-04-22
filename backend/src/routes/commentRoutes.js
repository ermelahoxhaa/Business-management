import express from 'express'
import {
  createCommentController,
  getCommentsByTaskController,
  updateCommentController,
  deleteCommentController
} from '../controllers/commentController.js'

const router = express.Router()

router.post('/', createCommentController)
router.get('/task/:taskId', getCommentsByTaskController)
router.put('/:id', updateCommentController)
router.delete('/:id', deleteCommentController)

export default router
