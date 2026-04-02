import bcrypt from 'bcrypt'
import { createUser, findUserByEmail } from '../repositories/userRepository.js'

export const registerUser = async ({ first_name, last_name, email, password_hash }) => {
  const existing = await findUserByEmail(email)
  if (existing) throw new Error('User already exists')

  
  const hashed = await bcrypt.hash(password_hash, 10)  

  return createUser({
    first_name,
    last_name,
    email,
    password_hash: hashed,   
  })
}