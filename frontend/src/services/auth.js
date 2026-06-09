import Cookies from 'js-cookie'

const TOKEN_KEY = 'auth_token'
const REFRESH_KEY = 'auth_refresh_token'
const USER_KEY = 'auth_user'
const ROLE_KEY = 'auth_role'

export const isAuthenticated = () => !!Cookies.get(TOKEN_KEY)

export const getCurrentUser = () => {
  const userStr = Cookies.get(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

export const getUserRole = () => Cookies.get(ROLE_KEY)

export const getRoleLabel = (role) => {
  const labels = {
    admin: 'Admin',
    team_leader: 'Team Leader',
    employee: 'Employee'
  }
  return labels[role] || 'Employee'
}

export const getDefaultRouteForRole = (role) =>
  role === 'admin' || role === 'team_leader' ? '/dashboard' : '/home'

export const setAuthData = (accessToken, user, role, refreshToken) => {
  Cookies.set(TOKEN_KEY, accessToken, { expires: 1 })
  if (refreshToken) {
    Cookies.set(REFRESH_KEY, refreshToken, { expires: 7 })
  }
  Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7 })
  Cookies.set(ROLE_KEY, role, { expires: 7 })
}

export const updateStoredUser = (user) => {
  Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7 })
}

export const getSettingsHomeRoute = (role) =>
  role === 'employee' ? '/home' : '/dashboard'

export const getToken = () => Cookies.get(TOKEN_KEY)

export const getRefreshToken = () => Cookies.get(REFRESH_KEY)

export const clearAuthData = () => {
  Cookies.remove(TOKEN_KEY)
  Cookies.remove(REFRESH_KEY)
  Cookies.remove(USER_KEY)
  Cookies.remove(ROLE_KEY)
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('role')
}

export const logout = async () => {
  const refreshToken = getRefreshToken()
  const token = getToken()
  try {
    await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ refreshToken })
    })
  } catch {
    // ignore
  }
  clearAuthData()
}
