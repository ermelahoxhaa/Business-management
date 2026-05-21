import express from 'express'
import {
  createClientController,
  deleteClientController,
  getClientByIdController,
  getClientsController,
  updateClientController
} from '../controllers/clientController.js'
import { requireAuth, requirePermissions } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth)

router.get('/', requirePermissions('clients.read'), getClientsController)
router.get('/:id', requirePermissions('clients.read'), getClientByIdController)
router.post('/', requirePermissions('clients.create'), createClientController)
router.put('/:id', requirePermissions('clients.update'), updateClientController)
router.delete('/:id', requirePermissions('clients.delete'), deleteClientController)

export default router
