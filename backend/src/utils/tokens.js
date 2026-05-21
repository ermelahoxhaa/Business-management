import crypto from 'crypto'
import jwt from 'jsonwebtoken'

const getSecret = () => process.env.JWT_SECRET || 'fallback_secret'

export const signAccessToken = (payload) =>
  jwt.sign(payload, getSecret(), {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m'
  })

export const verifyAccessToken = (token) => jwt.verify(token, getSecret())

export const generateRefreshTokenValue = () => crypto.randomBytes(48).toString('hex')

export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex')

export const getRefreshTokenExpiry = () => {
  const days = Number.parseInt(process.env.REFRESH_TOKEN_DAYS || '7', 10)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + days)
  return expiresAt
}
