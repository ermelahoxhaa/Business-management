import express from 'express'
import {
  createEmployeeController,
  deleteEmployeeController,
  getEmployeesController,
  getMyEmployeeProfileController,
  updateEmployeeController,
  updateEmployeeStatusController
} from '../controllers/employeeController.js'
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth)
router.get('/me', requireRoles(['employee']), getMyEmployeeProfileController)
router.get('/', requireRoles(['admin', 'team_leader']), getEmployeesController)
router.post('/', requireRoles(['admin']), createEmployeeController)
router.put('/:id', requireRoles(['admin']), updateEmployeeController)
router.patch('/:id/status', requireRoles(['admin']), updateEmployeeStatusController)
router.delete('/:id', requireRoles(['admin']), deleteEmployeeController)

export default router
