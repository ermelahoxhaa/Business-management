import CompanySetting from '../models/CompanySetting.js'

export const getCompanySettingsService = async () => {
  const rows = await CompanySetting.findAll({ order: [['key', 'ASC']] })
  return Object.fromEntries(rows.map((row) => [row.key, row.value]))
}

export const updateCompanySettingsService = async (payload) => {
  const entries = Object.entries(payload || {})
  if (!entries.length) throw new Error('No settings provided')

  for (const [key, value] of entries) {
    const [row] = await CompanySetting.findOrCreate({
      where: { key: String(key) },
      defaults: {
        key: String(key),
        value: value === null || value === undefined ? null : String(value)
      }
    })
    await row.update({
      value: value === null || value === undefined ? null : String(value)
    })
  }

  return getCompanySettingsService()
}
