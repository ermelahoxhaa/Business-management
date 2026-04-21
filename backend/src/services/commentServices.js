import {
  createComment,
  getCommentsByTask,
  updateComment,
  deleteComment
} from '../repositories/commentRepository.js'

export const createCommentService = async ({ task_id, user_id, comment, created_by }) => {
  if (!comment || !comment.toString().trim()) {
    throw new Error('Comment text is required')
  }

  return createComment({
    task_id,
    user_id,
    comment,
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
