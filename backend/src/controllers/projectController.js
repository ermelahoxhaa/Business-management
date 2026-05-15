import {
  createProjectService,
  getAllProjectsService,
  searchProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService
} from '../services/projectServices.js'
import { getTasksByAssignedUserService } from '../services/taskServices.js'

export const createProjectController = async (req, res) => {
  try {
    const project = await createProjectService({
      ...req.body,
      created_by: req.user.id
    })
    res.status(201).json(project)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getAllProjectsController = async (req, res) => {
  try {
    const result = await searchProjectsService(req.query, req.user)
    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getMyProjectsController = async (req, res) => {
  try {
    const [projects, tasks] = await Promise.all([
      getAllProjectsService(),
      getTasksByAssignedUserService(req.user.id)
    ])
    const projectIds = new Set(tasks.map((task) => Number(task.project_id)))
    res.json(projects.filter((project) => projectIds.has(Number(project.id))))
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getProjectByIdController = async (req, res) => {
  try {
    const project = await getProjectByIdService(req.params.id)
    res.json(project)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const updateProjectController = async (req, res) => {
  try {
    const result = await updateProjectService(req.params.id, {
      ...req.body,
      updated_by: req.user.id
    })
    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const deleteProjectController = async (req, res) => {
  try {
    const result = await deleteProjectService(req.params.id)
    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
