import bcrypt from 'bcrypt'
import { findUserByEmail, findUserById, updateUserById } from '../repositories/userRepository.js'
import { revokeAllUserRefreshTokens } from '../repositories/refreshTokenRepository.js'
import { getUserPreferences, upsertUserPreferences } from './eventLogService.js'
import { logAudit } from './auditService.js'

const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)

const sanitizeUser = (user) => ({
  id: user.id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email
})

export const getAccountSettingsService = async (userId, role, permissions = []) => {
  const user = await findUserById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const preferences = await getUserPreferences(userId)

  return {
    user: sanitizeUser(user),
    role,
    permissions,
    preferences: {
      email_notifications: preferences.email_notifications ?? true,
      task_updates: preferences.task_updates ?? true,
      project_updates: role === 'employee' ? false : (preferences.project_updates ?? true)
    }
  }
}

export const updateProfileService = async (userId, { first_name, last_name, email }) => {
  const user = await findUserById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const nextFirstName = String(first_name ?? user.first_name).trim()
  const nextLastName = String(last_name ?? user.last_name).trim()
  const nextEmail = String(email ?? user.email).trim().toLowerCase()

  if (!nextFirstName || !nextLastName || !nextEmail) {
    throw new Error('First name, last name, and email are required')
  }

  if (nextEmail !== user.email) {
    const existing = await findUserByEmail(nextEmail)
    if (existing && existing.id !== userId) {
      throw new Error('Email is already in use')
    }
  }

  const updated = await updateUserById(userId, {
    first_name: nextFirstName,
    last_name: nextLastName,
    email: nextEmail
  })

  await logAudit({
    userId,
    action: 'profile_update',
    entityType: 'user',
    entityId: userId,
    metadata: { email: nextEmail }
  })

  return sanitizeUser(updated)
}

export const changePasswordService = async (userId, { current_password, new_password }) => {
  const user = await findUserById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const currentPassword = String(current_password || '').trim()
  const newPassword = String(new_password || '').trim()

  if (!currentPassword || !newPassword) {
    throw new Error('Current password and new password are required')
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash)
  if (!isMatch) {
    throw new Error('Current password is incorrect')
  }

  if (!isStrongPassword(newPassword)) {
    throw new Error(
      'Password is too weak. Use at least 8 characters, including uppercase, lowercase, number, and special character.'
    )
  }

  const password_hash = await bcrypt.hash(newPassword, 10)
  await updateUserById(userId, { password_hash })
  await revokeAllUserRefreshTokens(userId)

  await logAudit({
    userId,
    action: 'password_change',
    entityType: 'user',
    entityId: userId
  })

  return { message: 'Password updated successfully' }
}

export const updateNotificationPreferencesService = async (userId, role, preferences = {}) => {
  const payload = {
    email_notifications: Boolean(preferences.email_notifications),
    task_updates: Boolean(preferences.task_updates),
    project_updates: role === 'employee' ? false : Boolean(preferences.project_updates)
  }

  await upsertUserPreferences(userId, payload)

  await logAudit({
    userId,
    action: 'preferences_update',
    entityType: 'user',
    entityId: userId,
    metadata: payload
  })

  return payload
}
