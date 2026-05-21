import { verifyAccessToken } from '../utils/tokens.js'
import { getPermissionsForRole, roleHasPermission } from '../services/permissionService.js'

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  try {
    const decoded = verifyAccessToken(token)
    const permissions = decoded.permissions || await getPermissionsForRole(decoded.role)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      permissions
    }
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export const requireRoles = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to perform this action' })
  }

  return next()
}

export const requirePermissions = (...requiredPermissions) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  const allowed = requiredPermissions.some((code) =>
    roleHasPermission(req.user.permissions || [], code)
  )

  if (!allowed) {
    return res.status(403).json({ message: 'You do not have permission to perform this action' })
  }

  return next()
}
