import {
  createEmployeeService,
  deleteEmployeeService,
  searchEmployeesService,
  getMyEmployeeProfileService,
  updateEmployeeService,
  updateEmployeeStatusService
} from '../services/employeeService.js'

export const getMyEmployeeProfileController = async (req, res) => {
  try {
    const profile = await getMyEmployeeProfileService(req.user.id)
    res.json(profile)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const getEmployeesController = async (req, res) => {
  try {
    const result = await searchEmployeesService(req.query, req.user)
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const createEmployeeController = async (req, res) => {
  try {
    const employee = await createEmployeeService({
      ...req.body,
      created_by: req.user.id
    })
    res.status(201).json(employee)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const updateEmployeeController = async (req, res) => {
  try {
    const employee = await updateEmployeeService(req.params.id, req.body, req.user.id)
    res.json(employee)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const updateEmployeeStatusController = async (req, res) => {
  try {
    const employee = await updateEmployeeStatusService(req.params.id, req.body.status, req.user.id)
    res.json(employee)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const deleteEmployeeController = async (req, res) => {
  try {
    const result = await deleteEmployeeService(req.params.id, req.user.id)
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
