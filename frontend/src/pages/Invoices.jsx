import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, Edit2, Trash2 } from 'lucide-react'
import { getClients, getProjects, exportEntityData } from '../services/api'
import { getUserRole, getCurrentUser } from '../services/auth'
import ListSearchPanel from '../components/ListSearchPanel'
import { buildQueryParams, unwrapList } from '../utils/listResponse'

export default function Invoices() {
  const userRole = getUserRole()
  const currentUser = getCurrentUser()
  const isAdmin = userRole === 'admin'

  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    client_id: '',
    invoice_number: '',
    amount: '',
    currency: 'EUR',
    status: 'draft',
    due_date: '',
    issued_at: new Date().toISOString().split('T')[0],
    project_id: ''
  })

  const [editForm, setEditForm] = useState({
    client_id: '',
    invoice_number: '',
    amount: '',
    currency: 'EUR',
    status: 'draft',
    due_date: '',
    issued_at: '',
    project_id: ''
  })

  const [saving, setSaving] = useState(false)
  const [listMeta, setListMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [listPage, setListPage] = useState(1)
  const emptySearch = { search: '', sort: 'created_at', order: 'desc' }
  const [searchQuery, setSearchQuery] = useState(emptySearch)

  // Mock data - replace with API calls when backend is ready
  const mockInvoices = [
    {
      id: 1,
      invoice_number: 'INV-001',
      client_id: 1,
      amount: 5000,
      currency: 'EUR',
      status: 'paid',
      due_date: '2026-06-26',
      issued_at: '2026-05-26',
      project_id: 1,
      created_by: currentUser?.id
    },
    {
      id: 2,
      invoice_number: 'INV-002',
      client_id: 2,
      amount: 3500,
      currency: 'EUR',
      status: 'sent',
      due_date: '2026-06-15',
      issued_at: '2026-05-15',
      project_id: 2,
      created_by: currentUser?.id
    }
  ]

  const loadInvoices = async (query = searchQuery, page = listPage) => {
    try {
      setInvoices(mockInvoices)
      setListMeta({ total: mockInvoices.length, page: 1, totalPages: 1 })
    } catch (err) {
      console.error('Error loading invoices:', err)
      alert(err.response?.data?.message || 'Unable to load invoices')
    }
  }

  const loadClients = async () => {
    try {
      const response = await getClients({ limit: 500 })
      setClients(unwrapList(response).items || response.data || [])
    } catch (err) {
      console.error('Error loading clients:', err)
    }
  }

  const loadProjects = async () => {
    try {
      const response = await getProjects({ limit: 500 })
      setProjects(unwrapList(response).items || response.data || [])
    } catch (err) {
      console.error('Error loading projects:', err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadInvoices(emptySearch), loadClients(), loadProjects()])
      setLoading(false)
    }
    loadData()
  }, [])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setListPage(1)
    loadInvoices(searchQuery, 1)
  }

  const handleSearchReset = () => {
    setSearchQuery(emptySearch)
    setListPage(1)
    loadInvoices(emptySearch, 1)
  }

  const handlePageChange = (nextPage) => {
    setListPage(nextPage)
    loadInvoices(searchQuery, nextPage)
  }

  const resetForm = () => {
    setForm({
      client_id: '',
      invoice_number: '',
      amount: '',
      currency: 'EUR',
      status: 'draft',
      due_date: '',
      issued_at: new Date().toISOString().split('T')[0],
      project_id: ''
    })
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleEditInvoice = (invoice) => {
    setEditingId(invoice.id)
    setEditForm({
      client_id: invoice.client_id || '',
      invoice_number: invoice.invoice_number || '',
      amount: invoice.amount || '',
      currency: invoice.currency || 'EUR',
      status: invoice.status || 'draft',
      due_date: invoice.due_date || '',
      issued_at: invoice.issued_at || '',
      project_id: invoice.project_id || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({
      client_id: '',
      invoice_number: '',
      amount: '',
      currency: 'EUR',
      status: 'draft',
      due_date: '',
      issued_at: '',
      project_id: ''
    })
  }

  const handleUpdateInvoice = async (invoiceId) => {
    if (!editForm.invoice_number.trim()) {
      alert('Invoice number is required')
      return
    }

    setSaving(true)
    try {
      // TODO: Call API when backend is ready
      // await updateInvoice(invoiceId, editForm)
      setInvoices(
        invoices.map((inv) =>
          inv.id === invoiceId
            ? { ...inv, ...editForm }
            : inv
        )
      )
      setEditingId(null)
      setEditForm({
        client_id: '',
        invoice_number: '',
        amount: '',
        currency: 'EUR',
        status: 'draft',
        due_date: '',
        issued_at: '',
        project_id: ''
      })
    } catch (err) {
      console.error('Error updating invoice:', err)
      alert(err.response?.data?.message || 'Unable to update invoice')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return
    }

    setSaving(true)
    try {
      // TODO: Call API when backend is ready
      // await deleteInvoice(invoiceId)
      setInvoices(invoices.filter((inv) => inv.id !== invoiceId))
    } catch (err) {
      console.error('Error deleting invoice:', err)
      alert(err.response?.data?.message || 'Unable to delete invoice')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.invoice_number.trim()) {
      alert('Invoice number is required')
      return
    }

    if (!form.client_id) {
      alert('Please select a client')
      return
    }

    setSaving(true)

    try {
      // TODO: Call API when backend is ready
      // await createInvoice(form)
      const newInvoice = {
        id: Math.max(...invoices.map((i) => i.id), 0) + 1,
        ...form,
        client_id: parseInt(form.client_id),
        project_id: form.project_id ? parseInt(form.project_id) : null,
        amount: parseFloat(form.amount),
        created_by: currentUser?.id
      }
      setInvoices([newInvoice, ...invoices])
      alert('Invoice created successfully')
      resetForm()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Unable to create invoice')
    } finally {
      setSaving(false)
    }
  }

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId)
    return client?.name || `Client #${clientId}`
  }

  const getProjectName = (projectId) => {
    if (!projectId) return 'N/A'
    const project = projects.find((p) => p.id === projectId)
    return project?.name || `Project #${projectId}`
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-slate-500/10 text-slate-300',
      sent: 'bg-blue-500/10 text-blue-300',
      paid: 'bg-emerald-500/10 text-emerald-300',
      overdue: 'bg-rose-500/10 text-rose-300',
      cancelled: 'bg-slate-500/10 text-slate-400'
    }
    return colors[status] || colors.draft
  }

  const getStatusBorder = (status) => {
    const borders = {
      draft: 'border-slate-500/20',
      sent: 'border-blue-500/20',
      paid: 'border-emerald-500/20',
      overdue: 'border-rose-500/20',
      cancelled: 'border-slate-500/10'
    }
    return borders[status] || borders.draft
  }

  const totalInvoices = invoices.length
  const paidInvoices = invoices.filter((inv) => inv.status === 'paid').length
  const sentInvoices = invoices.filter((inv) => inv.status === 'sent').length
  const draftInvoices = invoices.filter((inv) => inv.status === 'draft').length
  const totalAmount = invoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-slate-950">
        <div className="text-white">Loading invoices...</div>
      </div>
    )
  }

  const handleExportInvoice = async (invoiceId) => {
    try {
      const invoice = invoices.find((inv) => inv.id === invoiceId)
      if (!invoice) {
        alert('Invoice not found')
        return
      }

      const response = await exportEntityData('invoices', 'pdf', { id: invoiceId })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${invoice.invoice_number}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentChild.removeChild(link)
    } catch (err) {
      console.error('Error exporting invoice:', err)
      alert('Unable to export invoice')
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-950 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-slate-700/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-8">
        <Link
          to="/dashboard"
          aria-label="Back to dashboard"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 shadow-lg shadow-slate-950/20 transition hover:border-sky-400/40 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-400/40"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Paid', value: paidInvoices, icon: '✔️', style: 'from-emerald-500/10 to-emerald-400/10' },
            { label: 'Sent', value: sentInvoices, icon: '📤', style: 'from-blue-500/10 to-blue-400/10' },
            { label: 'Draft', value: draftInvoices, icon: '📝', style: 'from-amber-500/10 to-amber-400/10' },
            { label: 'Overdue', value: invoices.filter((inv) => inv.status === 'overdue').length, icon: '⚠️', style: 'from-rose-500/10 to-rose-400/10' }
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-slate-900/90 p-6 shadow-xl ring-1 ring-white/5">
              <div className={`inline-flex rounded-3xl bg-gradient-to-r ${item.style} px-3 py-2 text-sm font-semibold text-slate-900`}>{item.icon}</div>
              <p className="mt-5 text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </section>

        {isAdmin && (
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Create new invoice</h2>
                <p className="mt-2 text-sm text-slate-400">Add a new invoice for a client.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Client *</label>
                <select
                  name="client_id"
                  value={form.client_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Invoice Number *</label>
                <input
                  name="invoice_number"
                  value={form.invoice_number}
                  onChange={handleChange}
                  required
                  placeholder="e.g., INV-001"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Amount *</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Project</label>
                <select
                  name="project_id"
                  value={form.project_id}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="">No project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Due Date</label>
                <input
                  name="due_date"
                  type="date"
                  value={form.due_date}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="lg:col-span-3 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Invoice'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-3xl border border-slate-700 bg-slate-950/70 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500"
                >
                  Reset
                </button>
              </div>
            </form>
          </section>
        )}

        <ListSearchPanel
          search={searchQuery.search}
          onSearchChange={(value) => setSearchQuery((current) => ({ ...current, search: value }))}
          onSubmit={handleSearchSubmit}
          onReset={handleSearchReset}
          sort={searchQuery.sort}
          onSortChange={(value) => setSearchQuery((current) => ({ ...current, sort: value }))}
          order={searchQuery.order}
          onOrderChange={(value) => setSearchQuery((current) => ({ ...current, order: value }))}
          sortOptions={[
            { value: 'created_at', label: 'Created date' },
            { value: 'invoice_number', label: 'Invoice number' },
            { value: 'amount', label: 'Amount' },
            { value: 'due_date', label: 'Due date' }
          ]}
          resultMeta={listMeta}
          page={listPage}
          onPageChange={handlePageChange}
        />

        <section className="grid gap-6">
          {invoices.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-800 bg-slate-900/80 p-8 text-center text-slate-400 shadow-xl">
              No invoices available yet.
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className={`group rounded-3xl border bg-gradient-to-br shadow-xl transition-all duration-300 hover:shadow-2xl ${getStatusBorder(invoice.status)} border-white/10 from-slate-900 to-slate-950/50`}
                >
                  <div className="p-6">
                    {editingId === invoice.id ? (
                      <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-400">Client</label>
                            <select
                              name="client_id"
                              value={editForm.client_id}
                              onChange={handleEditChange}
                              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
                            >
                              <option value="">Select a client</option>
                              {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                  {client.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-400">Invoice Number</label>
                            <input
                              name="invoice_number"
                              value={editForm.invoice_number}
                              onChange={handleEditChange}
                              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-400">Amount</label>
                            <input
                              name="amount"
                              type="number"
                              step="0.01"
                              value={editForm.amount}
                              onChange={handleEditChange}
                              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-400">Status</label>
                            <select
                              name="status"
                              value={editForm.status}
                              onChange={handleEditChange}
                              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
                            >
                              <option value="draft">Draft</option>
                              <option value="sent">Sent</option>
                              <option value="paid">Paid</option>
                              <option value="overdue">Overdue</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-400">Due Date</label>
                            <input
                              name="due_date"
                              type="date"
                              value={editForm.due_date}
                              onChange={handleEditChange}
                              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-400">Project</label>
                            <select
                              name="project_id"
                              value={editForm.project_id}
                              onChange={handleEditChange}
                              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
                            >
                              <option value="">No project</option>
                              {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                  {project.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleUpdateInvoice(invoice.id)}
                            disabled={saving}
                            className="flex-1 rounded-2xl bg-emerald-500/80 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={saving}
                            className="flex-1 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-white">{invoice.invoice_number}</h3>
                              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-400">{getClientName(invoice.client_id)}</p>
                          </div>
                        </div>

                        <div className="mb-4 space-y-2 border-t border-slate-800 pt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Amount</span>
                            <span className="font-semibold text-white">
                              €{(parseFloat(invoice.amount) || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Project</span>
                            <span className="text-white">{getProjectName(invoice.project_id)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Issued</span>
                            <span className="text-white">{invoice.issued_at}</span>
                          </div>
                          {invoice.due_date && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Due</span>
                              <span className="text-white">{invoice.due_date}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 border-t border-slate-800 pt-4">
                          <button
                            onClick={() => handleExportInvoice(invoice.id)}
                            title="Export as PDF"
                            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-800/50 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white"
                          >
                            <Download className="h-4 w-4" />
                            Export
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleEditInvoice(invoice)}
                                title="Edit invoice"
                                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-sky-500/20 px-3 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-500/30 hover:text-sky-200"
                              >
                                <Edit2 className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteInvoice(invoice.id)}
                                title="Delete invoice"
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-rose-500/20 px-3 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/30 hover:text-rose-200 disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
