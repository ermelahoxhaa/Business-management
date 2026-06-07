import { getCompanySettingsService, updateCompanySettingsService } from '../services/settingsService.js'

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
