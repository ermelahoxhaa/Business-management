import { Op } from 'sequelize'
import User from '../models/User.js'
import Role from '../models/Role.js'
import UserRole from '../models/UserRole.js'
import Employee from '../models/Employee.js'
import Department from '../models/Department.js'

export const findUserByEmail = (email) => User.findOne({ where: { email } })

export const createUser = (data) => User.create(data)

export const getRoleByName = (name) => Role.findOne({ where: { name } })

export const upsertUserRole = async (userId, roleId) => {
  await UserRole.destroy({ where: { user_id: userId } })
  return UserRole.create({ user_id: userId, role_id: roleId })
}

export const createEmployee = (data) => Employee.create(data)

export const getEmployeeById = (id) =>
  Employee.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ['id', 'first_name', 'last_name', 'email', 'is_active'],
        include: [{ model: Role, attributes: ['name'], through: { attributes: [] } }]
      },
      { model: Department, attributes: ['id', 'name'] }
    ]
  })

export const getEmployeeByUserId = (userId) =>
  Employee.findOne({
    where: { user_id: userId },
    include: [
      {
        model: User,
        attributes: ['id', 'first_name', 'last_name', 'email', 'is_active'],
        include: [{ model: Role, attributes: ['name'], through: { attributes: [] } }]
      },
      { model: Department, attributes: ['id', 'name'] }
    ]
  })

export const getEmployees = async ({ search, role, departmentId, requesterRole, requesterUserId }) => {
  const where = {}
  const userWhere = {}
  const roleWhere = role ? { name: role } : {}

  if (departmentId) {
    where.department_id = departmentId
  }

  if (search) {
    const value = `%${search}%`
    userWhere[Op.or] = [
      { first_name: { [Op.iLike]: value } },
      { last_name: { [Op.iLike]: value } },
      { email: { [Op.iLike]: value } }
    ]
  }

  if (requesterRole === 'team_leader') {
    const requesterProfile = await getEmployeeByUserId(requesterUserId)
    if (!requesterProfile?.department_id) {
      return []
    }
    where.department_id = requesterProfile.department_id
  }

  return Employee.findAll({
    where,
    include: [
      {
        model: User,
        attributes: ['id', 'first_name', 'last_name', 'email', 'is_active'],
        where: userWhere,
        include: [{ model: Role, attributes: ['name'], where: roleWhere, through: { attributes: [] } }]
      },
      { model: Department, attributes: ['id', 'name'] },
    ],
    order: [['created_at', 'DESC']]
  })
}

export const updateUser = (id, data) => User.update(data, { where: { id } })

export const updateEmployee = (id, data) => Employee.update(data, { where: { id } })
