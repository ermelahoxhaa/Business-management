import {
  exportReportService,
  generateReportService,
  getReportTypesService
} from '../services/reportService.js'

export const getReportTypesController = async (req, res) => {
  try {
    res.json(getReportTypesService())
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const previewReportController = async (req, res) => {
  try {
    const report = await generateReportService(req.params.type, req.query, req.user)
    res.json(report)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const exportReportController = async (req, res) => {
  try {
    const format = (req.query.format || 'xlsx').toLowerCase()
    const { format: _ignored, ...filters } = req.query
    const file = await exportReportService(req.params.type, format, filters, req.user)

    res.setHeader('Content-Type', file.mimeType)
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`)
    res.send(file.buffer)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
