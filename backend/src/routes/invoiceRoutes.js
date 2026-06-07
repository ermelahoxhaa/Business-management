import express from 'express'
import {
  addInvoiceItemController,
  addInvoicePaymentController,
  createInvoiceController,
  deleteInvoiceController,
  deleteInvoiceItemController,
  getInvoiceByIdController,
  getInvoiceController,
  updateInvoiceController
} from "../controllers/invoiceController.js"

import { requireAuth, requirePermissions } from '../middleware/authMiddleware.js'

const router = express.Router() 

router.use(requireAuth)

router.get('/', requirePermissions('invoices.read'), getInvoiceController)
router.post('/', requirePermissions('invoices.create'), createInvoiceController)
router.get('/:id', requirePermissions('invoices.read'), getInvoiceByIdController)
router.put('/:id', requirePermissions('invoices.update'), updateInvoiceController)
router.delete('/:id', requirePermissions('invoices.delete'), deleteInvoiceController)
router.post('/:id/items', requirePermissions('invoices.update'), addInvoiceItemController)
router.delete('/:id/items/:itemId', requirePermissions('invoices.update'), deleteInvoiceItemController)
router.post('/:id/payments', requirePermissions('invoices.update'), addInvoicePaymentController)

export default router