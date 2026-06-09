import { getCompanySettingsService, updateCompanySettingsService } from '../services/settingsService.js'
import {
  changePasswordService,
  getAccountSettingsService,
  updateNotificationPreferencesService,
  updateProfileService
} from '../services/accountSettingsService.js'

export const getCompanySettingsController = async (req, res) => {
  try {
    const settings = await getCompanySettingsService()
    res.json(settings)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const updateCompanySettingsController = async (req, res) => {
  try {
    const settings = await updateCompanySettingsService(req.body)
    res.json(settings)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const getAccountSettingsController = async (req, res) => {
  try {
    const data = await getAccountSettingsService(
      req.user.id,
      req.user.role,
      req.user.permissions || []
    )
    res.json(data)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const updateProfileController = async (req, res) => {
  try {
    const user = await updateProfileService(req.user.id, req.body)
    res.json({ user, message: 'Profile updated successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const changePasswordController = async (req, res) => {
  try {
    const result = await changePasswordService(req.user.id, req.body)
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const getNotificationPreferencesController = async (req, res) => {
  try {
    const data = await getAccountSettingsService(
      req.user.id,
      req.user.role,
      req.user.permissions || []
    )
    res.json({ preferences: data.preferences })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const updateNotificationPreferencesController = async (req, res) => {
  try {
    const preferences = await updateNotificationPreferencesService(
      req.user.id,
      req.user.role,
      req.body
    )
    res.json({ preferences, message: 'Notification preferences saved' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
