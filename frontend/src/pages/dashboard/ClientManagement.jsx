import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, TrendingUp, Plus } from 'lucide-react'
import {
  deleteClient,
  getClients,
  updateClient,
  getProjects,
  getClientContacts,
  addClientContact,
  deleteClientContact,
  getClientProjects,
  linkClientProject,
  unlinkClientProject
} from '../../services/api'
import ListSearchPanel from '../../components/ListSearchPanel'
import DataTransferBar from '../../components/DataTransferBar'
import { buildQueryParams, unwrapList } from '../../utils/listResponse'
import CreateClientModal from '../../modals/CreateClientModal'

const emptySearch = {
  search: '',
  status: '',
  sort: 'created_at',
  order: 'desc'
}

const formatClientName = (client) =>
  [client.contact_name, client.company_name].filter(Boolean).join(' - ')

export default function ClientManagement() {
  const clientsListRef = useRef(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState(emptySearch)
  const [listMeta, setListMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [listPage, setListPage] = useState(1)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    contact_name: '',
    company_name: '',
    phone: '',
    email: '',
    address: '',
    status: 'active'
  })
  const [saving, setSaving] = useState(false)
  const [allProjects, setAllProjects] = useState([])
  const [clientContacts, setClientContacts] = useState([])
  const [clientProjectLinks, setClientProjectLinks] = useState([])
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', position: '' })
  const [linkForm, setLinkForm] = useState({ project_id: '', notes: '' })

  const loadClients = useCallback(async (query = searchQuery, page = listPage) => {
    setLoading(true)
    setError('')
    try {
      const response = await getClients(buildQueryParams({ ...query, page, limit: 50 }))
      const { items, meta } = unwrapList(response)
      setClients(items)
      setListMeta(meta)
      setListPage(meta.page || page)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load clients')
    } finally {
      setLoading(false)
    }
  }, [listPage, searchQuery])

  useEffect(() => {
    const loadInitialData = async () => {
      await loadClients(emptySearch, 1)
      try {
        const response = await getProjects({ limit: 500 })
        setAllProjects(unwrapList(response).items)
      } catch (err) {
        console.error('Error loading projects:', err)
      }
    }
    loadInitialData()
  }, [])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setListPage(1)
    loadClients(searchQuery, 1)
  }

  const handleSearchReset = () => {
    setSearchQuery(emptySearch)
    setListPage(1)
    loadClients(emptySearch, 1)
  }

  const handlePageChange = (nextPage) => {
    setListPage(nextPage)
    loadClients(searchQuery, nextPage)
  }

  const handleSearchFieldChange = (event) => {
    const { name, value } = event.target
    setSearchQuery((current) => ({ ...current, [name]: value }))
  }

  const loadClientExtras = async (clientId) => {
    try {
      const [contactsRes, projectsRes] = await Promise.all([
        getClientContacts(clientId),
        getClientProjects(clientId)
      ])
      setClientContacts(contactsRes.data || [])
      setClientProjectLinks(projectsRes.data || [])
    } catch (err) {
      console.error('Error loading client extras:', err)
      setClientContacts([])
      setClientProjectLinks([])
    }
  }

  const handleEditClient = async (client) => {
    setEditingId(client.id)
    setEditForm({
      contact_name: client.contact_name || '',
      company_name: client.company_name || '',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      status: client.status || 'active'
    })
    setContactForm({ name: '', email: '', phone: '', position: '' })
    setLinkForm({ project_id: '', notes: '' })
    await loadClientExtras(client.id)
  }

  const handleAddClientContact = async (clientId) => {
    if (!contactForm.name.trim()) {
      alert('Contact name is required')
      return
    }

    setSaving(true)
    try {
      await addClientContact(clientId, contactForm)
      setContactForm({ name: '', email: '', phone: '', position: '' })
      await loadClientExtras(clientId)
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to add contact')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClientContact = async (clientId, contactId) => {
    setSaving(true)
    try {
      await deleteClientContact(clientId, contactId)
      await loadClientExtras(clientId)
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to delete contact')
    } finally {
      setSaving(false)
    }
  }

  const handleLinkClientProject = async (clientId) => {
    if (!linkForm.project_id) {
      alert('Select a project to link')
      return
    }

    setSaving(true)
    try {
      await linkClientProject(clientId, {
        project_id: Number(linkForm.project_id),
        notes: linkForm.notes.trim() || null
      })
      setLinkForm({ project_id: '', notes: '' })
      await loadClientExtras(clientId)
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to link project')
    } finally {
      setSaving(false)
    }
  }

  const handleUnlinkClientProject = async (clientId, linkId) => {
    setSaving(true)
    try {
      await unlinkClientProject(clientId, linkId)
      await loadClientExtras(clientId)
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to unlink project')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setClientContacts([])
    setClientProjectLinks([])
    setEditForm({
      contact_name: '',
      company_name: '',
      phone: '',
      email: '',
      address: '',
      status: 'active'
    })
  }

  const handleEditChange = (event) => {
    setEditForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleUpdateClient = async (clientId) => {
    if (!editForm.contact_name.trim() || !editForm.company_name.trim()) {
      alert('Contact name and company name are required')
      return
    }

    setSaving(true)
    try {
      await updateClient(clientId, editForm)
      handleCancelEdit()
      await loadClients(searchQuery, listPage)
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to update client')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) {
      return
    }

    setSaving(true)
    try {
      await deleteClient(clientId)
      await loadClients(searchQuery, listPage)
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to delete client')
    } finally {
      setSaving(false)
    }
  }

  const totalClients = listMeta.total || clients.length
  const activeClients = clients.filter((client) => client.status === 'active').length

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

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300/80">Client Management</p>
              <h1 className="mt-4 text-4xl font-semibold text-white">Manage your clients</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Overview of all clients, their contact information, and associated projects in one place.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/5 p-5 text-sm text-slate-200 ring-1 ring-white/10">
                <p className="text-slate-400">Total clients</p>
                <p className="mt-2 text-3xl font-semibold text-white">{totalClients}</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-5 text-sm text-slate-200 ring-1 ring-white/10">
                <p className="text-slate-400">Active on this page</p>
                <p className="mt-2 text-3xl font-semibold text-white">{activeClients}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { label: 'Total clients', value: totalClients, icon: '👥', style: 'from-emerald-500/10 to-emerald-400/10' },
            { label: 'Active clients', value: activeClients, icon: '✓', style: 'from-amber-500/10 to-amber-400/10' },
            { label: 'Inactive on page', value: clients.length - activeClients, icon: '○', style: 'from-rose-500/10 to-rose-400/10' }
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-slate-900/90 p-6 shadow-xl ring-1 ring-white/5">
              <div className={`inline-flex rounded-3xl bg-gradient-to-r ${item.style} px-3 py-2 text-sm font-semibold text-slate-900`}>
                {item.icon}
              </div>
              <p className="mt-5 text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Add new client</h2>
              <p className="mt-2 text-sm text-slate-400">Create a new client entry for your business.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              <Plus className="h-5 w-5" />
              Add Client
            </button>
          </div>
        </section>

        <ListSearchPanel
          scrollToRef={clientsListRef}
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
            { value: 'contact_name', label: 'Contact name' },
            { value: 'company_name', label: 'Company' },
            { value: 'email', label: 'Email' }
          ]}
          resultMeta={listMeta}
          page={listPage}
          onPageChange={handlePageChange}
        >
          <select
            name="status"
            value={searchQuery.status}
            onChange={handleSearchFieldChange}
            className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 md:max-w-xs"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </ListSearchPanel>

        <DataTransferBar
          entity="clients"
          filters={buildQueryParams(searchQuery)}
          scrollToRef={clientsListRef}
          onImported={() => loadClients(searchQuery, listPage)}
        />

        {error && (
          <div className="rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-100 ring-1 ring-rose-500/20">
            {error}
          </div>
        )}

        <section
          ref={clientsListRef}
          className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5"
        >
          {loading ? (
            <div className="rounded-[2rem] border border-dashed border-slate-800 bg-slate-950/50 p-8 text-center text-slate-400">
              Loading clients...
            </div>
          ) : clients.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-800 bg-slate-950/50 p-8 text-center text-slate-400">
              No clients found. Add your first client or adjust your search.
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              {clients.map((client) => (
                <div key={client.id} className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-xl font-semibold text-white">{formatClientName(client)}</h3>
                      <div className="mt-4 space-y-2 text-sm">
                        <p className="text-slate-300">
                          <span className="text-slate-400">Phone:</span> {client.phone || '—'}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Email:</span> {client.email || '—'}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Address:</span> {client.address || '—'}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Status:</span>{' '}
                          <span className={client.status === 'active' ? 'text-emerald-300' : 'text-slate-400'}>
                            {client.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-2 text-sm text-slate-200">
                        <FileText className="h-4 w-4 text-emerald-400" />
                        <span className="font-semibold">Client</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-2 text-sm text-slate-200">
                        <TrendingUp className="h-4 w-4 text-sky-400" />
                        <span className="font-semibold">{client.company_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {editingId === client.id ? (
                      <>
                        <div className="space-y-3 sm:col-span-2">
                          <input
                            name="contact_name"
                            value={editForm.contact_name}
                            onChange={handleEditChange}
                            placeholder="Contact name"
                            className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          />
                          <input
                            name="company_name"
                            value={editForm.company_name}
                            onChange={handleEditChange}
                            placeholder="Company name"
                            className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          />
                          <input
                            name="phone"
                            value={editForm.phone}
                            onChange={handleEditChange}
                            placeholder="Phone number"
                            className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          />
                          <input
                            name="email"
                            value={editForm.email}
                            onChange={handleEditChange}
                            placeholder="Email address"
                            className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          />
                          <input
                            name="address"
                            value={editForm.address}
                            onChange={handleEditChange}
                            placeholder="Address"
                            className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          />
                          <select
                            name="status"
                            value={editForm.status}
                            onChange={handleEditChange}
                            className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>

                          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-4">
                            <h4 className="text-sm font-semibold text-white">Additional contacts</h4>
                            {clientContacts.length === 0 ? (
                              <p className="mt-2 text-xs text-slate-500">No extra contacts yet.</p>
                            ) : (
                              <ul className="mt-2 space-y-2">
                                {clientContacts.map((contact) => (
                                  <li
                                    key={contact.id}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 px-3 py-2 text-sm text-slate-200"
                                  >
                                    <span>
                                      {contact.name}
                                      {contact.position ? ` · ${contact.position}` : ''}
                                      {contact.email ? ` · ${contact.email}` : ''}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteClientContact(client.id, contact.id)}
                                      disabled={saving}
                                      className="text-xs text-rose-300 hover:text-rose-200 disabled:opacity-50"
                                    >
                                      Remove
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              <input
                                value={contactForm.name}
                                onChange={(e) => setContactForm((current) => ({ ...current, name: e.target.value }))}
                                placeholder="Name"
                                className="rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                              />
                              <input
                                value={contactForm.position}
                                onChange={(e) => setContactForm((current) => ({ ...current, position: e.target.value }))}
                                placeholder="Position"
                                className="rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                              />
                              <input
                                value={contactForm.email}
                                onChange={(e) => setContactForm((current) => ({ ...current, email: e.target.value }))}
                                placeholder="Email"
                                className="rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                              />
                              <input
                                value={contactForm.phone}
                                onChange={(e) => setContactForm((current) => ({ ...current, phone: e.target.value }))}
                                placeholder="Phone"
                                className="rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddClientContact(client.id)}
                              disabled={saving}
                              className="mt-2 rounded-2xl bg-sky-500/20 px-4 py-2 text-xs font-semibold text-sky-200 transition hover:bg-sky-500/30 disabled:opacity-50"
                            >
                              Add contact
                            </button>
                          </div>

                          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-4">
                            <h4 className="text-sm font-semibold text-white">Linked projects</h4>
                            {clientProjectLinks.length === 0 ? (
                              <p className="mt-2 text-xs text-slate-500">No linked projects yet.</p>
                            ) : (
                              <ul className="mt-2 space-y-2">
                                {clientProjectLinks.map((link) => (
                                  <li
                                    key={link.id}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 px-3 py-2 text-sm text-slate-200"
                                  >
                                    <span>
                                      {link.project?.name || `Project #${link.project_id}`}
                                      {link.notes ? ` · ${link.notes}` : ''}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleUnlinkClientProject(client.id, link.id)}
                                      disabled={saving}
                                      className="text-xs text-rose-300 hover:text-rose-200 disabled:opacity-50"
                                    >
                                      Unlink
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                              <select
                                value={linkForm.project_id}
                                onChange={(e) => setLinkForm((current) => ({ ...current, project_id: e.target.value }))}
                                className="rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                              >
                                <option value="">Select project</option>
                                {allProjects.map((project) => (
                                  <option key={project.id} value={project.id}>
                                    {project.name}
                                  </option>
                                ))}
                              </select>
                              <input
                                value={linkForm.notes}
                                onChange={(e) => setLinkForm((current) => ({ ...current, notes: e.target.value }))}
                                placeholder="Notes"
                                className="rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleLinkClientProject(client.id)}
                              disabled={saving}
                              className="mt-2 rounded-2xl bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/30 disabled:opacity-50"
                            >
                              Link project
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateClient(client.id)}
                          disabled={saving}
                          className="rounded-3xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleEditClient(client)}
                          className="rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClient(client.id)}
                          disabled={saving}
                          className="rounded-3xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <CreateClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => loadClients(searchQuery, listPage)}
      />
    </div>
  )
}
