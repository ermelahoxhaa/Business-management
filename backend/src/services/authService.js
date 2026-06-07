import bcrypt from 'bcrypt'
import { createUser, findUserByEmail, getAllUsers } from '../repositories/userRepository.js'
import Role from '../models/Role.js'
import UserRole from '../models/UserRole.js'
import { issueAuthTokens } from './refreshTokenService.js'
import { logWorkspaceEvent, upsertUserPresence } from './eventLogService.js'

const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)

export const registerUser = async ({ first_name, last_name, email, password, password_hash }) => {
  const existing = await findUserByEmail(email)
  if (existing) throw new Error('User already exists')

  const rawPassword = (password ?? password_hash ?? '').trim()
  if (!rawPassword) throw new Error('Password is required')
  if (!isStrongPassword(rawPassword)) {
    throw new Error(
      'Password is too weak! Use at least 8 characters, including uppercase, lowercase, number, and special character.'
    )
  }

  const hashed = await bcrypt.hash(rawPassword, 10)

  const user = await createUser({
    first_name,
    last_name,
    email,
    password_hash: hashed
  })

  const employeeRole = await Role.findOne({ where: { name: 'employee' } })
  if (employeeRole) {
    await UserRole.create({
      user_id: user.id,
      role_id: employeeRole.id
    })
  }

  return user
}

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email)
  if (!user) throw new Error('Invalid credentials')

  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) throw new Error('Invalid credentials')

  const userRole = await UserRole.findOne({
    where: { user_id: user.id },
    include: [Role]
  })

  const role = userRole?.Role?.name || 'employee'

  await logWorkspaceEvent({
    userId: user.id,
    action: 'login',
    entityType: 'user',
    entityId: user.id,
    message: `${user.email} logged in`
  })
  await upsertUserPresence({ userId: user.id, status: 'online' })

  return issueAuthTokens(user, role)
}

export const getAllUsersService = async () => getAllUsers()
