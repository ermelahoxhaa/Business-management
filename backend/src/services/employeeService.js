import bcrypt from 'bcrypt'
import {
  createEmployee,
  createUser,
  findUserByEmail,
  getEmployeeById,
  getEmployeeByUserId,
  searchEmployees,
  getRoleByName,
  updateEmployee,
  updateUser,
  upsertUserRole
} from '../repositories/employeeRepository.js'
import { parseListQuery, buildPaginatedResponse } from '../utils/queryParser.js'

const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)

const roleWhitelist = ['employee', 'team_leader']
const statusWhitelist = ['active', 'inactive']

const mapEmployee = (item) => ({
  id: item.id,
  user_id: item.user_id,
  first_name: item.User?.first_name || '',
  last_name: item.User?.last_name || '',
  email: item.User?.email || '',
  role: item.User?.Roles?.[0]?.name || 'employee',
  department_id: item.department_id,
  department_name: item.Department?.name || 'No department',
  position: item.position || '',
  status: item.User?.is_active ? 'active' : 'inactive',
  employment_status: item.employment_status,
  created_at: item.created_at,
  updated_at: item.updated_at
})

export const getMyEmployeeProfileService = async (userId) => {
  const profile = await getEmployeeByUserId(userId)
  if (!profile) {
    throw new Error('Employee profile not found')
  }

  return mapEmployee(profile)
}

export const searchEmployeesService = async (query, requester) => {
  const listQuery = parseListQuery(query, {
    allowedSort: ['created_at', 'first_name', 'last_name', 'email', 'department'],
    defaultSort: 'created_at'
  })

  const { rows, count } = await searchEmployees({
    search: listQuery.search,
    role: query.role,
    departmentId: query.department_id ? Number(query.department_id) : undefined,
    employment_status: query.employment_status,
    sort: listQuery.sort,
    order: listQuery.order,
    limit: listQuery.limit,
    offset: listQuery.offset,
    requesterRole: requester?.role,
    requesterUserId: requester?.id
  })

  return buildPaginatedResponse(rows.map(mapEmployee), count, listQuery)
}

export const createEmployeeService = async ({
  first_name,
  last_name,
  email,
  password,
  role,
  department_id,
  position,
  status,
  created_by
}) => {
  if (!first_name?.trim() || !last_name?.trim() || !email?.trim()) {
    throw new Error('First name, last name and email are required')
  }

  if (!isStrongPassword((password || '').trim())) {
    throw new Error('Password must be at least 8 chars and include uppercase, lowercase, number and special char')
  }

  if (!roleWhitelist.includes(role)) {
    throw new Error('Role must be employee or team_leader')
  }

  if (status && !statusWhitelist.includes(status)) {
    throw new Error('Status must be active or inactive')
  }

  const existingUser = await findUserByEmail(email.trim())
  if (existingUser) {
    throw new Error('Email already exists')
  }

  const hashed = await bcrypt.hash(password.trim(), 10)
  const user = await createUser({
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    email: email.trim().toLowerCase(),
    password_hash: hashed,
    is_active: status !== 'inactive'
  })

  const roleRecord = await getRoleByName(role)
  if (!roleRecord) {
    throw new Error('Selected role does not exist')
  }
  await upsertUserRole(user.id, roleRecord.id)

  const employee = await createEmployee({
    user_id: user.id,
    department_id: department_id ? Number(department_id) : null,
    position: position || null,
    employment_status: status || 'active',
    created_by
  })

  const created = await getEmployeeById(employee.id)
  return mapEmployee(created)
}

export const updateEmployeeService = async (id, payload, updatedBy) => {
  const existing = await getEmployeeById(id)
  if (!existing) {
    throw new Error('Employee not found')
  }

  const userUpdates = {}
  if (payload.first_name !== undefined) userUpdates.first_name = payload.first_name.trim()
  if (payload.last_name !== undefined) userUpdates.last_name = payload.last_name.trim()

  if (payload.role !== undefined) {
    if (!roleWhitelist.includes(payload.role)) {
      throw new Error('Role must be employee or team_leader')
    }
    const roleRecord = await getRoleByName(payload.role)
    if (!roleRecord) {
      throw new Error('Selected role does not exist')
    }
    await upsertUserRole(existing.user_id, roleRecord.id)
  }

  const employeeUpdates = { updated_by: updatedBy }
  if (payload.department_id !== undefined) employeeUpdates.department_id = payload.department_id ? Number(payload.department_id) : null
  if (payload.position !== undefined) employeeUpdates.position = payload.position || null
  if (payload.status !== undefined) {
    if (!statusWhitelist.includes(payload.status)) {
      throw new Error('Status must be active or inactive')
    }
    employeeUpdates.employment_status = payload.status
    userUpdates.is_active = payload.status === 'active'
  }

  if (Object.keys(userUpdates).length > 0) {
    await updateUser(existing.user_id, userUpdates)
  }

  await updateEmployee(id, employeeUpdates)
  const updated = await getEmployeeById(id)
  return mapEmployee(updated)
}

export const updateEmployeeStatusService = async (id, status, updatedBy) => {
  if (!statusWhitelist.includes(status)) {
    throw new Error('Status must be active or inactive')
  }

  const existing = await getEmployeeById(id)
  if (!existing) {
    throw new Error('Employee not found')
  }

  await updateEmployee(id, {
    employment_status: status,
    updated_by: updatedBy
  })

  await updateUser(existing.user_id, {
    is_active: status === 'active'
  })

  const updated = await getEmployeeById(id)
  return mapEmployee(updated)
}
