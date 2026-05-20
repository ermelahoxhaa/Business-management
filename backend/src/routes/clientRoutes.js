import express from 'express'
import {
  createClientController,
  deleteClientController,
  getClientByIdController,
  getClientsController,
  updateClientController
} from '../controllers/clientController.js'
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth, requireRoles(['admin', 'team_leader']))

router.get('/', getClientsController)
router.get('/:id', getClientByIdController)
router.post('/', createClientController)
router.put('/:id', updateClientController)
router.delete('/:id', deleteClientController)

export default router
