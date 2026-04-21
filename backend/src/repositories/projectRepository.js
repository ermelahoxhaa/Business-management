import Project from '../models/Project.js'

export const createProject = (data) => Project.create(data)
export const getAllProjects = () => Project.findAll()
export const getProjectById = (id) => Project.findByPk(id)
export const updateProject = (id, data) => Project.update(data, { where: { id } })
export const deleteProject = (id) => Project.destroy({ where: { id } })
