import Department from '../models/Department.js'

export const getAllDepartments = () => Department.findAll({ order: [['name', 'ASC']] })

export const findDepartmentByName = (name) => Department.findOne({ where: { name } })

export const createDepartment = (data) => Department.create(data)
