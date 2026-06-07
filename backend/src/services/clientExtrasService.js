import ClientContact from '../models/ClientContact.js'
import ClientProject from '../models/ClientProject.js'
import Client from '../models/Client.js'
import Project from '../models/Project.js'

export const listClientContactsService = async (clientId) => {
  const client = await Client.findByPk(clientId)
  if (!client) throw new Error('Client not found')
  return ClientContact.findAll({ where: { client_id: clientId }, order: [['created_at', 'DESC']] })
}

export const addClientContactService = async (clientId, payload) => {
  const client = await Client.findByPk(clientId)
  if (!client) throw new Error('Client not found')

  const name = String(payload.name || '').trim()
  if (!name) throw new Error('Contact name is required')

  return ClientContact.create({
    client_id: Number(clientId),
    name,
    email: payload.email ? String(payload.email).trim() : null,
    phone: payload.phone ? String(payload.phone).trim() : null,
    position: payload.position ? String(payload.position).trim() : null
  })
}

export const deleteClientContactService = async (clientId, contactId) => {
  const deleted = await ClientContact.destroy({ where: { id: contactId, client_id: clientId } })
  if (!deleted) throw new Error('Client contact not found')
  return { deleted: true }
}

export const listClientProjectsService = async (clientId) => {
  const client = await Client.findByPk(clientId)
  if (!client) throw new Error('Client not found')

  const links = await ClientProject.findAll({ where: { client_id: clientId }, order: [['created_at', 'DESC']] })
  const projectIds = links.map((link) => link.project_id)
  const projects = projectIds.length
    ? await Project.findAll({ where: { id: projectIds } })
    : []

  const projectMap = Object.fromEntries(projects.map((project) => [project.id, project]))

  return links.map((link) => ({
    ...link.toJSON(),
    project: projectMap[link.project_id] || null
  }))
}

export const linkClientProjectService = async (clientId, payload, createdBy) => {
  const client = await Client.findByPk(clientId)
  if (!client) throw new Error('Client not found')

  const projectId = Number(payload.project_id)
  const project = await Project.findByPk(projectId)
  if (!project) throw new Error('Project not found')

  const existing = await ClientProject.findOne({ where: { client_id: clientId, project_id: projectId } })
  if (existing) throw new Error('Client is already linked to this project')

  return ClientProject.create({
    client_id: Number(clientId),
    project_id: projectId,
    notes: payload.notes ? String(payload.notes).trim() : null,
    created_by: createdBy
  })
}

export const unlinkClientProjectService = async (clientId, linkId) => {
  const deleted = await ClientProject.destroy({ where: { id: linkId, client_id: clientId } })
  if (!deleted) throw new Error('Client project link not found')
  return { deleted: true }
}
