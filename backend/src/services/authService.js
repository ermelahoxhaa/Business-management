import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { createUser, findUserByEmail, getAllUsers } from '../repositories/userRepository.js'
import Role from '../models/Role.js'
import UserRole from '../models/UserRole.js'

const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)

export const registerUser = async ({ first_name, last_name, email, password, password_hash }) => {
  const existing = await findUserByEmail(email)
  if (existing) throw new Error('User already exists')

  const rawPassword = (password ?? password_hash ?? '').trim()
  if (!rawPassword) throw new Error('Password is required')
  if (!isStrongPassword(rawPassword)) {
    throw new Error(
      'Password is too weak! Use at least 8 characters, including uppercase, lowercase, number, and special character.'
    )
  }

  const hashed = await bcrypt.hash(rawPassword, 10)

  const user = await createUser({
    first_name,
    last_name,
    email,
    password_hash: hashed
  })


  const employeeRole = await Role.findOne({ where: { name: 'employee' } })
  if (employeeRole) {
    await UserRole.create({
      user_id: user.id,
      role_id: employeeRole.id
    })
  }

  return user
}

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email)
  if (!user) throw new Error('Invalid credentials')

  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) throw new Error('Invalid credentials')

  
  const userRole = await UserRole.findOne({
    where: { user_id: user.id },
    include: [Role]
  })

  const role = userRole?.Role?.name || 'employee' 

  const token = jwt.sign(
    { id: user.id, email: user.email, role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1d' }
  )

  return { user, role, token }
}

export const getAllUsersService = async () => {
  return getAllUsers()
}
