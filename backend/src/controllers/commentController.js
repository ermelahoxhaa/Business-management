import {
  createCommentService,
  getCommentsByTaskService,
  updateCommentService,
  deleteCommentService
} from '../services/commentServices.js'

export const createCommentController = async (req, res) => {
  try {
    const comment = await createCommentService(req.body)
    res.status(201).json(comment)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getCommentsByTaskController = async (req, res) => {
  try {
    const comments = await getCommentsByTaskService(req.params.taskId)
    res.json(comments)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const updateCommentController = async (req, res) => {
  try {
    const result = await updateCommentService(req.params.id, req.body)
    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const deleteCommentController = async (req, res) => {
  try {
    const result = await deleteCommentService(req.params.id)
    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
