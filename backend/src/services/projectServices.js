import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject
} from '../repositories/projectRepository.js'

export const createProjectService = async ({ name, description, created_by }) => {
  if (!name || !name.toString().trim()) {
    throw new Error('Project name is required')
  }

  return createProject({
    name,
    description,
    created_by
  })
}

export const getAllProjectsService = async () => {
  return getAllProjects()
}

export const getProjectByIdService = async (id) => {
  const project = await getProjectById(id)
  if (!project) {
    throw new Error('Project not found')
  }
  return project
}

export const updateProjectService = async (id, payload) => {
  const existingProject = await getProjectById(id)
  if (!existingProject) {
    throw new Error('Project not found')
  }

  const updates = {}
  if (payload.name !== undefined) updates.name = payload.name
  if (payload.description !== undefined) updates.description = payload.description
  if (payload.updated_by !== undefined) updates.updated_by = payload.updated_by

  await updateProject(id, updates)
  return getProjectById(id)
}

export const deleteProjectService = async (id) => {
  const existingProject = await getProjectById(id)
  if (!existingProject) {
    throw new Error('Project not found')
  }

  await deleteProject(id)
  return { deleted: true }
}
