import { exportEntityService, importEntityService } from '../services/dataTransferService.js'

export const exportEntityController = async (req, res) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase()
    const { format: _ignored, ...filters } = req.query
    const file = await exportEntityService(req.params.entity, format, filters, req.user)

    res.setHeader('Content-Type', file.mimeType)
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`)
    res.send(file.buffer)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const importEntityController = async (req, res) => {
  try {
    const result = await importEntityService(req.params.entity, req.file, {
      id: req.user.id,
      role: req.user.role,
      permissions: req.user.permissions || []
    })
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
