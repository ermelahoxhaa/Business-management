import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search, FileText, TrendingUp, Pencil, Trash2, Plus } from 'lucide-react'
import CreateClientModal from "../../modals/CreateClientModal"

export default function ClientManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [clients, setClients] = useState([
    {
      id: 1,
      name: 'John Doe - Acme Corporation',
      phone: '+38349356478',
      email: 'john.doe@acme.com',
      address: '123 Main St, Anytown, USA',
      projects: 1,
      totalRevenue: 4500.00
    }
  ])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  })
  const [saving, setSaving] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  )

  const handleEditClient = (client) => {
    setEditingId(client.id)
    setEditForm({
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', phone: '', email: '', address: '' })
  }

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleUpdateClient = async (clientId) => {
    if (!editForm.name.trim()) {
      alert('Client name is required')
      return
    }

    setSaving(true)
    try {
      // Update client in state
      setClients(clients.map(c =>
        c.id === clientId ? { ...c, ...editForm } : c
      ))
      setEditingId(null)
      setEditForm({ name: '', phone: '', email: '', address: '' })
    } catch (err) {
      console.error('Error updating client:', err)
      alert('Unable to update client')
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
      setClients(clients.filter(c => c.id !== clientId))
    } catch (err) {
      console.error('Error deleting client:', err)
      alert('Unable to delete client')
    } finally {
      setSaving(false)
    }
  }

  const totalClients = clients.length
  const totalRevenue = clients.reduce((sum, client) => sum + client.totalRevenue, 0)
  const totalProjects = clients.reduce((sum, client) => sum + client.projects, 0)

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
                <p className="text-slate-400">Total projects</p>
                <p className="mt-2 text-3xl font-semibold text-white">{totalProjects}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { label: 'Total clients', value: totalClients, icon: '👥', style: 'from-emerald-500/10 to-emerald-400/10' },
            { label: 'Total revenue', value: `€${totalRevenue.toFixed(2)}`, icon: '💰', style: 'from-amber-500/10 to-amber-400/10' },
            { label: 'Associated projects', value: totalProjects, icon: '📁', style: 'from-rose-500/10 to-rose-400/10' }
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-slate-900/90 p-6 shadow-xl ring-1 ring-white/5">
              <div className={`inline-flex rounded-3xl bg-gradient-to-r ${item.style} px-3 py-2 text-sm font-semibold text-slate-900`}>{item.icon}</div>
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
              onClick={openModal}
              className="flex items-center justify-center gap-2 rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add Client
            </button>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-800 bg-slate-950/50 p-8 text-center text-slate-400">
              {clients.length === 0 ? 'No clients yet. Add your first client!' : 'No clients match your search.'}
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              {filteredClients.map((client) => (
                <div key={client.id} className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-semibold text-white truncate">{client.name}</h3>
                      <div className="mt-4 space-y-2 text-sm">
                        <p className="text-slate-300">
                          <span className="text-slate-400">Phone:</span> {client.phone}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Email:</span> {client.email}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Address:</span> {client.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-2 text-sm text-slate-200">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold">{client.projects} {client.projects === 1 ? 'Project' : 'Projects'}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-2 text-sm text-slate-200">
                        <TrendingUp className="w-4 h-4 text-sky-400" />
                        <span className="font-semibold">€{client.totalRevenue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {editingId === client.id ? (
                      <>
                        <div className="space-y-3 sm:col-span-2">
                          <input
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            placeholder="Client name"
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
        onClose={closeModal}
      />
    </div>
  )
}