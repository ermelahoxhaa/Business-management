import {
  createTaskService,
  getAllTasksService,
  getTaskByIdService,
  getTasksByAssignedUserService,
  getTasksByProjectService,
  updateTaskService,
  deleteTaskService
} from '../services/taskServices.js'

export const createTaskController = async (req, res) => {
  try {
    const task = await createTaskService(req.body)
    res.status(201).json(task)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getAllTasksController = async (req, res) => {
  try {
    const tasks = await getAllTasksService()
    res.json(tasks)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getTaskByIdController = async (req, res) => {
  try {
    const task = await getTaskByIdService(req.params.id)
    res.json(task)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getTasksByAssignedUserController = async (req, res) => {
  try {
    const tasks = await getTasksByAssignedUserService(req.params.userId)
    res.json(tasks)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getTasksByProjectController = async (req, res) => {
  try {
    const tasks = await getTasksByProjectService(req.params.projectId)
    res.json(tasks)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const updateTaskController = async (req, res) => {
  try {
    const result = await updateTaskService(req.params.id, req.body)
    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const deleteTaskController = async (req, res) => {
  try {
    const result = await deleteTaskService(req.params.id)
    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
