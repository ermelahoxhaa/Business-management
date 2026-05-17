import * as XLSX from 'xlsx'

const escapeCsvValue = (value) => {
  const text = value === null || value === undefined ? '' : String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export const rowsToCsv = (rows, headers) => {
  const headerLine = headers.map((header) => escapeCsvValue(header.label)).join(',')
  const lines = rows.map((row) =>
    headers.map((header) => escapeCsvValue(row[header.key])).join(',')
  )
  return [headerLine, ...lines].join('\n')
}

export const rowsToJson = (rows) => JSON.stringify(rows, null, 2)

export const rowsToXlsxBuffer = (rows, headers, sheetName = 'Export') => {
  const sheetData = [
    headers.map((header) => header.label),
    ...rows.map((row) => headers.map((header) => row[header.key] ?? ''))
  ]
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}

export const parseUploadedFile = (file) => {
  const extension = file.originalname.split('.').pop()?.toLowerCase()
  const format = ['csv', 'json', 'xlsx', 'xls'].includes(extension) ? extension : null

  if (!format) {
    throw new Error('Unsupported file type. Use CSV, JSON, or Excel (.xlsx).')
  }

  if (format === 'json') {
    const parsed = JSON.parse(file.buffer.toString('utf8'))
    return Array.isArray(parsed) ? parsed : [parsed]
  }

  if (format === 'csv') {
    const text = file.buffer.toString('utf8').trim()
    if (!text) return []
    const lines = text.split(/\r?\n/).filter(Boolean)
    const headers = lines[0].split(',').map((value) => value.trim().replace(/^"|"$/g, ''))
    return lines.slice(1).map((line) => {
      const values = line.match(/("([^"]|"")*"|[^,]*)/g)?.map((cell) =>
        cell.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
      ) || []
      return headers.reduce((row, header, index) => {
        row[header] = values[index] || ''
        return row
      }, {})
    })
  }

  const workbook = XLSX.read(file.buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet, { defval: '' })
}

export const buildDownload = (rows, headers, format, filenameBase) => {
  if (format === 'json') {
    return {
      buffer: Buffer.from(rowsToJson(rows), 'utf8'),
      mimeType: 'application/json',
      filename: `${filenameBase}.json`
    }
  }

  if (format === 'xlsx') {
    return {
      buffer: rowsToXlsxBuffer(rows, headers, filenameBase),
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `${filenameBase}.xlsx`
    }
  }

  return {
    buffer: Buffer.from(rowsToCsv(rows, headers), 'utf8'),
    mimeType: 'text/csv',
    filename: `${filenameBase}.csv`
  }
}
