import User from '../models/User.js'
import Role from '../models/Role.js'
import UserRole from '../models/UserRole.js'
import {
  createRefreshTokenRecord,
  findValidRefreshToken,
  revokeRefreshTokenByValue,
  revokeAllUserRefreshTokens
} from '../repositories/refreshTokenRepository.js'
import {
  generateRefreshTokenValue,
  getRefreshTokenExpiry,
  signAccessToken
} from '../utils/tokens.js'
import { getPermissionsForRole } from './permissionService.js'

const getUserRole = async (userId) => {
  const userRole = await UserRole.findOne({
    where: { user_id: userId },
    include: [Role]
  })
  return userRole?.Role?.name || 'employee'
}

const buildAuthPayload = async (user, role) => {
  const permissions = await getPermissionsForRole(role)
  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    role,
    permissions
  })

  const refreshToken = generateRefreshTokenValue()
  await createRefreshTokenRecord({
    userId: user.id,
    token: refreshToken,
    expiresAt: getRefreshTokenExpiry()
  })

  return {
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    },
    role,
    permissions,
    accessToken,
    refreshToken,
    token: accessToken
  }
}

export const issueAuthTokens = async (user, role) => buildAuthPayload(user, role)

export const refreshAuthTokens = async (refreshToken) => {
  const record = await findValidRefreshToken(refreshToken)
  if (!record) {
    throw new Error('Invalid or expired refresh token')
  }

  const user = await User.findByPk(record.user_id)
  if (!user || !user.is_active) {
    throw new Error('User account is not active')
  }

  await revokeRefreshTokenByValue(refreshToken)
  const role = await getUserRole(user.id)
  return buildAuthPayload(user, role)
}

export const logoutRefreshToken = async ({ refreshToken, userId }) => {
  if (refreshToken) {
    await revokeRefreshTokenByValue(refreshToken)
    return
  }

  if (userId) {
    await revokeAllUserRefreshTokens(userId)
  }
}
