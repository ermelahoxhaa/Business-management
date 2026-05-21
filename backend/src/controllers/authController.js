import { loginUser, registerUser, getAllUsersService } from '../services/authService.js'
import { refreshAuthTokens, logoutRefreshToken } from '../services/refreshTokenService.js'
import { logAudit } from '../services/auditService.js'

export const signup = async (req, res) => {
  try {
    const user = await registerUser(req.body)
    res.status(201).json(user)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const data = await loginUser(req.body)
    await logAudit({
      userId: data.user.id,
      action: 'login',
      entityType: 'user',
      entityId: data.user.id,
      ipAddress: req.ip
    })
    res.json(data)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken || req.body.refresh_token
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' })
    }

    const data = await refreshAuthTokens(refreshToken)
    res.json(data)
  } catch (err) {
    res.status(401).json({ message: err.message })
  }
}

export const logout = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken || req.body.refresh_token
    await logoutRefreshToken({
      refreshToken,
      userId: req.user?.id
    })

    if (req.user?.id) {
      await logAudit({
        userId: req.user.id,
        action: 'logout',
        entityType: 'user',
        entityId: req.user.id,
        ipAddress: req.ip
      })
    }

    res.json({ message: 'Logged out successfully' })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsersService()
    res.json(users)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
