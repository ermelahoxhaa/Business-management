import {
  createTask,
  getAllTasks,
  getTaskById,
  getTasksByAssignedUser,
  updateTask,
  deleteTask
} from '../repositories/taskRepository.js'

const validStatuses = ['todo', 'in_progress', 'done']
const validPriorities = ['low', 'medium', 'high']

const normalizeTaskPayload = ({ title, description, status, priority, dueDate }) => {
  const taskData = {}

  if (title !== undefined) taskData.title = title
  if (description !== undefined) taskData.description = description
  if (status !== undefined) taskData.status = status
  if (priority !== undefined) taskData.priority = priority
  if (dueDate !== undefined) taskData.due_date = dueDate

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
