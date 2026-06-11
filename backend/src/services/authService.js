import bcrypt from 'bcrypt'
import { Op } from 'sequelize'
import { findUserByEmail, getAllUsers } from '../repositories/userRepository.js'
import { getUserIdsByDepartment } from '../repositories/employeeRepository.js'
import Role from '../models/Role.js'
import UserRole from '../models/UserRole.js'
import User from '../models/User.js'
import { issueAuthTokens } from './refreshTokenService.js'
import { logWorkspaceEvent, upsertUserPresence } from './eventLogService.js'
import { getTeamLeaderDepartmentId } from './departmentScopeService.js'

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

export const getAllUsersService = async (requester) => {
  if (!requester || requester.role === 'admin') {
    return getAllUsers({
      attributes: ['id', 'first_name', 'last_name', 'email', 'is_active'],
      order: [['first_name', 'ASC'], ['last_name', 'ASC']]
    })
  }

  if (requester.role === 'team_leader') {
    const departmentId = await getTeamLeaderDepartmentId(requester.id)
    if (!departmentId) return []

    const userIds = await getUserIdsByDepartment(departmentId, ['employee', 'team_leader'])
    if (userIds.length === 0) return []

    return User.findAll({
      where: { id: { [Op.in]: userIds }, is_active: true },
      attributes: ['id', 'first_name', 'last_name', 'email', 'is_active'],
      order: [['first_name', 'ASC'], ['last_name', 'ASC']]
    })
  }

  return []
}
