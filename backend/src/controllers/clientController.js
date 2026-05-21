import {
  createClientService,
  deleteClientService,
  getClientByIdService,
  searchClientsService,
  updateClientService
} from '../services/clientService.js'
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
