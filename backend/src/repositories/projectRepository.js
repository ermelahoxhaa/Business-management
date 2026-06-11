import { Op } from 'sequelize'
import Project from '../models/Project.js'
import ProjectMember from '../models/ProjectMember.js'

export const createProject = (data) => Project.create(data)
export const getAllProjects = () => Project.findAll({ order: [['created_at', 'DESC']] })
export const getProjectById = (id) => Project.findByPk(id)
export const updateProject = (id, data) => Project.update(data, { where: { id } })
export const deleteProject = (id) => Project.destroy({ where: { id } })

export const searchProjects = async ({
  search,
  created_by,
  accessible_to_user_id,
  sort,
  order,
  limit,
  offset
}) => {
  const where = {}
  const andConditions = []

  if (search) {
    const value = `%${search}%`
    andConditions.push({
      [Op.or]: [
        { name: { [Op.iLike]: value } },
        { description: { [Op.iLike]: value } }
      ]
    })
  }

  if (accessible_to_user_id) {
    const memberProjects = await ProjectMember.findAll({
      where: { user_id: accessible_to_user_id },
      attributes: ['project_id']
    })
    const memberProjectIds = memberProjects.map((member) => member.project_id)

    andConditions.push({
      [Op.or]: [
        { created_by: accessible_to_user_id },
        ...(memberProjectIds.length ? [{ id: { [Op.in]: memberProjectIds } }] : [])
      ]
    })
  } else if (created_by) {
    where.created_by = created_by
  }

  if (andConditions.length > 0) {
    where[Op.and] = andConditions
  }

  return Project.findAndCountAll({
    where,
    order: [[sort, order]],
    limit,
    offset
  })
}
