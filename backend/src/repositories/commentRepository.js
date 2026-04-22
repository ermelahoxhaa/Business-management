import TaskComment from '../models/TaskComment.js'

export const createComment = (data) => TaskComment.create(data)
export const getCommentsByTask = (taskId) => TaskComment.findAll({ where: { task_id: taskId } })
export const updateComment = (id, data) => TaskComment.update(data, { where: { id } })
export const deleteComment = (id) => TaskComment.destroy({ where: { id } })
