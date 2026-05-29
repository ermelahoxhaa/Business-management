import express from 'express'
import {
  createInvoiceController,
  deleteInvoiceController,
  getInvoiceByIdController,
  getInvoiceController,
  updateInvoiceController
} from "../controllers/invoiceController.js"

import { requireAuth, requirePermissions } from '../middleware/authMiddleware.js'

const router = express.Router() 

router.use(requireAuth)

router.get('/', requirePermissions('invoices.read'), getInvoiceController)
router.get('/:id', requirePermissions('invoices.read'), getInvoiceByIdController)
router.post('/', requirePermissions('invoices.create'), createInvoiceController)
router.put('/:id', requirePermissions('invoices.update'), updateInvoiceController)
router.delete('/:id', requirePermissions('invoices.delete'), deleteInvoiceController)

export default router