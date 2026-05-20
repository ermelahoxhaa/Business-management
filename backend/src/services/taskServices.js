import {
  createTask,
  getTaskById,
  getTasksByProject,
  getTasksByAssignedUser,
  searchTasks,
  updateTask,
  deleteTask
} from '../repositories/taskRepository.js'
import { getProjectById } from '../repositories/projectRepository.js'
import { parseListQuery, buildPaginatedResponse } from '../utils/queryParser.js'

const validStatuses = ['todo', 'in_progress', 'done']
const validPriorities = ['low', 'medium', 'high']

const assertProjectAccess = async (projectId, requester) => {
  if (!requester || requester.role === 'admin') return

  if (requester.role !== 'team_leader') {
    throw new Error('You do not have access to this project')
  }

  const project = await getProjectById(projectId)
  if (!project) {
    throw new Error('Project not found')
  }

  if (Number(project.created_by) !== Number(requester.id)) {
    throw new Error('You do not have access to this project')
  }
}

const normalizeTaskPayload = ({ title, description, status, priority, dueDate, assigned_to, project_id, updated_by }) => {
  const taskData = {}

  if (title !== undefined) taskData.title = title
  if (description !== undefined) taskData.description = description
  if (status !== undefined) taskData.status = status
  if (priority !== undefined) taskData.priority = priority
  if (dueDate !== undefined) taskData.due_date = dueDate
  if (assigned_to !== undefined) taskData.assigned_to = assigned_to
  if (project_id !== undefined) taskData.project_id = project_id
  if (updated_by !== undefined) taskData.updated_by = updated_by

  return taskData
}

export const createTaskService = async (
  { title, description, status, priority, dueDate, created_by, assigned_to, project_id },
  requester
) => {
  if (!title || !title.toString().trim()) {
    throw new Error('Title is required')
  }

  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status. Allowed values: todo, in_progress, done')
  }

  if (!validPriorities.includes(priority)) {
    throw new Error('Invalid priority. Allowed values: low, medium, high')
  }

  if (!project_id || project_id <= 0) {
    throw new Error('Valid project ID is required')
  }

  if (assigned_to === undefined || assigned_to === null) {
    throw new Error('Assigned user is required')
  }

  if (assigned_to !== undefined && assigned_to !== null && (assigned_to <= 0 || !Number.isInteger(assigned_to))) {
    throw new Error('Assigned user ID must be a positive integer if provided')
  }

  return createTask({
    title,
    description,
    status,
    priority,
    due_date: dueDate,
    created_by,
    assigned_to,
    project_id
  })
}

export const searchTasksService = async (query, requester) => {
  const listQuery = parseListQuery(query, {
    allowedSort: ['title', 'status', 'priority', 'due_date', 'created_at', 'updated_at'],
    defaultSort: 'created_at'
  })

  if (query.status && !validStatuses.includes(query.status)) {
    throw new Error('Invalid status. Allowed values: todo, in_progress, done')
  }

  if (query.priority && !validPriorities.includes(query.priority)) {
    throw new Error('Invalid priority. Allowed values: low, medium, high')
  }

  const managerUserId = requester?.role === 'team_leader' ? requester.id : null

  const { rows, count } = await searchTasks({
    search: listQuery.search,
    status: query.status || undefined,
    priority: query.priority || undefined,
    project_id: query.project_id ? Number(query.project_id) : undefined,
    assigned_to: query.assigned_to ? Number(query.assigned_to) : undefined,
    due_from: query.due_from,
    due_to: query.due_to,
    sort: listQuery.sort,
    order: listQuery.order,
    limit: listQuery.limit,
    offset: listQuery.offset,
    managerUserId
  })

  return buildPaginatedResponse(rows, count, listQuery)
}

export const searchMyTasksService = async (userId, query) => {
  const listQuery = parseListQuery(query, {
    allowedSort: ['title', 'status', 'priority', 'due_date', 'created_at'],
    defaultSort: 'due_date',
    defaultOrder: 'ASC'
  })

  const { rows, count } = await searchTasks({
    search: listQuery.search,
    status: query.status,
    priority: query.priority,
    assigned_to: userId,
    due_from: query.due_from,
    due_to: query.due_to,
    sort: listQuery.sort,
    order: listQuery.order,
    limit: listQuery.limit,
    offset: listQuery.offset
  })

  return buildPaginatedResponse(rows, count, listQuery)
}

export const getTaskByIdService = async (id) => {
  const task = await getTaskById(id)
  if (!task) {
    throw new Error('Task not found')
  }
  return task
}

export const getTasksByAssignedUserService = async (userId) => {
  return getTasksByAssignedUser(userId)
}

export const getTasksByProjectService = async (projectId) => {
  return getTasksByProject(projectId)
}

export const updateTaskService = async (id, payload, requester) => {
  const existingTask = await getTaskById(id)
  if (!existingTask) {
    throw new Error('Task not found')
  }

  if (requester) {
    await assertProjectAccess(existingTask.project_id, requester)
  }

  const updates = normalizeTaskPayload(payload)

  if (updates.status !== undefined && !validStatuses.includes(updates.status)) {
    throw new Error('Invalid status. Allowed values: todo, in_progress, done')
  }

  if (updates.priority !== undefined && !validPriorities.includes(updates.priority)) {
    throw new Error('Invalid priority. Allowed values: low, medium, high')
  }

  // Business rule: cannot mark as done if title is empty
  if (updates.status === 'done' && (!existingTask.title || !existingTask.title.trim())) {
    throw new Error('Cannot mark task as done without a title')
  }

  if (updates.assigned_to !== undefined && (updates.assigned_to <= 0 || !Number.isInteger(updates.assigned_to))) {
    throw new Error('Assigned user ID must be a positive integer if provided')
  }

  if (updates.project_id !== undefined && (updates.project_id <= 0 || !Number.isInteger(updates.project_id))) {
    throw new Error('Valid project ID is required')
  }

  await updateTask(id, updates)
  return getTaskById(id)
}

export const deleteTaskService = async (id, requester) => {
  const existingTask = await getTaskById(id)
  if (!existingTask) {
    throw new Error('Task not found')
  }

  if (requester) {
    await assertProjectAccess(existingTask.project_id, requester)
  }

  await deleteTask(id)
  return { deleted: true }
}
