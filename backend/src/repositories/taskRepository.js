import { Op } from 'sequelize'
import Task from '../models/Task.js'
import Project from '../models/Project.js'

export const createTask = (data) => Task.create(data)
export const getTaskById = (id) => Task.findByPk(id)
export const getTasksByProject = (projectId) => Task.findAll({ where: { project_id: projectId } })
export const getTasksByAssignedUser = (userId) => Task.findAll({ where: { assigned_to: userId } })
export const updateTask = (id, data) => Task.update(data, { where: { id } })
export const deleteTask = (id) => Task.destroy({ where: { id } })

export const searchTasks = async ({
  search,
  status,
  priority,
  project_id,
  assigned_to,
  due_from,
  due_to,
  sort,
  order,
  limit,
  offset,
  managerUserId
}) => {
  const where = {}

  if (search) {
    const value = `%${search}%`
    where[Op.or] = [
      { title: { [Op.iLike]: value } },
      { description: { [Op.iLike]: value } }
    ]
  }

  if (status) where.status = status
  if (priority) where.priority = priority
  if (assigned_to) where.assigned_to = assigned_to

  if (due_from || due_to) {
    where.due_date = {}
    if (due_from) where.due_date[Op.gte] = new Date(due_from)
    if (due_to) {
      const end = new Date(due_to)
      end.setHours(23, 59, 59, 999)
      where.due_date[Op.lte] = end
    }
  }

  if (managerUserId) {
    const managerProjects = await Project.findAll({
      where: { created_by: managerUserId },
      attributes: ['id']
    })
    const projectIds = managerProjects.map((project) => project.id)

    if (projectIds.length === 0) {
      return { rows: [], count: 0 }
    }

    if (project_id) {
      if (!projectIds.includes(Number(project_id))) {
        return { rows: [], count: 0 }
      }
      where.project_id = project_id
    } else {
      where.project_id = { [Op.in]: projectIds }
    }
  } else if (project_id) {
    where.project_id = project_id
  }

  return Task.findAndCountAll({
    where,
    order: [[sort, order]],
    limit,
    offset
  })
}
