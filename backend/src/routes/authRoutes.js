import express from 'express'
import { signup, login, getUsers } from '../controllers/authController.js'
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/users', requireAuth, requireRoles(['admin', 'team_leader']), getUsers)

export default router