import bcrypt from 'bcrypt'
import { findUserByEmail, getAllUsers } from '../repositories/userRepository.js'
import Role from '../models/Role.js'
import UserRole from '../models/UserRole.js'
import { issueAuthTokens } from './refreshTokenService.js'
import { logWorkspaceEvent, upsertUserPresence } from './eventLogService.js'

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
