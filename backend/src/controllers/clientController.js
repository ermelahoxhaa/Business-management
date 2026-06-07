import {
  createClientService,
  deleteClientService,
  getClientByIdService,
  searchClientsService,
  updateClientService
} from '../services/clientService.js'
import {
  addClientContactService,
  deleteClientContactService,
  linkClientProjectService,
  listClientContactsService,
  listClientProjectsService,
  unlinkClientProjectService
} from '../services/clientExtrasService.js'
import { logAudit } from '../services/auditService.js'

export const getClientsController = async (req, res) => {
  try {
    const result = await searchClientsService(req.query)
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const getClientByIdController = async (req, res) => {
  try {
    const client = await getClientByIdService(req.params.id)
    res.json(client)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const createClientController = async (req, res) => {
  try {
    const client = await createClientService({
      ...req.body,
      created_by: req.user.id
    })
    await logAudit({
      userId: req.user.id,
      action: 'create',
      entityType: 'client',
      entityId: client.id,
      ipAddress: req.ip
    })
    res.status(201).json(client)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const updateClientController = async (req, res) => {
  try {
    const client = await updateClientService(req.params.id, {
      ...req.body,
      updated_by: req.user.id
    })
    await logAudit({
      userId: req.user.id,
      action: 'update',
      entityType: 'client',
      entityId: Number(req.params.id),
      ipAddress: req.ip
    })
    res.json(client)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const getClientContactsController = async (req, res) => {
  try {
    const contacts = await listClientContactsService(req.params.id)
    res.json(contacts)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const addClientContactController = async (req, res) => {
  try {
    const contact = await addClientContactService(req.params.id, req.body)
    res.status(201).json(contact)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const deleteClientContactController = async (req, res) => {
  try {
    const result = await deleteClientContactService(req.params.id, req.params.contactId)
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const getClientProjectsController = async (req, res) => {
  try {
    const links = await listClientProjectsService(req.params.id)
    res.json(links)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const linkClientProjectController = async (req, res) => {
  try {
    const link = await linkClientProjectService(req.params.id, req.body, req.user.id)
    res.status(201).json(link)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const unlinkClientProjectController = async (req, res) => {
  try {
    const result = await unlinkClientProjectService(req.params.id, req.params.linkId)
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const deleteClientController = async (req, res) => {
  try {
    const result = await deleteClientService(req.params.id)
    await logAudit({
      userId: req.user.id,
      action: 'delete',
      entityType: 'client',
      entityId: Number(req.params.id),
      ipAddress: req.ip
    })
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
