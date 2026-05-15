import {
  createProject,
  getAllProjects,
  getProjectById,
  searchProjects,
  updateProject,
  deleteProject
} from '../repositories/projectRepository.js'
import { parseListQuery, buildPaginatedResponse } from '../utils/queryParser.js'

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

export const searchProjectsService = async (query, requester) => {
  const listQuery = parseListQuery(query, {
    allowedSort: ['name', 'created_at', 'updated_at'],
    defaultSort: 'created_at'
  })

  const createdBy = requester?.role === 'team_leader' ? requester.id : undefined

  const { rows, count } = await searchProjects({
    search: listQuery.search,
    created_by: createdBy,
    sort: listQuery.sort,
    order: listQuery.order,
    limit: listQuery.limit,
    offset: listQuery.offset
  })

  return buildPaginatedResponse(rows, count, listQuery)
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
