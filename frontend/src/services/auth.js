import Cookies from 'js-cookie'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const ROLE_KEY = 'auth_role'

export const isAuthenticated = () => {
  return !!Cookies.get(TOKEN_KEY)
}

export const getCurrentUser = () => {
  const userStr = Cookies.get(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

export const getUserRole = () => {
  return Cookies.get(ROLE_KEY)
}

export const setAuthData = (token, user, role) => {
  Cookies.set(TOKEN_KEY, token, { expires: 1 }) // 1 day
  Cookies.set(USER_KEY, JSON.stringify(user), { expires: 1 })
  Cookies.set(ROLE_KEY, role, { expires: 1 })
}

export const logout = () => {
  Cookies.remove(TOKEN_KEY)
  Cookies.remove(USER_KEY)
  Cookies.remove(ROLE_KEY)
  // Clear localStorage as backup
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const getToken = () => {
  return Cookies.get(TOKEN_KEY)
}