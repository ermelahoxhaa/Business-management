import TaskComment from '../models/TaskComment.js'
import User from '../models/User.js'

export const createComment = (data) => TaskComment.create(data)
export const getCommentsByTask = (taskId) =>
  TaskComment.findAll({
    where: { task_id: taskId },
    include: [{ model: User, attributes: ['id', 'first_name', 'last_name'] }],
    order: [['created_at', 'ASC']]
  })
export const updateComment = (id, data) => TaskComment.update(data, { where: { id } })
export const deleteComment = (id) => TaskComment.destroy({ where: { id } })
