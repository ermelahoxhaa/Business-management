import User from '../models/User.js'

export const createUser = (data) => User.create(data)
export const findUserByEmail = (email) => User.findOne({ where: { email } })
export const findUserById = (id) => User.findByPk(id)
export const getAllUsers = (options = {}) => User.findAll(options)

export const updateUserById = async (id, data) => {
  const user = await findUserById(id)
  if (!user) {
    throw new Error('User not found')
  }
  await user.update(data)
  return user
}