import Task from '../models/Task.js'

export const createTask = (data) => Task.create(data)
export const getAllTasks = () => Task.findAll()
export const getTaskById = (id) => Task.findByPk(id)
export const getTasksByProject = (projectId) => Task.findAll({ where: { project_id: projectId } })
export const getTasksByAssignedUser = (userId) => Task.findAll({ where: { assigned_to: userId } })
export const updateTask = (id, data) => Task.update(data, { where: { id } })
export const deleteTask = (id) => Task.destroy({ where: { id } })
