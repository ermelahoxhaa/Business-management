import { Op } from 'sequelize'
import Project from '../models/Project.js'

export const createProject = (data) => Project.create(data)
export const getAllProjects = () => Project.findAll({ order: [['created_at', 'DESC']] })
export const getProjectById = (id) => Project.findByPk(id)
export const updateProject = (id, data) => Project.update(data, { where: { id } })
export const deleteProject = (id) => Project.destroy({ where: { id } })

export const searchProjects = async ({
  search,
  created_by,
  sort,
  order,
  limit,
  offset
}) => {
  const where = {}

  if (search) {
    const value = `%${search}%`
    where[Op.or] = [
      { name: { [Op.iLike]: value } },
      { description: { [Op.iLike]: value } }
    ]
  }

  if (created_by) {
    where.created_by = created_by
  }

  return Project.findAndCountAll({
    where,
    order: [[sort, order]],
    limit,
    offset
  })
}
