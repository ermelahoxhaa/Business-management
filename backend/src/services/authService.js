import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { createUser, findUserByEmail } from '../repositories/userRepository.js'

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

  return createUser({
    first_name,
    last_name,
    email,
    password_hash: hashed,   
  })
}

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email)
  if (!user) throw new Error('Invalid credentials')

  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) throw new Error('Invalid credentials')

 
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  )

  return { user, token }
}
