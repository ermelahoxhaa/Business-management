import { Op } from 'sequelize'
import RefreshToken from '../models/RefreshToken.js'
import { hashToken } from '../utils/tokens.js'

export const createRefreshTokenRecord = ({ userId, token, expiresAt }) =>
  RefreshToken.create({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiresAt
  })

export const findValidRefreshToken = async (token) => {
  const record = await RefreshToken.findOne({
    where: {
      token_hash: hashToken(token),
      revoked_at: null,
      expires_at: { [Op.gt]: new Date() }
    }
  })
  return record
}

export const revokeRefreshTokenByValue = async (token) => {
  const record = await RefreshToken.findOne({ where: { token_hash: hashToken(token) } })
  if (!record) return null
  await record.update({ revoked_at: new Date() })
  return record
}

export const revokeAllUserRefreshTokens = async (userId) =>
  RefreshToken.update(
    { revoked_at: new Date() },
    { where: { user_id: userId, revoked_at: null } }
  )
