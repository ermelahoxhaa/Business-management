import {
  createEmployeeService,
  getEmployeesService,
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
    const employees = await getEmployeesService({
      search: req.query.search,
      role: req.query.role,
      department_id: req.query.department_id,
      requesterRole: req.user.role,
      requesterUserId: req.user.id
    })
    res.json(employees)
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
