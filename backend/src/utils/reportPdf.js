import PDFDocument from 'pdfkit'

export const buildReportPdf = ({ title, subtitle, summary = [], rows = [], headers = [] }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.fontSize(18).text(title)
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#555555').text(subtitle)
    doc.moveDown(1)
    doc.fillColor('#000000')

    if (summary.length > 0) {
      doc.fontSize(12).text('Summary')
      doc.moveDown(0.4)
      summary.forEach((item) => {
        doc.fontSize(10).text(`${item.label}: ${item.value}`)
      })
      doc.moveDown(0.8)
    }

    if (rows.length > 0 && headers.length > 0) {
      doc.fontSize(12).text('Details')
      doc.moveDown(0.4)
      doc.fontSize(9)

      const limit = Math.min(rows.length, 50)
      for (let index = 0; index < limit; index += 1) {
        const row = rows[index]
        const line = headers.map((header) => `${header.label}: ${row[header.key] ?? ''}`).join(' | ')
        if (doc.y > doc.page.height - 60) {
          doc.addPage()
        }
        doc.text(line)
        doc.moveDown(0.2)
      }

      if (rows.length > limit) {
        doc.moveDown(0.5).fillColor('#666666')
          .text(`+ ${rows.length - limit} more rows. Use Excel export for the full list.`)
      }
    }

    doc.end()
  })
