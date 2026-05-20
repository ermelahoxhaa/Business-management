import {
  createClient,
  deleteClient,
  getClientById,
  searchClients,
  updateClient
} from '../repositories/clientRepository.js'
import { parseListQuery, buildPaginatedResponse } from '../utils/queryParser.js'

const statusWhitelist = ['active', 'inactive']

const normalizeClientPayload = ({
  contact_name,
  contactName,
  company_name,
  companyName,
  email,
  phone,
  address,
  status,
  updated_by
}) => {
  const payload = {}

  const contact = contact_name ?? contactName
  const company = company_name ?? companyName

  if (contact !== undefined) payload.contact_name = String(contact).trim()
  if (company !== undefined) payload.company_name = String(company).trim()
  if (email !== undefined) payload.email = email ? String(email).trim() : null
  if (phone !== undefined) payload.phone = phone ? String(phone).trim() : null
  if (address !== undefined) payload.address = address ? String(address).trim() : null
  if (status !== undefined) payload.status = status
  if (updated_by !== undefined) payload.updated_by = updated_by

  return payload
}

export const searchClientsService = async (query) => {
  const listQuery = parseListQuery(query, {
    allowedSort: ['contact_name', 'company_name', 'email', 'status', 'created_at', 'updated_at'],
    defaultSort: 'created_at'
  })

  if (query.status && !statusWhitelist.includes(query.status)) {
    throw new Error('Status must be active or inactive')
  }

  const { rows, count } = await searchClients({
    search: listQuery.search,
    status: query.status,
    sort: listQuery.sort,
    order: listQuery.order,
    limit: listQuery.limit,
    offset: listQuery.offset
  })

  return buildPaginatedResponse(rows, count, listQuery)
}

export const createClientService = async (payload) => {
  const data = normalizeClientPayload(payload)

  if (!data.contact_name) {
    throw new Error('Contact name is required')
  }

  if (!data.company_name) {
    throw new Error('Company name is required')
  }

  if (data.status && !statusWhitelist.includes(data.status)) {
    throw new Error('Status must be active or inactive')
  }

  return createClient({
    contact_name: data.contact_name,
    company_name: data.company_name,
    email: data.email ?? null,
    phone: data.phone ?? null,
    address: data.address ?? null,
    status: data.status || 'active',
    created_by: payload.created_by
  })
}

export const getClientByIdService = async (id) => {
  const client = await getClientById(id)
  if (!client) {
    throw new Error('Client not found')
  }
  return client
}

export const updateClientService = async (id, payload) => {
  const existing = await getClientById(id)
  if (!existing) {
    throw new Error('Client not found')
  }

  const updates = normalizeClientPayload(payload)

  if (updates.contact_name !== undefined && !updates.contact_name) {
    throw new Error('Contact name is required')
  }

  if (updates.company_name !== undefined && !updates.company_name) {
    throw new Error('Company name is required')
  }

  if (updates.status !== undefined && !statusWhitelist.includes(updates.status)) {
    throw new Error('Status must be active or inactive')
  }

  await updateClient(id, updates)
  return getClientById(id)
}

export const deleteClientService = async (id) => {
  const existing = await getClientById(id)
  if (!existing) {
    throw new Error('Client not found')
  }

  await deleteClient(id)
  return { deleted: true }
}
