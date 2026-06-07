import express from 'express'
import {
  addClientContactController,
  createClientController,
  deleteClientContactController,
  deleteClientController,
  getClientByIdController,
  getClientContactsController,
  getClientProjectsController,
  getClientsController,
  linkClientProjectController,
  unlinkClientProjectController,
  updateClientController
} from '../controllers/clientController.js'
import { requireAuth, requirePermissions } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth)

router.get('/', requirePermissions('clients.read'), getClientsController)
router.post('/', requirePermissions('clients.create'), createClientController)
router.get('/:id', requirePermissions('clients.read'), getClientByIdController)
router.put('/:id', requirePermissions('clients.update'), updateClientController)
router.delete('/:id', requirePermissions('clients.delete'), deleteClientController)
router.get('/:id/contacts', requirePermissions('clients.read'), getClientContactsController)
router.post('/:id/contacts', requirePermissions('clients.update'), addClientContactController)
router.delete('/:id/contacts/:contactId', requirePermissions('clients.update'), deleteClientContactController)
router.get('/:id/projects', requirePermissions('clients.read'), getClientProjectsController)
router.post('/:id/projects', requirePermissions('clients.update'), linkClientProjectController)
router.delete('/:id/projects/:linkId', requirePermissions('clients.update'), unlinkClientProjectController)

export default router
