import {
  createDepartmentService,
  searchDepartmentsService
} from '../services/departmentService.js'

export const getDepartmentsController = async (req, res) => {
  try {
    const result = await searchDepartmentsService(req.query, req.user)
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const createDepartmentController = async (req, res) => {
  try {
    const department = await createDepartmentService({
      ...req.body,
      created_by: req.user.id
    })
    res.status(201).json(department)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
