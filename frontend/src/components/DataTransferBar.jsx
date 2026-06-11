import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { exportEntityData, importEntityData } from '../services/api'
import { downloadBlob } from '../utils/downloadFile'
import { scrollToElement } from '../utils/scrollToElement'

export default function DataTransferBar({
  entity,
  title,
  subtitle,
  filters = {},
  onImported,
  canImport = true,
  scrollToRef
}) {
  const fileInputRef = useRef(null)
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const [importErrors, setImportErrors] = useState([])

  const handleExport = async (format) => {
    setBusy(`export-${format}`)
    setMessage('')
    setImportErrors([])

    try {
      const response = await exportEntityData(entity, format, filters)
      const disposition = response.headers['content-disposition'] || ''
      const match = disposition.match(/filename="(.+)"/)
      const filename = match?.[1] || `${entity}-export.${format}`
      downloadBlob(response.data, filename)
      setMessage(`Exported as ${format.toUpperCase()}.`)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Export failed.')
    } finally {
      setBusy('')
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setBusy('import')
    setMessage('')
    setImportErrors([])

    try {
      const response = await importEntityData(entity, file)
      const result = response.data
      setMessage(`Import finished: ${result.success} succeeded, ${result.failed} failed.`)
      setImportErrors(result.errors || [])
      if (onImported) await Promise.resolve(onImported())
      scrollToElement(scrollToRef)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Import failed.')
    } finally {
      setBusy('')
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-xl ring-1 ring-white/5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{title || 'Export / import'}</p>
          <p className="mt-1 text-sm text-slate-400">
            {subtitle || 'Download current results or upload a CSV, Excel, or JSON file.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {['csv', 'xlsx', 'json'].map((format) => (
            <button
              key={format}
              type="button"
              disabled={Boolean(busy)}
              onClick={() => handleExport(format)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500 hover:text-white disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {busy === `export-${format}` ? 'Exporting...' : format.toUpperCase()}
            </button>
          ))}
          {canImport && (
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={handleImportClick}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {busy === 'import' ? 'Importing...' : 'Import file'}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,.xlsx,.xls"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </div>

      {message && (
        <p className={`mt-4 text-sm ${importErrors.length ? 'text-amber-200' : 'text-emerald-200'}`}>{message}</p>
      )}

      {importErrors.length > 0 && (
        <div className="mt-3 max-h-32 overflow-y-auto rounded-2xl bg-slate-950/70 p-3 text-xs text-slate-300">
          {importErrors.map((item) => (
            <p key={`${item.row}-${item.message}`}>Row {item.row}: {item.message}</p>
          ))}
        </div>
      )}
    </section>
  )
}
