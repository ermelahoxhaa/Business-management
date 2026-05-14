import {
  createComment,
  getCommentsByTask,
  updateComment,
  deleteComment
} from '../repositories/commentRepository.js'
import { getTaskById } from '../repositories/taskRepository.js'

export const createCommentService = async ({ task_id, user_id, comment, created_by, role }) => {
  if (!comment || !comment.toString().trim()) {
    throw new Error('Comment text is required')
  }

  const task = await getTaskById(task_id)
  if (!task) {
    throw new Error('Task not found')
  }

  if (role === 'employee' && Number(task.assigned_to) !== Number(user_id)) {
    throw new Error('You can comment only on tasks assigned to you')
  }

  return createComment({
    task_id,
    user_id,
    comment: comment.toString().trim(),
    created_by
  })
}

export const getCommentsByTaskService = async (taskId) => {
  return getCommentsByTask(taskId)
}

export const updateCommentService = async (id, payload) => {
  const updates = {}
  if (payload.comment !== undefined) updates.comment = payload.comment
  if (payload.updated_by !== undefined) updates.updated_by = payload.updated_by

  await updateComment(id, updates)
  return { updated: true }
}

export const deleteCommentService = async (id) => {
  await deleteComment(id)
  return { deleted: true }
}
