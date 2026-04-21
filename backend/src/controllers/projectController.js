import {
  createProjectService,
  getAllProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService
} from '../services/projectServices.js'

export const createProjectController = async (req, res) => {
  try {
    const project = await createProjectService(req.body)
    res.status(201).json(project)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getAllProjectsController = async (req, res) => {
  try {
    const projects = await getAllProjectsService()
    res.json(projects)
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
    const result = await updateProjectService(req.params.id, req.body)
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
