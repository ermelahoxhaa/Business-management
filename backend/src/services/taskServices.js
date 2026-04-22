import {
  createTask,
  getAllTasks,
  getTaskById,
  getTasksByProject,
  getTasksByAssignedUser,
  updateTask,
  deleteTask
} from '../repositories/taskRepository.js'

const validStatuses = ['todo', 'in_progress', 'done']
const validPriorities = ['low', 'medium', 'high']

const normalizeTaskPayload = ({ title, description, status, priority, dueDate, updated_by }) => {
  const taskData = {}

  if (title !== undefined) taskData.title = title
  if (description !== undefined) taskData.description = description
  if (status !== undefined) taskData.status = status
  if (priority !== undefined) taskData.priority = priority
  if (dueDate !== undefined) taskData.due_date = dueDate
  if (updated_by !== undefined) taskData.updated_by = updated_by

  return taskData
}

export const createTaskService = async ({ title, description, status, priority, dueDate, created_by, assigned_to, project_id }) => {
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

  if (assigned_to !== undefined && (assigned_to <= 0 || !Number.isInteger(assigned_to))) {
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

export const getAllTasksService = async () => {
  return getAllTasks()
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

export const updateTaskService = async (id, payload) => {
  const existingTask = await getTaskById(id)
  if (!existingTask) {
    throw new Error('Task not found')
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

  await updateTask(id, updates)
  return getTaskById(id)
}

export const deleteTaskService = async (id) => {
  const existingTask = await getTaskById(id)
  if (!existingTask) {
    throw new Error('Task not found')
  }

  await deleteTask(id)
  return { deleted: true }
}
