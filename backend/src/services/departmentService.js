import {
  createDepartment,
  findDepartmentByName,
  getAllDepartments
} from '../repositories/departmentRepository.js'

export const getDepartmentsService = async () => {
  return getAllDepartments()
}

export const createDepartmentService = async ({ name, description, created_by }) => {
  const normalizedName = (name || '').trim()
  if (!normalizedName) {
    throw new Error('Department name is required')
  }

  const existing = await findDepartmentByName(normalizedName)
  if (existing) {
    throw new Error('Department already exists')
  }

  return createDepartment({
    name: normalizedName,
    description,
    created_by
  })
}
