import express from 'express'
import { login, refresh, logout, getUsers } from '../controllers/authController.js'
import { requireAuth, requirePermissions } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.get('/users', requireAuth, requirePermissions('users.read'), getUsers)

export default router